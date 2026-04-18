"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function Hero() {
  const { locale, t } = useI18n();

  return (
    <section className="relative overflow-hidden border-b border-gold/15 dark:border-white/10">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-algerian-caftan.jpeg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-deep via-forest-deep/88 to-bark/75 dark:from-black/80 dark:via-black/70 dark:to-black/85" />
        <div className="pattern-mashrabiya absolute inset-0 opacity-90 mix-blend-soft-light dark:opacity-60" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-20 sm:gap-12 sm:px-6 sm:py-28 md:flex-row md:items-end md:py-36">
        <div className="max-w-2xl">
          <motion.p
            className="text-[10px] uppercase tracking-[0.45em] text-gold-bright sm:tracking-[0.55em]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("hero.kicker")}
          </motion.p>
          <motion.h1
            className={`mt-5 font-display text-[2.15rem] leading-[1.12] text-cream sm:mt-6 sm:text-5xl md:text-6xl lg:text-[3.5rem] ${locale === "ar" ? "font-arabic" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {t("hero.titleBefore")}{" "}
            <span className="text-gold-bright">{t("hero.titleAccent")}</span>
          </motion.h1>
          {locale === "fr" && (
            <motion.p
              lang="ar"
              dir="rtl"
              className="font-arabic mt-6 text-xl leading-relaxed text-cream/90 md:text-2xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
            >
              {t("hero.arabicLine")}
            </motion.p>
          )}
          <motion.p
            className={`mt-5 max-w-xl text-sm leading-relaxed text-cream/75 md:text-base ${locale === "ar" ? "font-arabic text-lg md:text-xl" : ""}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: locale === "fr" ? 0.14 : 0.1 }}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {t("hero.body")}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/browse"
              className="inline-flex justify-center rounded-full bg-gold px-6 py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.26em] text-bark shadow-fabric-hover transition hover:bg-gold-bright sm:px-8 sm:text-xs sm:tracking-[0.3em]"
            >
              {t("hero.ctaBrowse")}
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex justify-center rounded-full border border-cream/35 bg-cream/5 px-6 py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.26em] text-cream backdrop-blur-sm transition hover:border-gold/50 hover:bg-cream/10 sm:px-8 sm:text-xs sm:tracking-[0.3em]"
            >
              {t("hero.ctaRegister")}
            </Link>
          </motion.div>
        </div>
        <div className="hidden md:block md:flex-1" />
      </div>
    </section>
  );
}
