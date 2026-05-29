import { useMemo, useState } from "react";
import PropTypes from "prop-types";

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
  const [amountText, setAmountText] = useState("10000");

  const amount = Number(amountText);
  const isReady =
    Boolean(prediction) && Number.isFinite(latestClose) && latestClose > 0;
  const isValidAmount = Number.isFinite(amount) && amount > 0;

  const calculations = useMemo(() => {
    if (!isReady || !isValidAmount) {
      return null;
    }

    const estimatedUnits = amount / latestClose;
    const expectedReturnPct = Number(prediction.expected_return_7d || 0);
    const expectedValue = amount * (1 + expectedReturnPct / 100);
    const gainLoss = expectedValue - amount;

    return {
      estimatedUnits,
      expectedValue,
      gainLoss,
      gainLossPct: expectedReturnPct,
      confidence: Number(prediction.confidence || 0),
    };
  }, [amount, isReady, isValidAmount, latestClose, prediction]);

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-accent)]">
            What-if Simulator
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--app-text)]">
            Simulate a Naira position from the latest signal
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-300">
            Enter an amount and estimate how the current model output could
            change the value of a short-term position.
          </p>
        </div>
        {asset && (
          <div className="inline-flex w-fit rounded-full border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text)]">
            Asset: {asset}
          </div>
        )}
      </div>

      {!isReady ? (
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] px-4 py-10 text-center">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Run a prediction on the Dashboard to unlock the simulator.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
              <label
                htmlFor="simulator-amount"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
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
                    {formatCurrency(latestClose)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--app-muted)]">
                    Expected 7-day return
                  </span>
                  <span className="font-semibold text-[var(--app-text)]">
                    {Number(prediction.expected_return_7d || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--app-muted)]">Confidence</span>
                  <span className="font-semibold text-[var(--app-text)]">
                    {Math.round(Number(prediction.confidence || 0) * 100)}%
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
