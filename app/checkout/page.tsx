import { Suspense } from "react";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
          <p className="text-center text-slate-400">
            Loading checkout...
          </p>
        </main>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}