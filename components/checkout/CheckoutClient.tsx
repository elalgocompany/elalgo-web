"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { supabase } from "@/lib/supabase";
import { Product } from "@/types/Product";
import { ProductPlan } from "@/types/ProductPlan";

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("product");
  const planId = searchParams.get("plan");

  const [product, setProduct] =
    useState<Product | null>(null);

  const [plan, setPlan] =
    useState<ProductPlan | null>(null);

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCheckout() {
      if (!productId || !planId) {
        setMessage("Invalid checkout link.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const [
        productResult,
        planResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single(),

        supabase
          .from("product_plans")
          .select("*")
          .eq("id", planId)
          .eq("product_id", productId)
          .single(),
      ]);

      if (
        productResult.error ||
        planResult.error
      ) {
        console.error(
          "Checkout loading error:",
          productResult.error,
          planResult.error
        );

        setMessage(
          "Could not load this checkout."
        );

        setLoading(false);
        return;
      }

      setProduct(productResult.data);
      setPlan(planResult.data);

      setLoading(false);
    }

    loadCheckout();
  }, [productId, planId, router]);

  async function handleTestPurchase() {
    if (!product || !plan) return;

    setPurchasing(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/signin");
        return;
      }

      const response = await fetch(
  "/api/checkout/mock",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user.id,
      product_id: product.id,
      plan_id: plan.id,
    }),
  }
);

const text = await response.text();

console.log("Checkout raw response:", text);

let data;

try {
  data = JSON.parse(text);
} catch {
  throw new Error(
    `Checkout API returned invalid JSON. HTTP ${response.status}`
  );
}

console.log("Checkout parsed response:", data);

if (!response.ok) {
  setMessage(
    data.message ||
      `Purchase failed with status ${response.status}`
  );

  return;
}

      setMessage(
        "Purchase completed successfully!"
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
  console.error("Purchase error:", error);

  if (error instanceof Error) {
    setMessage(error.message);
  } else {
    setMessage(
      "Something went wrong while completing the purchase."
    );
  }
} finally {
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <p className="text-center text-slate-400">
          Loading checkout...
        </p>
      </main>
    );
  }

  if (!product || !plan) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold">
            Checkout unavailable
          </h1>

          <p className="mt-4 text-slate-400">
            {message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">

      <div className="mx-auto max-w-3xl">

        <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-400">
          Secure Checkout
        </p>

        <h1 className="mt-3 text-4xl font-black">
          Complete Your Purchase
        </h1>

        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5">

          {product.image && (
            <img
              src={product.image}
              alt={product.title}
              className="h-64 w-full object-cover"
            />
          )}

          <div className="p-8">

            <h2 className="text-2xl font-black">
              {product.title}
            </h2>

            <p className="mt-3 text-slate-400">
              {product.description}
            </p>

            <div className="mt-8 border-t border-white/10 pt-6">

              <div className="flex justify-between gap-6">
                <span className="text-slate-400">
                  License
                </span>

                <span className="font-bold">
                  {plan.name}
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-6">
                <span className="text-slate-400">
                  Duration
                </span>

                <span className="font-bold">
                  {plan.license_kind === "lifetime"
                    ? "Lifetime"
                    : `${plan.duration_days} days`}
                </span>
              </div>

              <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-6">

                <span className="text-lg font-bold">
                  Total
                </span>

                <span className="text-4xl font-black text-sky-400">
                  ${plan.price}
                </span>

              </div>

            </div>

            <button
              type="button"
              onClick={handleTestPurchase}
              disabled={purchasing}
              className="mt-8 w-full rounded-xl bg-sky-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {purchasing
                ? "Processing..."
                : "Complete Test Purchase"}
            </button>

            {message && (
              <p className="mt-4 text-center text-sm text-sky-300">
                {message}
              </p>
            )}

            <p className="mt-5 text-center text-xs text-slate-500">
              Test checkout only. No real payment will be charged.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}