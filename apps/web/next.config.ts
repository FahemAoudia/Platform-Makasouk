import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Reduces peak RAM during `next build` (helps small Railway/Nixpacks builders). Run `npm run lint -w apps/web` in CI if desired. */
  eslint: {
    ignoreDuringBuilds: true,
  },
  /** Fewer parallel webpack units → lower memory at the cost of slower builds. */
  webpack: (config) => {
    config.parallelism = 1;
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
