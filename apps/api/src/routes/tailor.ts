import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  authMiddleware,
  requireRole,
  type AuthedRequest,
} from "../middleware/auth";
import {
  acceptOrderForTailor,
  releaseOrderByTailor,
} from "../services/orderLock";
import type { IoServer } from "../socket";
import { emitOrderBroadcast, emitOrderTaken, tailorRoom } from "../socket";
import { paramString } from "../lib/params";

export function createTailorRouter(io: IoServer) {
  const router = Router();
  router.use(authMiddleware);
  router.use(requireRole("TAILOR"));

  router.get("/profile", async (req: AuthedRequest, res) => {
    const profile = await prisma.tailorProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        categories: { include: { category: true } },
        user: true,
      },
    });
    if (!profile) {
      return res.status(404).json({ error: "Tailor profile not found" });
    }
    return res.json(profile);
  });

  router.get("/orders/available", async (req: AuthedRequest, res) => {
    const profile = await prisma.tailorProfile.findUnique({
      where: { userId: req.user!.id },
      include: { categories: true },
    });
    if (!profile) {
      return res.status(404).json({
        error:
          "Tailor profile missing. Contact support or re-register as tailor with categories.",
      });
    }
    if (!profile.active) {
      return res.status(403).json({ error: "Inactive tailor" });
    }

    const categoryIds = profile.categories.map((c) => c.categoryId);
    console.log(
      "[tailor/orders/available] tailorProfileId=%s categories=%j count=%s",
      profile.id,
      categoryIds,
      categoryIds.length
    );

    if (categoryIds.length === 0) {
      console.warn(
        "[tailor/orders/available] tailor has ZERO category links — fix in DB"
      );
      return res.json([]);
    }

    const orders = await prisma.order.findMany({
      where: {
        categoryId: { in: categoryIds },
        status: "PENDING",
        tailorId: null,
        isDeleted: false,
      },
      include: {
        items: { include: { model: true } },
        client: { select: { fullName: true, email: true } },
        category: true,
      },
      orderBy: { createdAt: "asc" },
    });

    console.log(
      "[tailor/orders/available] pending orders found=%s",
      orders.length
    );

    return res.json(orders);
  });

  router.get("/orders/mine", async (req: AuthedRequest, res) => {
    const profile = await prisma.tailorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!profile) return res.status(404).json({ error: "Not found" });

    const orders = await prisma.order.findMany({
      where: { tailorId: profile.id, isDeleted: false },
      include: {
        items: { include: { model: true } },
        client: { select: { fullName: true, email: true } },
        category: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return res.json(orders);
  });

  router.post("/orders/:id/accept", async (req: AuthedRequest, res) => {
    const orderId = paramString(req.params.id);
    if (!orderId) {
      return res.status(400).json({ error: "Invalid order id" });
    }
    const profile = await prisma.tailorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!profile?.active) {
      return res.status(403).json({ error: "Inactive tailor" });
    }

    const result = await acceptOrderForTailor({
      orderId,
      tailorProfileId: profile.id,
    });

    if (!result.ok) {
      const map: Record<string, number> = {
        NOT_FOUND: 404,
        ALREADY_CLAIMED: 409,
        TAILOR_INVALID: 403,
        RACE_LOST: 409,
      };
      return res.status(map[result.reason] ?? 400).json({
        error: result.reason,
      });
    }

    const catId = result.order!.categoryId;
    emitOrderTaken(io, catId, { orderId: result.order!.id });
    io.to(`order:${result.order!.id}`).emit("order:status", {
      orderId: result.order!.id,
      status: "ACCEPTED",
    });

    return res.json(result.order);
  });

  /** Cancel / release order back to available pool */
  router.post("/orders/:id/release", async (req: AuthedRequest, res) => {
    const orderId = paramString(req.params.id);
    if (!orderId) {
      return res.status(400).json({ error: "Invalid order id" });
    }
    const profile = await prisma.tailorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!profile?.active) {
      return res.status(403).json({ error: "Inactive tailor" });
    }

    const result = await releaseOrderByTailor({
      orderId,
      tailorProfileId: profile.id,
    });

    if (!result.ok) {
      const map: Record<string, number> = {
        NOT_FOUND: 404,
        FORBIDDEN: 403,
        INVALID_STATE: 400,
        RACE_LOST: 409,
      };
      return res.status(map[result.reason] ?? 400).json({
        error: result.reason,
      });
    }

    emitOrderBroadcast(io, result.categoryId, {
      id: result.order!.id,
      categoryId: result.categoryId,
      subtotal: result.order!.subtotal,
      createdAt: result.order!.createdAt,
      itemCount: result.order!.items.length,
      reopened: true,
    });
    io.to(`order:${result.order!.id}`).emit("order:status", {
      orderId: result.order!.id,
      status: "PENDING",
    });

    return res.json(result.order);
  });

  router.get("/debug/room", async (req: AuthedRequest, res) => {
    const profile = await prisma.tailorProfile.findUnique({
      where: { userId: req.user!.id },
      include: { categories: true },
    });
    if (!profile) return res.status(404).json({ error: "Not found" });
    return res.json({
      rooms: profile.categories.map((c) => tailorRoom(c.categoryId)),
    });
  });

  return router;
}
