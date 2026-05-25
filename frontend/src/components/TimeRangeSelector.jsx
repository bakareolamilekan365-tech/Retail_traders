import PropTypes from 'prop-types'

const ranges = [7, 30, 90, 180, 365]

const TimeRangeSelector = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Range
      </span>
      <div className="flex flex-wrap gap-2">
        {ranges.map((range) => {
          const isActive = value === range
          return (
            <button
              key={range}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(range)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                isActive
                  ? 'bg-[var(--app-accent)] text-white'
                  : 'border border-[var(--app-border)] text-slate-600 dark:text-slate-300'
              }`}
            >
              {range}d
            </button>
          )
        })}
      </div>
    </div>
  )
}

TimeRangeSelector.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default TimeRangeSelector
