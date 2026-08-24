import { notFound } from "next/navigation";

import { getProductBySlug, getProductImages , getProductPlans } from "@/lib/products";
import ProductPlans from "@/components/product/ProductPlans";
import ProductVideo from "@/components/product/ProductVideo";
import ProductGallery from "@/components/product/ProductGallery";
import StartTrialButton from "@/components/StartTrialButton";


interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const images = await getProductImages(product.id);
  const plans = await getProductPlans(product.id);
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* PRODUCT VIDEO */}

        {product.youtube_url && (
          <ProductVideo
            url={product.youtube_url}
            title={product.title}
          />
        )}

        {/* PRODUCT HERO */}

        <section className="mt-16 grid gap-12 lg:grid-cols-[1.4fr_1fr]">

          {/* Product Image */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                className="h-full min-h-[400px] w-full object-cover"
              />
            ) : (
              <div className="flex min-h-[400px] items-center justify-center text-slate-400">
                No product image
              </div>
            )}

          </div>

          {/* Product Information */}

          <div className="flex flex-col justify-center">

            <span className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-sky-600">
              {product.category.replace("-", " ")}
            </span>

            <h1 className="text-5xl font-black tracking-tight text-slate-950">
              {product.title}
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              {product.description}
            </p>

            {/* Rating */}

            <div className="mt-6 flex items-center gap-3">

              <span className="text-xl font-bold text-slate-900">
                ★ {product.rating}
              </span>

              <span className="text-slate-400">
                Customer rating
              </span>

            </div>

            {/* Platforms */}

            <div className="mt-6 flex flex-wrap gap-3">

              {product.platforms.map((platform: string) => (
                <span
                  key={platform}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {platform}
                </span>
              ))}

            </div>

            {/* Price */}

            
            <ProductPlans plans={plans} />

            {product.demo_available && (
              <button className="mt-4 rounded-xl border border-slate-300 bg-white px-8 py-4 font-bold text-slate-800 transition hover:bg-slate-100">
                Free Demo
              </button>
            )}
              

          
                
          </div>
              {product.trial_enabled && (
                <StartTrialButton
                  productId={product.id}
                  trialDays={product.trial_duration_days || 7}
                />
              )}
        </section>

        {/* SCREENSHOT GALLERY */}

        <ProductGallery images={images} />

        {/* ABOUT */}

        <section className="mt-28 max-w-4xl">

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sky-600">
            About The Product
          </p>

          <h2 className="text-4xl font-black text-slate-950">
            What does {product.title} do?
          </h2>

          <p className="mt-8 text-lg leading-9 text-slate-600">
            {product.long_description}
          </p>

        </section>

        {/* FEATURES */}

        <section className="mt-28">

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sky-600">
            Features
          </p>

          <h2 className="text-4xl font-black text-slate-950">
            What You Get
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">

            {product.features.map((feature: string) => (
              <div
                key={feature}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-4">

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-600">
                    ✓
                  </span>

                  <span className="font-semibold text-slate-800">
                    {feature}
                  </span>

                </div>
              </div>
            ))}

          </div>

        </section>

        {/* REQUIREMENTS */}

        <section className="mt-28">

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sky-600">
            Requirements
          </p>

          <h2 className="text-4xl font-black text-slate-950">
            Before You Start
          </h2>

          <div className="mt-10 grid gap-4">

            {product.requirements.map((requirement: string) => (
              <div
                key={requirement}
                className="rounded-xl border border-slate-200 bg-white p-5 font-medium text-slate-700"
              >
                ✓ {requirement}
              </div>
            ))}

          </div>

        </section>

        {/* RISK DISCLAIMER */}

        <section className="mt-28 rounded-2xl border border-amber-200 bg-amber-50 p-8">

          <h3 className="font-bold text-amber-900">
            Risk Disclosure
          </h3>

          <p className="mt-3 text-sm leading-7 text-amber-800">
            Trading financial markets involves substantial risk.
            Past performance does not guarantee future results.
            ElAlgo products are tools designed to assist with
            trading and do not guarantee profits.
          </p>

        </section>

      </div>

    </main>
  );
}