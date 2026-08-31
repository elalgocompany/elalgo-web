import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { educationVideos } from "@/data/education";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Hero from "@/components/home/hero";

export default function EducationPage(){
    return (
        <main className="min-h-screen bg-[#050816] text-white">

      <Navbar />

      <Hero
        eyebrow="ElAlgo Education"
        title="Learn Trading"
        highlightedTitle="Technology."
        description="
          Step-by-step tutorials for MetaTrader,
          Expert Advisors, indicators, TradingView
          and algorithmic trading tools.
        "
        image="/images/Education_Image.png"
        imageAlt="ElAlgo education tutorials"
        accent="purple"
        imagePosition="right"
      />

      {/* VIDEOS */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div>

           <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
                Tutorials
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              Latest Educational Videos
            </h2>

          </div>


          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {educationVideos.map((video) => (

              <Link
                key={video.slug}
                href={`/education/${video.slug}`}
                className="
                    group
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:border-purple-500/40
                    hover:bg-purple-500/[0.03]
                "
              >

                {/* THUMBNAIL */}

                <div className="relative aspect-video overflow-hidden bg-[#0b1020]">

                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                    alt={video.title}
                    className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-300
                        group-hover:scale-105
                    "
                  />

                  {/* PLAY BUTTON */}

                  <div className="absolute inset-0 flex items-center justify-center">

                    <div className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-full
                        bg-purple-600
                        text-xl
                        text-white
                        shadow-lg
                        shadow-purple-500/20
                        transition
                        group-hover:scale-110
                        group-hover:bg-purple-500
                    ">
                      ▶
                    </div>

                  </div>

                </div>


                {/* CONTENT */}

                <div className="p-6">

                    <p className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.2em]
                        text-purple-400
                    ">
                    {video.category}
                  </p>

                  <h3 className="
                    mt-3
                    text-xl
                    font-bold
                    leading-7
                    text-white
                    transition
                    group-hover:text-purple-100
                ">
                    {video.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {video.description}
                  </p>

                  <p className="text-sm text-purple-400 transition hover:text-purple-300">
                    Read & Watch →
                  </p>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>
      <Footer/>
    </main>

    );
}