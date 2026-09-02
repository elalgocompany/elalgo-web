import Link from "next/link";

import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  Clock3,
  Database,
  Download,
  Eye,
  LineChart,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "ElAlgo Advisor | Understand How You Trade",
  description:
    "Connect MetaTrader to ElAlgo Advisor and transform your trading history into clear performance, risk and behavioral analytics.",
};

const metrics = [
  {
    label: "Win Rate",
    value: "61.8%",
    change: "+4.2%",
  },
  {
    label: "Profit Factor",
    value: "1.84",
    change: "+0.16",
  },
  {
    label: "Expectancy",
    value: "$18.42",
    change: "+12.1%",
  },
  {
    label: "Max Drawdown",
    value: "7.3%",
    change: "-1.8%",
  },
];

const features = [
  {
    icon: LineChart,
    title: "Performance Analytics",
    description:
      "Understand profitability, expectancy, drawdown, win rate, payoff ratios and the statistics behind your trading.",
  },
  {
    icon: ShieldCheck,
    title: "Risk Analysis",
    description:
      "See how position sizing, losing streaks, drawdowns and changing risk levels affect your results.",
  },
  {
    icon: Clock3,
    title: "Timing Intelligence",
    description:
      "Discover your strongest and weakest trading hours, weekdays and market sessions.",
  },
  {
    icon: Radar,
    title: "Trading Patterns",
    description:
      "Reveal patterns hidden inside hundreds or thousands of trades that are difficult to notice manually.",
  },
  {
    icon: Target,
    title: "Symbol Analysis",
    description:
      "Compare your performance across instruments and find where your real statistical edge appears.",
  },
  {
    icon: BarChart3,
    title: "Behavior Metrics",
    description:
      "Measure patterns such as increased risk after losses, overtrading and inconsistent position sizing.",
  },
];

const steps = [
  {
    number: "01",
    title: "Download Advisor Agent",
    description:
      "Install the lightweight ElAlgo Advisor Agent inside MetaTrader.",
  },
  {
    number: "02",
    title: "Connect Your Account",
    description:
      "Connect the Agent securely to your ElAlgo account without sharing your broker password.",
  },
  {
    number: "03",
    title: "Synchronize Your Trades",
    description:
      "Your historical trading data is securely transmitted to ElAlgo Advisor.",
  },
  {
    number: "04",
    title: "Discover Your Trading DNA",
    description:
      "Your dashboard transforms raw history into clear analytics, patterns and measurable performance.",
  },
];

