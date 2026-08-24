"use client"
import Image from "next/image";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { Product } from "@/types/Product";
import { Star , ArrowRight } from "lucide-react";
import {motion } from "framer-motion"
import Link from "next/link";
import { image } from "framer-motion/client";
import { products } from "@/data/products";

interface ProductCardProps {

  product: Product;
  
}

export default function ProductCard({

product

}:ProductCardProps){
  
  
  
  return (
    
    

    <motion.div
    whileHover={{
        y:-8,
        scale:1.02
    }}

    transition={{
        duration:.25
    }}
>
    <Link href={`/products/${product.slug}`}>
      <div className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]">

        {/* Product Image */}
        <div className="mb-6 overflow-hidden rounded-2xl">
          <Image
            src={product.image || "/images/Elalgoagent.png"}
            alt={product.title}
            width={500}
            height={500}
            className="transition duration-500 group-hover:scale-110"
          />
        </div>

        {/* Title */}
        <h3 className="text-gray-300 text-2xl font-bold">{product.title}</h3>

        {/* Badges */}
        <div className="mt-4 flex gap-2">
          <Badge type={product.category} />
          <Badge type={product.premium ? "premium" : "free"} />
        </div>

        <div className="text-gray-200 mt-5 flex gap-2">
          {product.platforms.map((platform) => (
          <span
            key={platform}
            className="rounded-full bg-white/10 px-3 py-1 text-xs"
          >
            {platform}
          </span>
          ))}
          </div>

        {/* Description */}
        <p className="mt-5 text-gray-400">
          {product.description}
        </p>
        <div className="flex items-center gap-1">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span className="text-gray-200 text-sm">{product.rating}</span>
        </div>


        
        
        {/* Footer */}
        <div className="mt-8 flex items-center justify-between">

          <span className="text-3xl font-bold text-blue-400">
            ${product.price}
          </span>

            <Button href={`/products/${product.slug}`}>
              View Details
            </Button>
        
        </div>

      </div>
    </Link>
    </motion.div>
  );
}