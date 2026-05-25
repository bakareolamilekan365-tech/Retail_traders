import PropTypes from 'prop-types'

const formatReturn = (value) => {
  if (value === null || value === undefined) return 'N/A'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

const formatConfidence = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return `${Math.round(value * 100)}%`
}

const PredictionHistory = ({ history, loading }) => {
  if (loading) {
    return (
      <div className="card p-4 dark:bg-slate-800 dark:ring-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-300">Loading history...</p>
      </div>
    )
  }

  if (!history.length) {
    return (
      <div className="card p-4 dark:bg-slate-800 dark:ring-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No prediction history yet.
        </p>
      </div>
    )
  }

  return (
    <div className="card p-4 dark:bg-slate-800 dark:ring-slate-700">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        Prediction History
      </h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Asset</th>
              <th className="py-2 pr-4">Signal</th>
              <th className="py-2 pr-4">Return</th>
              <th className="py-2 pr-4">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">
                  {row.timestamp || '-'}
                </td>
                <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">
                  {row.asset}
                </td>
                <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{row.signal}</td>
                <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">
                  {formatReturn(row.expected_return)}
                </td>
                <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">
                  {formatConfidence(row.confidence)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

PredictionHistory.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      asset: PropTypes.string.isRequired,
      signal: PropTypes.string.isRequired,
      expected_return: PropTypes.number,
      confidence: PropTypes.number,
      timestamp: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
}

PredictionHistory.defaultProps = {
  history: [],
  loading: false,
}

export default PredictionHistory
