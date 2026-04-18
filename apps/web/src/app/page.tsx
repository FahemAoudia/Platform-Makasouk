import { api } from "@/lib/api";
import type { Category, FashionModel } from "@/types";
import { Hero } from "@/components/home/Hero";
import { HomePageSections } from "@/components/home/HomePageSections";

async function load() {
  const cache = { next: { revalidate: 30 } } as const;
  const categories = await api<Category[]>("/catalog/categories", cache);
  const models = await api<FashionModel[]>("/catalog/models", cache);
  return { categories, models };
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
