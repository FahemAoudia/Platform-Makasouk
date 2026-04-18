"use client";

import { motion } from "framer-motion";
import { messages } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function Testimonials() {
  const { locale } = useI18n();
  const copy = messages[locale].testimonials;
  const quotes = copy.quotes;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.45em] text-bark/45 dark:text-cream/45">
          {copy.eyebrow}
        </p>
        <h2
          className={`mt-4 font-display text-4xl text-bark dark:text-[#F5E9DA] ${locale === "ar" ? "font-arabic" : ""}`}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          {copy.title}
        </h2>
        <p
          lang="ar"
          dir="rtl"
          className="font-arabic mx-auto mt-4 max-w-lg text-base text-bark/65 dark:text-cream/65"
        >
          {copy.arabicLine}
        </p>
      </div>
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {quotes.map((q, i) => (
          <motion.blockquote
            key={q.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.06 }}
            className="relative rounded-2xl border border-gold/20 bg-cream/90 p-8 shadow-fabric dark:border-white/10 dark:bg-zinc-900/70"
          >
            <span
              className="font-display text-5xl leading-none text-gold/35"
              aria-hidden
            >
              “
            </span>
            <p
              className={`mt-2 text-sm leading-relaxed text-bark/80 dark:text-cream/80 ${locale === "ar" ? "font-arabic text-right" : ""}`}
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              {q.text}
            </p>
            <footer className="mt-6 border-t border-gold/15 pt-4 dark:border-white/10">
              <p className="font-display text-lg text-bark dark:text-cream">
                {q.name}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-bark/45 dark:text-cream/45">
                {q.place}
              </p>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
