import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Eye,
  FileChartColumn,
  KeyRound,
  LockKeyhole,
  Server,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Advisor Data & Privacy Policy | ElAlgo",
  description:
    "Learn what information ElAlgo Advisor collects, why it is collected, how it is used, and how trading data is protected.",
};

const collectedData = [
  {
    title: "ElAlgo Account Information",
    items: [
      "ElAlgo user identifier",
      "Email address associated with your ElAlgo account",
      "Advisor subscription or plan information",
    ],
  },

  {
    title: "MetaTrader Account Information",
    items: [
      "MetaTrader account number",
      "Platform type such as MetaTrader 4 or MetaTrader 5",
      "Broker name",
      "Trading server name",
      "Account currency",
      "Account leverage where available",
      "Account balance and equity information required for analytics",
    ],
  },

  {
    title: "Trading History",
    items: [
      "Trade, order, deal or position identifiers",
      "Trading symbol",
      "Buy or sell direction",
      "Trade volume",
      "Open and close timestamps",
      "Open and close prices",
      "Stop Loss and Take Profit values",
      "Trade profit or loss",
      "Commission",
      "Swap",
      "Magic number",
      "Trade comment where available",
    ],
  },

  {
    title: "Advisor Synchronization Information",
    items: [
      "Time of synchronization",
      "Advisor Agent version",
      "Synchronization status",
      "Number of records processed",
      "Technical information required to detect failed or duplicate synchronization attempts",
    ],
  },
];

const neverRequested = [
  "MetaTrader master password",
  "MetaTrader investor password",
  "Broker account password",
  "Email password",
  "Banking password",
  "Credit or debit card PIN",
  "Withdrawal credentials",
  "Two-factor authentication codes",
  "Remote access to your computer",
];

const purposes = [
  {
    icon: Database,
    title: "Synchronize Trading History",
    text: "Store trading records transmitted by Advisor Agent so your ElAlgo account can maintain an analytics history.",
  },

  {
    icon: FileChartColumn,
    title: "Calculate Analytics",
    text: "Calculate performance, risk, timing, symbol and behavioral statistics from synchronized trading information.",
  },

  {
    icon: Eye,
    title: "Display Your Dashboard",
    text: "Present your trading metrics, charts, historical comparisons and other Advisor features inside your authenticated dashboard.",
  },

  {
    icon: Server,
    title: "Maintain The Service",
    text: "Detect synchronization errors, prevent duplicate records, troubleshoot technical problems and maintain service reliability.",
  },
];

