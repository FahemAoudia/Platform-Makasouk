"use client";

import { AdminEditPriceTrigger } from "@/components/admin/AdminModelPriceDialog";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatPriceWithSymbol } from "@/lib/utils";

export function ModelDetailPrice({
  modelId,
  basePrice,
}: {
  modelId: string;
  basePrice: number;
}) {
  const { t } = useI18n();
  const n = Number(basePrice);
  return (
    <div className="mt-10 flex flex-wrap items-baseline gap-4 border-t border-gold/20 pt-10 dark:border-white/15">
      <p className="font-display text-3xl text-bark dark:text-cream" dir="ltr">
        {formatPriceWithSymbol(n, t("currency.symbol"))}
      </p>
      <AdminEditPriceTrigger
        modelId={modelId}
        initialPrice={n}
        variant="text"
      />
    </div>
  );
}
