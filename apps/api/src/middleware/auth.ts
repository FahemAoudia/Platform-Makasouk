import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";

export type AuthedRequest = Request & {
  user?: { id: string; role: Role; email: string };
};

export async function authMiddleware(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = verifyToken(token);
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { disabled: true },
    });
    if (dbUser?.disabled) {
      return res.status(403).json({ error: "Account disabled" });
    }
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
