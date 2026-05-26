import PropTypes from "prop-types";

const PredictionPanel = ({ prediction }) => {
  const signalColor =
    prediction.signal === "BUY"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
      : prediction.signal === "SELL"
        ? "bg-red-50 text-red-800 ring-1 ring-red-200 dark:bg-red-500/20 dark:text-red-200 dark:ring-red-500/30"
        : "bg-amber-100 text-amber-800 dark:bg-yellow-500/20 dark:text-yellow-200";

  return (
    <div className="card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300">
              Model Signal
            </h3>
            <span
              title="The model signal maps the predicted 7-day return into BUY, HOLD, or SELL."
              aria-label="Model signal explanation"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--app-border)] text-xs text-slate-600 dark:text-slate-300"
            >
              ?
            </span>
          </div>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${signalColor}`}
          >
            {prediction.signal}
          </span>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Expected 7-day return
          </p>
          <p className="text-2xl font-semibold text-[var(--app-text)]">
            {prediction.expected_return_7d.toFixed(2)}%
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Confidence
          </p>
          <span
            title="Confidence estimates how strongly the predicted return clears the trading threshold."
            aria-label="Confidence explanation"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--app-border)] text-xs text-slate-600 dark:text-slate-300"
          >
            ?
          </span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-300 dark:bg-slate-700">
          <div
            className="h-2 rounded-full bg-[var(--app-accent)]"
            style={{ width: `${prediction.confidence * 100}%` }}
          />
        </div>
        <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          {(prediction.confidence * 100).toFixed(0)}% confidence
        </p>
      </div>
    </div>
  );
};

PredictionPanel.propTypes = {
  prediction: PropTypes.shape({
    signal: PropTypes.string.isRequired,
    expected_return_7d: PropTypes.number.isRequired,
    confidence: PropTypes.number.isRequired,
  }).isRequired,
};

export default PredictionPanel;
