"use client";

import { AdminEditPriceTrigger } from "@/components/admin/AdminModelPriceDialog";

export function ModelDetailPrice({
  modelId,
  basePrice,
}: {
  modelId: string;
  basePrice: number;
}) {
  const n = Number(basePrice);
  return (
    <div className="mt-10 flex flex-wrap items-baseline gap-4 border-t border-gold/20 pt-10 dark:border-white/15">
      <p className="font-display text-3xl text-bark dark:text-cream">
        ${n.toLocaleString()}
      </p>
      <AdminEditPriceTrigger
        modelId={modelId}
        initialPrice={n}
        variant="text"
      />
    </div>
  );
}
