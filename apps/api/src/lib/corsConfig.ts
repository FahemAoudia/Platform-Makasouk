import type { CorsOptions } from "cors";

/**
 * Normalize Railway / browser origins (trim, no trailing slash).
 * Supports comma-separated list: "https://a.app,https://b.app"
 */
function parseOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

/** Shared by Express and Socket.io so browser preflight matches production web URL. */
export function buildCorsOptions(): CorsOptions {
  const origins = parseOrigins();

  if (origins.length === 0) {
    return {
      origin: true,
      credentials: true,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      optionsSuccessStatus: 204,
    };
  }

  const originHandler: CorsOptions["origin"] = (requestOrigin, cb) => {
    if (!requestOrigin) {
      cb(null, true);
      return;
    }
    const normalized = requestOrigin.replace(/\/+$/, "");
    if (origins.includes(normalized)) {
      cb(null, normalized);
      return;
    }
    cb(null, false);
  };

  return {
    origin: originHandler,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 204,
  };
}
