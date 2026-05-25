import PropTypes from 'prop-types'

const IndicatorCards = ({ indicators }) => {
  const latest = indicators?.[indicators.length - 1] || {}

  const cards = [
    {
      title: 'RSI (14)',
      value: latest.rsi_14 !== null && latest.rsi_14 !== undefined ? latest.rsi_14.toFixed(1) : 'N/A',
      note: 'Momentum',
    },
    {
      title: 'Volatility (14)',
      value:
        latest.volatility_14 !== null && latest.volatility_14 !== undefined
          ? latest.volatility_14.toFixed(2)
          : 'N/A',
      note: 'Risk',
    },
    {
      title: 'SMA Crossover',
      value:
        latest.sma_crossover === 1
          ? 'Bullish'
          : latest.sma_crossover === 0
            ? 'Bearish'
            : 'N/A',
      note: 'Trend',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.title} className="card p-4 dark:bg-slate-800 dark:ring-slate-700">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {card.note}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{card.value}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{card.title}</p>
        </div>
      ))}
    </div>
  )
}

IndicatorCards.propTypes = {
  indicators: PropTypes.arrayOf(
    PropTypes.shape({
      rsi_14: PropTypes.number,
      volatility_14: PropTypes.number,
      sma_crossover: PropTypes.number,
    })
  ).isRequired,
}

export default IndicatorCards
