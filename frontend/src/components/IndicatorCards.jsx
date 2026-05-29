import PropTypes from "prop-types";

const explanations = {
  rsi: "Measures momentum. Above 70 = overbought, below 30 = oversold.",
  volatility: "Measures how much the price moves. Higher = more risk.",
  crossover:
    "When the 14-day average crosses above the 50-day average, it may be a bullish signal. The opposite is bearish.",
};

const InfoTip = ({ label, explanation }) => (
  <span className="relative inline-flex group align-middle">
    <button
      type="button"
      aria-label={`${label} explanation`}
      title={explanation}
      className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--app-border)] text-[10px] font-semibold text-slate-700 transition hover:bg-[var(--app-soft)] hover:text-[var(--app-text)] dark:text-slate-300"
    >
      ?
    </button>
    <span className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-56 -translate-x-1/2 pt-2 group-hover:block group-focus-within:block">
      <span className="block rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-xs leading-5 text-[var(--app-text)] shadow-xl">
        {explanation}
      </span>
    </span>
  </span>
);

const IndicatorCards = ({ indicators }) => {
  const latest = indicators?.[indicators.length - 1] || {};

  const cards = [
    {
      title: "RSI (14)",
      tipKey: "rsi",
      value:
        latest.rsi_14 !== null && latest.rsi_14 !== undefined
          ? latest.rsi_14.toFixed(1)
          : "N/A",
      note: "Momentum",
    },
    {
      title: "Volatility (14)",
      tipKey: "volatility",
      value:
        latest.volatility_14 !== null && latest.volatility_14 !== undefined
          ? `${latest.volatility_14.toFixed(2)}%`
          : "N/A",
      note: "Risk",
    },
    {
      title: "SMA Crossover",
      tipKey: "crossover",
      value:
        latest.sma_crossover === 1
          ? "Bullish"
          : latest.sma_crossover === 0
            ? "Bearish"
            : "N/A",
      note: "Trend",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.title} className="card p-4">
          <p className="text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">
            {card.note}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <h3 className="text-lg font-semibold text-[var(--app-text)]">
              {card.value}
            </h3>
          </div>
          <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
            <p>{card.title}</p>
            <InfoTip
              label={card.title}
              explanation={explanations[card.tipKey]}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

IndicatorCards.propTypes = {
  indicators: PropTypes.arrayOf(
    PropTypes.shape({
      rsi_14: PropTypes.number,
      volatility_14: PropTypes.number,
      sma_crossover: PropTypes.number,
    }),
  ).isRequired,
};

export default IndicatorCards;