export default function AdvisorPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030611] text-white">
      <Navbar />

      {/* HERO */}

      <section className="relative">
        {/* BACKGROUND EFFECTS */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-400px] h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-[140px]" />

          <div className="absolute right-[-250px] top-[250px] h-[600px] w-[600px] rounded-full bg-blue-600/[0.08] blur-[130px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto grid min-h-[850px] max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr]">
          {/* LEFT */}

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-sm font-semibold text-cyan-300">
              <Sparkles size={16} />

              Trading Intelligence
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Meet Your
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                ElAlgo Advisor.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-400">
              Stop guessing why your trading works sometimes and fails
              somewhere else. ElAlgo Advisor transforms your MetaTrader
              history into clear performance, risk, timing and behavioral
              analytics.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="#download"
                className="group inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 font-bold text-[#020611] transition hover:bg-cyan-300"
              >
                <Download size={18} />

                Download Advisor Agent

                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-semibold text-gray-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.04]"
              >
                See How It Works
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-cyan-400" />
                No broker password required
              </div>

              <div className="flex items-center gap-2">
                <Check size={16} className="text-cyan-400" />
                Secure synchronization
              </div>

              <div className="flex items-center gap-2">
                <Check size={16} className="text-cyan-400" />
                Start free
              </div>
            </div>
          </div>

          {/* DASHBOARD PREVIEW */}

          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-400/[0.06] blur-[90px]" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#070b16]/90 shadow-[0_40px_120px_rgba(0,0,0,.6)] backdrop-blur-xl">
              {/* TOP BAR */}

              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                    ElAlgo Advisor
                  </p>

                  <p className="mt-1 font-semibold text-gray-200">
                    Performance Command Center
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" />

                  Synced
                </div>
              </div>

              {/* METRICS */}

              <div className="grid grid-cols-2 gap-px bg-white/[0.06] lg:grid-cols-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="bg-[#080d19] px-5 py-5"
                  >
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-600">
                      {metric.label}
                    </p>

                    <p className="mt-2 text-xl font-bold text-white">
                      {metric.value}
                    </p>

                    <p className="mt-1 text-xs font-medium text-cyan-400">
                      {metric.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* CHART */}

              <div className="p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-600">
                      Equity Performance
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      $14,821.40
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-400/[0.08] px-3 py-2 text-sm font-semibold text-emerald-300">
                    +18.4%
                  </div>
                </div>

                <div className="relative mt-7 h-[210px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#050914]">
                  {/* GRID */}

                  <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                      backgroundSize: "55px 45px",
                    }}
                  />

                  {/* FAKE CURVE */}

                  <svg
                    viewBox="0 0 700 220"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    <defs>
                      <linearGradient
                        id="advisorLine"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>

                      <linearGradient
                        id="advisorFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#22d3ee"
                          stopOpacity="0.22"
                        />

                        <stop
                          offset="100%"
                          stopColor="#22d3ee"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0 188
                         C55 175 75 190 120 158
                         S190 170 230 129
                         S302 142 340 112
                         S405 122 450 79
                         S520 99 562 63
                         S620 76 700 28
                         L700 220
                         L0 220 Z"
                      fill="url(#advisorFill)"
                    />

                    <path
                      d="M0 188
                         C55 175 75 190 120 158
                         S190 170 230 129
                         S302 142 340 112
                         S405 122 450 79
                         S520 99 562 63
                         S620 76 700 28"
                      fill="none"
                      stroke="url(#advisorLine)"
                      strokeWidth="4"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>

                {/* LOWER ANALYSIS */}

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <p className="text-xs text-gray-500">
                      Strongest Session
                    </p>

                    <p className="mt-2 font-semibold text-gray-200">
                      London
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <p className="text-xs text-gray-500">
                      Best Symbol
                    </p>

                    <p className="mt-2 font-semibold text-gray-200">
                      EURUSD
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <p className="text-xs text-gray-500">
                      Avg. Trade
                    </p>

                    <p className="mt-2 font-semibold text-gray-200">
                      +$42.18
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-center text-[11px] text-gray-700">
                  Illustrative dashboard preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ADVISOR */}

      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Stop Trading Blind
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Your trading history knows more about you than you think.
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-400">
              Most traders remember individual wins and losses. Advisor
              studies the complete picture and turns thousands of data
              points into something you can actually understand.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-white/[0.07] bg-[#070b16] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-cyan-400/[0.025]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl scroll-mt-24 px-6 py-28"
      >
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            How It Works
          </p>

          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
            From MetaTrader to clarity.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-gray-400">
            Advisor Agent handles synchronization. Your ElAlgo dashboard
            handles the analysis.
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-3xl border border-white/[0.07] bg-white/[0.02] p-7"
            >
              <p className="text-4xl font-black text-cyan-400/20">
                {step.number}
              </p>

              <h3 className="mt-5 text-xl font-bold">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-gray-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY */}

      <section className="border-y border-white/[0.06] bg-[#050914]">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
              <LockKeyhole size={26} />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Your Data Matters
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              We analyze trading data.
              <span className="block text-gray-500">
                Not your broker credentials.
              </span>
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-gray-400">
              ElAlgo Advisor is designed to synchronize information
              required for trading analytics. It does not require your
              MetaTrader master password, investor password or withdrawal
              credentials.
            </p>

            <Link
              href="/advisor-data-policy"
              className="mt-7 inline-flex items-center gap-2 font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Read Advisor Data & Privacy Policy

              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Database,
                title: "Purpose-limited data",
                text: "Trading information is collected to synchronize accounts and generate Advisor analytics.",
              },
              {
                icon: Eye,
                title: "Transparent collection",
                text: "We explain the categories of account and trading information synchronized by Advisor Agent.",
              },
              {
                icon: ShieldCheck,
                title: "Account isolation",
                text: "Advisor accounts and trading records are associated with their authenticated ElAlgo owner.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.06] text-cyan-300">
                    <Icon size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}

      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="rounded-[36px] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.07] via-blue-500/[0.035] to-transparent p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-cyan-300">
                <Zap size={18} />

                <span className="text-sm font-semibold uppercase tracking-[0.25em]">
                  Start Free
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-bold">
                Understand your trading before paying for more.
              </h2>

              <p className="mt-5 max-w-2xl leading-8 text-gray-400">
                Advisor Free gives every trader access to essential
                analytics. Advisor Pro will unlock deeper history,
                advanced breakdowns and expanded analysis.
              </p>
            </div>

            <Link
              href="#download"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-7 py-4 font-bold text-[#020611] transition hover:bg-cyan-300"
            >
              Start With Advisor Free

              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}

      <section
        id="download"
        className="scroll-mt-24 border-t border-white/[0.06]"
      >
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
              <Activity size={28} />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Advisor Agent
            </p>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              Connect MetaTrader to ElAlgo.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-8 text-gray-400">
              Install Advisor Agent, connect your ElAlgo account and
              synchronize your trading history to begin building your
              performance dashboard.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-cyan-400 px-7 py-4 font-bold text-[#020611] opacity-50"
              >
                <Download size={18} />

                MT5 Agent Coming Soon
              </button>

              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/10 px-7 py-4 font-bold text-gray-400 opacity-60"
              >
                MT4 Agent Coming Soon
              </button>
            </div>

            <p className="mt-6 text-xs leading-6 text-gray-600">
              ElAlgo Advisor provides analytical information based on
              submitted trading data and does not provide investment
              advice or guarantee improved trading performance.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}