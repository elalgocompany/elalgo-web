export interface Product {
  id: string;

  title: string;

    slug: string;

  description: string;

  image: string ;

  
  
  category:
    | "expert-advisor"
    | "indicator"
    | "assistant";

  premium: boolean;

  price: number;

  rating: number;

  platforms: string[];

  featured: boolean;

  created_at: string;

  trial_enabled : boolean ; 
  
  trial_duration_days: number | null;

  long_description: string | null;

  features: string[];

  requirements: string[];

  demo_available: boolean;

  youtube_url: string | null;
}



export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}