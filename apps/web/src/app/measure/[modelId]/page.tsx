"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { FashionModel, MeasurementField } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMeasureStep, measurementKeyLabel } from "@/lib/i18n/messages";

export default function MeasurePage() {
  const params = useParams<{ modelId: string }>();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { token, user } = useAuth();
  const [model, setModel] = useState<FashionModel | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [fields, setFields] = useState<MeasurementField[]>([]);
  const [values, setValues] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, f] = await Promise.all([
          api<FashionModel>(`/catalog/models/${params.modelId}`),
          api<MeasurementField[]>("/catalog/measurement-fields"),
        ]);
        if (!cancelled) {
          setModel(m);
          setFields(f);
          const init: Record<string, number> = {};
          f.forEach((field) => {
            init[field.key] = 90;
          });
          setValues(init);
        }
      } catch {
        if (!cancelled) setError(t("measure.loadModelError"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.modelId, t]);

  const active = useMemo(() => fields[step], [fields, step]);

  async function addToCart() {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    if (!model) return;
    setError(null);
    try {
      await api("/cart/items", {
        method: "POST",
        token,
        body: JSON.stringify({
          modelId: model.id,
          measurements: values,
          quantity: user?.role === "ADMIN" ? quantity : 1,
        }),
      });
      router.push("/cart");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("measure.addToCartError"));
    }
  }

  if (!model) {
    return (
      <div className="px-6 py-24 text-center text-sm text-ink/50 dark:text-cream/65">
        {error ?? t("common.loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-[10px] uppercase tracking-[0.45em] text-ink/40 dark:text-cream/55">
        {t("measure.eyebrow")}
      </p>
      <h1 className="mt-4 font-display text-4xl text-ink dark:text-cream">
        {t("measure.titlePrefix")} {model.name}
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink/55 dark:text-cream/80">
        {t("measure.intro")}
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white shadow-card dark:bg-zinc-900 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                {active.guideImageUrl ? (
                  <Image
                    src={active.guideImageUrl}
                    alt={measurementKeyLabel(locale, active.key)}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-parchment text-sm text-ink/40 dark:bg-zinc-800 dark:text-cream/55">
                    {t("measure.visualGuide")}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/70">
                    {formatMeasureStep(locale, step + 1, fields.length)}
                  </p>
                  <h2 className="mt-2 font-display text-3xl">
                    {measurementKeyLabel(locale, active.key)}
                  </h2>
                  {active.guideVideoUrl && (
                    <a
                      href={active.guideVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-xs uppercase tracking-[0.3em] text-gold"
                    >
                      {t("measure.watchMotionGuide")}
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          {fields.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStep(i)}
              className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${
                step === i
                  ? "border-gold/60 bg-white shadow-card dark:border-gold/50 dark:bg-zinc-900 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                  : "border-black/5 bg-white/60 hover:border-black/15 dark:border-white/10 dark:bg-zinc-900/60 dark:hover:border-white/20"
              }`}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-ink/40 dark:text-cream/55">
                  {measurementKeyLabel(locale, f.key)}
                </p>
                <p className="mt-1 text-lg text-ink dark:text-cream">
                  {values[f.key]?.toFixed(1)} {f.unit}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold dark:text-gold-bright">
                {step === i ? t("measure.active") : t("measure.edit")}
              </span>
            </button>
          ))}

          {active && (
            <div className="rounded-2xl border border-black/5 bg-white/80 p-6 dark:border-white/10 dark:bg-zinc-900/90">
              <label className="text-xs uppercase tracking-[0.25em] text-ink/45 dark:text-cream/75">
                {t("measure.adjustPrefix")}{" "}
                {measurementKeyLabel(locale, active.key)} ({active.unit})
              </label>
              <input
                type="range"
                min={40}
                max={160}
                step={0.5}
                value={values[active.key] ?? 90}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [active.key]: Number(e.target.value),
                  }))
                }
                className="mt-4 w-full accent-gold"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {user?.role === "ADMIN" && (
            <div className="rounded-2xl border border-gold/25 bg-cream/90 p-5 dark:border-white/15 dark:bg-zinc-900/80">
              <label className="text-xs uppercase tracking-[0.25em] text-bark/55 dark:text-cream/70">
                Quantité (administration)
              </label>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold/30 bg-white text-bark hover:border-gold dark:border-white/20 dark:bg-zinc-800 dark:text-cream dark:hover:border-gold/50"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.min(99, Number(e.target.value) || 1))
                    )
                  }
                  className="w-20 rounded-lg border border-gold/20 px-3 py-2 text-center text-bark dark:border-white/15 dark:bg-zinc-950 dark:text-cream"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold/30 bg-white text-bark hover:border-gold dark:border-white/20 dark:bg-zinc-800 dark:text-cream dark:hover:border-gold/50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={addToCart}
            className="w-full rounded-full bg-forest py-4 text-xs uppercase tracking-[0.35em] text-cream transition hover:bg-forest-muted"
          >
            {t("measure.addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
