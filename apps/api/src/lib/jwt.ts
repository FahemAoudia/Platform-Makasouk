import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "dev-secret-change-me";

export type JwtPayload = {
  sub: string;
  role: Role;
  email: string;
};

export function signToken(
  payload: JwtPayload,
  expiresIn: NonNullable<SignOptions["expiresIn"]> = "7d"
) {
  const opts: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, opts);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
