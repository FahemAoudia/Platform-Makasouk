"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { FashionModel } from "@/types";
import { ModelCard } from "@/components/ModelCard";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function RecommendationsPage() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [models, setModels] = useState<FashionModel[]>([]);
  const [strategy, setStrategy] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api<{ models: FashionModel[]; strategy: string }>("/recommendations", {
      token,
    })
      .then((r) => {
        setModels(r.models);
        setStrategy(r.strategy);
      })
      .catch(() => setModels([]));
  }, [token]);

  if (!token) {
    return (
      <div className="px-6 py-24 text-center text-sm text-ink/55">
        {t("recommendations.signIn")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-[10px] uppercase tracking-[0.45em] text-ink/40">
        {t("recommendations.eyebrow")}
      </p>
      <h1 className="mt-4 font-display text-4xl text-ink">
        {t("recommendations.title")}
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink/55">
        {t("recommendations.intro")}
        {strategy && (
          <span className="ml-2 text-xs uppercase tracking-[0.25em] text-gold">
            {strategy}
          </span>
        )}
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {models.map((m, i) => (
          <ModelCard key={m.id} model={m} index={i} />
        ))}
      </div>
    </div>
  );
}
