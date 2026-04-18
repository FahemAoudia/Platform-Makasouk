"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { measurementKeyLabel } from "@/lib/i18n/messages";

type OrderItemRow = {
  id: string;
  quantity: number;
  measurements: unknown;
  model: { name: string };
};

type OrderDetail = {
  id: string;
  items: OrderItemRow[];
};

type MeasurementFieldRow = {
  key: string;
  label: string;
  unit: string;
  guideImageUrl?: string | null;
  guideVideoUrl?: string | null;
};

function parseMeasurements(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isNaN(n)) out[k] = n;
  }
  return out;
}

type Props = {
  open: boolean;
  orderId: string | null;
  token: string | null;
  onClose: () => void;
};

export function TailorMeasurementsModal({
  open,
  orderId,
  token,
  onClose,
}: Props) {
  const { locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [fields, setFields] = useState<MeasurementFieldRow[]>([]);

  const load = useCallback(async () => {
    if (!orderId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const [o, f] = await Promise.all([
        api<OrderDetail>(`/orders/${orderId}`, { token }),
        api<MeasurementFieldRow[]>("/catalog/measurement-fields"),
      ]);
      setOrder(o);
      setFields(f);
    } catch (e) {
      setOrder(null);
      setError(e instanceof Error ? e.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, [orderId, token]);

  useEffect(() => {
    if (open && orderId && token) {
      void load();
    } else if (!open) {
      setOrder(null);
      setError(null);
    }
  }, [open, orderId, token, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const fieldByKey = new Map(fields.map((x) => [x.key, x]));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tailor-measurements-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-bark/40 backdrop-blur-sm"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-3xl border border-gold/20 bg-cream p-6 shadow-fabric"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="tailor-measurements-title"
            className="font-display text-2xl text-bark"
          >
            Mesures du client
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-bark/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-bark/70 hover:bg-sand/50"
          >
            Fermer
          </button>
        </div>

        {loading && (
          <p className="mt-8 text-sm text-bark/50">Chargement…</p>
        )}
        {error && (
          <p className="mt-8 text-sm text-red-700">{error}</p>
        )}

        {!loading && !error && order && (
          <div className="mt-8 space-y-8">
            {order.items.map((item) => {
              const m = parseMeasurements(item.measurements);
              const keys = Object.keys(m);
              return (
                <div key={item.id}>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-bark/45">
                    {item.model.name}
                    {item.quantity > 1 ? (
                      <span className="ml-2 text-bark/55">
                        × {item.quantity}
                      </span>
                    ) : null}
                  </p>
                  {keys.length === 0 ? (
                    <p className="mt-2 text-sm text-bark/50">
                      Aucune mesure enregistrée pour cette pièce.
                    </p>
                  ) : (
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {keys.map((key) => {
                        const spec = fieldByKey.get(key);
                        const label = measurementKeyLabel(locale, key);
                        const unit = spec?.unit ?? "cm";
                        return (
                          <li
                            key={`${item.id}-${key}`}
                            className="flex justify-between gap-3 rounded-xl border border-gold/15 bg-white/60 px-3 py-2.5 text-sm"
                          >
                            <span className="text-bark/70">{label}</span>
                            <span className="font-medium tabular-nums text-bark">
                              {m[key]} {unit}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {keys.some((k) => fieldByKey.get(k)?.guideImageUrl) && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {keys.map((key) => {
                        const spec = fieldByKey.get(key);
                        const img = spec?.guideImageUrl;
                        if (!img) return null;
                        return (
                          <figure
                            key={`g-${item.id}-${key}`}
                            className="overflow-hidden rounded-xl border border-gold/15"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={measurementKeyLabel(locale, key)}
                              className="max-h-40 w-auto object-contain"
                            />
                            <figcaption className="px-2 py-1 text-center text-[10px] text-bark/55">
                              {measurementKeyLabel(locale, key)}
                            </figcaption>
                          </figure>
                        );
                      })}
                    </div>
                  )}
                  {keys.some((k) => fieldByKey.get(k)?.guideVideoUrl) && (
                    <div className="mt-4 space-y-2">
                      {keys.map((key) => {
                        const spec = fieldByKey.get(key);
                        const vid = spec?.guideVideoUrl;
                        if (!vid) return null;
                        return (
                          <div key={`v-${item.id}-${key}`}>
                            <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-bark/45">
                              Vidéo — {measurementKeyLabel(locale, key)}
                            </p>
                            <video
                              src={vid}
                              controls
                              className="w-full max-w-md rounded-xl border border-gold/15"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
