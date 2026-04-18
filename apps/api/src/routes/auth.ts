import { Router } from "express";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { authMiddleware, type AuthedRequest } from "../middleware/auth";

const router = Router();

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(2),
    role: z.enum(["CLIENT", "TAILOR"]).optional(),
    /** Required when role is TAILOR — category cuid strings */
    categoryIds: z.array(z.string().min(1)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "TAILOR") {
      if (!data.categoryIds || data.categoryIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tailors must select at least one category",
          path: ["categoryIds"],
        });
      }
    }
  });

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, fullName, role, categoryIds } = parsed.data;
  const effectiveRole =
    role === "TAILOR" ? Role.TAILOR : Role.CLIENT;

  if (effectiveRole === Role.TAILOR && categoryIds) {
    const found = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    if (found.length !== categoryIds.length) {
      return res.status(400).json({ error: "One or more invalid category ids" });
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (effectiveRole === Role.TAILOR && categoryIds?.length) {
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
        tailorProfile: {
          include: { categories: { include: { category: true } } },
        },
      },
    });

    console.log(
      "[auth/register] tailor created",
      user.id,
      "categories:",
      categoryIds
    );

    const token = signToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  }

  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, role: effectiveRole },
  });

  await prisma.userPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      categoryWeights: {},
      tagAffinity: [],
    },
    update: {},
  });

  const token = signToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (user.disabled) {
    return res.status(403).json({ error: "Account disabled" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = signToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
});

router.get("/me", authMiddleware, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      tailorProfile: {
        include: {
          categories: { include: { category: true } },
        },
      },
    },
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  const { passwordHash: _, ...rest } = user;
  return res.json(rest);
});

const profilePatchSchema = z
  .object({
    fullName: z.string().min(2).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).optional(),
  })
  .refine(
    (d) => {
      const pwd = !!(d.currentPassword || d.newPassword);
      if (!pwd) return true;
      return !!(d.currentPassword && d.newPassword);
    },
    { message: "Both current and new password are required to change password" }
  );

router.patch("/profile", authMiddleware, async (req: AuthedRequest, res) => {
  const parsed = profilePatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { fullName, currentPassword, newPassword } = parsed.data;

  if (
    fullName === undefined &&
    !newPassword
  ) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });
  if (!dbUser) {
    return res.status(404).json({ error: "Not found" });
  }

  if (newPassword && currentPassword) {
    const ok = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!ok) {
      return res.status(400).json({ error: "Invalid current password" });
    }
  }

  const data: { fullName?: string; passwordHash?: string } = {};
  if (fullName !== undefined) {
    data.fullName = fullName;
  }
  if (newPassword) {
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data,
    select: { id: true, email: true, fullName: true, role: true },
  });

  const token = signToken({
    sub: updated.id,
    role: updated.role,
    email: updated.email,
  });

  return res.json({ user: updated, token });
});

export default router;
