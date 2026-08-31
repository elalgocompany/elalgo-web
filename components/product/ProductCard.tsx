"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

import type { Product } from "@/types/Product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
    >
      <div className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]">

        {/* PRODUCT IMAGE */}

        <div className="mb-6 overflow-hidden rounded-2xl">
          <Image
            src={
              product.image ||
              "/images/Elalgoagent.png"
            }
            alt={product.title}
            width={500}
            height={500}
            className="h-auto w-full transition duration-500 group-hover:scale-110"
          />
        </div>


        {/* TITLE */}

        <h3 className="text-2xl font-bold text-gray-300">
          {product.title}
        </h3>


        {/* BADGES */}

        <div className="mt-4 flex flex-wrap gap-2">

          <Badge
            type={product.category}
          />

          <Badge
            type={
              product.premium
                ? "premium"
                : "free"
            }
          />

        </div>


        {/* PLATFORMS */}

        <div className="mt-5 flex flex-wrap gap-2 text-gray-200">

          {product.platforms.map(
            (platform) => (
              <span
                key={platform}
                className="rounded-full bg-white/10 px-3 py-1 text-xs"
              >
                {platform}
              </span>
            )
          )}

        </div>


        {/* DESCRIPTION */}

        <p className="mt-5 text-gray-400">
          {product.description}
        </p>


        {/* RATING */}

        <div className="mt-4 flex items-center gap-1">

          <Star
            size={16}
            className="fill-yellow-400 text-yellow-400"
          />

          <span className="text-sm text-gray-200">
            {product.rating}
          </span>

        </div>


        {/* FOOTER */}

        <div className="mt-8 flex items-center justify-between gap-4">

          <span className="text-3xl font-bold text-blue-400">

            {product.access_type === "free"
              ? "Free"
              : `$${product.price}`}

          </span>

          <Button
            href={`/products/${product.slug}`}
          >
            View Details
          </Button>

        </div>

      </div>
    </motion.div>
  );
}