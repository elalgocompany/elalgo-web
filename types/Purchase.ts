export type Purchase = {
  id: number;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
  products: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
  }[];
};