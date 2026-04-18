import { Router, type NextFunction, type Response } from "express";
import { z } from "zod";
import { Role, type Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  authMiddleware,
  requireRole,
  type AuthedRequest,
} from "../middleware/auth";
import { upload } from "../middleware/upload";
import type { IoServer } from "../socket";
import { emitOrderDeleted } from "../socket";
import { paramString } from "../lib/params";

export function createAdminRouter(io: IoServer) {
  const router = Router();
  router.use(authMiddleware);
  router.use(requireRole("ADMIN"));

router.get("/analytics/overview", async (_req, res) => {
  const [orderAgg, revenue, users, tailors] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where: { isDeleted: false },
      _count: { id: true },
    }),
    prisma.order.aggregate({
      _sum: { subtotal: true },
      where: { status: { not: "CANCELLED" }, isDeleted: false },
    }),
    prisma.user.count(),
    prisma.tailorProfile.count(),
  ]);

  const recent = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return res.json({
    ordersByStatus: orderAgg,
    revenueTotal: revenue._sum.subtotal,
    userCount: users,
    tailorCount: tailors,
    recentAudit: recent,
  });
});

router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      disabled: true,
      createdAt: true,
      tailorProfile: {
        select: {
          id: true,
          active: true,
          categories: { select: { categoryId: true, category: { select: { name: true, slug: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return res.json(users);
});

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
});

router.post("/create-admin", async (req: AuthedRequest, res) => {
  const parsed = createAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, fullName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: Role.ADMIN,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: req.user!.id,
      action: "admin.create",
      entityType: "User",
      entityId: newUser.id,
    },
  });

  return res.status(201).json(newUser);
});

const userStatusSchema = z.object({
  disabled: z.boolean(),
});

router.patch("/users/:id/status", async (req: AuthedRequest, res) => {
  const parsed = userStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const userIdParam = paramString(req.params.id);
  if (!userIdParam) {
    return res.status(400).json({ error: "Invalid id" });
  }
  if (userIdParam === req.user!.id) {
    return res.status(400).json({ error: "Cannot change own account" });
  }
  const target = await prisma.user.findUnique({ where: { id: userIdParam } });
  if (!target) return res.status(404).json({ error: "Not found" });
  if (target.role === Role.ADMIN) {
    return res.status(403).json({ error: "Cannot disable admin" });
  }
  const user = await prisma.user.update({
    where: { id: userIdParam },
    data: { disabled: parsed.data.disabled },
  });
  await prisma.adminAuditLog.create({
    data: {
      actorId: req.user!.id,
      action: "user.status",
      entityType: "User",
      entityId: user.id,
      meta: { disabled: user.disabled } as object,
    },
  });
  return res.json(user);
});

router.delete("/users/:id", async (req: AuthedRequest, res) => {
  const userIdParam = paramString(req.params.id);
  if (!userIdParam) {
    return res.status(400).json({ error: "Invalid id" });
  }
  if (userIdParam === req.user!.id) {
    return res.status(400).json({ error: "Cannot delete self" });
  }
  const target = await prisma.user.findUnique({ where: { id: userIdParam } });
  if (!target) return res.status(404).json({ error: "Not found" });
  if (target.role === Role.ADMIN) {
    return res.status(403).json({ error: "Cannot delete admin" });
  }
  try {
    await prisma.user.delete({ where: { id: userIdParam } });
  } catch {
    return res.status(409).json({
      error: "Delete blocked (existing relations). Use disable instead.",
    });
  }
  await prisma.adminAuditLog.create({
    data: {
      actorId: req.user!.id,
      action: "user.delete",
      entityType: "User",
      entityId: userIdParam,
    },
  });
  return res.status(204).send();
});

