export type LicenseStatus =
  | "pending"
  | "active"
  | "expired"
  | "suspended"
  | "revoked";

export type License = {
  id: string;

  license_key: string;

  

  license_kind: string | null; 

  platform: "mt4" | "mt5" | null;

  account_number: string | null;


  server: string | null;

  status: LicenseStatus;

  starts_at: string;

  expires_at: string | null;

  

  trial_started_at: string | null;

  trial_duration_days: number | null;

  activation_limit: number;

  activation_count: number;

  account_selected_at: string | null;

  account_verified_at: string | null;

  last_verified_at: string | null;

  created_at: string;

  products: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    product_files: {
      id: string;
      platform: "mt4" | "mt5";
      version: string | null;
    }[];

  }[];

  product_plans: {
    id: string;
    name: string;
    plan_type: string;
    duration_days: number | null;
  }[];
};