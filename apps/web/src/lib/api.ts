const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

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
  const headers = new Headers(rest.headers);
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, {
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

export { API_BASE };
