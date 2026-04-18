import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        parchment: "#f3efe6",
        cream: "#faf7f0",
        sand: "#e8dcc8",
        bark: "#3d2914",
        forest: {
          DEFAULT: "#1a3a2f",
          deep: "#132a22",
          muted: "#2d4d42",
        },
        gold: {
          DEFAULT: "#c9a962",
          dim: "#a68b4b",
          bright: "#dfc07a",
        },
        /** Museum archive palette — Les Collections & footer (exact brand hex) */
        archive: {
          ivory: "#F5E9DA",
          cream: "#FCF8F2",
          indigo: "#1C2A44",
          bordeaux: "#5C1A1B",
          sepia: "#4A3F36",
          gold: "#C6A75E",
          goldMuted: "#A88B48",
          emerald: "#1F3A2E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        collections: [
          "var(--font-collections-display)",
          "var(--font-display)",
          "Georgia",
          "serif",
        ],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        lift: "0 24px 80px rgba(0,0,0,0.12)",
        card: "0 12px 40px rgba(0,0,0,0.08)",
        fabric:
          "0 4px 24px rgba(44, 36, 22, 0.08), inset 0 1px 0 rgba(255,255,255,0.45)",
        "fabric-hover":
          "0 8px 36px rgba(201, 169, 98, 0.22), 0 4px 20px rgba(26, 58, 47, 0.12)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "archive-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 8s linear infinite",
        /** `both` = backwards+forwards so staggered delays don’t leave opacity at 0 */
        "archive-fade": "archive-fade 0.45s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
