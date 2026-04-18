"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function LoginPage() {
  const { t } = useI18n();
  const { setSession } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api<{ token: string; user: never }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(res.token, res.user as never);
      router.push("/browse");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <p className="text-[10px] uppercase tracking-[0.45em] text-ink/40 dark:text-cream/50">
        {t("auth.loginEyebrow")}
      </p>
      <h1 className="mt-4 font-display text-4xl text-ink dark:text-cream">
        {t("auth.loginTitle")}
      </h1>
      <form onSubmit={onSubmit} className="mt-10 space-y-6">
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
          {t("auth.continue")}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-ink/50 dark:text-cream/65">
        {t("auth.newGuest")}{" "}
        <Link
          href="/auth/register"
          className="text-gold hover:underline dark:text-gold/90"
        >
          {t("auth.createAccountLink")}
        </Link>
      </p>
    </div>
  );
}
