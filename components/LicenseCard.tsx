

"use client";

import { useState } from "react";
import { License } from "@/types/License";
import { supabase } from "@/lib/supabase";
import { products } from "@/data/products";
import { data } from "framer-motion/client";









type LicenseCardProps = {
  license: License;
};

export default function LicenseCard({
  license,
}: LicenseCardProps) {
const product = license.products;
const plan = license.product_plans;

const productFiles = product?.product_files ?? [];

const [accountNumber, setAccountNumber] = useState(
  license.account_number || ""
);

console.log("PRODUCT:", product);
console.log("PLAN:", plan);
console.log("PRODUCT FILES:", productFiles);


const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");



// set cool down for account change 
const COOLDOWN_HOURS = 24;

const lastAccountVerification = license.account_verified_at
  ? new Date(license.account_verified_at)
  : null;

const nextAccountChange = lastAccountVerification
  ? new Date(
      lastAccountVerification.getTime() +
        COOLDOWN_HOURS * 60 * 60 * 1000
    )
  : null;

const isAccountChangeLocked =
  nextAccountChange !== null &&
  nextAccountChange > new Date();

const remainingCooldownHours =
  isAccountChangeLocked && nextAccountChange
    ? Math.ceil(
        (nextAccountChange.getTime() - new Date().getTime()) /
          (1000 * 60 * 60)
      )
    : 0;

const isTrial = license.license_kind === "trial";

  
const isLifetime =
  license.license_kind === "lifetime";

const isTrialWaitingForActivation =
  isTrial && !license.trial_started_at;

const isExpired =
  !!license.expires_at &&
  new Date(license.expires_at) < new Date();

const remainingDays =
  license.expires_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(license.expires_at).getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

const formattedExpiration = license.expires_at
  ? new Date(license.expires_at).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )
  : isTrial
  ? "Starts after activation"
  : isLifetime
  ? "Never"
  : "Not set";









  const [downloading, setDownloading] =
  useState(false);

  async function handleSaveAccount() {
  const cleanedAccountNumber = accountNumber.trim();

  if (!cleanedAccountNumber) {
    setMessage("Please enter an account number.");
    return;
  }

  setSaving(true);
  setMessage("");

  const { error } = await supabase
    .from("licenses")
    .update({
        account_number: cleanedAccountNumber,
        account_selected_at: new Date().toISOString(),
        account_verified_at: null,
       
    })
    .eq("id", license.id);

    if (error) {
      console.error("Error updating account:", error);
      setMessage("Failed to save account number.");
    } else {
      setMessage("Account number saved successfully.");
    }

    setSaving(false);
  }


 

  
async function handleDownload(platform: string) {
  setDownloading(true);
  setMessage("");

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please sign in again.");
      return;
    }

    const response = await fetch("/api/download", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        user_id: user.id,
        license_id: license.id,
        platform,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.message ||
          "Could not download product."
      );

      return;
    }

    window.location.href = data.download_url;
  } catch (error) {
    console.error("Download error:", error);

    setMessage(
      "Something went wrong while downloading."
    );
  } finally {
    setDownloading(false);
  }
}
  return (
    <div  className="overflow-hidden rounded-2xl border border-black/10 bg-black/5 ">

      {/* Product Image */}

      {product?.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
  
      <div  className="p-6">

        {/* Product Name */}

        <div className="flex items-start justify-between gap-4 ">

          <div>
            <h2 className="text-xl font-bold text-white">
              {product?.title}
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {product?.category}
            </p>
          </div>

          {/* Status Badge */}

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isExpired || license.status !== "active"
                ? "bg-red-500/20 text-red-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {isExpired
              ? "EXPIRED"
              : isTrial
              ? "FREE TRIAL"
              : license.status.toUpperCase()}
          </span>

        </div>

        {isTrial && (
          <div className="mt-6 rounded-xl border border-blue-400/30 bg-blue-500/10 p-4">
            <p className="font-bold text-blue-300">
              FREE TRIAL
            </p>

            {isTrialWaitingForActivation ? (
              <p className="mt-2 text-sm text-yellow-300">
                Your {license.trial_duration_days || 7}-day trial will begin
                when you activate this product on MetaTrader.
              </p>
            ) : isExpired ? (
              <p className="mt-2 text-sm text-red-300">
                Your free trial has ended.
              </p>
            ) : (
              <p className="mt-2 text-sm text-blue-200">
                You have {remainingDays} day
                {remainingDays === 1 ? "" : "s"} remaining.
              </p>
            )}
          </div>
        )}

        {/* License Information */}

        <div className="mt-6 space-y-4">

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">
              License Plan
            </p>

            <p className="mt-1 font-semibold text-white">
              {isTrial ? "7-Day Free Trial" : plan?.name}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">
              Remaining Time
            </p>

            <p className="mt-1 text-lg font-bold text-blue-300">
              {isTrialWaitingForActivation
                ? "Starts after activation"
                : isLifetime
                ? "Lifetime"
                : isExpired
                ? "Trial expired"
                : `${remainingDays} days remaining`}
            </p>
          
          
            <p className="text-xs uppercase tracking-wider text-gray-500">
              Expires
            </p>

            <p className="mt-1 font-semibold text-blue-300">
              {formattedExpiration}
            </p>
          </div>

          

        </div>

        {/* Account Input */}

        <div className="mt-6">

          <label className="mb-2 block text-sm font-medium text-gray-500">
            MetaTrader Account Number
          </label>

          <input
            type="text"
            value={accountNumber}
            onChange={(event) =>
              setAccountNumber(event.target.value)
            }
            disabled={isAccountChangeLocked}
            placeholder="Enter account number"
            className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-400"
            />
            {license.account_number &&
            !license.account_verified_at &&
            !isAccountChangeLocked && (
                <p className="mt-3 text-sm text-yellow-400">
                Waiting for activation. Please run the EA on this
                MetaTrader account {accountNumber} to activate your license.
                </p>
            )}
        </div>

        {/* Save Button */}

        <button
            onClick={handleSaveAccount}
            disabled={saving || isAccountChangeLocked}
            className="mt-3 w-full rounded-lg bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
            {saving ? "Saving..." : "Save Account"}
        </button>

        {message && (
        <p className="mt-3 text-center text-sm text-gray-300">
            {message}
        </p>
        )}
        {isAccountChangeLocked && (
        <p className="mt-3 text-center text-sm text-yellow-400">
            You can change this account again in approximately{" "}
            {remainingCooldownHours} hours.
        </p>
        )}
        {/* License Key */}

        <div className="mt-6 border-t border-white/10 pt-4">

          <p className="text-xs uppercase tracking-wider text-gray-500">
            License Key
          </p>

          <p className="mt-1 break-all font-mono text-sm text-gray-300">
            {license.license_key}
          </p>

        </div>

        {/* Last Verified */}

        <div className="mt-4">

          <p className="text-xs uppercase tracking-wider text-gray-500">
            Last Verified
          </p>

          <p className="mt-1 text-sm text-gray-400">
            {license.last_verified_at
              ? new Date(
                  license.last_verified_at
                ).toLocaleString()
              : "Never"}
          </p>

        </div>

          <div className="mt-4 flex flex-wrap gap-3">

              {productFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() =>
                    handleDownload(file.platform)
                  }
                  disabled={downloading || isExpired}
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloading
                    ? "Preparing..."
                    : `Download ${file.platform.toUpperCase()}`}
                </button>
              ))}

            </div>


        </div>
        </div>
  );
}