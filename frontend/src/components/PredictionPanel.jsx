import PropTypes from 'prop-types'

const PredictionPanel = ({ prediction }) => {
  const signalColor =
    prediction.signal === 'BUY'
      ? 'bg-emerald-100 text-emerald-700'
      : prediction.signal === 'SELL'
        ? 'bg-red-100 text-red-700'
        : 'bg-yellow-100 text-yellow-700'

  return (
    <div className="card p-5 dark:bg-slate-800 dark:ring-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Model Signal
          </h3>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${signalColor}`}
          >
            {prediction.signal}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">Expected 7-day return</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            {prediction.expected_return_7d.toFixed(2)}%
          </p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">Confidence</p>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-2 rounded-full bg-primary-600"
            style={{ width: `${prediction.confidence * 100}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {(prediction.confidence * 100).toFixed(0)}% confidence
        </p>
      </div>
    </div>
  )
}

PredictionPanel.propTypes = {
  prediction: PropTypes.shape({
    signal: PropTypes.string.isRequired,
    expected_return_7d: PropTypes.number.isRequired,
    confidence: PropTypes.number.isRequired,
  }).isRequired,
}

export default PredictionPanel
