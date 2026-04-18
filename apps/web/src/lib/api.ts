const DEFAULT_API = "http://localhost:4000/api";

/**
 * Base URL vers l’API.
 * - Côté **serveur** (RSC) : `API_URL` est lu au runtime (Railway) — pas seulement au build.
 * - Côté **client** : `NEXT_PUBLIC_API_URL` (injecté au build).
 */
function getApiBase(): string {
  const trim = (s: string) => s.replace(/\/+$/, "");
  if (typeof window === "undefined") {
    return (
      (process.env.API_URL ? trim(process.env.API_URL) : undefined) ??
      (process.env.NEXT_PUBLIC_API_URL
        ? trim(process.env.NEXT_PUBLIC_API_URL)
        : undefined) ??
      DEFAULT_API
    );
  }
  return (
    (process.env.NEXT_PUBLIC_API_URL
      ? trim(process.env.NEXT_PUBLIC_API_URL)
      : undefined) ?? DEFAULT_API
  );
}

/** Options étendues pour le cache Next.js (fetch côté serveur / RSC). */
export type ApiInit = RequestInit & {
  token?: string | null;
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function api<T>(
  path: string,
  init?: ApiInit
): Promise<T> {
  const { token, next, ...rest } = init ?? {};
  const base = getApiBase();
  const headers = new Headers(rest.headers);
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers,
    ...(next ? { next } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
