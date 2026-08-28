"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ProjectSubmission() {
  const [userId, setUserId] = useState<string | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [projectType, setProjectType] = useState("");
  const [platform, setPlatform] = useState("");

  const [title, setTitle] = useState("");

  const [strategyDescription, setStrategyDescription] =
    useState("");

  const [entryRules, setEntryRules] = useState("");
  const [exitRules, setExitRules] = useState("");
  const [riskManagement, setRiskManagement] = useState("");
  const [additionalFeatures, setAdditionalFeatures] =
    useState("");

  const [budgetRange, setBudgetRange] = useState("");
  const [deliveryPreference, setDeliveryPreference] =
    useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!userId) {
      setMessage("Please log in first.");
      return;
    }

    if (
      !projectType ||
      !platform ||
      !title.trim() ||
      !strategyDescription.trim()
    ) {
      setMessage(
        "Please complete all required fields."
      );

      return;
    }

    setSubmitting(true);
    setMessage("");

    const { error } = await supabase
      .from("project_requests")
      .insert({
        user_id: userId,

        project_type: projectType,
        platform,

        title: title.trim(),

        strategy_description:
          strategyDescription.trim(),

        entry_rules:
          entryRules.trim() || null,

        exit_rules:
          exitRules.trim() || null,

        risk_management:
          riskManagement.trim() || null,

        additional_features:
          additionalFeatures.trim() || null,

        budget_range:
          budgetRange || null,

        delivery_preference:
          deliveryPreference || null,
      });

    if (error) {
      console.error(
        "Project submission error:",
        error
      );

      setMessage(
        "Could not submit your project."
      );

      setSubmitting(false);

      return;
    }

    setMessage(
      "Your project has been submitted successfully."
    );

    setProjectType("");
    setPlatform("");
    setTitle("");
    setStrategyDescription("");
    setEntryRules("");
    setExitRules("");
    setRiskManagement("");
    setAdditionalFeatures("");
    setBudgetRange("");
    setDeliveryPreference("");

    setSubmitting(false);
  }

  if (loadingUser) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-gray-400">
          Checking your account...
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-8 text-center lg:p-12">

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
          Login Required
        </p>

        <h2 className="mt-4 text-3xl font-bold text-white">
          Submit Your Project
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-400">
          Please log in to submit your project and keep all
          project communication connected to your ElAlgo account.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">

          <Link
            href="/auth/login"
            className="rounded-xl bg-amber-500 px-7 py-4 font-bold text-black transition hover:bg-amber-400"
          >
            Log In
          </Link>

          <Link
            href="/auth/signup"
            className="rounded-xl border border-amber-500/30 px-7 py-4 font-bold text-gray-200 transition hover:bg-amber-500/10"
          >
            Create Account
          </Link>

        </div>

      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:p-10"
    >

      <div>

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
          Project Brief
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Tell Us About Your Project
        </h2>

        <p className="mt-4 max-w-2xl text-gray-400">
          Give us enough detail to understand your strategy.
          We will review everything before sending you a quote
          and estimated delivery time.
        </p>

      </div>


      <div className="mt-10 grid gap-6 md:grid-cols-2">

        {/* PROJECT TYPE */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Project Type *
          </label>

          <select
            value={projectType}
            onChange={(e) =>
              setProjectType(e.target.value)
            }
            className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-amber-500"
          >
            <option value="">
              Select project type
            </option>

            <option value="expert-advisor">
              Expert Advisor
            </option>

            <option value="indicator">
              Indicator
            </option>

            <option value="trading-assistant">
              Trading Assistant / Panel
            </option>

            <option value="tradingview">
              TradingView Project
            </option>

            <option value="modification">
              Modification / Bug Fix
            </option>

            <option value="other">
              Other Custom Project
            </option>

          </select>

        </div>


        {/* PLATFORM */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Platform *
          </label>

          <select
            value={platform}
            onChange={(e) =>
              setPlatform(e.target.value)
            }
            className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-amber-500"
          >

            <option value="">
              Select platform
            </option>

            <option value="mt4">
              MetaTrader 4
            </option>

            <option value="mt5">
              MetaTrader 5
            </option>

            <option value="both">
              MT4 & MT5
            </option>

            <option value="tradingview">
              TradingView
            </option>

            <option value="other">
              Other
            </option>

          </select>

        </div>

      </div>


      {/* PROJECT TITLE */}

      <div className="mt-6">

        <label className="mb-2 block text-sm font-medium text-gray-300">
          Project Title *
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Example: Gold Scalping Expert Advisor"
          className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
        />

      </div>


      {/* STRATEGY */}

      <div className="mt-6">

        <label className="mb-2 block text-sm font-medium text-gray-300">
          Strategy Description *
        </label>

        <textarea
          value={strategyDescription}
          onChange={(e) =>
            setStrategyDescription(
              e.target.value
            )
          }
          rows={6}
          placeholder="Explain how your strategy works..."
          className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
        />

      </div>


      <div className="mt-6 grid gap-6 md:grid-cols-2">

        <textarea
          value={entryRules}
          onChange={(e) =>
            setEntryRules(e.target.value)
          }
          rows={5}
          placeholder="Entry rules"
          className="resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
        />

        <textarea
          value={exitRules}
          onChange={(e) =>
            setExitRules(e.target.value)
          }
          rows={5}
          placeholder="Exit rules"
          className="resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
        />

      </div>


      <div className="mt-6 grid gap-6 md:grid-cols-2">

        <textarea
          value={riskManagement}
          onChange={(e) =>
            setRiskManagement(e.target.value)
          }
          rows={5}
          placeholder="Risk / money management"
          className="resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
        />

        <textarea
          value={additionalFeatures}
          onChange={(e) =>
            setAdditionalFeatures(
              e.target.value
            )
          }
          rows={5}
          placeholder="Additional features"
          className="resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
        />

      </div>


      <div className="mt-6 grid gap-6 md:grid-cols-2">

        <select
          value={budgetRange}
          onChange={(e) =>
            setBudgetRange(e.target.value)
          }
          className="rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-amber-500"
        >

          <option value="">
            Estimated budget
          </option>

          <option value="under-100">
            Under $100
          </option>

          <option value="100-300">
            $100 - $300
          </option>

          <option value="300-700">
            $300 - $700
          </option>

          <option value="700-plus">
            $700+
          </option>

          <option value="not-sure">
            Not sure
          </option>

        </select>


        <select
          value={deliveryPreference}
          onChange={(e) =>
            setDeliveryPreference(
              e.target.value
            )
          }
          className="rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-amber-500"
        >

          <option value="">
            Delivery preference
          </option>

          <option value="flexible">
            Flexible
          </option>

          <option value="1-week">
            About 1 week
          </option>

          <option value="2-weeks">
            About 2 weeks
          </option>

          <option value="1-month">
            About 1 month
          </option>

        </select>

      </div>


      <button
        type="submit"
        disabled={submitting}
        className="mt-8 w-full rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Submitting Project..."
          : "Submit Project"}
      </button>


      {message && (
        <p className="mt-4 text-center text-sm text-gray-300">
          {message}
        </p>
      )}

    </form>
  );
}