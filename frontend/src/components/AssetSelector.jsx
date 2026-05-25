import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const AssetSelector = ({ assets, selectedAsset, onSelect }) => {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('All')
  const [risk, setRisk] = useState('All')

  const selected = useMemo(
    () => assets.find((asset) => asset.symbol === selectedAsset),
    [assets, selectedAsset]
  )

  useEffect(() => {
    if (!open && selected) {
      setSearch(`${selected.symbol} · ${selected.name}`)
    }
  }, [open, selected])

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase()
    return assets.filter((asset) => {
      const matchesSearch =
        !query ||
        asset.symbol.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query)
      const matchesCategory =
        category === 'All' ||
        (category === 'Crypto' && asset.asset_type === 'crypto') ||
        (category === 'NGX' && asset.asset_type !== 'crypto')
      return matchesSearch && matchesCategory
    })
  }, [assets, search, category])

  const handleSelect = (asset) => {
    onSelect(asset.symbol)
    setSearch(`${asset.symbol} · ${asset.name}`)
    setOpen(false)
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-[var(--app-text)]">Asset Overview</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Choose an asset to load its chart and signal.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="relative">
          <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Asset
          </label>
          <input
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-label="Asset search"
            value={search}
            placeholder="Search assets..."
            onChange={(event) => {
              setSearch(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setTimeout(() => setOpen(false), 100)
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {open && (
            <div
              className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
              onMouseDown={(event) => event.preventDefault()}
            >
              {filteredAssets.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                  No matches found.
                </div>
              ) : (
                filteredAssets.map((asset) => (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => handleSelect(asset)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span>
                      {asset.symbol} · {asset.name}
                    </span>
                    <span className="text-xs uppercase text-slate-400">
                      {asset.asset_type}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Category
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="All">All</option>
            <option value="Crypto">Crypto</option>
            <option value="NGX">NGX</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Risk
          </label>
          <select
            value={risk}
            onChange={(event) => setRisk(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="All">All</option>
            <option value="Conservative">Conservative</option>
            <option value="Moderate">Moderate</option>
            <option value="Aggressive">Aggressive</option>
          </select>
        </div>
      </div>
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
