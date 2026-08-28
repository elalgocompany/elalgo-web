"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Menu,
  X,
  Search,
  ShoppingCart,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const navigation = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Products",
    href: "/products",
  },
  {
    title: "Build Your Project",
    href: "/build-project",
  },
];

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsLoggedIn(!!user);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session?.user);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    setMenuOpen(false);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* LOGO */}

        <Link
          href="/"
          className="flex shrink-0 items-center font-bold text-white"
        >
          <Image
            src="/images/Logo.png"
            alt="ElAlgo Logo"
            width={65}
            height={45}
            className="h-auto w-[55px] sm:w-[65px]"
          />

          <span className="text-xl sm:text-2xl lg:text-3xl">
            ElAlgo
          </span>
        </Link>


        {/* DESKTOP NAVIGATION */}

        <nav className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="text-sm text-gray-300 transition hover:text-white"
            >
              {item.title}
            </Link>
          ))}
        </nav>


        {/* DESKTOP RIGHT SIDE */}

        <div className="hidden items-center gap-4 lg:flex">

          <Search
            size={20}
            className="cursor-pointer text-gray-300 transition hover:text-white"
          />

          <ShoppingCart
            size={20}
            className="cursor-pointer text-gray-300 transition hover:text-white"
          />

          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl border border-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/10 px-5 py-2 text-sm font-medium text-gray-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-xl border border-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Log in
            </Link>
          )}

        </div>


        {/* MOBILE RIGHT SIDE */}

        <div className="flex items-center gap-3 lg:hidden">

          <Search
            size={19}
            className="text-gray-300"
          />

          <ShoppingCart
            size={19}
            className="text-gray-300"
          />

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white"
            aria-label="Toggle navigation"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>

      </div>


      {/* MOBILE MENU */}

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#050816] lg:hidden">

          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">

            {/* NAVIGATION */}

            <nav className="flex flex-col gap-2">

              {navigation.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  {item.title}
                </Link>
              ))}

            </nav>


            {/* AUTH */}

            <div className="mt-5 border-t border-white/10 pt-5">

              {isLoggedIn ? (
                <div className="grid gap-3">

                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                  >
                    Log out
                  </button>

                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Log in
                </Link>
              )}

            </div>

          </div>

        </div>
      )}

    </header>
  );
}