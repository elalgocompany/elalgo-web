"use client";

import {
  useState,
} from "react";

import {
  Check,
  Copy,
  KeyRound,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function AdvisorConnectionSetup() {
  const [
    advisorKey,
    setAdvisorKey,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  async function createConnection() {
    setLoading(true);
    setError("");
    setCopied(false);


    const {
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();


    if (!session) {
      setError(
        "Please log in first."
      );

      setLoading(false);

      return;
    }


    const response =
      await fetch(
        "/api/advisor/connections/create",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );


    const data =
      await response.json();


    if (!response.ok) {
      setError(
        data.error ||
          "Could not create Advisor connection."
      );

      setLoading(false);

      return;
    }


    setAdvisorKey(
      data.advisor_key
    );

    setLoading(false);
  }


  async function copyKey() {
    if (!advisorKey) {
      return;
    }

    await navigator.clipboard.writeText(
      advisorKey
    );

    setCopied(true);

    setTimeout(
      () => setCopied(false),
      2000
    );
  }


  return (
    <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.03] p-6 sm:p-8">

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/[0.08] text-cyan-300">
        <KeyRound size={22} />
      </div>

      <h2 className="mt-6 text-2xl font-bold text-white">
        Connect Advisor Agent
      </h2>

      <p className="mt-3 max-w-xl leading-7 text-gray-400">
        Generate a secure Advisor key and
        paste it into the ElAlgo Advisor
        Agent inside MetaTrader.
      </p>


      {!advisorKey && (
        <button
          type="button"
          onClick={
            createConnection
          }
          disabled={loading}
          className="mt-7 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-[#020611] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Generate Advisor Key"}
        </button>
      )}


      {advisorKey && (
        <div className="mt-7">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Your Advisor Key
          </p>

          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#030611] p-4">

            <code className="min-w-0 flex-1 break-all text-sm text-gray-300">
              {advisorKey}
            </code>

            <button
              type="button"
              onClick={copyKey}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              {copied ? (
                <Check
                  size={17}
                  className="text-emerald-400"
                />
              ) : (
                <Copy size={17} />
              )}
            </button>

          </div>

          <p className="mt-3 text-xs leading-6 text-amber-300/70">
            Save this key now. ElAlgo
            does not store the readable
            version and cannot show it
            again later.
          </p>

        </div>
      )}


      {error && (
        <p className="mt-5 text-sm text-red-400">
          {error}
        </p>
      )}

    </div>
  );
}