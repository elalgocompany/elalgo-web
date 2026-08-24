"use client";

import { useState } from "react";
import { ProductPlan } from "@/types/productPlan";

type ProductPlansProps = {
  plans: ProductPlan[];
};

export default function ProductPlans({
  plans,
}: ProductPlansProps) {
  const [selectedPlanId, setSelectedPlanId] =
    useState<string | null>(
      plans.length > 0 ? plans[0].id : null
    );

  const selectedPlan = plans.find(
    (plan) => plan.id === selectedPlanId
  );

  if (plans.length === 0) {
    return (
      <p className="text-slate-500">
        No license plans are currently available.
      </p>
    );
  }

  return (
    <div className="mt-8">

      <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
        Choose Your License
      </p>

      <div className="grid gap-4">
        {plans.map((plan) => {
          const isSelected =
            selectedPlanId === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() =>
                setSelectedPlanId(plan.id)
              }
              className={`rounded-2xl border p-5 text-left transition ${
                isSelected
                  ? "border-sky-500 bg-sky-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-sky-300"
              }`}
            >
              <div className="flex items-center justify-between gap-4">

                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    {plan.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {plan.license_kind === "lifetime"
                      ? "Use forever"
                      : `${plan.duration_days} days access`}
                  </p>
                </div>

                <span className="text-2xl font-black text-slate-950">
                  ${plan.price}
                </span>

              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selectedPlan}
        className="mt-6 w-full rounded-xl bg-sky-500 px-8 py-4 font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buy {selectedPlan?.name || "Now"}
      </button>

    </div>
  );
}