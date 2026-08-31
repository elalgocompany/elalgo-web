import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ProjectSubmission from "@/components/project/ProjectSubmission";
import DevelopersSection from "@/components/project/DevelopersSection";
import Hero from "@/components/home/hero";
import Footer from "@/components/layout/Footer";
export default function BuildProjectPage() {
  return (

  
    <main className="min-h-screen bg-[#050816] text-white">
        <Navbar />
        
        <Hero
            eyebrow="Custom Trading Development"
            title="Build Your"
            highlightedTitle="Trading Project."
            description="
                Turn your trading strategy into a professional
                Expert Advisor, Indicator, Trading Assistant,
                TradingView project, or custom MetaTrader solution
                built exactly around your requirements.
            "
            image="/images/build-project-rocket2.png"
            imageAlt="ElAlgo custom trading development"
            accent="orange"
            imagePosition="right"
            buttons={[
                {
                label: "Submit Your Project",
                href: "#submit-project",
                },
                {
                label: "Talk to a Developer",
                href: "#developers",
                variant: "secondary",
                },
            ]}
            points={[
                {
                text: "Confidential",
                },
                {
                text: "Custom Built",
                },
                {
                text: "Tested",
                },
            ]}
            />

        <section className="border-t border-white/10">

    <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="text-center">

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
            Custom Development
        </p>

        <h2 className="mt-3 text-4xl font-bold text-white">
            What We Can Build
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            From automated trading systems to indicators,
            professional trading tools and TradingView solutions.
        </p>

        </div>


        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5">

        {[
            {
            title: "Expert Advisor",
            description:
                "Fully automated MT4 and MT5 trading systems.",
            },

            {
            title: "Indicator",
            description:
                "Custom indicators, signals and calculations.",
            },

            {
            title: "Trading Assistant",
            description:
                "Risk management panels and execution tools.",
            },

            {
            title: "TradingView Project",
            description:
                "Pine Script development and TradingView conversions.",
            },

            {
            title: "Modification",
            description:
                "Fix, improve or expand an existing project.",
            },
        ].map((item) => (

            <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-amber-500/40 hover:bg-white/[0.05]"
            >

            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                ◇
            </div>

            <h3 className="text-lg font-bold text-white">
                {item.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
                {item.description}
            </p>

            </div>

        ))}

        </div>

    </div>

        </section>


        <section className="border-t border-white/10 bg-[#070b18]">

            <div className="mx-auto max-w-7xl px-6 py-20">

                <div className="text-center">

                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
                    Simple & Transparent
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                    How The Project Works
                </h2>

                </div>


                <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {[
                    {
                    number: "01",
                    title: "Tell Us Your Strategy",
                    text:
                        "Send us your complete strategy, rules, examples and requirements.",
                    },

                    {
                    number: "02",
                    title: "Project Review",
                    text:
                        "We review the strategy and clarify any unclear details with you.",
                    },

                    {
                    number: "03",
                    title: "Proposal",
                    text:
                        "You receive the project scope, delivery time and total price.",
                    },

                    {
                    number: "04",
                    title: "Agreement & Project Start",
                    text:
                        "Once you approve the proposal, we finalize the project agreement and begin development.",
                    },

                    {
                    number: "05",
                    title: "Development & Demo",
                    text:
                        "We build and test your project and show the result in Strategy Tester.",
                    },

                    {
                    number: "06",
                    title: "Final Delivery",
                    text:
                        "After confirmation and final payment, you receive the final files and source code.",
                    },
                ].map((step) => (

                    <div
                    key={step.number}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-7"
                    >

                    <span className="text-sm font-bold text-amber-400">
                        {step.number}
                    </span>

                    <h3 className="mt-5 text-xl font-bold text-white">
                        {step.title}
                    </h3>

                    <p className="mt-3 leading-7 text-gray-400">
                        {step.text}
                    </p>

                    </div>

                ))}

                </div>

            </div>

        </section>


        <section
            id="submit-project"
            className="border-t border-white/10"
            >
            <div className="mx-auto max-w-5xl px-6 py-20">

                <ProjectSubmission />

            </div>
        </section>
        
        <DevelopersSection />

        <Footer/>
    </main>
  );
}




