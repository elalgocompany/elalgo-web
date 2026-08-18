"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Console } from "console";

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  async function getUser() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log("SESSION:", session);
    console.log("ERROR:", error);

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    setEmail(session.user.email ?? null);
    setLoading(false);
  }

  getUser();
}, [router]);
  
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">

      <div className="mx-auto max-w-6xl">

        <div className="mb-10">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-600">
            ELALGO
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Welcome back
          </h1>

          <p className="mt-3 text-slate-500">
            {email}
          </p>

        </div>

        <section className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Products
            </p>

            <p className="mt-3 text-3xl font-black">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Purchases
            </p>

            <p className="mt-3 text-3xl font-black">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Active Licenses
            </p>

            <p className="mt-3 text-3xl font-black">
              0
            </p>
          </div>

        </section>

      </div>

    </main>
  );





}