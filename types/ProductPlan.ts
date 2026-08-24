export interface ProductPlan {
  id: string;

  product_id: string;

  name: string;

  price: number;

  duration_days: number | null;

  license_kind: "paid" | "lifetime";

  platform: string | null;

  created_at: string;
}