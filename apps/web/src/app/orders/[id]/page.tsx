"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { createSocket } from "@/lib/socket";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { orderStatusLabel } from "@/lib/i18n/messages";
import { formatPriceWithSymbol } from "@/lib/utils";

type OrderDetail = {
  id: string;
  status: string;
  subtotal: number | string;
  items: { model: { name: string } }[];
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { locale, t } = useI18n();
  const currencySym = t("currency.symbol");
  const { token } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!token) return;
    api<OrderDetail>(`/orders/${params.id}`, { token }).then(setOrder);
  }, [token, params.id]);

  useEffect(() => {
    if (!token || !params.id) return;
    const socket = createSocket(token);
    socket.emit("client:subscribe-order", params.id);
    socket.on(
      "order:status",
      (payload: { status?: string; orderId?: string }) => {
        if (payload.orderId === params.id && payload.status) {
          setOrder((o) => (o ? { ...o, status: payload.status! } : o));
        }
      }
    );
    socket.on("order:deleted", (payload: { orderId?: string }) => {
      if (payload.orderId === params.id) {
        router.replace("/orders");
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [token, params.id, router]);

  if (!token || !order) {
    return (
      <div className="py-24 text-center text-sm dark:text-cream/70">
        {t("orderDetail.loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-[10px] uppercase tracking-[0.45em] text-ink/40 dark:text-cream/55">
        {t("orderDetail.eyebrow")}
      </p>
      <h1 className="mt-4 font-display text-3xl text-ink dark:text-cream sm:text-4xl">
        {orderStatusLabel(locale, order.status)}
      </h1>
      <p className="mt-4 text-sm text-ink/55 dark:text-cream/75">
        {t("orderDetail.liveUpdates")}
      </p>
      <div className="mt-10 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-card dark:border-white/10 dark:bg-zinc-900/90">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/45 dark:text-cream/60">
          {t("orderDetail.pieces")}
        </p>
        <ul className="mt-4 space-y-2 text-sm text-ink dark:text-cream/90">
          {order.items.map((i) => (
            <li key={i.model.name}>{i.model.name}</li>
          ))}
        </ul>
        <p
          className="mt-8 font-display text-3xl text-ink dark:text-cream"
          dir="ltr"
        >
          {formatPriceWithSymbol(order.subtotal, currencySym)}
        </p>
      </div>
    </div>
  );
}
