"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Props = {
  modelId: string;
  initialPrice: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminModelPriceDialog({
  modelId,
  initialPrice,
  open,
  onOpenChange,
}: Props) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [price, setPrice] = useState(String(initialPrice));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPrice(String(initialPrice));
  }, [initialPrice]);

  if (user?.role !== "ADMIN") return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a valid price");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api(`/admin/models/${modelId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ basePrice: n }),
      });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-bark/50 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal
            className="relative z-10 w-full max-w-md rounded-2xl border border-gold/30 bg-cream p-8 shadow-fabric-hover"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-forest-muted">
              Administration
            </p>
            <h2 className="mt-2 font-display text-2xl text-bark">
              Modifier le prix de base
            </h2>
            <form onSubmit={save} className="mt-6 space-y-4">
              <label className="block text-xs uppercase tracking-[0.2em] text-bark/60">
                Prix (USD)
              </label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-gold/25 bg-white/90 px-4 py-3 font-sans text-bark outline-none ring-forest/20 focus:ring-2"
              />
              {error && <p className="text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full border border-bark/15 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-bark/70 transition hover:bg-sand/50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    "rounded-full bg-forest px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-cream",
                    "transition hover:bg-forest-muted disabled:opacity-50"
                  )}
                >
                  {saving ? "…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type TriggerProps = {
  modelId: string;
  initialPrice: number;
  variant?: "icon" | "text";
  className?: string;
};

export function AdminEditPriceTrigger({
  modelId,
  initialPrice,
  variant = "text",
  className,
}: TriggerProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (user?.role !== "ADMIN") return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          variant === "icon"
            ? "rounded-full border border-gold/40 bg-cream/95 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-bark shadow-sm transition hover:border-gold hover:shadow-fabric-hover"
            : "text-[10px] uppercase tracking-[0.25em] text-gold-dim underline-offset-4 hover:text-gold hover:underline dark:text-gold-bright/90 dark:hover:text-gold-bright",
          className
        )}
      >
        {variant === "icon" ? "Modifier" : "Modifier le prix"}
      </button>
      <AdminModelPriceDialog
        modelId={modelId}
        initialPrice={initialPrice}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
