"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { supabase } from "@/lib/supabase";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  redirectTo?: string | null;
};

type AuthMode = "login" | "signup";

export default function AuthModal({
  open,
  onClose,
  redirectTo = "/dashboard",
}: AuthModalProps) {
  const [mode, setMode] =
    useState<AuthMode>("login");

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /*
    Prevent background scrolling
    while the modal is open.
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [open]);


  /*
    Escape key closes modal.
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, onClose]);


  if (!open) {
    return null;
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (!email.trim() || !password) {
      setMessage(
        "Please enter your email and password."
      );

      return;
    }


    /*
      LOGIN
    */

    if (mode === "login") {
      setLoading(true);

      const {
        error,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      setLoading(false);

      if (error) {
        setMessage(error.message);
        return;
      }

      onClose();

        if (redirectTo) {
            window.location.href = redirectTo;
        }

      return;
    }


    /*
      SIGN UP
    */

    if (!username.trim()) {
      setMessage(
        "Please choose a username."
      );

      return;
    }

    if (!acceptedTerms) {
      setMessage(
        "You must agree to the Terms & Conditions."
      );

      return;
    }

    setLoading(true);

    const {
      data,
      error,
    } =
      await supabase.auth.signUp({
        email: email.trim(),

        password,

        options: {
          data: {
            username:
              username.trim(),
          },
        },
      });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }


    /*
      If email confirmation is enabled,
      Supabase may create the user but
      not immediately create a session.
    */

    if (!data.session) {
      setMessage(
        "Account created. Please check your email to confirm your account."
      );

      return;
    }

    onClose();

    window.location.href =
      "/dashboard";
  }


  function changeMode(
    newMode: AuthMode
  ) {
    setMode(newMode);

    setMessage("");

    setPassword("");

    setAcceptedTerms(false);
  }


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        px-4
        py-8
      "
    >

      {/* BLURRED BACKDROP */}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close authentication"
        className="
          absolute
          inset-0
          cursor-default
          bg-[#02040c]/70
          backdrop-blur-md
        "
      />


      {/* LOGIN CARD */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-md
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-[#080c19]/95
          p-7
          shadow-2xl
          shadow-blue-950/40
          sm:p-8
        "
      >

        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            absolute
            right-5
            top-5
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            text-gray-400
            transition
            hover:bg-white/5
            hover:text-white
          "
        >
          <X size={18} />
        </button>


        {/* HEADER */}

        <div className="pr-10">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            ElAlgo Account
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {mode === "login"
              ? "Welcome Back"
              : "Create Your Account"}
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            {mode === "login"
              ? "Log in to access your products, licenses and custom projects."
              : "Create your ElAlgo account to access products, trials and custom development."}
          </p>

        </div>


        {/* LOGIN / SIGNUP TABS */}

        <div className="mt-8 grid grid-cols-2 rounded-xl border border-white/10 bg-[#050816] p-1">

          <button
            type="button"
            onClick={() =>
              changeMode("login")
            }
            className={
              mode === "login"
                ? "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                : "rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 transition hover:text-white"
            }
          >
            Log In
          </button>

          <button
            type="button"
            onClick={() =>
              changeMode("signup")
            }
            className={
              mode === "signup"
                ? "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                : "rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 transition hover:text-white"
            }
          >
            Sign Up
          </button>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="mt-7"
        >

          {/* USERNAME - SIGNUP ONLY */}

          {mode === "signup" && (
            <div>

              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                autoComplete="username"
                placeholder="Choose a username"
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#050816]
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  placeholder:text-gray-600
                  focus:border-blue-500
                "
              />

            </div>
          )}


          {/* EMAIL */}

          <div
            className={
              mode === "signup"
                ? "mt-5"
                : ""
            }
          >

            <label
              htmlFor="auth-email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email
            </label>

            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              autoComplete="email"
              placeholder="you@example.com"
              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-[#050816]
                px-4
                py-3
                text-white
                outline-none
                transition
                placeholder:text-gray-600
                focus:border-blue-500
              "
            />

          </div>


          {/* PASSWORD */}

          <div className="mt-5">

            <label
              htmlFor="auth-password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              placeholder="Enter your password"
              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-[#050816]
                px-4
                py-3
                text-white
                outline-none
                transition
                placeholder:text-gray-600
                focus:border-blue-500
              "
            />

          </div>


          {/* TERMS - SIGNUP ONLY */}

          {mode === "signup" && (
            <label className="mt-6 flex items-start gap-3">

              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) =>
                  setAcceptedTerms(
                    event.target.checked
                  )
                }
                className="
                  mt-1
                  h-4
                  w-4
                  shrink-0
                  accent-blue-600
                "
              />

              <span className="text-sm leading-6 text-gray-400">

                I agree to the{" "}

                <Link
                  href="/terms"
                  target="_blank"
                  className="font-medium text-blue-400 transition hover:text-blue-300"
                >
                  Terms & Conditions
                </Link>

                {" "}and acknowledge the{" "}

                <Link
                  href="/risk-disclosure"
                  target="_blank"
                  className="font-medium text-blue-400 transition hover:text-blue-300"
                >
                  Risk Disclosure
                </Link>.

              </span>

            </label>
          )}


          {/* MESSAGE */}

          {message && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">

              <p className="text-sm leading-6 text-gray-300">
                {message}
              </p>

            </div>
          )}


          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="
              mt-7
              w-full
              rounded-xl
              bg-blue-600
              px-6
              py-3.5
              font-semibold
              text-white
              transition
              hover:bg-blue-500
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Log In"
                : "Create Account"}
          </button>

        </form>

      </div>

    </div>
  );
}