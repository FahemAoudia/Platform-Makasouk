import type { RequestHandler } from "express";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthedRequest } from "../middleware/auth";
import type { IoServer } from "../socket";
import { emitOrderBroadcast, emitOrderCancelled, orderRoom } from "../socket";

function orderParamId(req: AuthedRequest): string | null {
  const raw = req.params.id;
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return null;
}

const orderDetailInclude = {
  category: true,
  tailor: { include: { user: true } },
  items: { include: { model: true } },
  review: true,
} as const;

/**
 * Mounted at `PATCH /api/orders/:id/cancel` from `index.ts` (before `/orders` sub-router)
 * so Express 5 reliably matches `.../:id/cancel` (nested param routes on sub-routers can 404).
 */
export function createOrderCancelHandler(io: IoServer): RequestHandler {
  return async (req: AuthedRequest, res) => {
    const orderId = orderParamId(req);
    if (!orderId) {
      return res.status(400).json({ error: "Order cannot be cancelled" });
    }
    if (req.user!.role !== "CLIENT") {
      return res.status(403).json({ error: "Order cannot be cancelled" });
    }

    const existing = await prisma.order.findFirst({
      where: { id: orderId, clientId: req.user!.id, isDeleted: false },
    });
    if (!existing) {
      return res.status(400).json({ error: "Order cannot be cancelled" });
    }
    if (existing.status !== "PENDING" || existing.tailorId != null) {
      return res.status(400).json({ error: "Order cannot be cancelled" });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        lockVersion: { increment: 1 },
      },
      include: {
        category: true,
        tailor: { include: { user: true } },
        items: { include: { model: true } },
      },
    });

    emitOrderCancelled(io, {
      categoryId: existing.categoryId,
      clientId: existing.clientId,
      orderId: existing.id,
    });

    io.to(orderRoom(orderId)).emit("order:status", {
      orderId,
      status: "CANCELLED",
    });

    return res.json(updated);
  };
}

export function createOrdersRouter(io: IoServer) {
  const router = Router();
  router.use(authMiddleware);

  router.get("/mine", async (req: AuthedRequest, res) => {
    const orders = await prisma.order.findMany({
      where: { clientId: req.user!.id, isDeleted: false },
      include: {
        category: true,
        tailor: { include: { user: true } },
        items: { include: { model: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(orders);
  });

  const checkoutSchema = z.object({
    categoryId: z.string().min(1),
  });

  router.post("/checkout", async (req: AuthedRequest, res) => {
    if (req.user!.role !== "CLIENT") {
      return res.status(403).json({ error: "Clients only" });
    }
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { categoryId } = parsed.data;

    const cart = await prisma.cart.findFirst({
      where: { userId: req.user!.id },
      include: { items: { include: { model: true } } },
    });
    if (!cart?.items.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const mismatched = cart.items.filter(
      (i) => i.model.categoryId !== categoryId
    );
    if (mismatched.length) {
      return res.status(400).json({
        error:
          "All pieces in cart must belong to the selected category for tailor routing.",
      });
    }

    const subtotal = cart.items.reduce(
      (sum, i) => sum + Number(i.model.basePrice) * i.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        clientId: req.user!.id,
        categoryId,
        status: "PENDING",
        subtotal,
        items: {
          create: cart.items.map((i) => ({
            modelId: i.modelId,
            measurements: i.measurements as object,
            unitPrice: i.model.basePrice,
            quantity: i.quantity,
          })),
        },
      },
      include: {
        items: { include: { model: true } },
        category: true,
        client: true,
      },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    console.log(
      "[orders/checkout] broadcasting order:new categoryId=%s orderId=%s",
      categoryId,
      order.id
    );
    emitOrderBroadcast(io, categoryId, {
      id: order.id,
      categoryId,
      subtotal: order.subtotal,
      createdAt: order.createdAt,
      itemCount: order.items.length,
    });

    return res.status(201).json(order);
  });

  router.get("/:id", async (req: AuthedRequest, res) => {
    const orderId = orderParamId(req);
    if (!orderId) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        isDeleted: false,
        OR: [
          { clientId: req.user!.id },
          { tailor: { userId: req.user!.id } },
        ],
      },
      include: orderDetailInclude,
    });
    if (order) {
      return res.json(order);
    }

    if (req.user!.role === "ADMIN") {
      const adminOrder = await prisma.order.findFirst({
        where: { id: orderId, isDeleted: false },
        include: {
          category: true,
          tailor: { include: { user: true } },
          items: { include: { model: true } },
        },
      });
      return adminOrder
        ? res.json(adminOrder)
        : res.status(404).json({ error: "Not found" });
    }

    if (req.user!.role === "TAILOR") {
      const profile = await prisma.tailorProfile.findUnique({
        where: { userId: req.user!.id },
        include: { categories: true },
      });
      if (!profile?.active) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const categoryIds = profile.categories.map((c) => c.categoryId);
      if (categoryIds.length === 0) {
        return res.status(404).json({ error: "Not found" });
      }
      const poolOrder = await prisma.order.findFirst({
        where: {
          id: orderId,
          status: "PENDING",
          tailorId: null,
          isDeleted: false,
          categoryId: { in: categoryIds },
        },
        include: orderDetailInclude,
      });
      if (!poolOrder) {
        return res.status(404).json({ error: "Not found" });
      }
      return res.json(poolOrder);
    }

    return res.status(404).json({ error: "Not found" });
  });

  router.patch("/:id/status", async (req: AuthedRequest, res) => {
    const orderId = orderParamId(req);
    if (!orderId) {
      return res.status(400).json({ error: "Invalid id" });
    }
    const schema = z.object({
      status: z.enum(["IN_PROGRESS", "SHIPPED", "CANCELLED"]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, isDeleted: false },
      include: { tailor: true },
    });
    if (!order) return res.status(404).json({ error: "Not found" });

    if (req.user!.role === "TAILOR") {
      const tailor = await prisma.tailorProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!tailor || order.tailorId !== tailor.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
    } else if (req.user!.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const next = await prisma.order.update({
      where: { id: order.id },
      data: { status: parsed.data.status, lockVersion: { increment: 1 } },
      include: { items: true },
    });

    io.to(orderRoom(order.id)).emit("order:status", {
      orderId: order.id,
      status: next.status,
    });

    return res.json(next);
  });

  return router;
}
