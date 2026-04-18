"use client";

import { motion } from "framer-motion";
import { messages } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function TailorsStrip() {
  const { locale } = useI18n();
  const copy = messages[locale].tailors;
  const artisans = copy.cards;

  return (
    <section className="border-y border-gold/15 bg-gradient-to-b from-forest-deep to-forest py-20 text-cream dark:border-white/10 dark:from-zinc-950 dark:to-[#0f1a16]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] uppercase tracking-[0.45em] text-gold-bright/90">
            {copy.eyebrow}
          </p>
          <h2
            className={`mt-4 font-display text-3xl text-cream md:text-4xl ${locale === "ar" ? "font-arabic" : ""}`}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {copy.title}
          </h2>
          <p
            lang="ar"
            dir="rtl"
            className="font-arabic mt-4 text-lg leading-relaxed text-cream/85"
          >
            {copy.arabicLine}
          </p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {artisans.map((a, i) => (
            <motion.article
              key={`${a.name}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative rounded-2xl border border-gold/20 bg-forest/40 p-8 shadow-fabric backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
            >
              <div
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
                aria-hidden
              />
              <p
                className={`text-[10px] uppercase tracking-[0.35em] text-gold ${locale === "ar" ? "font-arabic" : ""}`}
                dir={locale === "ar" ? "rtl" : "ltr"}
              >
                {a.line}
              </p>
              <h3
                className={`mt-4 font-display text-xl text-cream ${locale === "ar" ? "font-arabic" : ""}`}
                dir={locale === "ar" ? "rtl" : "ltr"}
              >
                {a.name}
              </h3>
              <p
                className={`mt-3 text-sm leading-relaxed text-cream/70 ${locale === "ar" ? "font-arabic" : ""}`}
                dir={locale === "ar" ? "rtl" : "ltr"}
              >
                {a.note}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
