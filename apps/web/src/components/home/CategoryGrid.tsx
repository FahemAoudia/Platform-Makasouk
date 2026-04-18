"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/types";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const { t } = useI18n();
  return (
    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {categories.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.04 }}
        >
          <Link
            href={`/browse/${c.slug}`}
            className="group relative block overflow-hidden rounded-2xl border border-gold/20 bg-cream/90 p-6 shadow-fabric transition duration-300 hover:-translate-y-1 hover:border-gold/45 hover:shadow-fabric-hover dark:border-white/10 dark:bg-zinc-900/60 dark:hover:border-gold/40"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(201,169,98,0.12), transparent 55%)",
              }}
            />
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-dim">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-4 font-display text-xl text-bark dark:text-[#F5E9DA]">
              {c.name}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-bark/55 dark:text-cream/55">
              {c.description}
            </p>
            <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-forest-muted dark:text-cream/45">
              {t("categoryGrid.cta")}
            </p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
