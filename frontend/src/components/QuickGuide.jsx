import React from "react";

export default function QuickGuide({ onClose, isAdmin, onNavigate }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-guide-title"
    >
      <div className="w-full max-w-lg rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-accent)]">
              Quick Guide
            </p>
            <h2
              id="quick-guide-title"
              className="mt-1 text-xl font-semibold text-[var(--app-text)] dark:text-white"
            >
              Reading your signal dashboard
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close quick guide"
            onClick={onClose}
            className="rounded-full border border-[var(--app-border)] px-3 py-1 text-sm text-slate-700 dark:text-white"
          >
            Close
          </button>
        </div>

        {isAdmin ? (
          <div>
            <ol className="mt-5 space-y-3 text-sm text-slate-700 dark:text-white">
              <li>
                1. Use Admin to review users, predictions, and system stats.
              </li>
              <li>2. Compare activity across traders before making changes.</li>
              <li>
                3. Check the history tables to audit recent signal output.
              </li>
              <li>4. Use Settings to update your password when needed.</li>
              <li>
                5. Switch back to Dashboard to inspect live model behavior.
              </li>
            </ol>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (onNavigate) onNavigate("admin");
                  onClose();
                }}
              >
                Go to Admin Panel
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  // non-destructive admin helper action - open logs in new tab if available
                  try {
                    window.open("/admin/logs", "_blank");
                  } catch (e) {
                    // noop
                  }
                }}
              >
                View Audit Logs
              </button>
            </div>
          </div>
        ) : (
          <div>
            <ol className="mt-5 space-y-3 text-sm text-slate-700 dark:text-white">
              <li>
                1. Choose an NGX equity or major cryptocurrency from the asset
                control.
              </li>
              <li>
                2. Read the candlestick chart and SMA overlays for recent price
                direction.
              </li>
              <li>
                3. Check RSI, volatility, and crossover indicators for momentum
                and risk.
              </li>
              <li>
                4. Review the model signal, expected return, and confidence
                explanation.
              </li>
              <li>5. Open History to audit your recent generated signals.</li>
            </ol>
            <div className="mt-6">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  // suggest creating a demo prediction or go to dashboard
                  if (onNavigate) onNavigate("dashboard");
                  onClose();
                }}
              >
                Try Demo Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
