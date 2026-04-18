import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import type { FashionModel } from "@/types";
import { BrowseCategoryView } from "@/components/browse/BrowseCategoryView";

/** Même fenêtre que le fetch API — pages catalogue reviennent plus vite après la 1ʳᵉ visite. */
export const revalidate = 30;

type Props = { params: Promise<{ slug: string }> };

export default async function BrowseCategoryPage({ params }: Props) {
  const { slug } = await params;
  const models = await api<FashionModel[]>(
    `/catalog/models?category=${encodeURIComponent(slug)}`,
    { next: { revalidate: 30 } }
  );
  if (!models.length) notFound();

  return <BrowseCategoryView slug={slug} models={models} />;
}
