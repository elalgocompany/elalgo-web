"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/Product";

type ProductExplorerProps = {
  products: Product[];
};

type CategoryFilter =
  | "all"
  | "expert-advisor"
  | "indicator"
  | "assistant";

type AccessFilter =
  | "all"
  | "free"
  | "paid";

export default function ProductExplorer({
  products,
}: ProductExplorerProps) {
  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState<CategoryFilter>("all");

  const [access, setAccess] =
    useState<AccessFilter>("all");

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return products.filter((product) => {
      // SEARCH

      const matchesSearch =
        normalizedSearch === "" ||
        product.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.description
          .toLowerCase()
          .includes(normalizedSearch);

      // CATEGORY

      const matchesCategory =
        category === "all" ||
        product.category === category;

      // FREE / PAID

      const matchesAccess =
        access === "all" ||
        product.access_type === access;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAccess
      );
    });
  }, [
    products,
    search,
    category,
    access,
  ]);

  return (
    <section className="border-t border-white/10">

      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* HEADER */}

        <div>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Product Library
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            Explore All Products
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-gray-400">
            Find Expert Advisors, indicators
            and trading assistants built for
            professional MetaTrader workflows.
          </p>

        </div>


        {/* SEARCH */}

        <div className="mt-10">

          <label
            htmlFor="product-search"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Search Products
          </label>

          <input
            id="product-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by product name or description..."
            className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-[#0b1020]
              px-5
              py-4
              text-white
              outline-none
              transition
              placeholder:text-gray-600
              focus:border-emerald-500/60
            "
          />

        </div>


        {/* FILTERS */}

        <div className="mt-8 space-y-6">

          {/* CATEGORY */}

          <div>

            <p className="mb-3 text-sm font-medium text-gray-300">
              Category
            </p>

            <div className="flex flex-wrap gap-3">

              <FilterButton
                active={
                  category === "all"
                }
                onClick={() =>
                  setCategory("all")
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={
                  category ===
                  "expert-advisor"
                }
                onClick={() =>
                  setCategory(
                    "expert-advisor"
                  )
                }
              >
                Expert Advisors
              </FilterButton>

              <FilterButton
                active={
                  category === "indicator"
                }
                onClick={() =>
                  setCategory(
                    "indicator"
                  )
                }
              >
                Indicators
              </FilterButton>

              <FilterButton
                active={
                  category === "assistant"
                }
                onClick={() =>
                  setCategory(
                    "assistant"
                  )
                }
              >
                Trading Assistants
              </FilterButton>

            </div>

          </div>


          {/* ACCESS TYPE */}

          <div>

            <p className="mb-3 text-sm font-medium text-gray-300">
              Access
            </p>

            <div className="flex flex-wrap gap-3">

              <FilterButton
                active={
                  access === "all"
                }
                onClick={() =>
                  setAccess("all")
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={
                  access === "free"
                }
                onClick={() =>
                  setAccess("free")
                }
              >
                Free
              </FilterButton>

              <FilterButton
                active={
                  access === "paid"
                }
                onClick={() =>
                  setAccess("paid")
                }
              >
                Paid
              </FilterButton>

            </div>

          </div>

        </div>


        {/* RESULT COUNT */}

        <div className="mt-10 flex items-center justify-between border-b border-white/10 pb-5">

          <p className="text-sm text-gray-400">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}{" "}
            found
          </p>

          {(search ||
            category !== "all" ||
            access !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setAccess("all");
              }}
              className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              Clear Filters
            </button>
          )}

        </div>


        {/* PRODUCT GRID */}

        {filteredProducts.length > 0 ? (

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}

          </div>

        ) : (

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-400">
              ⌕
            </div>

            <h3 className="mt-5 text-xl font-bold text-white">
              No Products Found
            </h3>

            <p className="mx-auto mt-3 max-w-md leading-7 text-gray-400">
              We couldn't find any products
              matching your current search and
              filters.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setAccess("all");
              }}
              className="mt-6 rounded-xl border border-emerald-500/30 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
            >
              Clear Filters
            </button>

          </div>

        )}

      </div>

    </section>
  );
}


type FilterButtonProps = {
  active: boolean;

  onClick: () => void;

  children: React.ReactNode;
};

function FilterButton({
  active,
  onClick,
  children,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? `
            rounded-xl
            border
            border-emerald-500/50
            bg-emerald-500/10
            px-4
            py-2
            text-sm
            font-semibold
            text-emerald-300
          `
          : `
            rounded-xl
            border
            border-white/10
            bg-white/[0.02]
            px-4
            py-2
            text-sm
            font-medium
            text-gray-400
            transition
            hover:border-emerald-500/30
            hover:text-white
          `
      }
    >
      {children}
    </button>
  );
}