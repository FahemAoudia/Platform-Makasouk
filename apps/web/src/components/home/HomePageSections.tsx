"use client";

import Link from "next/link";
import type { Category, FashionModel } from "@/types";
import { ModelCard } from "@/components/ModelCard";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { TailorsStrip } from "@/components/home/TailorsStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { SectionOrnament } from "@/components/home/SectionOrnament";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Props = {
  categories: Category[];
  models: FashionModel[];
  rec: FashionModel[];
};

export function HomePageSections({ categories, models, rec }: Props) {
  const { locale, t } = useI18n();

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div
            className={`text-center md:text-left ${locale === "ar" ? "font-arabic" : ""}`}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <p className="text-[10px] uppercase tracking-[0.45em] text-bark/45 dark:text-cream/45">
              {t("home.lignesEyebrow")}
            </p>
            <h2 className="mt-3 font-display text-[1.85rem] leading-tight text-bark dark:text-[#F5E9DA] sm:text-4xl md:text-[2.75rem]">
              {t("home.lignesTitle")}
            </h2>
            <SectionOrnament />
            <p className="font-arabic mt-6 text-lg text-bark/70 dark:text-cream/70">
              {t("home.lignesArabic")}
            </p>
          </div>
          <p
            className={`max-w-md text-sm leading-relaxed text-bark/55 dark:text-cream/60 ${locale === "ar" ? "font-arabic text-right" : ""}`}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {t("home.lignesDesc")}
          </p>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      <TailorsStrip />

      <section className="border-y border-gold/15 bg-sand/40 py-16 dark:border-white/10 dark:bg-zinc-900/40 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className={locale === "ar" ? "font-arabic text-right" : ""} dir={locale === "ar" ? "rtl" : "ltr"}>
              <p className="text-[10px] uppercase tracking-[0.45em] text-bark/45 dark:text-cream/45">
                {t("home.selectionEyebrow")}
              </p>
              <h2 className="mt-3 font-display text-[1.85rem] leading-tight text-bark dark:text-[#F5E9DA] sm:text-4xl">
                {t("home.selectionTitle")}
              </h2>
              <SectionOrnament />
            </div>
            <Link
              href="/recommendations"
              className="text-xs uppercase tracking-[0.3em] text-gold-dim transition hover:text-gold dark:text-gold/80"
            >
              {t("home.selectionLink")}
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {rec.map((m, i) => (
              <ModelCard key={m.id} model={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div
          className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${locale === "ar" ? "font-arabic text-right" : ""}`}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-bark/45 dark:text-cream/45">
              {t("home.lookbookEyebrow")}
            </p>
            <h2 className="mt-3 font-display text-[1.85rem] leading-tight text-bark dark:text-[#F5E9DA] sm:text-4xl">
              {t("home.lookbookTitle")}
            </h2>
            <SectionOrnament />
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {models.slice(0, 6).map((m, i) => (
            <ModelCard key={m.id} model={m} index={i} />
          ))}
        </div>
      </section>

      <Testimonials />
    </>
  );
}
