import { Playfair_Display } from "next/font/google";
import { api } from "@/lib/api";
import type { Category } from "@/types";
import { BrowseCollectionsContent } from "@/components/browse/BrowseCollectionsContent";

const collectionsDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-collections-display",
  weight: ["400", "500", "600", "700"],
});

/**
 * Aligné sur les slugs du seed Prisma (`prisma/seed.ts`) pour que « Entrer »
 * fonctionne lorsque l’API répond à nouveau.
 */
const FALLBACK_CATEGORIES: Category[] = [
  {
    id: "fallback-traditional",
    slug: "traditional",
    name: "Patrimoine & tradition",
    description:
      "Silhouettes d’héritage, cérémonies et savoir-faire transmis.",
    heroImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
  },
  {
    id: "fallback-haute",
    slug: "haute-couture-evening",
    name: "Haute couture / Soirée",
    description:
      "Robes de soirée sculpturales, présence tapis rouge et matières nobles.",
    heroImage:
      "https://images.unsplash.com/photo-1515372039744-b8f02a815602?w=1600&q=80",
  },
  {
    id: "fallback-classic",
    slug: "classic",
    name: "Classic tailoring",
    description:
      "Coupe intemporelle, lignes sobres et raffinement discret.",
    heroImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80",
  },
];

async function loadCategories(): Promise<Category[]> {
  try {
    const list = await api<Category[]>("/catalog/categories", {
      next: { revalidate: 30 },
    });
    if (Array.isArray(list) && list.length > 0) return list;
  } catch {
    /* API hors ligne ou erreur — on bascule sur le fallback */
  }
  return FALLBACK_CATEGORIES;
}

export default async function BrowseIndexPage() {
  const categories = await loadCategories();

  return (
    <BrowseCollectionsContent
      categories={categories}
      displayClassName={collectionsDisplay.variable}
    />
  );
}
