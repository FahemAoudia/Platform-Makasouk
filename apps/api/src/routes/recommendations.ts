import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

/**
 * Taste-based ranking: blend category weights from user behavior with tag overlap.
 * Extend with embeddings / collaborative filtering without schema changes.
 */
router.get("/", async (req: AuthedRequest, res) => {
  const pref = await prisma.userPreference.findUnique({
    where: { userId: req.user!.id },
  });
  const weights = (pref?.categoryWeights as Record<string, number>) ?? {};
  const tags = new Set(pref?.tagAffinity ?? []);

  const models = await prisma.fashionModel.findMany({
    where: { isActive: true },
    include: { category: true },
    take: 80,
    orderBy: { updatedAt: "desc" },
  });

  const scored = models
    .map((m) => {
      const catW = weights[m.category.slug] ?? 0;
      const tagArr = Array.isArray(m.tags) ? (m.tags as string[]) : [];
      const tagScore = tagArr.reduce(
        (s, t) => s + (tags.has(t) ? 1 : 0),
        0
      );
      const score = catW * 2 + tagScore * 0.5 + Math.random() * 0.05;
      return { model: m, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((x) => x.model);

  return res.json({ models: scored, strategy: "affinity_v1" });
});

export default router;
