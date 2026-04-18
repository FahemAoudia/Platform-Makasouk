import { prisma } from "../lib/prisma";

/**
 * Claim order: Prisma-only transaction (works with SQLite + PostgreSQL).
 * Optimistic concurrency via lockVersion.
 */
export async function acceptOrderForTailor(params: {
  orderId: string;
  tailorProfileId: string;
}) {
  const { orderId, tailorProfileId } = params;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return { ok: false as const, reason: "NOT_FOUND" as const };
    }
    if (order.isDeleted) {
      return { ok: false as const, reason: "NOT_FOUND" as const };
    }
    if (order.status !== "PENDING" || order.tailorId != null) {
      return { ok: false as const, reason: "ALREADY_CLAIMED" as const };
    }

    const categoryId = order.categoryId;

    const link = await tx.tailorCategory.findUnique({
      where: {
        tailorProfileId_categoryId: { tailorProfileId, categoryId },
      },
    });
    const tailor = await tx.tailorProfile.findUnique({
      where: { id: tailorProfileId },
    });
    if (!tailor?.active || !link) {
      return { ok: false as const, reason: "TAILOR_INVALID" as const };
    }

    const updated = await tx.order.updateMany({
      where: {
        id: orderId,
        status: "PENDING",
        tailorId: null,
        isDeleted: false,
        lockVersion: order.lockVersion,
      },
      data: {
        tailorId: tailorProfileId,
        status: "ACCEPTED",
        acceptedAt: new Date(),
        lockVersion: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      return { ok: false as const, reason: "RACE_LOST" as const };
    }

    const full = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { model: true } },
        client: true,
        category: true,
      },
    });

    return { ok: true as const, order: full };
  });
}

export type ReleaseReason =
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "INVALID_STATE"
  | "RACE_LOST";

export async function releaseOrderByTailor(params: {
  orderId: string;
  tailorProfileId: string;
}) {
  const { orderId, tailorProfileId } = params;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return { ok: false as const, reason: "NOT_FOUND" as const };
    }
    if (order.tailorId !== tailorProfileId) {
      return { ok: false as const, reason: "FORBIDDEN" as const };
    }
    if (order.status !== "ACCEPTED" && order.status !== "IN_PROGRESS") {
      return { ok: false as const, reason: "INVALID_STATE" as const };
    }

    const updated = await tx.order.updateMany({
      where: {
        id: orderId,
        tailorId: tailorProfileId,
        lockVersion: order.lockVersion,
      },
      data: {
        tailorId: null,
        status: "PENDING",
        acceptedAt: null,
        lockVersion: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      return { ok: false as const, reason: "RACE_LOST" as const };
    }

    const full = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        category: true,
        items: { include: { model: true } },
        client: { select: { fullName: true, email: true } },
      },
    });

    return {
      ok: true as const,
      order: full,
      categoryId: order.categoryId,
    };
  });
}
