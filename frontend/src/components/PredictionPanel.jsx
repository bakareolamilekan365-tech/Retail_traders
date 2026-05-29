import PropTypes from "prop-types";

const PredictionPanel = ({ prediction }) => {
  const signalColor =
    prediction.signal === "BUY"
      ? "bg-green-600 text-white"
      : prediction.signal === "SELL"
        ? "bg-red-600 text-white"
        : "bg-gray-600 text-white";

  return (
    <div className="card p-5">
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm uppercase tracking-wide text-slate-800 dark:text-white">
              Model Signal
            </h3>
            <span
              title="The model signal maps the predicted 7-day return into BUY, HOLD, or SELL."
              aria-label="Model signal explanation"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--app-border)] text-xs text-slate-700 dark:text-white"
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
        <div className="space-y-1 md:text-right">
          <p className="text-sm text-slate-800 dark:text-white">
            Expected 7-day return
          </p>
          <p className="text-2xl font-semibold text-[var(--app-text)] dark:text-white">
            {prediction.expected_return_7d.toFixed(2)}%
          </p>
        </div>
      </div>
      <div className="mt-5 border-t border-[var(--app-border)] pt-4 pb-1">
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-800 dark:text-white">Confidence</p>
          <span
            title="Confidence estimates how strongly the predicted return clears the trading threshold."
            aria-label="Confidence explanation"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--app-border)] text-xs text-slate-700 dark:text-white"
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
        <p className="mt-2 text-sm font-medium text-slate-800 dark:text-white">
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
