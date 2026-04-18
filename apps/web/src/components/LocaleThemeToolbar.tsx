"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

function IconLang({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 8l6 6" />
      <path d="M4 14l6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="M22 22l-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export function LocaleThemeToolbar() {
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <button
        type="button"
        onClick={() => setLocale(locale === "fr" ? "ar" : "fr")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-medium uppercase tracking-[0.18em] transition",
          "border-bark/15 bg-white/60 text-bark/80 hover:border-gold/40 hover:bg-sand/40",
          "dark:border-white/15 dark:bg-white/5 dark:text-cream/85 dark:hover:border-gold/35 dark:hover:bg-white/10"
        )}
        aria-label={locale === "fr" ? t("toolbar.toArabic") : t("toolbar.toFrench")}
        title={locale === "fr" ? t("toolbar.toArabic") : t("toolbar.toFrench")}
      >
        <IconLang className="opacity-80" />
        <span className="hidden sm:inline">
          {locale === "fr" ? t("toolbar.toArabic") : t("toolbar.toFrench")}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border transition",
          "border-bark/15 bg-white/60 text-bark/80 hover:border-gold/40 hover:bg-sand/40",
          "dark:border-white/15 dark:bg-white/5 dark:text-gold-bright dark:hover:border-gold/35"
        )}
        aria-label={isDark ? t("toolbar.light") : t("toolbar.dark")}
        title={isDark ? t("toolbar.light") : t("toolbar.dark")}
      >
        {!mounted ? (
          <IconSun className="opacity-60" />
        ) : isDark ? (
          <IconSun className="text-gold-bright" />
        ) : (
          <IconMoon className="opacity-80" />
        )}
      </button>
    </div>
  );
}
