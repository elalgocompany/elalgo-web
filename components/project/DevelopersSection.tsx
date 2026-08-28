"use client";

import Image from "next/image";
import Link from "next/link";

const developers = [
  {
    id: "hamed",
    name: "Hamed Esmaeli",
    role: "MQL4 / MQL5 Developer",
    image: "/images/developers/hamed.jpg",

    successfulProjects: 40,
    yearsExperience: 4,

    specialties: [
      "Expert Advisors",
      "Indicators",
      "Trading Assistants",
      "Licensing Systems",
    ],

    whatsapp: "https://wa.me/+989100040436",
    telegram: "https://t.me/elalgosupport",

    available: true,
  },
  
];

export default function DevelopersSection() {
  return (
    <section
      id="developers"
      className="border-t border-white/10 bg-[#070b18]"
    >
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* HEADER */}

        <div className="text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
            Meet The Team
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            Talk Directly With Our Developers
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-400">
            Discuss your idea directly with the developer who may
            work on your project.
          </p>

        </div>


        {/* CARDS */}

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {developers.map((developer) => (
            <article
              key={developer.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-amber-500/40"
            >

              {/* PHOTO */}

              <div className="relative aspect-[4/3] overflow-hidden bg-[#0b1020]">

                <Image
                  src={developer.image}
                  alt={developer.name}
                  fill
                  className="object-cover"
                />

                {developer.available && (
                  <div className="absolute left-5 top-5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur">
                    Available for projects
                  </div>
                )}

              </div>


              <div className="p-7">

                {/* NAME */}

                <h3 className="text-2xl font-bold text-white">
                  {developer.name}
                </h3>

                <p className="mt-1 text-sm font-medium text-amber-400">
                  {developer.role}
                </p>


                {/* STATS */}

                <div className="mt-7 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl border border-white/10 bg-[#050816] p-4">

                    <p className="text-2xl font-black text-white">
                      {developer.successfulProjects}+
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">
                      Successful Projects
                    </p>

                  </div>


                  <div className="rounded-2xl border border-white/10 bg-[#050816] p-4">

                    <p className="text-2xl font-black text-white">
                      {developer.yearsExperience}+
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">
                      Years Experience
                    </p>

                  </div>

                </div>


                {/* SPECIALTIES */}

                <div className="mt-6">

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Specialties
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {developer.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-3 py-1 text-xs font-medium text-amber-300"
                      >
                        {specialty}
                      </span>
                    ))}

                  </div>

                </div>


                {/* CONTACT */}

                <div className="mt-7 grid grid-cols-2 gap-3">

                  <Link
                    href={developer.whatsapp}
                    target="_blank"
                    className="rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-400"
                  >
                    WhatsApp
                  </Link>

                  <Link
                    href={developer.telegram}
                    target="_blank"
                    className="rounded-xl bg-sky-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-sky-400"
                  >
                    Telegram
                  </Link>

                </div>


                {/* SEND PROJECT */}

                <Link
                  href="#submit-project"
                  className="mt-3 block w-full rounded-xl border border-amber-500/30 px-4 py-3 text-center text-sm font-bold text-amber-300 transition hover:bg-amber-500/10"
                >
                  Send Project
                </Link>

              </div>

            </article>
          ))}

        </div>

      </div>
    </section>
  );
}