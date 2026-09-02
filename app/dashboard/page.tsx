"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Purchase } from "@/types/Purchase";
import { License } from "@/types/License";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import LicenseCard from "@/components/LicenseCard";
import { CustomProject } from "@/types/Project";
import AdvisorConnectionSetup from "@/components/advisor/AdvisorConnectionSetup";
import AdvisorPerformanceCard from "@/components/advisor/AdvisorPerformanceCard";
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
  const [projects, setProjects] =
    useState<CustomProject[]>([]);

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
    license_kind, 
    trial_started_at,
    trial_duration_days,
    account_number,
    broker,
    server,
    status,
    starts_at,
    expires_at,
    activation_limit,
    activation_count,
    account_selected_at,
    account_verified_at,
    last_verified_at,
    created_at,

    products (
  id,
  title,
  description,
  image,
  category,

  product_files (
    id,
    platform,
    version,
    file_path
  )
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
      console.log(
        "RAW LICENSE DATA:",
        JSON.stringify(licensesData, null, 2)
      );
      setLicenses(licensesData ?? []);
    }


    const {
        data: projectsData,
        error: projectsError,
      } = await supabase
        .from("project_requests")
        .select(`
          id,
          project_ref,
          title,
          project_type,
          platform,
          status,
          budget_range,
          delivery_preference,
          created_at
        `)
        .eq("user_id", user.id)
        .order(
          "created_at",
          { ascending: false }
        );

      if (projectsError) {
        console.error(
          "Project loading error:",
          projectsError
        );
      } else {
        setProjects(
          projectsData ?? []
        );
      }

  }

  // --------------------------------
      // CUSTOM PROJECTS
      // --------------------------------

      


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

    
    <main className="min-h-screen bg-slate-50 text-slate-900">
     <Navbar /> 
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
            {purchases.map((purchase) => {
              const product = purchase.products[0];

              if (!product) {
                return null;
              }

              return (
              <div
                key={purchase.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-60 w-full object-cover"
                />

                <div className="p-5">
                  <h3 className="text-xl font-black">
                    {product.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {product.description}
                  </p>

                  <p className="mt-4 text-sm font-semibold text-green-600">
                    Purchased
                  </p>
                </div>
              </div>
            );
            })
          }
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

        <section className="mt-12">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
                Custom Development
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                My Custom Projects
              </h2>

            </div>

        </div>


        {projects.length === 0 ? (

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">

            <p className="text-gray-400">
              You have not submitted any custom projects yet.
            </p>
            
            <Link
              href="/build-project"
              className="mt-5 inline-block rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
            >
              Build Your Project
            </Link>

          </div>

        ) : (

    <div className="mt-6 grid gap-5">

      {projects.map((project) => (

        <div
          key={project.id}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-medium text-amber-400">
                {project.project_ref}
              </p>

              <h3 className="mt-2 text-xl font-bold text-white">
                {project.title}
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-gray-300">
                  {formatProjectType(project.project_type)}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-gray-300">
                  {formatPlatform(project.platform)}
                </span>

              </div>

            </div>


            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              <span className="rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-4 py-2 text-sm font-medium text-amber-300">
                {formatStatus(project.status)}
              </span>

              <p className="text-sm text-gray-500">
                {new Date(
                  project.created_at
                ).toLocaleDateString()}
              </p>

            </div>

          </div>


          <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2 lg:grid-cols-3">

            <div>

              <p className="text-xs uppercase tracking-wider text-gray-500">
                Budget
              </p>

              <p className="mt-1 text-sm text-gray-300">
                {formatBudget(
                  project.budget_range
                )}
              </p>

            </div>


            <div>

              <p className="text-xs uppercase tracking-wider text-gray-500">
                Delivery
              </p>

              <p className="mt-1 text-sm text-gray-300">
                {formatDelivery(
                  project.delivery_preference
                )}
              </p>

            </div>


            <div>

              <p className="text-xs uppercase tracking-wider text-gray-500">
                Status
              </p>

              <p className="mt-1 text-sm text-gray-300">
                {formatStatus(
                  project.status
                )}
              </p>

            </div>

          </div>

        </div>

      ))}

    </div>

  )}

</section>

    <AdvisorConnectionSetup/>
    <AdvisorPerformanceCard />
    </main>
  );

  




}


function formatProjectType(
  type: string
) {
  switch (type) {
    case "expert-advisor":
      return "Expert Advisor";

    case "indicator":
      return "Indicator";

    case "trading-assistant":
      return "Trading Assistant";

    case "tradingview":
      return "TradingView Project";

    case "modification":
      return "Modification / Bug Fix";

    default:
      return "Custom Project";
  }
}

function formatPlatform(
  platform: string
) {
  switch (platform) {
    case "mt4":
      return "MetaTrader 4";

    case "mt5":
      return "MetaTrader 5";

    case "both":
      return "MT4 & MT5";

    case "tradingview":
      return "TradingView";

    default:
      return "Other";
  }
}

function formatStatus(
  status: string
) {
  switch (status) {
    case "submitted":
      return "Submitted";

    case "reviewing":
      return "Reviewing";

    case "awaiting_information":
      return "Waiting for Information";

    case "quoted":
      return "Quoted";

    case "accepted":
      return "Accepted";

    case "in_development":
      return "In Development";

    case "testing":
      return "Testing";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function formatBudget(
  budget: string | null
) {
  switch (budget) {
    case "under-100":
      return "Under $100";

    case "100-300":
      return "$100 - $300";

    case "300-700":
      return "$300 - $700";

    case "700-plus":
      return "$700+";

    case "not-sure":
      return "Not sure";

    default:
      return "Not specified";
  }
}

function formatDelivery(
  delivery: string | null
) {
  switch (delivery) {
    case "flexible":
      return "Flexible";

    case "1-week":
      return "About 1 week";

    case "2-weeks":
      return "About 2 weeks";

    case "1-month":
      return "About 1 month";

    default:
      return "Not specified";
  }
}