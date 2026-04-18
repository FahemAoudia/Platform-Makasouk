"use client";

import Link from "next/link";
import type { Category } from "@/types";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Props = {
  categories: Category[];
  displayClassName: string;
};

export function BrowseCollectionsContent({
  categories,
  displayClassName,
}: Props) {
  const { locale, t } = useI18n();

  return (
    <div
      className={`relative min-h-0 flex-1 bg-[#F5E9DA] dark:bg-[#121820] ${displayClassName} font-sans transition-colors`}
    >
      <div
        className="pointer-events-none absolute inset-0 grain opacity-50 dark:opacity-30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 pattern-mashrabiya-indigo dark:opacity-60"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-12 md:pt-16">
        <header
          className={`animate-archive-fade ${locale === "ar" ? "font-arabic text-right" : ""}`}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#4A3F36]/70 dark:text-cream/55">
            {t("browse.eyebrow")}
          </p>
          <h1 className="mt-5 max-w-3xl font-collections text-[1.75rem] font-medium leading-[1.2] text-[#1C2A44] dark:text-[#E8DCC8] sm:text-4xl md:text-5xl">
            {t("browse.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#4A3F36]/90 dark:text-cream/75 md:text-[17px]">
            {t("browse.intro")}
          </p>
          <div className="mt-10 h-px w-28 bg-[#C6A75E]/55" aria-hidden />
        </header>

        <div className="mt-16 flex flex-col gap-12 md:mt-20 md:gap-16">
          {categories.map((c, index) => (
            <Link
              key={c.id}
              href={`/browse/${c.slug}`}
              className="group block overflow-hidden rounded-sm border border-[#C6A75E]/40 bg-[#FCF8F2]/90 shadow-[0_2px_0_rgba(74,63,54,0.06),0_18px_48px_rgba(28,42,68,0.08)] transition-[box-shadow,transform] duration-500 ease-out animate-archive-fade hover:shadow-[0_4px_0_rgba(198,167,94,0.12),0_28px_64px_rgba(28,42,68,0.12)] dark:border-[#C6A75E]/25 dark:bg-zinc-900/80 dark:shadow-[0_18px_48px_rgba(0,0,0,0.35)]"
              prefetch={true}
              style={{ animationDelay: `${index * 32}ms` }}
            >
              <article className="grid md:grid-cols-[1.2fr_1fr]">
                <div className="relative min-h-[240px] md:min-h-[min(22rem,50vh)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      c.heroImage ??
                      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80"
                    }
                    alt=""
                    className="h-full w-full object-cover transition duration-[1.1s] ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5C1A1B]/88 via-[#5C1A1B]/35 to-transparent" />
                </div>
                <div className="flex flex-col justify-center border-t border-[#C6A75E]/40 bg-[#FCF8F2]/95 px-5 py-8 sm:px-8 sm:py-10 md:border-l md:border-t-0 md:px-10 md:py-12 dark:border-[#C6A75E]/25 dark:bg-zinc-900/90">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-[#A88B48]">
                    {t("browse.salle")} {index + 1}
                  </p>
                  <h2 className="mt-4 font-collections text-2xl font-medium leading-tight text-[#5C1A1B] dark:text-[#E8C4C5] sm:text-3xl md:text-[2rem]">
                    {c.name}
                  </h2>
                  <p className="mt-5 text-sm leading-[1.75] text-[#4A3F36]/92 dark:text-cream/80 md:text-[15px]">
                    {c.description ?? t("browse.fallbackDescription")}
                  </p>
                  <span className="mt-8 inline-flex text-sm font-medium text-[#4A3F36] transition-colors duration-300 group-hover:text-[#5C1A1B] dark:text-cream/75 dark:group-hover:text-[#E8C4C5]">
                    {t("browse.entrer")}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
