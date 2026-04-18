import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findFirst({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return prisma.cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: { items: { include: { model: { include: { category: true } } } } },
  });
}

router.get("/", async (req: AuthedRequest, res) => {
  const cart = await getOrCreateCart(req.user!.id);
  return res.json(cart);
});

const upsertSchema = z.object({
  modelId: z.string().min(1),
  measurements: z.record(z.number()),
  quantity: z.number().int().min(1).optional(),
});

router.post("/items", async (req: AuthedRequest, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { modelId, measurements, quantity } = parsed.data;
  const cart = await getOrCreateCart(req.user!.id);

  const model = await prisma.fashionModel.findUnique({ where: { id: modelId } });
  if (!model || !model.isActive) {
    return res.status(400).json({ error: "Invalid model" });
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_modelId: { cartId: cart.id, modelId },
    },
    create: {
      cartId: cart.id,
      modelId,
      measurements: measurements as object,
      quantity: quantity ?? 1,
    },
    update: {
      measurements: measurements as object,
      quantity: quantity ?? 1,
    },
  });

  const next = await getOrCreateCart(req.user!.id);
  return res.json(next);
});

const patchItemSchema = z.object({
  quantity: z.number().int().min(1),
});

/** Update quantity for a cart line (by CartItem id). Measurements unchanged. */
router.patch("/items/:itemId", async (req: AuthedRequest, res) => {
  const parsed = patchItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const cart = await prisma.cart.findFirst({ where: { userId: req.user!.id } });
  if (!cart) {
    return res.status(404).json({ error: "Cart not found" });
  }
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.itemId, cartId: cart.id },
  });
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: parsed.data.quantity },
  });
  const next = await getOrCreateCart(req.user!.id);
  return res.json(next);
});

/**
 * Remove line: accepts CartItem id, or legacy FashionModel id for this cart.
 */
router.delete("/items/:id", async (req: AuthedRequest, res) => {
  const cart = await prisma.cart.findFirst({ where: { userId: req.user!.id } });
  if (!cart) {
    return res.status(404).json({ error: "Cart not found" });
  }
  const id = req.params.id;
  const byLine = await prisma.cartItem.deleteMany({
    where: { id, cartId: cart.id },
  });
  if (byLine.count === 0) {
    const byModel = await prisma.cartItem.deleteMany({
      where: { modelId: id, cartId: cart.id },
    });
    if (byModel.count === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
  }
  const next = await getOrCreateCart(req.user!.id);
  return res.json(next);
});

export default router;
