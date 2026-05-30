import React, { Suspense } from "react";
import QuickGuide from "./components/QuickGuide.jsx";

const CryptoWidget = React.lazy(() => import("./components/CryptoWidget.jsx"));

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
    <path
      d="M12 3v2.25M12 18.75V21M4.22 4.22l1.59 1.59M18.19 18.19l1.59 1.59M3 12h2.25M18.75 12H21M4.22 19.78l1.59-1.59M18.19 5.81l1.59-1.59M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
    <path
      d="M21 13.2A8.25 8.25 0 1 1 10.8 3a6.8 6.8 0 1 0 10.2 10.2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function LandingPage({ theme = "dark", onToggleTheme = () => {} }) {
  const [showQuickGuide, setShowQuickGuide] = React.useState(false);

  const openQuickGuide = () => setShowQuickGuide(true);
  const closeQuickGuide = () => setShowQuickGuide(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_75%_10%,rgba(34,197,94,0.12),transparent_45%),radial-gradient(circle_at_20%_70%,rgba(56,189,248,0.08),transparent_40%),linear-gradient(180deg,#030712_0%,#020617_35%,#04121f_100%)] text-slate-200 overflow-x-hidden">
      <header className="px-4 md:px-6 py-4 md:py-5 flex items-center justify-between max-w-7xl mx-auto gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#0a2230] to-[#003828] ring-1 ring-emerald-400/30 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.22)]">
            <span className="text-green-400 font-bold text-lg">↗</span>
          </div>
          <div>
            <div className="font-semibold text-xl md:text-[1.75rem] leading-none tracking-tight">
              TradeSense <span className="text-green-400">NG</span>
            </div>
            <div className="text-xs md:text-sm text-slate-400">AI Investment Signals</div>
          </div>
        </div>

        <button
          type="button"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={theme === "dark"}
          onClick={onToggleTheme}
          className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/90 bg-slate-950/35 text-slate-100"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <nav className="hidden xl:flex items-center gap-7 text-[1.02rem] text-slate-300">
          <button className="hover:text-white">Features</button>
          <button className="hover:text-white">How It Works</button>
          <button className="hover:text-white">Pricing</button>
          <button className="hover:text-white">About Us</button>
          <button className="hover:text-white">FAQ</button>
        </nav>

        <nav className="flex gap-2 md:gap-3 items-center">
          <button
            type="button"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={theme === "dark"}
            onClick={onToggleTheme}
            className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-700/90 bg-slate-950/35 text-slate-100"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="px-4 md:px-6 py-2.5 rounded-2xl border border-slate-700/90 bg-slate-950/30 text-sm md:text-lg text-slate-100 shadow-inner">
            Log In
          </button>
          <button className="bg-gradient-to-r from-green-400 to-green-300 text-black px-5 md:px-7 py-2.5 rounded-2xl text-sm md:text-lg font-semibold shadow-[0_0_24px_rgba(34,197,94,0.35)]">
            Sign Up
          </button>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 grid grid-cols-1 xl:grid-cols-[1.16fr_0.94fr] 2xl:grid-cols-[1.12fr_1fr] gap-8 md:gap-10 items-center">
        <div className="space-y-5 md:space-y-6">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full border border-emerald-400/30 bg-slate-950/60 text-green-300 text-xs md:text-sm tracking-wide">
            AI POWERED • SMARTER INVESTING
          </div>

          <h1 className="text-[2.4rem] sm:text-[3.2rem] lg:text-[3.9rem] font-extrabold leading-[0.98] tracking-tight max-w-[13ch]">
            Smarter Signals.
            <br /> Better Decisions.
            <br /> <span className="text-green-400">Stronger Portfolio.</span>
          </h1>

          <p className="text-slate-300/90 text-[1.02rem] md:text-[1.2rem] leading-relaxed max-w-xl xl:max-w-2xl">
            TradeSense NG uses advanced AI to analyze market trends, identify
            high‑probability opportunities, and deliver real‑time signals you
            can trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <button className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-300 text-black text-base md:text-lg font-bold shadow-[0_0_28px_rgba(34,197,94,0.35)]">
              Get Started Free  →
            </button>
            <button className="px-6 py-3.5 rounded-2xl border border-slate-700 bg-slate-950/25 text-slate-100 text-base md:text-lg font-semibold">
              See How It Works
            </button>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-1">
            <div className="flex -space-x-3">
              <div className="w-11 h-11 rounded-full ring-2 ring-slate-900 bg-slate-700" />
              <div className="w-11 h-11 rounded-full ring-2 ring-slate-900 bg-slate-600" />
              <div className="w-11 h-11 rounded-full ring-2 ring-slate-900 bg-slate-500" />
            </div>
            <div className="text-[0.98rem] md:text-[1.08rem] text-slate-300">
              Join 10,000+ investors •{" "}
              <span className="text-yellow-400 font-semibold">4.9/5</span> <span className="text-slate-500 text-base">(from 1,200+ reviews)</span>
            </div>
          </div>

          <div className="mt-4">
            <button className="btn-secondary text-sm md:text-base" onClick={openQuickGuide}>
              Quick Guide
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="mx-auto max-w-[860px] w-full">
            <div className="rounded-3xl bg-[linear-gradient(180deg,rgba(11,24,40,0.94),rgba(7,18,30,0.98))] border border-cyan-400/25 p-4 md:p-5 shadow-[0_0_55px_rgba(34,197,94,0.14)] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="text-slate-100 font-semibold text-lg">BTC • Bitcoin</div>
                <div className="text-emerald-300 text-sm bg-emerald-900/30 border border-emerald-500/25 px-3 py-1 rounded-full">Market: Active</div>
              </div>

              <div className="h-[310px] sm:h-[340px] md:h-[370px] lg:h-[410px] xl:h-[430px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950/40">
                <Suspense
                  fallback={
                    <div className="h-full w-full bg-gradient-to-b from-slate-900 to-slate-800 animate-pulse rounded-md" />
                  }
                >
                  <CryptoWidget />
                </Suspense>
              </div>

              <div className="mt-3 md:mt-4 flex justify-between items-center text-sm md:text-base text-slate-300">
                <div className="font-semibold">
                  $98,542.61 <span className="text-green-400 ml-2">+2.45%</span>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-500/30 px-4 py-1.5 rounded-full text-green-300 font-medium">
                  Strong Buy
                </div>
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 md:-bottom-14 w-[380px] md:w-[560px] h-28 md:h-40 rounded-full bg-gradient-to-t from-emerald-400/35 to-transparent opacity-85 blur-2xl"></div>
        </div>
      </section>
      {showQuickGuide && (
        // Landing quick guide (guest)
        <React.Suspense>
          <QuickGuide
            onClose={closeQuickGuide}
            isAdmin={false}
            onNavigate={() => {
              window.location.href = "/";
            }}
          />
        </React.Suspense>
      )}
    </main>
  );
}
