"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";

type AccountType = "CLIENT" | "TAILOR";

export default function RegisterPage() {
  const { t } = useI18n();
  const { setSession } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("CLIENT");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Category[]>("/catalog/categories")
      .then(setCategories)
      .catch(() => setError(t("auth.loadCategoriesError")));
  }, [t]);

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (accountType === "TAILOR" && selectedCategoryIds.size === 0) {
      setError(t("auth.tailorCategoryRequired"));
      return;
    }
    try {
      const body: Record<string, unknown> = {
        email,
        password,
        fullName,
        role: accountType,
      };
      if (accountType === "TAILOR") {
        body.categoryIds = Array.from(selectedCategoryIds);
      }
      const res = await api<{ token: string; user: never }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setSession(res.token, res.user as never);
      router.push(accountType === "TAILOR" ? "/tailor" : "/browse");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.registerFailed"));
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <p className="text-[10px] uppercase tracking-[0.45em] text-ink/40 dark:text-cream/50">
        {t("auth.registerEyebrow")}
      </p>
      <h1 className="mt-4 font-display text-4xl text-ink dark:text-cream">
        {t("auth.registerTitle")}
      </h1>
      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <fieldset>
          <legend className="block text-xs uppercase tracking-[0.25em] text-ink/45 dark:text-cream/70">
            {t("auth.accountType")}
          </legend>
          <div className="mt-3 flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink dark:text-cream">
              <input
                type="radio"
                name="role"
                checked={accountType === "CLIENT"}
                onChange={() => setAccountType("CLIENT")}
              />
              {t("auth.client")}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink dark:text-cream">
              <input
                type="radio"
                name="role"
                checked={accountType === "TAILOR"}
                onChange={() => setAccountType("TAILOR")}
              />
              {t("auth.tailor")}
            </label>
          </div>
        </fieldset>

        {accountType === "TAILOR" && (
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-ink/45 dark:text-cream/70">
              {t("auth.tailorCategories")}
            </p>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-black/10 bg-white/80 p-3 dark:border-white/15 dark:bg-zinc-900/90">
              {categories.map((c) => (
                <label
                  key={c.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink dark:text-cream",
                    selectedCategoryIds.has(c.id) && "bg-gold/15 dark:bg-gold/25"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.has(c.id)}
                    onChange={() => toggleCategory(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <label className="block text-xs uppercase tracking-[0.25em] text-ink/45 dark:text-cream/70">
          {t("auth.fullName")}
          <input
            className="mt-3 w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-ink outline-none ring-gold/30 focus:ring-2 dark:border-white/15 dark:bg-zinc-900/90 dark:text-cream dark:placeholder:text-cream/35"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className="block text-xs uppercase tracking-[0.25em] text-ink/45 dark:text-cream/70">
          {t("auth.email")}
          <input
            className="mt-3 w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-ink outline-none ring-gold/30 focus:ring-2 dark:border-white/15 dark:bg-zinc-900/90 dark:text-cream dark:placeholder:text-cream/35"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-xs uppercase tracking-[0.25em] text-ink/45 dark:text-cream/70">
          {t("auth.password")}
          <input
            className="mt-3 w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-ink outline-none ring-gold/30 focus:ring-2 dark:border-white/15 dark:bg-zinc-900/90 dark:text-cream dark:placeholder:text-cream/35"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          className="w-full rounded-full bg-ink py-3 text-xs uppercase tracking-[0.35em] text-parchment transition hover:bg-ink/90 dark:bg-cream dark:text-ink dark:hover:bg-cream/90"
        >
          {accountType === "TAILOR"
            ? t("auth.submitTailor")
            : t("auth.submitClient")}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-ink/50 dark:text-cream/65">
        {t("auth.alreadyMember")}{" "}
        <Link
          href="/auth/login"
          className="text-gold hover:underline dark:text-gold/90"
        >
          {t("auth.signInLink")}
        </Link>
      </p>
    </div>
  );
}
