"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface StartTrialButtonProps {
  productId: string;
  trialDays: number;
}

export default function StartTrialButton({
  productId,
  trialDays,
}: StartTrialButtonProps) {
  const router = useRouter();

  const [accountNumber, setAccountNumber] = useState("");
  const [platform, setPlatform] = useState("mt5");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleStartTrial = async () => {
    setMessage("");

    if (!accountNumber.trim()) {
      setMessage("Please enter your MetaTrader account number.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please sign in before starting your trial.");

        setTimeout(() => {
          router.push("/auth/signin");
        }, 1500);

        return;
      }

      const response = await fetch("/api/licenses/trial", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          product_id: productId,
          account_number: accountNumber,
          platform,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to start trial.");
        return;
      }

      setMessage(
        `Your ${trialDays}-day free trial has been created successfully!`
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Trial error:", error);

      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">

      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          MetaTrader Account Number
        </label>

        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Enter your MT4/MT5 account number"
          className="
            w-full
            rounded-lg
            border
            border-blue-400/40
            bg-slate-800
            px-4
            py-3
            text-white
            placeholder:text-gray-400
            outline-none
            focus:border-blue-400
          "
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Platform
        </label>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="
            w-full
            rounded-lg
            border
            border-blue-400/40
            bg-slate-800
            px-4
            py-3
            text-white
            outline-none
            focus:border-blue-400
          "
        >
          <option value="mt5">MetaTrader 5</option>
          <option value="mt4">MetaTrader 4</option>
        </select>
      </div>

      <button
        onClick={handleStartTrial}
        disabled={loading}
        className="
          w-full
          rounded-lg
          bg-blue-500
          px-6
          py-4
          font-bold
          text-white
          transition
          hover:bg-blue-400
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading
          ? "Creating Trial..."
          : `Start ${trialDays}-Day Free Trial`}
      </button>

      {message && (
        <p className="text-center text-sm text-blue-200">
          {message}
        </p>
      )}

    </div>
  );
}