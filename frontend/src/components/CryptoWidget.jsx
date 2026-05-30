import React, { Suspense } from "react";

const TradingViewWidget = React.lazy(() => import("./TradingViewWidget.jsx"));

export default function CryptoWidget({ useTradingView = true }) {
  if (!useTradingView) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-full h-full rounded-md bg-gradient-to-br from-[#041018] to-[#07202a] border border-slate-800 flex flex-col items-center justify-center text-slate-400">
          <div className="text-xl font-semibold text-slate-200">Chart Placeholder</div>
          <div className="text-sm mt-2">TradingView / lightweight-charts goes here (lazy loaded)</div>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-widget widget-monument w-full h-full relative">
      <Suspense fallback={<div className="h-full w-full bg-gradient-to-b from-slate-900 to-slate-800 animate-pulse rounded-md" />}>
        <TradingViewWidget />
      </Suspense>

      {/* Interaction shield keeps the chart view-only while it remains live */}
      <div className="absolute inset-0 z-10" aria-hidden="true" />

      <div className="absolute left-2 top-2 z-10 pointer-events-none">
        <span className="px-2 py-1 rounded-full bg-black/55 text-[11px] text-green-300 border border-green-400/30">
          Live Preview
        </span>
      </div>
    </div>
  );
}
