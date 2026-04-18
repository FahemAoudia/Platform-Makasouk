import { Router } from "express";
import { prisma } from "../lib/prisma";
import { paramString } from "../lib/params";

const router = Router();

router.get("/categories", async (_req, res) => {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return res.json(rows);
});

router.get("/categories/:slug", async (req, res) => {
  const slug = paramString(req.params.slug);
  if (!slug) {
    return res.status(400).json({ error: "Invalid slug" });
  }
  const cat = await prisma.category.findUnique({
    where: { slug },
  });
  if (!cat) return res.status(404).json({ error: "Not found" });
  return res.json(cat);
});

router.get("/models", async (req, res) => {
  const categorySlug = req.query.category as string | undefined;
  const where = categorySlug
    ? { category: { slug: categorySlug }, isActive: true }
    : { isActive: true };
  const models = await prisma.fashionModel.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json(models);
});

router.get("/models/:id", async (req, res) => {
  const id = paramString(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const model = await prisma.fashionModel.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!model) return res.status(404).json({ error: "Not found" });
  return res.json(model);
});

router.get("/measurement-fields", async (_req, res) => {
  const fields = await prisma.measurementField.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return res.json(fields);
});

export default router;
