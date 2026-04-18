"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function FavoriteButton({ modelId }: { modelId: string }) {
  const { t } = useI18n();
  const { token } = useAuth();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function toggle() {
    if (!token) {
      setErr("Sign in to save favorites");
      return;
    }
    setErr(null);
    try {
      await api(`/favorites/${modelId}`, { method: "POST", token });
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("favorite.saveError"));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={toggle}
        className="rounded-full border border-ink/15 px-8 py-3 text-xs uppercase tracking-[0.35em] text-ink transition hover:border-gold/60 dark:border-white/20 dark:text-cream dark:hover:border-gold/50"
      >
        {done ? t("favorite.saved") : t("favorite.add")}
      </button>
      {err && (
        <p className="text-xs text-red-600 dark:text-red-400">{err}</p>
      )}
    </div>
  );
}
