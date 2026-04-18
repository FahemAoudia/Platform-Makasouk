export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  heroImage: string | null;
};

export type FashionModel = {
  id: string;
  name: string;
  subtitle: string | null;
  description: string;
  images: unknown;
  basePrice: number | string;
  tags: string[];
  category: Category;
};

export type MeasurementField = {
  id: string;
  key: string;
  label: string;
  unit: string;
  guideImageUrl: string | null;
  guideVideoUrl: string | null;
};

export type Order = {
  id: string;
  status: string;
  subtotal: number | string;
  createdAt: string;
  category: Category;
  items: {
    id: string;
    model: FashionModel;
    measurements: Record<string, number>;
  }[];
};