export default function AdvisorDataPolicyPage() {
  return (
    <main className="min-h-screen bg-[#030611] text-white">
      <Navbar />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-420px] h-[850px] w-[850px] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-[140px]" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <Link
            href="/advisor"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-cyan-300"
          >
            <ArrowLeft size={16} />

            Back to ElAlgo Advisor
          </Link>

          <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-sm font-semibold text-cyan-300">
            <ShieldCheck size={16} />

            Advisor Data & Privacy
          </div>

          <h1 className="mt-7 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
            Your trading data.
            <span className="block text-cyan-300">
              Clear rules about how we use it.
            </span>
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-gray-400">
            ElAlgo Advisor processes trading information to provide
            analytics about your trading activity. This policy explains
            what Advisor Agent may transmit, why we process that
            information, and what information we do not require.
          </p>

          <div className="mt-8 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5">
            <p className="text-sm leading-7 text-gray-300">
              This Advisor Data & Privacy Policy supplements the general
              ElAlgo Privacy Policy. Where this page specifically concerns
              ElAlgo Advisor, this policy explains the additional trading
              information processed by the Advisor service.
            </p>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Last updated: September 2026
          </p>
        </div>
      </section>

      {/* CORE PRINCIPLE */}

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-[32px] border border-white/[0.08] bg-[#070b16] p-8 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
            <LockKeyhole size={25} />
          </div>

          <h2 className="mt-7 text-3xl font-bold">
            Our core principle
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-400">
            ElAlgo Advisor is designed to analyze trading activity, not
            control access to your brokerage account. Advisor Agent should
            only transmit information reasonably required to synchronize
            your trading history, calculate analytics and operate the
            Advisor service.
          </p>
        </div>
      </section>

      {/* WHAT WE COLLECT */}

      <section className="border-y border-white/[0.06] bg-white/[0.012]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            01 · Information We Process
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            What Advisor may collect
          </h2>

          <p className="mt-5 max-w-3xl leading-8 text-gray-400">
            The exact fields transmitted may depend on your MetaTrader
            platform, account type and Advisor Agent version.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {collectedData.map((section) => (
              <div
                key={section.title}
                className="rounded-3xl border border-white/[0.07] bg-[#070b16] p-7"
              >
                <h3 className="text-xl font-bold">
                  {section.title}
                </h3>

                <div className="mt-5 space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2
                        size={17}
                        className="mt-1 shrink-0 text-cyan-400"
                      />

                      <p className="text-sm leading-6 text-gray-400">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEVER REQUEST */}

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300">
              <KeyRound size={25} />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
              02 · Credentials
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              What Advisor does not need
            </h2>

            <p className="mt-5 leading-8 text-gray-400">
              ElAlgo Advisor does not need credentials that would allow us
              to log in to your broker account, withdraw funds or control
              your trading account.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {neverRequested.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-4"
              >
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />

                <p className="text-sm leading-6 text-gray-300">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE USE */}

      <section className="border-y border-white/[0.06] bg-[#050914]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            03 · Purpose
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            How we use Advisor data
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {purposes.map((purpose) => {
              const Icon = purpose.icon;

              return (
                <div
                  key={purpose.title}
                  className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/[0.06] text-cyan-300">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    {purpose.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-500">
                    {purpose.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OWNERSHIP / ACCESS */}

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          04 · Account Access
        </p>

        <h2 className="mt-4 text-4xl font-bold">
          Your Advisor data belongs with your account
        </h2>

        <div className="mt-8 space-y-5 text-base leading-8 text-gray-400">
          <p>
            Advisor trading records are associated with the ElAlgo account
            used to connect the Advisor Agent. The service is designed so
            authenticated users can access analytics associated with their
            own connected accounts.
          </p>

          <p>
            ElAlgo may use authorized internal systems or service
            components to process information when required to operate,
            secure, troubleshoot or maintain Advisor.
          </p>

          <p>
            We do not intend to sell individual Advisor trading history to
            third-party advertisers.
          </p>
        </div>
      </section>

      {/* SECURITY */}

      <section className="border-y border-white/[0.06] bg-white/[0.012]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
                <ShieldCheck size={25} />
              </div>

              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                05 · Security
              </p>

              <h2 className="mt-4 text-4xl font-bold">
                Protecting Advisor information
              </h2>
            </div>

            <div className="space-y-5 leading-8 text-gray-400">
              <p>
                We use technical and organizational safeguards intended to
                protect Advisor information against unauthorized access,
                alteration, disclosure or loss.
              </p>

              <p>
                Advisor Agent should communicate with ElAlgo through
                authenticated server endpoints. Private server credentials
                must not be embedded in public website code or exposed to
                customers.
              </p>

              <p>
                No internet-based service can guarantee absolute security.
                Users should also protect their ElAlgo account, computer
                and MetaTrader environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RETENTION */}

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              06 · Retention
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              How long data may remain
            </h2>
          </div>

          <div className="space-y-5 leading-8 text-gray-400">
            <p>
              Advisor trading information may be retained while your
              Advisor account is active and for a reasonable period
              afterward where required to operate the service, resolve
              disputes, maintain security, comply with legal obligations or
              preserve legitimate business records.
            </p>

            <p>
              Specific retention periods may vary depending on the type of
              information, applicable law and the status of your ElAlgo
              account.
            </p>
          </div>
        </div>
      </section>

      {/* DELETION */}

      <section className="border-y border-white/[0.06] bg-[#050914]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.05] text-red-300">
                <Trash2 size={24} />
              </div>

              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.3em] text-red-300">
                07 · Your Choices
              </p>

              <h2 className="mt-4 text-4xl font-bold">
                Disconnecting and deleting data
              </h2>
            </div>

            <div className="space-y-5 leading-8 text-gray-400">
              <p>
                Users should be able to stop future synchronization by
                disconnecting Advisor Agent or removing it from MetaTrader.
              </p>

              <p>
                ElAlgo may provide account controls or support processes
                for requesting deletion of Advisor information, subject to
                legal, security and record-retention requirements.
              </p>

              <p>
                Removing Advisor Agent from MetaTrader stops the Agent from
                sending new information, but does not automatically erase
                information already stored by ElAlgo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS DISCLAIMER */}

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          08 · Analytics
        </p>

        <h2 className="mt-4 text-4xl font-bold">
          Advisor analytics are informational
        </h2>

        <div className="mt-8 rounded-3xl border border-amber-400/15 bg-amber-400/[0.035] p-7 sm:p-8">
          <p className="leading-8 text-gray-300">
            ElAlgo Advisor analyzes historical and current trading
            information. Metrics, charts, classifications, observations and
            other analytics are provided for informational and educational
            purposes. They do not constitute financial, investment or
            trading advice and do not guarantee future profitability or
            improved performance.
          </p>
        </div>
      </section>

      {/* USER RESPONSIBILITY */}

      <section className="border-y border-white/[0.06] bg-white/[0.012]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
                <UserRoundCheck size={24} />
              </div>

              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                09 · User Responsibility
              </p>

              <h2 className="mt-4 text-4xl font-bold">
                Connect only accounts you are authorized to use
              </h2>
            </div>

            <div className="space-y-5 leading-8 text-gray-400">
              <p>
                By connecting a MetaTrader account to Advisor, you confirm
                that you are authorized to provide the trading information
                associated with that account.
              </p>

              <p>
                You are responsible for keeping your ElAlgo credentials and
                Advisor connection information secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHANGES */}

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          10 · Policy Updates
        </p>

        <h2 className="mt-4 text-4xl font-bold">
          Changes to this policy
        </h2>

        <p className="mt-6 max-w-3xl leading-8 text-gray-400">
          ElAlgo may update this policy as Advisor evolves, including when
          new data categories, analytics, integrations or service features
          are introduced. Material changes should be reflected on this page
          with an updated revision date.
        </p>
      </section>

      {/* RELATED POLICIES */}

      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-bold">
            Related ElAlgo policies
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              href="/privacy"
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 font-semibold text-gray-300 transition hover:border-cyan-400/20 hover:text-cyan-300"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 font-semibold text-gray-300 transition hover:border-cyan-400/20 hover:text-cyan-300"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/risk-disclosure"
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 font-semibold text-gray-300 transition hover:border-cyan-400/20 hover:text-cyan-300"
            >
              Risk Disclosure
            </Link>
          </div>

          <p className="mt-10 text-xs leading-6 text-gray-600">
            This page is intended as a product-policy framework and should
            be reviewed by qualified legal counsel before commercial
            deployment in the jurisdictions where ElAlgo operates.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}