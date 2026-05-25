import PropTypes from 'prop-types'

const AssetSelector = ({ assets, selectedAsset, onSelect }) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Asset Overview
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Choose an asset to load its chart and signal.
        </p>
      </div>
      <select
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        value={selectedAsset}
        onChange={(event) => onSelect(event.target.value)}
      >
        {assets.map((asset) => (
          <option key={asset.symbol} value={asset.symbol}>
            {asset.symbol} · {asset.name}
          </option>
        ))}
      </select>
    </div>
  )
}

AssetSelector.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      asset_type: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedAsset: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
}

export default AssetSelector