router.get("/orders", async (_req, res) => {
  const orders = await prisma.order.findMany({
    where: { isDeleted: false },
    include: {
      client: { select: { email: true, fullName: true } },
      category: true,
      tailor: { include: { user: { select: { email: true } } } },
      items: { include: { model: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return res.json(orders);
});

function orderRouteId(req: AuthedRequest): string | null {
  const raw = req.params.id;
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return null;
}

router.delete("/orders/:id", async (req: AuthedRequest, res) => {
  const orderId = orderRouteId(req);
  if (!orderId) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.isDeleted) {
    return res.status(404).json({ error: "Not found" });
  }
  if (order.status !== "PENDING") {
    return res.status(400).json({ error: "Cannot delete processed order" });
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { isDeleted: true, lockVersion: { increment: 1 } },
  });
  await prisma.adminAuditLog.create({
    data: {
      actorId: req.user!.id,
      action: "order.soft_delete",
      entityType: "Order",
      entityId: orderId,
      meta: { categoryId: order.categoryId } as object,
    },
  });
  emitOrderDeleted(io, {
    categoryId: order.categoryId,
    clientId: order.clientId,
    orderId: order.id,
  });
  return res.status(204).send();
});

const tailorInviteSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string(),
  categoryIds: z.array(z.string().min(1)).min(1),
});

router.post("/tailors", async (req: AuthedRequest, res) => {
  const parsed = tailorInviteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, fullName, categoryIds } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: Role.TAILOR,
      tailorProfile: {
        create: {
          active: true,
          categories: {
            create: categoryIds.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          },
        },
      },
    },
    include: {
      tailorProfile: { include: { categories: { include: { category: true } } } },
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: req.user!.id,
      action: "tailor.create",
      entityType: "User",
      entityId: user.id,
    },
  });

  return res.status(201).json(user);
});

const tailorCategoriesSchema = z.object({
  categoryIds: z.array(z.string().min(1)).min(1),
});

router.patch("/tailors/:tailorProfileId/categories", async (req: AuthedRequest, res) => {
  const parsed = tailorCategoriesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const tailorProfileId = paramString(req.params.tailorProfileId);
  if (!tailorProfileId) {
    return res.status(400).json({ error: "Invalid tailor profile id" });
  }
  const profile = await prisma.tailorProfile.findUnique({
    where: { id: tailorProfileId },
  });
  if (!profile) return res.status(404).json({ error: "Not found" });

  await prisma.$transaction([
    prisma.tailorCategory.deleteMany({
      where: { tailorProfileId: profile.id },
    }),
    prisma.tailorCategory.createMany({
      data: parsed.data.categoryIds.map((categoryId) => ({
        tailorProfileId: profile.id,
        categoryId,
      })),
    }),
  ]);

  const next = await prisma.tailorProfile.findUnique({
    where: { id: profile.id },
    include: { categories: { include: { category: true } }, user: true },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: req.user!.id,
      action: "tailor.categories",
      entityType: "TailorProfile",
      entityId: profile.id,
    },
  });

  return res.json(next);
});

const modelCreateSchema = z.object({
  categoryId: z.string(),
  name: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  images: z.array(z.string().url()),
  basePrice: z.number().positive(),
  tags: z.array(z.string()).optional(),
  videoUrl: z.string().url().optional(),
});

function multipartCreateModel(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const ct = req.headers["content-type"] ?? "";
  if (ct.includes("multipart/form-data")) {
    upload.array("images", 20)(req, res, (err: unknown) => {
      if (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        return res.status(400).json({ error: msg });
      }
      next();
    });
  } else {
    next();
  }
}

router.post("/models", multipartCreateModel, async (req: AuthedRequest, res) => {
  const ct = req.headers["content-type"] ?? "";
  if (ct.includes("multipart/form-data")) {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) {
      return res
        .status(400)
        .json({ error: "At least one image file is required" });
    }
    const b = req.body as Record<string, string | undefined>;
    const categoryId = (b.categoryId ?? "").trim();
    const name = (b.name ?? "").trim();
    const subtitleRaw = b.subtitle?.trim();
    const description = (b.description ?? "").trim() || "—";
    const basePrice = Number(b.basePrice);
    if (!categoryId || !name) {
      return res
        .status(400)
        .json({ error: "categoryId and name are required" });
    }
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      return res.status(400).json({ error: "Invalid basePrice" });
    }
    const cat = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) {
      return res.status(400).json({ error: "Invalid categoryId" });
    }
    const publicBase = (
      process.env.UPLOAD_PUBLIC_BASE ?? `${req.protocol}://${req.get("host")}`
    ).replace(/\/$/, "");
    const imageUrls = files.map((f) => `${publicBase}/uploads/${f.filename}`);
    const model = await prisma.fashionModel.create({
      data: {
        categoryId,
        name,
        subtitle: subtitleRaw && subtitleRaw.length > 0 ? subtitleRaw : null,
        description,
        images: imageUrls as Prisma.InputJsonValue,
        basePrice,
        tags: [],
        videoUrl: b.videoUrl?.trim() || undefined,
      },
      include: { category: true },
    });
    await prisma.adminAuditLog.create({
      data: {
        actorId: req.user!.id,
        action: "model.create",
        entityType: "FashionModel",
        entityId: model.id,
      },
    });
    return res.status(201).json(model);
  }

  const parsed = modelCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const d = parsed.data;
  const model = await prisma.fashionModel.create({
    data: {
      categoryId: d.categoryId,
      name: d.name,
      subtitle: d.subtitle,
      description: d.description,
      images: d.images as object,
      basePrice: d.basePrice,
      tags: d.tags ?? [],
      videoUrl: d.videoUrl,
    },
  });
  await prisma.adminAuditLog.create({
    data: {
      actorId: req.user!.id,
      action: "model.create",
      entityType: "FashionModel",
      entityId: model.id,
    },
  });
  return res.status(201).json(model);
});

