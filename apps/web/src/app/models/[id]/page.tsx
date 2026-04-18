import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import type { FashionModel } from "@/types";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ModelDetailPrice } from "@/components/ModelDetailPrice";

type Props = { params: Promise<{ id: string }> };

export default async function ModelDetailPage({ params }: Props) {
  const { id } = await params;
  let model: FashionModel;
  try {
    model = await api<FashionModel>(`/catalog/models/${id}`);
  } catch {
    notFound();
  }
  const images = model.images as string[];

  return (
    <div className="grain pattern-mashrabiya mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {images.map((src) => (
            <div
              key={src}
              className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-gold/15 bg-cream shadow-fabric dark:border-white/10 dark:bg-zinc-900"
            >
              <Image
                src={src}
                alt={model.name}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.45em] text-bark/45 dark:text-cream/55">
            {model.category.name}
          </p>
          <h1 className="mt-4 font-display text-5xl text-bark dark:text-cream">
            {model.name}
          </h1>
          {model.subtitle && (
            <p className="mt-3 text-sm uppercase tracking-[0.3em] text-gold-dim dark:text-gold-bright/90">
              {model.subtitle}
            </p>
          )}
          <p className="mt-8 text-sm leading-relaxed text-bark/65 dark:text-cream/80">
            {model.description}
          </p>
          <ModelDetailPrice modelId={model.id} basePrice={Number(model.basePrice)} />
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={`/measure/${model.id}`}
              className="rounded-full bg-forest px-8 py-3 text-xs uppercase tracking-[0.35em] text-cream transition hover:bg-forest-muted"
            >
              Mesurer &amp; ajouter au panier
            </Link>
            <FavoriteButton modelId={model.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
