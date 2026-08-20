export type LicenseStatus =
  | "pending"
  | "active"
  | "expired"
  | "suspended"
  | "revoked";

export type License = {
  id: string;

  license_key: string;

  platform: "mt4" | "mt5" | null;

  account_number: string | null;

  broker: string | null;

  server: string | null;

  status: LicenseStatus;

  starts_at: string;

  expires_at: string | null;

  activation_limit: number;

  activation_count: number;

  account_updated_at: string | null;

  last_verified_at: string | null;

  created_at: string;

  products: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
  }[];

  product_plans: {
    id: string;
    name: string;
    plan_type: string;
    duration_days: number | null;
  }[];
};