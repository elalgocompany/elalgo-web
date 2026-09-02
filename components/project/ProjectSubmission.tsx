"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/app/auth/AuthModal";
type SubmittedProject = {
  id: string;
  project_ref: string;
};

export default function ProjectSubmission() {
  const [userId, setUserId] = useState<string | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [authOpen , setAuthOpen] = useState(false) ; 
  const [submittedProject, setSubmittedProject] =
    useState<SubmittedProject | null>(null);

  // FORM DATA

  const [projectType, setProjectType] = useState("");
  const [platform, setPlatform] = useState("");

  const [title, setTitle] = useState("");

  const [strategyDescription, setStrategyDescription] =
    useState("");

  const [entryRules, setEntryRules] = useState("");
  const [exitRules, setExitRules] = useState("");

  const [riskManagement, setRiskManagement] =
    useState("");

  const [additionalFeatures, setAdditionalFeatures] =
    useState("");

  const [budgetRange, setBudgetRange] = useState("");

  const [deliveryPreference, setDeliveryPreference] =
    useState("");

  // FILES

  const [files, setFiles] = useState<File[]>([]);

  // CHECK USER

  useEffect(() => {
  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);
    setLoadingUser(false);
  }

  loadUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUserId(session?.user?.id ?? null);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, []);

  // SUBMIT PROJECT

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

    // CREATE PROJECT

    const { data, error } = await supabase
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
      })
      .select("id, project_ref")
      .single();

    if (error) {
      console.error(
        "Project submission error:",
        error
      );

      setMessage(
        "Could not submit your project. Please try again."
      );

      setSubmitting(false);

      return;
    }

    // UPLOAD FILES

    if (files.length > 0) {
      for (const file of files) {
        const safeFileName =
          file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );

        const filePath =
          `${userId}/${data.id}/` +
          `${crypto.randomUUID()}-${safeFileName}`;

        // UPLOAD TO STORAGE

        const { error: uploadError } =
          await supabase.storage
            .from("project-files")
            .upload(
              filePath,
              file,
              {
                cacheControl: "3600",
                upsert: false,
              }
            );

        if (uploadError) {
          console.error(
            "Project file upload error:",
            uploadError
          );

          continue;
        }

        // SAVE FILE INFO TO DATABASE

        const { error: metadataError } =
          await supabase
            .from("project_files")
            .insert({
              project_id: data.id,

              user_id: userId,

              file_name: file.name,

              file_path: filePath,

              file_size: file.size,

              file_type:
                file.type || null,
            });

        if (metadataError) {
          console.error(
            "Project file metadata error:",
            metadataError
          );
        }
      }
    }

    // PROJECT SUCCESS

    setSubmittedProject({
      id: data.id,

      project_ref:
        data.project_ref,
    });

    // CLEAR FORM

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

    setFiles([]);

    setSubmitting(false);
  }

  // LOADING USER

  if (loadingUser) {
    return (
      
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">

        <p className="text-gray-400">
          Checking your account...
        </p>

      </div>
    );
  }

  // NOT LOGGED IN

  if (!userId) {
  return (
    <>
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-8 text-center lg:p-12">

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
          Login Required
        </p>

        <h2 className="mt-4 text-3xl font-bold text-white">
          Submit Your Project
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-400">
          Please log in to submit your project and keep
          your project communication connected to your
          ElAlgo account.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">

          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="rounded-xl bg-amber-500 px-7 py-4 font-bold text-black transition hover:bg-amber-400"
          >
            Log in
          </button>

          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="rounded-xl border border-amber-500/30 px-7 py-4 font-bold text-gray-200 transition hover:bg-amber-500/10"
          >
            Create Account
          </button>

        </div>

      </div>  

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo={null}
      />
    </>
  );
}

  // SUCCESS SCREEN

  if (submittedProject) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.05] p-8 text-center lg:p-12">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
          ✓
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
          Project Submitted
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          We Received Your Project
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-400">
          Your project has been received successfully.
          We will review your requirements before preparing
          the project scope, estimated delivery time and
          quotation.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-[#050816] p-6">

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Project Reference
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-400">
            {submittedProject.project_ref}
          </p>

        </div>

        <p className="mt-5 text-sm text-gray-500">
          Keep this reference for future communication
          about your project.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">

          <Link
            href="/dashboard"
            className="rounded-xl bg-amber-500 px-7 py-3 font-bold text-black transition hover:bg-amber-400"
          >
            Go to Dashboard
          </Link>

          <button
            type="button"
            onClick={() =>
              setSubmittedProject(null)
            }
            className="rounded-xl border border-white/10 px-7 py-3 font-semibold text-gray-300 transition hover:bg-white/[0.05]"
          >
            Submit Another Project
          </button>

        </div>

      </div>
    );
  }

  // PROJECT FORM

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10"
    >

      {/* HEADER */}

      <div>

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
          Project Brief
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Tell Us About Your Project
        </h2>

        <p className="mt-4 max-w-2xl leading-7 text-gray-400">
          Give us enough detail to understand your strategy.
          We will review everything before sending you a quote
          and estimated delivery time.
        </p>

      </div>


      {/* PROJECT TYPE + PLATFORM */}

      <div className="mt-10 grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Project Type *
          </label>

          <select
            value={projectType}
            onChange={(e) =>
              setProjectType(
                e.target.value
              )
            }
            required
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


        <div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Platform *
          </label>

          <select
            value={platform}
            onChange={(e) =>
              setPlatform(
                e.target.value
              )
            }
            required
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


      {/* TITLE */}

      <div className="mt-6">

        <label className="mb-2 block text-sm font-medium text-gray-300">
          Project Title *
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          required
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
          required
          rows={6}
          placeholder="Explain how your strategy works..."
          className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
        />

      </div>


      {/* ENTRY + EXIT */}

      <div className="mt-6 grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Entry Rules
          </label>

          <textarea
            value={entryRules}
            onChange={(e) =>
              setEntryRules(
                e.target.value
              )
            }
            rows={5}
            placeholder="Explain when trades should open..."
            className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
          />

        </div>


        <div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Exit Rules
          </label>

          <textarea
            value={exitRules}
            onChange={(e) =>
              setExitRules(
                e.target.value
              )
            }
            rows={5}
            placeholder="Explain when trades should close..."
            className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
          />

        </div>

      </div>


      {/* RISK + FEATURES */}

      <div className="mt-6 grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Risk / Money Management
          </label>

          <textarea
            value={riskManagement}
            onChange={(e) =>
              setRiskManagement(
                e.target.value
              )
            }
            rows={5}
            placeholder="Lot size, percentage risk, stop loss, daily limits..."
            className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
          />

        </div>


        <div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Additional Features
          </label>

          <textarea
            value={additionalFeatures}
            onChange={(e) =>
              setAdditionalFeatures(
                e.target.value
              )
            }
            rows={5}
            placeholder="Dashboard, alerts, filters, news control, multi-symbol..."
            className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500"
          />

        </div>

      </div>


      {/* BUDGET + DELIVERY */}

      <div className="mt-6 grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Estimated Budget
          </label>

          <select
            value={budgetRange}
            onChange={(e) =>
              setBudgetRange(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-amber-500"
          >

            <option value="">
              Select estimated budget
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

        </div>


        <div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Delivery Preference
          </label>

          <select
            value={deliveryPreference}
            onChange={(e) =>
              setDeliveryPreference(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-amber-500"
          >

            <option value="">
              Select delivery preference
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

      </div>


      {/* FILE UPLOAD */}

      <div className="mt-8">

        <label className="mb-2 block text-sm font-medium text-gray-300">
          Project Files
        </label>

        <label className="block cursor-pointer rounded-2xl border border-dashed border-white/15 bg-[#0b1020] p-8 text-center transition hover:border-amber-500/40 hover:bg-amber-500/[0.02]">

          <p className="font-medium text-white">
            Upload supporting files
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Screenshots, documents, source files or strategy examples
          </p>

          <p className="mt-1 text-xs text-gray-600">
            You can select multiple files.
          </p>

          <input
            type="file"
            multiple
            onChange={(e) => {
              if (
                !e.target.files
              ) {
                return;
              }

              setFiles(
                Array.from(
                  e.target.files
                )
              );
            }}
            className="hidden"
          />

        </label>


        {/* SELECTED FILES */}

        {files.length > 0 && (
          <div className="mt-4 space-y-2">

            {files.map(
              (file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                >

                  <div className="min-w-0">

                    <p className="truncate text-sm text-gray-300">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      {(
                        file.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFiles(
                        (
                          currentFiles
                        ) =>
                          currentFiles.filter(
                            (
                              _,
                              fileIndex
                            ) =>
                              fileIndex !==
                              index
                          )
                      );
                    }}
                    className="shrink-0 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    Remove
                  </button>

                </div>
              )
            )}

          </div>
        )}

      </div>


      {/* MESSAGE */}

      {message && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3">

          <p className="text-sm text-red-300">
            {message}
          </p>

        </div>
      )}


      {/* SUBMIT */}

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 w-full rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Submitting Project..."
          : "Submit Project"}
      </button>

      <p className="mt-4 text-center text-xs text-gray-600">
        Submitting a project does not create any payment obligation.
        We review the project first.
      </p>

    </form>

    
    
  );

  
}