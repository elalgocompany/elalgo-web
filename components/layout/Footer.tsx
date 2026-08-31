import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#040612] text-white">

      <div className="mx-auto max-w-7xl px-6 py-14">

        {/* MAIN FOOTER */}

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">

          {/* BRAND */}

          <div>

            <Link
              href="/"
              className="flex items-center gap-3"
            >

              <Image
                src="/images/Logo.png"
                alt="ElAlgo Logo"
                width={65}
                height={50}
                className="h-auto w-[60px]"
              />

              <span className="text-2xl font-bold text-white">
                ElAlgo
              </span>

            </Link>


            <p className="mt-5 max-w-xs text-sm leading-7 text-gray-400">
              Professional algorithmic trading solutions,
              custom development, trading tools and education
              for MetaTrader and TradingView users.
            </p>

          </div>


          {/* QUICK LINKS */}

          <div>

            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              Quick Links
            </h3>

            <div className="mt-6 flex flex-col gap-4">

              <Link
                href="/"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/products"
                className="text-sm text-gray-400 transition hover:text-emerald-400"
              >
                Products
              </Link>

              <Link
                href="/education"
                className="text-sm text-gray-400 transition hover:text-purple-400"
              >
                Education
              </Link>

              <Link
                href="/build-project"
                className="text-sm text-gray-400 transition hover:text-amber-400"
              >
                Build Your Project
              </Link>

            </div>

          </div>


          {/* SUPPORT */}

          <div>

            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              Support
            </h3>

            <div className="mt-6 flex flex-col gap-4">

              <Link
                href="/education"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Tutorials
              </Link>

              <Link
                href="/build-project"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Custom Development
              </Link>

              <Link
                href="/dashboard"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Customer Dashboard
              </Link>

              <Link
                href="/auth/login"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Login
              </Link>

            </div>

          </div>


          {/* LEGAL */}

          <div>

            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              Legal
            </h3>

            <div className="mt-6 flex flex-col gap-4">

              <Link
                href="/terms"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Terms & Conditions
              </Link>

              <Link
                href="/privacy"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Privacy Policy
              </Link>

              <Link
                href="/risk-disclosure"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Risk Disclosure
              </Link>

            </div>

          </div>

        </div>


        {/* BOTTOM BAR */}

        <div className="mt-14 border-t border-white/10 pt-6">

          <div className="flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

            <p>
              © {new Date().getFullYear()} ElAlgo. All rights reserved.
            </p>

            <p>
              Algorithmic trading involves financial risk.
            </p>

          </div>

        </div>

      </div>

    </footer>
  );
}