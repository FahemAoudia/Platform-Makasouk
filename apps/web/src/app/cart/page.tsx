"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { FashionModel } from "@/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { measurementKeyLabel } from "@/lib/i18n/messages";

type CartItem = {
  id: string;
  modelId: string;
  measurements: Record<string, number>;
  quantity: number;
  model: FashionModel;
};

type Cart = {
  id: string;
  items: CartItem[];
};

export default function CartPage() {
  const { t, locale } = useI18n();
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadCart = useCallback(() => {
    if (!token) return;
    api<Cart>("/cart", { token })
      .then(setCart)
      .catch(() => setError(t("cart.loadError")));
  }, [token, t]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function setQuantity(item: CartItem, nextQty: number) {
    if (!token || nextQty < 1) return;
    setUpdatingId(item.id);
    setError(null);
    try {
      const updated = await api<Cart>(`/cart/items/${item.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ quantity: nextQty }),
      });
      setCart(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("cart.updateQtyError"));
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeLine(item: CartItem) {
    if (!token) return;
    setUpdatingId(item.id);
    setError(null);
    try {
      const updated = await api<Cart>(`/cart/items/${item.id}`, {
        method: "DELETE",
        token,
      });
      setCart(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("cart.removeError"));
    } finally {
      setUpdatingId(null);
    }
  }

  async function checkout() {
    if (!token || !cart?.items[0]) return;
    setError(null);
    try {
      const categoryId = cart.items[0].model.category.id;
      await api("/orders/checkout", {
        method: "POST",
        token,
        body: JSON.stringify({ categoryId }),
      });
      window.location.href = "/orders";
    } catch (e) {
      setError(e instanceof Error ? e.message : t("cart.checkoutError"));
    }
  }

  if (!token) {
    return (
      <div className="grain pattern-mashrabiya px-6 py-24 text-center">
        <p className="text-sm text-bark/55 dark:text-cream/80">
          Connectez-vous pour voir votre panier.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-gold-dim hover:text-gold dark:text-gold/80 dark:hover:text-gold"
        >
          Connexion
        </Link>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="py-24 text-center text-sm text-bark/50 dark:text-cream/60">
        Chargement…
      </div>
    );
  }

  const images = (m: FashionModel) => (m.images as string[])[0];

  return (
    <div className="grain pattern-mashrabiya mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-bark dark:text-cream">Votre panier</h1>
      <div className="mt-10 space-y-6">
        {cart.items.map((item) => {
          const qty = item.quantity ?? 1;
          return (
            <div
              key={item.id}
              className="flex flex-col gap-6 rounded-3xl border border-gold/15 bg-cream/90 p-6 shadow-fabric dark:border-white/10 dark:bg-zinc-900/85 md:flex-row"
            >
              <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-gold/10 dark:border-white/10 md:h-44 md:w-36">
                <Image
                  src={images(item.model)}
                  alt={item.model.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.35em] text-bark/45 dark:text-cream/50">
                  {item.model.category.name}
                </p>
                <h2 className="mt-2 font-display text-2xl text-bark dark:text-cream">
                  {item.model.name}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-bark/50 dark:text-cream/55">
                    Quantité
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={updatingId === item.id || qty <= 1}
                      onClick={() => setQuantity(item, qty - 1)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg border border-gold/30 bg-white text-bark transition",
                        "hover:border-gold hover:shadow-sm disabled:opacity-40 dark:border-white/20 dark:bg-zinc-800 dark:text-cream dark:hover:border-gold/50"
                      )}
                      aria-label={t("cart.decreaseAria")}
                    >
                      −
                    </button>
                    <span className="min-w-[2ch] text-center text-sm font-medium text-bark dark:text-cream">
                      {updatingId === item.id ? "…" : qty}
                    </span>
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => setQuantity(item, qty + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/30 bg-white text-bark transition hover:border-gold hover:shadow-sm disabled:opacity-40 dark:border-white/20 dark:bg-zinc-800 dark:text-cream dark:hover:border-gold/50"
                      aria-label={t("cart.increaseAria")}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => removeLine(item)}
                    className="ml-auto text-xs uppercase tracking-[0.2em] text-red-800/80 underline-offset-2 hover:underline dark:text-red-400"
                  >
                    Retirer
                  </button>
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-bark/45 dark:text-cream/50">
                  Mesures
                </p>
                <ul className="mt-2 grid gap-1 text-sm text-bark/75 dark:text-cream/80 md:grid-cols-2">
                  {Object.entries(item.measurements).map(([k, v]) => (
                    <li key={k}>
                      <span className="text-bark/45 dark:text-cream/50">
                        {measurementKeyLabel(locale, k)}
                      </span>{" "}
                      <span className="text-bark dark:text-cream">{v} cm</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
      {cart.items.length === 0 && (
        <p className="mt-8 text-sm text-bark/50 dark:text-cream/70">
          Votre panier est vide.
        </p>
      )}
      {error && (
        <p className="mt-6 text-sm text-red-700 dark:text-red-400">{error}</p>
      )}
      {cart.items.length > 0 && (
        <button
          type="button"
          onClick={checkout}
          className="mt-10 rounded-full bg-forest px-10 py-3 text-xs uppercase tracking-[0.35em] text-cream transition hover:bg-forest-muted"
        >
          Passer commande (diffusion aux tailleurs)
        </button>
      )}
    </div>
  );
}
