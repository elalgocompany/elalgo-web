export interface Product {
  id: number;

  title: string;

  slug: string;

  description: string;

  image: string;

  category: "expert-advisor" | "indicator" | "assistant";

  premium: boolean;

  price: number;

  rating: number;

  platforms: ("MT4" | "MT5" | "TradingView")[];

  featured: boolean;
}
 
}