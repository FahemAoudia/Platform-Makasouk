"use client";

import type { FashionModel } from "@/types";
import { ModelCard } from "@/components/ModelCard";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function BrowseCategoryView({
  slug,
  models,
}: {
  slug: string;
  models: FashionModel[];
}) {
  const { locale, t } = useI18n();
  const title = slug.replace(/-/g, " ");

  return (
    <div
      className={`mx-auto max-w-7xl px-6 py-16 dark:text-cream ${locale === "ar" ? "font-arabic" : ""}`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <p className="text-[10px] uppercase tracking-[0.45em] text-ink/40 dark:text-cream/45">
        {t("browseSlug.eyebrow")}
      </p>
      <h1 className="mt-4 font-display text-5xl capitalize text-ink dark:text-[#F5E9DA]">
        {title}
      </h1>
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {models.map((m, i) => (
          <ModelCard key={m.id} model={m} index={i} />
        ))}
      </div>
    </div>
  );
}
