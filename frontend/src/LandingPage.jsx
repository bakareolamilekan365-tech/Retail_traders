import React, { Suspense, useEffect, useRef } from "react";
import QuickGuide from "./components/QuickGuide.jsx";

const CryptoWidget = React.lazy(() => import("./components/CryptoWidget.jsx"));

export default function LandingPage() {
  const [showQuickGuide, setShowQuickGuide] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(null);
  const navRef = useRef(null);

  const toggleMenu = (key) =>
    setOpenMenu((prev) => (prev === key ? null : key));

  const openQuickGuide = () => setShowQuickGuide(true);
  const closeQuickGuide = () => setShowQuickGuide(false);

  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }

    function handleKey(e) {
      if (e.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleTriggerKeyDown = (event, key, menuId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleMenu(key);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpenMenu(key);
      setTimeout(() => {
        const menu = document.getElementById(menuId);
        menu?.querySelector('[role="menuitem"]')?.focus();
      }, 0);
    }
  };

  const handleMenuItemKeyDown = (event, menuId) => {
    const menu = document.getElementById(menuId);
    const items = Array.from(menu?.querySelectorAll('[role="menuitem"]') || []);
    const index = items.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = items[(index + 1) % items.length];
      next?.focus();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = items[(index - 1 + items.length) % items.length];
      prev?.focus();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpenMenu(null);
    }
  };

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
            <div className="text-xs md:text-sm text-slate-400">
              AI Investment Signals
            </div>
          </div>
        </div>

        {/* Theme toggle intentionally hidden on landing to simplify header */}

        <nav
          ref={navRef}
          role="menubar"
          aria-label="Landing navigation"
          className="hidden xl:flex items-center gap-6 text-[1.02rem] text-slate-300"
        >
          <div className="relative">
            <button
              onClick={() => toggleMenu("features")}
              onKeyDown={(e) =>
                handleTriggerKeyDown(e, "features", "features-menu")
              }
              aria-controls="features-menu"
              aria-haspopup="true"
              aria-expanded={openMenu === "features"}
              role="menuitem"
              className="hover:text-white flex items-center gap-2"
            >
              Features <span className="text-slate-400">▾</span>
            </button>
            {openMenu === "features" && (
              <div
                id="features-menu"
                role="menu"
                tabIndex={-1}
                className="absolute z-50 mt-2 left-0 w-64 bg-slate-900/95 border border-slate-700 rounded-md p-3 text-sm text-slate-200 shadow-lg"
              >
                <div className="font-semibold mb-1">Key Features</div>
                <ul className="space-y-1">
                  <li
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => handleMenuItemKeyDown(e, "features-menu")}
                  >
                    AI signals & alerts
                  </li>
                  <li
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => handleMenuItemKeyDown(e, "features-menu")}
                  >
                    Backtested strategies
                  </li>
                  <li
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => handleMenuItemKeyDown(e, "features-menu")}
                  >
                    Portfolio insights
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => toggleMenu("how")}
              onKeyDown={(e) => handleTriggerKeyDown(e, "how", "how-menu")}
              aria-controls="how-menu"
              aria-haspopup="true"
              aria-expanded={openMenu === "how"}
              role="menuitem"
              className="hover:text-white flex items-center gap-2"
            >
              How It Works <span className="text-slate-400">▾</span>
            </button>
            {openMenu === "how" && (
              <div
                id="how-menu"
                role="menu"
                tabIndex={-1}
                className="absolute z-50 mt-2 left-0 w-64 bg-slate-900/95 border border-slate-700 rounded-md p-3 text-sm text-slate-200 shadow-lg"
              >
                <div className="font-semibold mb-1">Overview</div>
                <div
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => handleMenuItemKeyDown(e, "how-menu")}
                  className="text-slate-400"
                >
                  We analyze market data and surface high-probability
                  opportunities.
                </div>
              </div>
            )}
          </div>

          {["Pricing", "About Us", "FAQ"].map((label) => (
            <div key={label} className="relative">
              <button
                onClick={() => toggleMenu(label)}
                onKeyDown={(e) =>
                  handleTriggerKeyDown(
                    e,
                    label,
                    `${label.replace(/\s+/g, "-").toLowerCase()}-menu`,
                  )
                }
                aria-controls={`${label.replace(/\s+/g, "-").toLowerCase()}-menu`}
                aria-haspopup="true"
                aria-expanded={openMenu === label}
                role="menuitem"
                className="hover:text-white flex items-center gap-2"
              >
                {label} <span className="text-slate-400">▾</span>
              </button>
              {openMenu === label && (
                <div
                  id={`${label.replace(/\s+/g, "-").toLowerCase()}-menu`}
                  role="menu"
                  tabIndex={-1}
                  className="absolute z-50 mt-2 left-0 w-56 bg-amber-900/95 border border-amber-700 rounded-md p-3 text-sm text-amber-100 shadow-lg"
                >
                  <div className="font-semibold">Demo</div>
                  <div
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      handleMenuItemKeyDown(
                        e,
                        `${label.replace(/\s+/g, "-").toLowerCase()}-menu`,
                      )
                    }
                    className="text-amber-100/90"
                  >
                    This is a demo experience. Full content coming soon.
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <nav className="flex gap-2 md:gap-3 items-center">
          {/* hidden theme toggle on landing */}
          <button
            className="px-4 py-2 rounded-xl border border-slate-700/70 bg-slate-950/20 text-sm text-slate-100 shadow-inner"
            onClick={() => {
              window.location.href = "/?auth=login";
            }}
          >
            Log In
          </button>
          <button
            className="bg-gradient-to-r from-green-400 to-green-300 text-black px-4 py-2 rounded-xl text-sm font-semibold shadow-[0_0_20px_rgba(34,197,94,0.28)]"
            onClick={() => {
              window.location.href = "/?auth=register";
            }}
          >
            Sign Up
          </button>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 grid grid-cols-1 xl:grid-cols-[1.08fr_0.92fr] 2xl:grid-cols-[1.06fr_0.94fr] gap-8 md:gap-10 items-center">
        <div className="mx-auto max-w-[34rem] space-y-5 md:space-y-6 text-center xl:mx-0 xl:max-w-[35rem] xl:pl-12 2xl:pl-16 xl:text-left">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full border border-emerald-400/30 bg-slate-950/60 text-green-300 text-xs md:text-sm tracking-wide">
            AI POWERED • SMARTER INVESTING
          </div>

          <h1 className="text-[2.3rem] sm:text-[3rem] lg:text-[3.6rem] font-extrabold leading-[0.98] tracking-tight max-w-[13ch] mx-auto xl:mx-0">
            Smarter Signals.
            <br /> Better Decisions.
            <br /> <span className="text-green-400">Stronger Portfolio.</span>
          </h1>

          <p className="mx-auto max-w-[31rem] text-slate-300/90 text-[1rem] md:text-[1.12rem] leading-relaxed xl:mx-0 xl:max-w-[29rem]">
            TradeSense NG uses advanced AI to analyze market trends, identify
            high‑probability opportunities, and deliver real‑time signals you
            can trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-center sm:items-center xl:justify-start xl:pl-2">
            <button
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-300 text-black text-base md:text-lg font-bold shadow-[0_0_28px_rgba(34,197,94,0.35)]"
              onClick={() => {
                window.location.href = "/?auth=register";
              }}
            >
              Get Started Free →
            </button>
            <button
              className="px-6 py-3.5 rounded-2xl border border-slate-700 bg-slate-950/25 text-slate-100 text-base md:text-lg font-semibold"
              onClick={() => {
                window.location.href = "/?auth=login";
              }}
            >
              See How It Works
            </button>
          </div>

          {/* social proof removed from landing to reduce visual clutter */}

          <div className="mt-4">
            <button
              className="btn-secondary text-sm md:text-base"
              onClick={openQuickGuide}
            >
              Quick Guide
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="mx-auto max-w-[760px] w-full xl:ml-auto">
            <div className="rounded-3xl bg-[linear-gradient(180deg,rgba(11,24,40,0.94),rgba(7,18,30,0.98))] border border-cyan-400/25 p-4 md:p-5 shadow-[0_0_55px_rgba(34,197,94,0.14)] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="text-slate-100 font-semibold text-lg">
                  BTC • Bitcoin
                </div>
                <div className="text-emerald-300 text-sm bg-emerald-900/30 border border-emerald-500/25 px-3 py-1 rounded-full">
                  Market: Active
                </div>
              </div>

              <div className="h-[280px] sm:h-[310px] md:h-[340px] lg:h-[370px] xl:h-[390px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950/40">
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

          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 md:-bottom-14 w-[280px] md:w-[430px] h-20 md:h-30 rounded-full bg-gradient-to-t from-emerald-400/26 to-transparent opacity-75 blur-2xl"></div>
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
