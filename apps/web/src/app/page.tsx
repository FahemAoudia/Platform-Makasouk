import { api } from "@/lib/api";
import type { Category, FashionModel } from "@/types";
import { Hero } from "@/components/home/Hero";
import { HomePageSections } from "@/components/home/HomePageSections";

async function load() {
  const cache = { next: { revalidate: 30 } } as const;
  try {
    const [categories, models] = await Promise.all([
      api<Category[]>("/catalog/categories", cache),
      api<FashionModel[]>("/catalog/models", cache),
    ]);
    return { categories, models };
  } catch {
    /* Build-time (e.g. Railway) أو API غير متاح: لا نفشل prerender */
    return { categories: [] as Category[], models: [] as FashionModel[] };
  }
}

export default async function HomePage() {
  const { categories, models } = await load();
  const rec = models.slice(0, 3);

  return (
    <div className="grain pattern-mashrabiya transition-opacity dark:opacity-90">
      <Hero />
      <HomePageSections categories={categories} models={models} rec={rec} />
    </div>
  );
}