const patchModelSchema = z
  .object({
    basePrice: z.number().positive().optional(),
    name: z.string().optional(),
    subtitle: z.string().nullable().optional(),
    description: z.string().optional(),
    /** Array of image URLs, or a single URL string (normalized to one-element array). */
    images: z.preprocess(
      (v) => {
        if (v === undefined) return undefined;
        if (typeof v === "string") return [v];
        return v;
      },
      z.array(z.string().url()).optional()
    ),
    videoUrl: z.string().url().nullable().optional(),
    isActive: z.boolean().optional(),
    categoryId: z.string().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "Empty patch" });

function parseStoredModelImages(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string" && x.length > 0);
  }
  if (typeof raw === "string" && raw.length > 0) {
    return [raw];
  }
  return [];
}

function modelRouteId(req: AuthedRequest): string | null {
  const raw = req.params.id;
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return null;
}

function multipartModelImages(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const ct = req.headers["content-type"] ?? "";
  if (ct.includes("multipart/form-data")) {
    upload.array("images", 20)(req, res, (err: unknown) => {
      if (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        return res.status(400).json({ error: msg });
      }
      next();
    });
  } else {
    next();
  }
}

router.patch("/models/:id", multipartModelImages, async (req: AuthedRequest, res) => {
  const modelId = modelRouteId(req);
  if (!modelId) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const ct = req.headers["content-type"] ?? "";
  if (ct.includes("multipart/form-data")) {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) {
      return res.status(400).json({ error: "At least one image file is required" });
    }
    const existing = await prisma.fashionModel.findUnique({
      where: { id: modelId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }
    const publicBase = (
      process.env.UPLOAD_PUBLIC_BASE ?? `${req.protocol}://${req.get("host")}`
    ).replace(/\/$/, "");
    const newUrls = files.map((f) => `${publicBase}/uploads/${f.filename}`);
    const mode = String((req.body as { imageMode?: string }).imageMode ?? "replace");
    const prev = parseStoredModelImages(existing.images);
    const images = mode === "append" ? [...prev, ...newUrls] : newUrls;
    const model = await prisma.fashionModel.update({
      where: { id: modelId },
      data: { images: images as Prisma.InputJsonValue },
      include: { category: true },
    });
    await prisma.adminAuditLog.create({
      data: {
        actorId: req.user!.id,
        action: "model.update",
        entityType: "FashionModel",
        entityId: model.id,
      },
    });
    return res.json(model);
  }

  const parsed = patchModelSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const existing = await prisma.fashionModel.findUnique({
    where: { id: modelId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Not found" });
  }
  const d = parsed.data;
  const data: Prisma.FashionModelUpdateInput = {};
  if (d.basePrice !== undefined) data.basePrice = d.basePrice;
  if (d.name !== undefined) data.name = d.name;
  if (d.subtitle !== undefined) data.subtitle = d.subtitle;
  if (d.description !== undefined) data.description = d.description;
  if (d.images !== undefined) data.images = d.images as Prisma.InputJsonValue;
  if (d.videoUrl !== undefined) data.videoUrl = d.videoUrl;
  if (d.isActive !== undefined) data.isActive = d.isActive;
  if (d.categoryId !== undefined) {
    data.category = { connect: { id: d.categoryId } };
  }
  const model = await prisma.fashionModel.update({
    where: { id: modelId },
    data,
    include: { category: true },
  });
  await prisma.adminAuditLog.create({
    data: {
      actorId: req.user!.id,
      action: "model.update",
      entityType: "FashionModel",
      entityId: model.id,
    },
  });
  return res.json(model);
});

router.delete("/models/:id", async (req: AuthedRequest, res) => {
  const modelId = modelRouteId(req);
  if (!modelId) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const existing = await prisma.fashionModel.findUnique({
    where: { id: modelId },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });
  await prisma.fashionModel.delete({ where: { id: modelId } });
  await prisma.adminAuditLog.create({
    data: {
      actorId: req.user!.id,
      action: "model.delete",
      entityType: "FashionModel",
      entityId: modelId,
    },
  });
  return res.status(204).send();
});

  return router;
}
