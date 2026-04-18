"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { FashionModel } from "@/types";
import { AdminEditPriceTrigger } from "@/components/admin/AdminModelPriceDialog";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function ModelCard({
  model,
  index = 0,
}: {
  model: FashionModel;
  index?: number;
}) {
  const { t } = useI18n();
  const images = model.images as string[];
  const cover = images[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, delay: index * 0.02 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-b from-cream to-sand/50 shadow-fabric transition duration-500 hover:border-gold/35 hover:shadow-fabric-hover dark:border-white/10 dark:from-zinc-900 dark:to-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5 L35 20 L50 20 L38 30 L42 45 L30 38 L18 45 L22 30 L10 20 L25 20 Z' fill='%231a3a2f'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        <Link href={`/models/${model.id}`} className="relative block">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={cover}
              alt={model.name}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bark/80 via-bark/10 to-transparent opacity-95" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-cream">
              <p className="text-[10px] uppercase tracking-[0.4em] text-cream/70">
                {model.category.name}
              </p>
              <h3 className="mt-2 font-display text-2xl">{model.name}</h3>
              {model.subtitle && (
                <p className="mt-1 text-sm text-cream/80">{model.subtitle}</p>
              )}
            </div>
          </div>
          <div className="relative flex items-center justify-between gap-3 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.3em] text-bark/50 dark:text-cream/50">
              {t("modelCard.from")}{" "}
              <span className="font-medium text-bark dark:text-cream">
                ${Number(model.basePrice).toLocaleString()}
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <AdminEditPriceTrigger
                modelId={model.id}
                initialPrice={Number(model.basePrice)}
                variant="icon"
              />
              <span className="text-[10px] uppercase tracking-[0.35em] text-gold-dim transition group-hover:text-gold dark:text-gold/70">
                {t("modelCard.view")}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </motion.article>
  );
}
