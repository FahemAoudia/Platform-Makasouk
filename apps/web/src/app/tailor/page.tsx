"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { createSocket } from "@/lib/socket";
import { TailorMeasurementsModal } from "@/components/tailor/TailorMeasurementsModal";
import { cn, formatDateTime, formatPriceWithSymbol } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { orderStatusLabel } from "@/lib/i18n/messages";

type Order = {
  id: string;
  subtotal: string | number;
  createdAt: string;
  status: string;
  category?: { name: string; slug: string };
  client: { fullName: string };
  items: { model: { name: string } }[];
};

export default function TailorDashboardPage() {
  const { t, locale } = useI18n();
  const { token, user } = useAuth();
  const [tab, setTab] = useState<"available" | "mine">("available");
  const [available, setAvailable] = useState<Order[]>([]);
  const [mine, setMine] = useState<Order[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [noCategories, setNoCategories] = useState(false);
  const [measurementsOrderId, setMeasurementsOrderId] = useState<
    string | null
  >(null);

  const refresh = useCallback(async () => {
    if (!token || user?.role !== "TAILOR") return;
    const [a, m] = await Promise.all([
      api<Order[]>("/tailor/orders/available", { token }),
      api<Order[]>("/tailor/orders/mine", { token }),
    ]);
    setAvailable(a);
    setMine(m);
  }, [token, user?.role]);

  useEffect(() => {
    if (!token || user?.role !== "TAILOR") return;
    api<{ categories: { categoryId: string }[] }>("/tailor/profile", { token })
      .then((p) => setNoCategories(p.categories.length === 0))
      .catch(() => {});
  }, [token, user?.role]);

  useEffect(() => {
    if (!token || user?.role !== "TAILOR") return;
    refresh().catch(() => setMsg(t("tailor.loadError")));
  }, [token, user?.role, refresh, t]);

  const socketRef = useRef<ReturnType<typeof createSocket> | null>(null);
  const categoryIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!token || user?.role !== "TAILOR") return;

    (async () => {
      try {
        const prof = await api<{
          categories: { categoryId: string }[];
        }>("/tailor/profile", { token });
        const ids = prof.categories.map((c) => c.categoryId);
        categoryIdsRef.current = ids;
        const socket = createSocket(token);
        socketRef.current = socket;
        ids.forEach((id) => socket.emit("tailor:join", id));
        socket.on("order:new", () => {
          void refresh();
        });
        socket.on("order:taken", (payload: { orderId?: string }) => {
          if (payload?.orderId) {
            setAvailable((prev) => prev.filter((o) => o.id !== payload.orderId));
          }
          void refresh();
        });
        socket.on("order:deleted", (payload: { orderId?: string }) => {
          if (payload?.orderId) {
            setAvailable((prev) =>
              prev.filter((o) => o.id !== payload.orderId)
            );
          }
          void refresh();
        });
        socket.on("order:cancelled", (payload: { orderId?: string }) => {
          if (payload?.orderId) {
            setAvailable((prev) =>
              prev.filter((o) => o.id !== payload.orderId)
            );
          }
          void refresh();
        });
      } catch {
        setMsg(t("tailor.profileMissing"));
      }
    })();

    return () => {
      const socket = socketRef.current;
      const ids = categoryIdsRef.current;
      if (socket) {
        ids.forEach((id) => socket.emit("tailor:leave", id));
        socket.disconnect();
      }
      socketRef.current = null;
      categoryIdsRef.current = [];
    };
  }, [token, user?.role, refresh, t]);

  async function accept(id: string) {
    if (!token) return;
    setMsg(null);
    try {
      await api(`/tailor/orders/${id}/accept`, { method: "POST", token });
      await refresh();
      setTab("mine");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("tailor.acceptError"));
    }
  }

  async function release(id: string) {
    if (!token) return;
    setMsg(null);
    try {
      await api(`/tailor/orders/${id}/release`, { method: "POST", token });
      await refresh();
      setTab("available");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("tailor.releaseError"));
    }
  }

  async function setStatus(id: string, status: "IN_PROGRESS" | "SHIPPED") {
    if (!token) return;
    await api(`/orders/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
    await refresh();
  }

  if (!user || user.role !== "TAILOR") {
    return (
      <div className="px-6 py-24 text-center text-sm text-bark/55 dark:text-cream/70">
        Accès tailleur uniquement. Connectez-vous avec tailor@atelier.demo (seed).
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl font-normal text-bark dark:font-semibold dark:text-[#F5E9DA]">
        Atelier — commandes
      </h1>
      <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-bark/55 dark:text-[15px] dark:text-cream/85">
        Vous ne voyez que les commandes des lignes auxquelles vous êtes affilié.
        Les événements temps réel passent par WebSocket (salons par catégorie).
      </p>
      {noCategories && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100">
          Aucune catégorie liée à votre compte tailleur. Exécutez{" "}
          <code className="rounded bg-white px-1">npm run db:fix-tailor-categories</code>{" "}
          ou contactez un administrateur.
        </p>
      )}
      {msg && (
        <p className="mt-4 text-sm text-red-700 dark:text-red-400">{msg}</p>
      )}

      <div className="mt-10 flex gap-2 border-b border-gold/20 dark:border-white/15">
        <button
          type="button"
          onClick={() => setTab("available")}
          className={cn(
            "px-5 py-3 text-xs font-medium uppercase tracking-[0.25em]",
            tab === "available"
              ? "border-b-2 border-forest text-bark dark:border-[#C6A75E] dark:text-cream"
              : "text-bark/45 dark:text-cream/50"
          )}
        >
          Disponibles ({available.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("mine")}
          className={cn(
            "px-5 py-3 text-xs font-medium uppercase tracking-[0.25em]",
            tab === "mine"
              ? "border-b-2 border-forest text-bark dark:border-[#C6A75E] dark:text-cream"
              : "text-bark/45 dark:text-cream/50"
          )}
        >
          Mes commandes ({mine.length})
        </button>
      </div>

      {tab === "available" && (
        <section className="mt-8">
          <div className="mt-6 space-y-4">
            {available.map((o) => (
              <div
                key={o.id}
                className="flex flex-col gap-4 rounded-3xl border border-gold/15 bg-cream/90 p-6 shadow-fabric dark:border-white/10 dark:bg-zinc-900/85 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-bark/45 dark:text-cream/55">
                    {o.client.fullName}
                    {o.category && (
                      <span className="ml-2 text-gold-dim dark:text-gold/80">
                        · {o.category.name}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 font-display text-2xl text-bark dark:text-cream">
                    {formatPriceWithSymbol(o.subtotal, t("currency.symbol"))}
                  </p>
                  <p className="mt-2 text-xs text-bark/50 dark:text-cream/55">
                    {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMeasurementsOrderId(o.id)}
                    className="rounded-full border border-bark/15 px-6 py-3 text-xs uppercase tracking-[0.3em] text-bark hover:border-gold/40 dark:border-white/20 dark:text-cream dark:hover:border-gold/50"
                  >
                    Voir les mesures
                  </button>
                  <button
                    type="button"
                    onClick={() => accept(o.id)}
                    className="rounded-full bg-forest px-8 py-3 text-xs uppercase tracking-[0.35em] text-cream"
                  >
                    Accepter
                  </button>
                </div>
              </div>
            ))}
            {available.length === 0 && (
              <p className="text-sm text-bark/50 dark:text-cream/60">
                Aucune commande ouverte.
              </p>
            )}
          </div>
        </section>
      )}

      {tab === "mine" && (
        <section className="mt-8">
          <div className="mt-6 space-y-4">
            {mine.map((o) => (
              <div
                key={o.id}
                className="rounded-3xl border border-gold/15 bg-cream/90 p-6 shadow-fabric dark:border-white/10 dark:bg-zinc-900/85"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-bark/45 dark:text-cream/55">
                      {orderStatusLabel(locale, o.status)}
                      {o.category && (
                        <span className="ml-2">· {o.category.name}</span>
                      )}
                    </p>
                    <p className="mt-1 font-display text-xl text-bark dark:text-cream">
                      {formatPriceWithSymbol(o.subtotal, t("currency.symbol"))}
                    </p>
                    <p className="mt-1 font-mono text-xs text-bark/50 dark:text-cream/50">
                      {o.id}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMeasurementsOrderId(o.id)}
                      className="rounded-full border border-bark/15 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-bark hover:border-gold/40 dark:border-white/20 dark:text-cream dark:hover:border-gold/50"
                    >
                      Voir les mesures
                    </button>
                    {(o.status === "ACCEPTED" || o.status === "IN_PROGRESS") && (
                      <button
                        type="button"
                        onClick={() => release(o.id)}
                        className="rounded-full border border-red-800/30 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-red-900"
                      >
                        Annuler &amp; remettre en pool
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus(o.id, "IN_PROGRESS")}
                    className="rounded-full border border-bark/15 px-6 py-2 text-[10px] uppercase tracking-[0.3em] dark:border-white/25 dark:text-cream"
                  >
                    En cours
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(o.id, "SHIPPED")}
                    className="rounded-full bg-gold px-6 py-2 text-[10px] uppercase tracking-[0.3em] text-bark"
                  >
                    Expédiée
                  </button>
                </div>
              </div>
            ))}
            {mine.length === 0 && (
              <p className="text-sm text-bark/50 dark:text-cream/60">
                Aucune commande assignée.
              </p>
            )}
          </div>
        </section>
      )}

      <TailorMeasurementsModal
        open={measurementsOrderId !== null}
        orderId={measurementsOrderId}
        token={token}
        onClose={() => setMeasurementsOrderId(null)}
      />
    </div>
  );
}
