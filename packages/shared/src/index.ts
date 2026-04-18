export type MeasurementMap = Record<string, number>;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Order pending",
  ACCEPTED: "Accepted by tailor",
  IN_PROGRESS: "In progress",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
};

export const CATEGORY_SLUGS = [
  "traditional",
  "haute-couture-evening",
  "classic",
  "modern",
  "casual",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];
