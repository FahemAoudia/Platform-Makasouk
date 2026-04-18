/**
 * Express path params may be typed as `string | string[]` (strict / Express 5).
 */
export function paramString(
  v: string | string[] | undefined
): string | undefined {
  if (v === undefined) return undefined;
  if (typeof v === "string") return v;
  return typeof v[0] === "string" ? v[0] : undefined;
}

/** Prisma Json list fields → string[] for Set / iteration */
export function jsonToStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}
