import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { paramString } from "../lib/params";
import { authMiddleware, type AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

const bodySchema = z.object({
  orderId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

router.post("/", async (req: AuthedRequest, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { orderId, rating, comment } = parsed.data;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      clientId: req.user!.id,
      status: "SHIPPED",
      isDeleted: false,
      tailorId: { not: null },
    },
  });
  if (!order || !order.tailorId) {
    return res.status(400).json({ error: "Order not eligible for review" });
  }

  const existing = await prisma.tailorReview.findUnique({
    where: { orderId },
  });
  if (existing) {
    return res.status(409).json({ error: "Already reviewed" });
  }

  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.tailorReview.create({
      data: {
        orderId,
        tailorId: order.tailorId!,
        authorId: req.user!.id,
        rating,
        comment,
      },
    });

    const agg = await tx.tailorReview.aggregate({
      where: { tailorId: order.tailorId! },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.tailorProfile.update({
      where: { id: order.tailorId! },
      data: {
        ratingAvg: agg._avg.rating ?? rating,
        ratingCount: agg._count.rating,
      },
    });

    return r;
  });

  return res.status(201).json(review);
});

router.get("/tailor/:tailorId", async (req, res) => {
  const tailorId = paramString(req.params.tailorId);
  if (!tailorId) {
    return res.status(400).json({ error: "Invalid tailor id" });
  }
  const reviews = await prisma.tailorReview.findMany({
    where: { tailorId },
    include: {
      author: { select: { fullName: true } },
      order: { select: { id: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json(reviews);
});

export default router;
