"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-[#C6A75E]/30 bg-[#1F3A2E] text-[#FCF8F2] shadow-[0_-12px_40px_rgba(28,42,68,0.12)] transition-colors dark:border-[#C6A75E]/25 dark:bg-[#0f1f18] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
      <div
        className="pointer-events-none absolute inset-0 grain opacity-[0.38]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="flex flex-col gap-14 border-b border-[#C6A75E]/20 pb-14 md:flex-row md:items-start md:justify-between md:gap-20">
          <div className="max-w-md space-y-5">
            <p className="inline-block w-fit bg-transparent font-display text-2xl font-medium tracking-[0.22em] text-[#C6A75E] shadow-none">
              MAKASOUK
            </p>
            <p className="text-sm font-light leading-[1.75] text-[#FCF8F2]/85">
              {t("footer.tagline")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 text-sm md:gap-20">
            <div className="space-y-4">
              <p className="font-display text-[11px] font-medium uppercase tracking-[0.38em] text-[#C6A75E]/90">
                {t("footer.explorer")}
              </p>
              <Link
                href="/browse"
                className="block text-[#FCF8F2]/80 transition duration-300 hover:text-[#FCF8F2]"
              >
                {t("footer.linkCollections")}
              </Link>
              <Link
                href="/recommendations"
                className="block text-[#FCF8F2]/80 transition duration-300 hover:text-[#FCF8F2]"
              >
                {t("footer.linkRecommendations")}
              </Link>
            </div>
            <div className="space-y-4 border-l border-[#C6A75E]/20 pl-6">
              <p className="font-display text-[11px] font-medium uppercase tracking-[0.38em] text-[#C6A75E]/90">
                {t("footer.service")}
              </p>
              <Link
                href="/orders"
                className="block text-[#FCF8F2]/80 transition duration-300 hover:text-[#FCF8F2]"
              >
                {t("footer.linkOrders")}
              </Link>
              <Link
                href="/tailor"
                className="block text-[#FCF8F2]/80 transition duration-300 hover:text-[#FCF8F2]"
              >
                {t("footer.linkTailor")}
              </Link>
            </div>
          </div>
        </div>
        <div className="pt-8 text-center font-display text-[10px] uppercase tracking-[0.42em] text-[#FCF8F2]/45">
          © {year} {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
