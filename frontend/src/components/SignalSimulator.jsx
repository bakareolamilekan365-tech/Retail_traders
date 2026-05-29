import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import { apiFetch } from "../utils/api.js";

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-NG", {
  maximumFractionDigits: 6,
});

const formatCurrency = (value) => nairaFormatter.format(Number(value || 0));

const SignalSimulator = ({ asset, prediction, latestClose }) => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(asset || "");
  const [selectedPrediction, setSelectedPrediction] = useState(prediction);
  const [selectedClose, setSelectedClose] = useState(latestClose);
  const [amountText, setAmountText] = useState("10000");
  const [loadingAssetData, setLoadingAssetData] = useState(false);
  const [error, setError] = useState("");

  const amount = Number(amountText);
  const isReady =
    Boolean(selectedPrediction) &&
    Number.isFinite(selectedClose) &&
    selectedClose > 0;
  const isValidAmount = Number.isFinite(amount) && amount > 0;

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await apiFetch("/assets");
        if (!response.ok) {
          throw new Error("Failed to load simulator assets");
        }
        const data = await response.json();
        setAssets(data);
        setSelectedAsset((currentAsset) => {
          if (currentAsset) {
            return currentAsset;
          }
          return asset || data[0]?.symbol || "";
        });
      } catch (loadError) {
        setError(loadError.message);
      }
    };

    void loadAssets();
  }, [asset]);

  useEffect(() => {
    if (!selectedAsset) {
      setSelectedPrediction(prediction);
      setSelectedClose(latestClose);
      return;
    }

    let cancelled = false;
    const loadAssetPrediction = async () => {
      setLoadingAssetData(true);
      setError("");
      try {
        const response = await apiFetch(
          `/predict?asset=${selectedAsset}&days=180`,
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Asset not found");
          }
          throw new Error("Failed to load simulator prediction");
        }
        const data = await response.json();
        if (cancelled) {
          return;
        }
        setSelectedPrediction(data.prediction);
        setSelectedClose(data.ohlcv?.at(-1)?.close ?? null);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
          setSelectedPrediction(null);
          setSelectedClose(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingAssetData(false);
        }
      }
    };

    void loadAssetPrediction();

    return () => {
      cancelled = true;
    };
  }, [selectedAsset]);

  const calculations = useMemo(() => {
    if (!isReady || !isValidAmount) {
      return null;
    }

    const estimatedUnits = amount / selectedClose;
    const expectedReturnPct = Number(selectedPrediction.expected_return_7d || 0);
    const expectedValue = amount * (1 + expectedReturnPct / 100);
    const gainLoss = expectedValue - amount;

    return {
      estimatedUnits,
      expectedValue,
      gainLoss,
      gainLossPct: expectedReturnPct,
      confidence: Number(selectedPrediction.confidence || 0),
    };
  }, [amount, isReady, isValidAmount, selectedClose, selectedPrediction]);

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-accent)]">
            What-if Simulator
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--app-text)]">
            Simulate a Naira position from the latest signal
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700 dark:text-white">
            Enter an amount and estimate how the current model output could
            change the value of a short-term position.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-56">
          <label
            htmlFor="simulator-asset"
            className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-white"
          >
            Simulator Asset
          </label>
          <select
            id="simulator-asset"
            value={selectedAsset}
            onChange={(event) => setSelectedAsset(event.target.value)}
            className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-sm text-[var(--app-text)] dark:text-white shadow-sm"
          >
            {assets.map((item) => (
              <option key={item.symbol} value={item.symbol}>
                {item.symbol} · {item.name}
              </option>
            ))}
          </select>
          {selectedAsset && (
            <div className="inline-flex w-fit rounded-full border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text)] dark:text-white">
              Asset: {selectedAsset}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {loadingAssetData && (
        <div className="mt-4 text-sm text-[var(--app-muted)] dark:text-white">
          Loading simulator data...
        </div>
      )}

      {!isReady ? (
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] px-4 py-10 text-center">
          <p className="text-sm text-slate-700 dark:text-white">
            Run a prediction on the Dashboard to unlock the simulator.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
              <label
                htmlFor="simulator-amount"
                className="text-sm font-medium text-slate-700 dark:text-white"
              >
                Amount in Naira
              </label>
              <input
                id="simulator-amount"
                type="number"
                min="0"
                step="100"
                inputMode="decimal"
                value={amountText}
                onChange={(event) => setAmountText(event.target.value)}
                placeholder="10000"
                className="mt-2 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 text-sm text-[var(--app-text)]"
              />

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--app-muted)]">Latest close</span>
                  <span className="font-semibold text-[var(--app-text)]">
                    {formatCurrency(selectedClose)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--app-muted)]">
                    Expected 7-day return
                  </span>
                  <span className="font-semibold text-[var(--app-text)]">
                    {Number(selectedPrediction.expected_return_7d || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--app-muted)]">Confidence</span>
                  <span className="font-semibold text-[var(--app-text)]">
                    {Math.round(Number(selectedPrediction.confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-soft)] p-4">
              {!calculations ? (
                <div className="flex h-full items-center justify-center text-sm text-[var(--app-muted)]">
                  Enter a positive amount to calculate the outcome.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-[var(--app-card)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--app-muted)]">
                      Estimated Units
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--app-text)]">
                      {numberFormatter.format(calculations.estimatedUnits)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[var(--app-card)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--app-muted)]">
                      Expected 7-day Value
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--app-text)]">
                      {formatCurrency(calculations.expectedValue)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[var(--app-card)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--app-muted)]">
                      Possible Gain / Loss
                    </p>
                    <p
                      className={`mt-2 text-2xl font-semibold ${
                        calculations.gainLoss >= 0
                          ? "text-emerald-400"
                          : "text-red-300"
                      }`}
                    >
                      {formatCurrency(calculations.gainLoss)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[var(--app-card)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--app-muted)]">
                      Gain / Loss %
                    </p>
                    <p
                      className={`mt-2 text-2xl font-semibold ${
                        calculations.gainLoss >= 0
                          ? "text-emerald-400"
                          : "text-red-300"
                      }`}
                    >
                      {calculations.gainLoss >= 0 ? "+" : ""}
                      {calculations.gainLossPct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs leading-6 text-[var(--app-muted)]">
            This is a simulated estimate based on the AI model's prediction. It
            is not financial advice.
          </p>
        </>
      )}
    </section>
  );
};

SignalSimulator.propTypes = {
  asset: PropTypes.string,
  prediction: PropTypes.shape({
    expected_return_7d: PropTypes.number,
    confidence: PropTypes.number,
  }),
  latestClose: PropTypes.number,
};

SignalSimulator.defaultProps = {
  asset: "",
  prediction: null,
  latestClose: null,
};

export default SignalSimulator;
