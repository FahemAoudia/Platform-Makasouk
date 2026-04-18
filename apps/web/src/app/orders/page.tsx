"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { createSocket } from "@/lib/socket";
import type { Order } from "@/types";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { orderStatusLabel } from "@/lib/i18n/messages";
import { formatDateTime, formatPriceWithSymbol } from "@/lib/utils";

export default function OrdersPage() {
  const { t, locale } = useI18n();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api<Order[]>("/orders/mine", { token }).then(setOrders);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = createSocket(token);
    socket.emit("client:join-self");
    socket.on("order:deleted", (p: { orderId?: string }) => {
      if (p?.orderId) {
        setOrders((prev) => prev.filter((o) => o.id !== p.orderId));
      }
    });
    socket.on("order:cancelled", (p: { orderId?: string }) => {
      if (p?.orderId) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === p.orderId ? { ...o, status: "CANCELLED" } : o
          )
        );
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [token]);

  async function confirmCancel() {
    if (!token || !cancelOrderId) return;
    setMsg(null);
    try {
      await api<Order>(`/orders/${cancelOrderId}/cancel`, {
        method: "PATCH",
        token,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelOrderId ? { ...o, status: "CANCELLED" } : o
        )
      );
      setCancelOrderId(null);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("orders.cancelError"));
    }
  }

  if (!token) {
    return (
      <div className="px-6 py-24 text-center text-sm text-ink/55 dark:text-cream/70">
        {t("orders.signIn")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl text-ink dark:text-cream sm:text-4xl">
        {t("orders.title")}
      </h1>
      {msg && (
        <p className="mt-4 text-sm text-red-700 dark:text-red-400">{msg}</p>
      )}
      <div className="mt-10 space-y-6">
        {orders.map((o) => (
          <div
            key={o.id}
            className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-card transition hover:border-gold/40 dark:border-white/10 dark:bg-zinc-900/90 dark:hover:border-gold/50"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Link
                href={`/orders/${o.id}`}
                className="min-w-0 flex-1"
              >
                <p className="text-[10px] uppercase tracking-[0.35em] text-ink/40 dark:text-cream/50">
                  {o.category.name}
                </p>
                <p className="mt-2 text-sm text-ink/60 dark:text-cream/70">
                  {formatDateTime(o.createdAt)}
                </p>
              </Link>
              <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-gold dark:text-gold-bright">
                    {orderStatusLabel(locale, o.status)}
                  </p>
                  <p className="mt-2 font-display text-2xl text-ink dark:text-cream">
                    {formatPriceWithSymbol(o.subtotal, t("currency.symbol"))}
                  </p>
                </div>
                {o.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => setCancelOrderId(o.id)}
                    className="rounded-full border border-red-800/35 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-red-900 transition hover:bg-red-50 dark:border-red-500/50 dark:text-red-300 dark:hover:bg-red-950/50"
                  >
                    Annuler la commande
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-sm text-ink/50 dark:text-cream/75">
            {t("orders.noOrders")}
          </p>
        )}
      </div>

      {cancelOrderId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm dark:bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-card dark:border-white/15 dark:bg-zinc-900">
            <h2
              id="cancel-order-title"
              className="font-display text-xl text-ink dark:text-cream"
            >
              {t("orders.cancelDialogTitle")}
            </h2>
            <p className="mt-4 text-sm text-ink/65 dark:text-cream/75">
              {t("orders.cancelDialogBody")}
            </p>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelOrderId(null)}
                className="rounded-full border border-black/10 px-6 py-2 text-xs uppercase tracking-[0.2em] text-ink dark:border-white/20 dark:text-cream"
              >
                {t("orders.back")}
              </button>
              <button
                type="button"
                onClick={() => void confirmCancel()}
                className="rounded-full bg-red-900 px-6 py-2 text-xs uppercase tracking-[0.2em] text-white"
              >
                {t("orders.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
