"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Purchase } from "@/types/Purchase";
import { License } from "@/types/License";
import { Console } from "console";
import { products } from "@/data/products";
import LicenseCard from "@/components/LicenseCard";

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [profile, setProfile] = useState<{
  full_name: string | null;
  avatar_url: string | null;
  } | null>(null);

 useEffect(() => {  
  async function getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();



    if (!user) {
      router.replace("/auth/login");
      return;
    }
    
    

    setEmail(user.email ?? null);
    setLoading(false);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();

    setProfile(profileData);

    const { data: purchasesData, error: purchasesError } = await supabase
    .from("purchases")
    .select(`
      id,
      amount,
      currency,
      status,
      created_at,
      products (
        id,
        title,
        description,
        image,
        category
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "completed");


    if (purchasesError) {
      console.error("Error loading purchases:", purchasesError);
    } else {
      setPurchases( purchasesData ?? [] );
    }

    console.log("Purches data:  ",purchasesData) ; 
    const {
  data: licensesData,
  error: licensesError,
} = await supabase
  .from("licenses")
  .select(`
    id,
    license_key,
    platform,
    account_number,
    broker,
    server,
    status,
    starts_at,
    expires_at,
    activation_limit,
    activation_count,
    account_updated_at,
    last_verified_at,
    created_at,

    products (
      id,
      title,
      description,
      image,
      category
    ),

    product_plans (
      id,
      name,
      plan_type,
      duration_days
    )
  `)
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

    if (licensesError) {
      console.error("Error loading licenses:", licensesError);
    } else {
      setLicenses(licensesData ?? []);
    }

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
              Owned Products
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
              {purchases.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Active Licenses
            </p>

            <p className="mt-3 text-3xl font-black">
              {licenses.length}
            </p>
          </div>

        </section>

         <section className="mt-10">
        <h2 className="text-2xl font-black">
          My Products
        </h2>

        {purchases.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-slate-500">
              You haven't purchased any products yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => 
             (
              <div
                key={purchase.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={purchase.products.image}
                  alt={purchase.products.title}
                  className="h-48 w-full object-cover"
                />

                <div className="p-5">
                  <h3 className="text-xl font-black">
                    {purchase.products.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {purchase.products.description}
                  </p>

                  <p className="mt-4 text-sm font-semibold text-green-600">
                    Purchased
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      </div>

        <section className="mt-10">
  <h2 className="mb-6 text-2xl font-bold">
    My Licenses
  </h2>

  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

    {licenses.map((license) => (
      <LicenseCard
        key={license.id}
        license={license}
      />
    ))}

  </div>
</section>

    </main>
  );

  




}