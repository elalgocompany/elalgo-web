import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { educationVideos } from "@/data/education";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EducationArticlePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const video = educationVideos.find(
    (item) => item.slug === slug
  );

  if (!video) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <Navbar />

      {/* ARTICLE HEADER */}

      <section className="mx-auto max-w-5xl px-6 py-16">
        <Link
          href="/education"
          className="text-sm font-medium text-purple-400 transition hover:text-purple-300"
        >
          ← Back to Education
        </Link>

        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
          {video.category}
        </p>

        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          {video.title}
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-400">
          {video.description}
        </p>
      </section>

      {/* VIDEO */}

      <section className="mx-auto max-w-5xl px-6">
        <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black shadow-2xl shadow-purple-500/5">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* INTRO */}

      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
          Tutorial Overview
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          About This Tutorial
        </h2>

        <p className="mt-5 text-lg leading-8 text-gray-400">
          {video.introduction}
        </p>
      </section>

      {/* STEPS */}

      <section className="border-y border-white/10 bg-[#070b18]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
            Step By Step
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            How To Do It
          </h2>

          <div className="mt-10 space-y-5">
            {video.steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-purple-500/30 hover:bg-purple-500/[0.02]"
              >
                <div className="flex gap-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 font-bold text-purple-400">
                    {index + 1}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {step.title}
                    </h3>

                    <p className="mt-2 leading-7 text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMON PROBLEMS */}

      {video.commonProblems &&
        video.commonProblems.length > 0 && (
          <section className="mx-auto max-w-4xl px-6 py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
              Troubleshooting
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              Common Problems
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-gray-400">
              If something is not working as expected,
              check these common issues first.
            </p>

            <div className="mt-8 space-y-4">
              {video.commonProblems.map((problem) => (
                <div
                  key={problem.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-purple-500/30"
                >
                  <h3 className="font-bold text-white">
                    {problem.title}
                  </h3>

                  <p className="mt-2 leading-7 text-gray-400">
                    {problem.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* CTA */}

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-3xl border border-purple-500/20 bg-purple-500/[0.04] p-8 text-center lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
            ElAlgo
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            Take Your Trading Tools Further
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-400">
            Explore professional Expert Advisors,
            indicators and trading tools, or turn your own
            trading strategy into a custom automated solution.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="rounded-xl bg-purple-600 px-7 py-3 font-semibold text-white transition hover:bg-purple-500"
            >
              Explore Products
            </Link>

            <Link
              href="/build-project"
              className="rounded-xl border border-purple-500/20 px-7 py-3 font-semibold text-white transition hover:bg-purple-500/10"
            >
              Build Your Project
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}