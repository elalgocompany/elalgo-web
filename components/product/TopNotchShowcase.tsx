"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/types/Product";

type TopNotchShowcaseProps = {
  products: Product[];
};

export default function TopNotchShowcase({
  products,
}: TopNotchShowcaseProps) {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  useEffect(() => {
    if (products.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((current) =>
        current === products.length - 1
          ? 0
          : current + 1
      );
    }, 4500);

    return () => {
      clearInterval(interval);
    };
  }, [products.length]);

  if (products.length === 0) {
    return null;
  }

  const product =
    products[currentIndex];

  return (
    <div className="relative w-full">

      <Link
        href={`/products/${product.slug}`}
        className="group block"
      >

        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-white/[0.03]">

          {/* IMAGE */}

          <div className="relative aspect-[4/3] overflow-hidden">

            <Image
              key={product.id}
              src={
                product.image ||
                "/images/Elalgoagent.png"
              }
              alt={product.title}
              fill
              className="
                object-cover
                transition
                duration-700
                group-hover:scale-105
              "
            />

            {/* DARK GRADIENT */}

            <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/30 to-transparent" />

            {/* TOP NOTCH BADGE */}

            <div className="absolute left-5 top-5">

              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-300 backdrop-blur-md">
                Top Notch
              </span>

            </div>


            {/* PRODUCT INFO */}

            <div className="absolute bottom-0 left-0 right-0 p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                {formatCategory(
                  product.category
                )}
              </p>

              <h3 className="mt-2 text-2xl font-bold text-white">
                {product.title}
              </h3>

              <p className="mt-2 line-clamp-2 max-w-lg text-sm leading-6 text-gray-300">
                {product.description}
              </p>


              <div className="mt-4 flex flex-wrap items-center gap-3">

                {product.platforms.map(
                  (platform) => (
                    <span
                      key={platform}
                      className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-gray-300 backdrop-blur"
                    >
                      {platform}
                    </span>
                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </Link>


      {/* INDICATORS */}

      {products.length > 1 && (
        <div className="mt-5 flex justify-center gap-2">

          {products.map(
            (item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setCurrentIndex(index)
                }
                aria-label={`Show ${item.title}`}
                className={
                  index === currentIndex
                    ? "h-2 w-8 rounded-full bg-emerald-500 transition-all"
                    : "h-2 w-2 rounded-full bg-white/20 transition-all hover:bg-white/40"
                }
              />
            )
          )}

        </div>
      )}

    </div>
  );
}


function formatCategory(
  category: string
) {
  switch (category) {
    case "expert-advisor":
      return "Expert Advisor";

    case "indicator":
      return "Indicator";

    case "assistant":
      return "Trading Assistant";

    default:
      return category;
  }
}