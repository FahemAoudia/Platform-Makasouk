import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthedRequest, res) => {
  const rows = await prisma.favorite.findMany({
    where: { userId: req.user!.id },
    include: { model: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json(rows.map((r) => r.model));
});

router.post("/:modelId", async (req: AuthedRequest, res) => {
  const model = await prisma.fashionModel.findUnique({
    where: { id: req.params.modelId },
  });
  if (!model) return res.status(404).json({ error: "Model not found" });

  await prisma.favorite.upsert({
    where: {
      userId_modelId: { userId: req.user!.id, modelId: model.id },
    },
    create: { userId: req.user!.id, modelId: model.id },
    update: {},
  });

  await bumpPreferenceFromFavorite(req.user!.id, model);
  return res.status(201).json({ ok: true });
});

router.delete("/:modelId", async (req: AuthedRequest, res) => {
  await prisma.favorite.deleteMany({
    where: { userId: req.user!.id, modelId: req.params.modelId },
  });
  return res.json({ ok: true });
});

async function bumpPreferenceFromFavorite(userId: string, model: {
  categoryId: string;
  tags: string[];
}) {
  const pref = await prisma.userPreference.findUnique({ where: { userId } });
  const cat = await prisma.category.findUnique({ where: { id: model.categoryId } });
  const weights = (pref?.categoryWeights as Record<string, number>) ?? {};
  if (cat) {
    weights[cat.slug] = (weights[cat.slug] ?? 0) + 0.15;
  }
  const tagAffinity = new Set(pref?.tagAffinity ?? []);
  model.tags.forEach((t) => tagAffinity.add(t));
  await prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      categoryWeights: weights,
      tagAffinity: [...tagAffinity],
    },
    update: {
      categoryWeights: weights,
      tagAffinity: [...tagAffinity],
    },
  });
}

export default router;
