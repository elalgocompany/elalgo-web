import { Product } from "@/types/Product";


export const products: Product[] = [
  {
    id:1,

    title:"Smart Scalper Pro",

    slug:"smart-scalper-pro",

    description:"AI-powered scalping Expert Advisor optimized for EURUSD.",

    image:"/images/products/scalper.png",

    category:"expert-advisor",

    premium:true,

    price:149,

    rating:4.9,

    platforms:["MT4","MT5"],

    featured:true
  },
  {
    id: 2,
    title: "Momentum Hunter",

    slug:"Momentum Hunter",

    description:"Trend-following indicator for momentum traders.",

    image: "/images/products/momentum.png",

    price: 0,

    rating:4.9,

    platforms:["MT5"],

    category: "indicator",

    premium: false,
    
    featured:true
  },
];