"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { LocaleThemeToolbar } from "@/components/LocaleThemeToolbar";

type NavLink = { href: string; labelKey: string };

function linksForRole(
  role: "CLIENT" | "TAILOR" | "ADMIN" | undefined
): NavLink[] {
  if (!role) {
    return [
      { href: "/", labelKey: "maison" },
      { href: "/browse", labelKey: "collections" },
    ];
  }
  if (role === "ADMIN") {
    return [{ href: "/admin", labelKey: "admin" }];
  }
  const base: NavLink[] = [
    { href: "/", labelKey: "maison" },
    { href: "/browse", labelKey: "collections" },
    { href: "/cart", labelKey: "panier" },
    { href: "/orders", labelKey: "commandes" },
  ];
  if (role === "TAILOR") {
    return [...base, { href: "/tailor", labelKey: "atelier" }];
  }
  return base;
}

export function Nav() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountWrapRef = useRef<HTMLDivElement>(null);

  const links = linksForRole(user?.role);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (
        accountWrapRef.current &&
        !accountWrapRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    function onResize() {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/15 bg-cream/85 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-6 sm:py-5">
        <Link href="/" className="group flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <motion.span
            className="hidden h-px w-8 shrink-0 bg-gold sm:block sm:w-10 dark:bg-gold/80"
            layoutId="nav-accent"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
          <div className="min-w-0">
            <p className="font-display text-base tracking-[0.28em] text-bark dark:text-[#F5E9DA] sm:text-lg sm:tracking-[0.35em]">
              MAKASOUK
            </p>
            <p className="truncate text-sm uppercase tracking-[0.4em] text-bark/50 dark:text-cream/45 sm:text-[25px] sm:tracking-[0.55em]">
              منصة مقاسك
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.28em] text-bark/55 dark:text-cream/55 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition hover:text-bark dark:hover:text-cream"
            >
              {t(`nav.${l.labelKey}`)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 text-xs uppercase tracking-[0.2em] sm:gap-3">
          <LocaleThemeToolbar />
          {user ? (
            <div className="relative" ref={accountWrapRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                className={cn(
                  "flex max-w-[200px] items-center gap-2 rounded-full border border-bark/10 px-3 py-2 text-left transition hover:border-gold/40 hover:bg-sand/50",
                  "dark:border-white/15 dark:hover:border-gold/35 dark:hover:bg-white/5",
                  "sm:max-w-none"
                )}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/90 text-[10px] font-medium text-cream dark:bg-[#1F3A2E]">
                  {user.fullName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden truncate text-bark/80 dark:text-cream/80 sm:inline">
                  {user.email}
                </span>
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-2xl border border-gold/20 bg-cream py-2 shadow-fabric dark:border-white/10 dark:bg-zinc-900"
                >
                  <Link
                    href="/account"
                    role="menuitem"
                    className="block px-4 py-2.5 text-xs normal-case tracking-normal text-bark hover:bg-sand/50 dark:text-cream dark:hover:bg-white/5"
                    onClick={() => setAccountOpen(false)}
                  >
                    {t("nav.profil")}
                  </Link>
                  <Link
                    href="/account#settings"
                    role="menuitem"
                    className="block px-4 py-2.5 text-xs normal-case tracking-normal text-bark hover:bg-sand/50 dark:text-cream dark:hover:bg-white/5"
                    onClick={() => setAccountOpen(false)}
                  >
                    {t("nav.parametres")}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-4 py-2.5 text-left text-xs normal-case tracking-normal text-bark hover:bg-sand/50 dark:text-cream dark:hover:bg-white/5"
                    onClick={() => {
                      setAccountOpen(false);
                      logout();
                    }}
                  >
                    {t("nav.deconnexion")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full bg-[#1F3A2E] px-3 py-2 text-[10px] text-[#FCF8F2] transition hover:bg-[#1F3A2E]/90 dark:bg-[#2a4d3e] sm:px-4 sm:text-xs md:px-5"
            >
              {t("nav.connexion")}
            </Link>
          )}
          <button
            type="button"
            className="rounded-full border border-bark/10 p-2 dark:border-white/15 md:hidden"
            aria-label={t("nav.ariaMenu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="block h-0.5 w-5 bg-bark dark:bg-cream" />
            <span className="mt-1 block h-0.5 w-5 bg-bark dark:bg-cream" />
            <span className="mt-1 block h-0.5 w-5 bg-bark dark:bg-cream" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gold/15 bg-cream/95 px-4 py-4 dark:border-white/10 dark:bg-zinc-950/95 sm:px-6 md:hidden">
          <nav className="flex flex-col gap-3 text-xs uppercase tracking-[0.28em] text-bark/70 dark:text-cream/70">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-1"
                onClick={() => setMobileOpen(false)}
              >
                {t(`nav.${l.labelKey}`)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
