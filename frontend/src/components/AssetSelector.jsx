import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'

const DEFAULT_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', asset_type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', asset_type: 'crypto' },
  { symbol: 'BNB', name: 'Binance Coin', asset_type: 'crypto' },
  { symbol: 'SOL', name: 'Solana', asset_type: 'crypto' },
  { symbol: 'ADA', name: 'Cardano', asset_type: 'crypto' },
  { symbol: 'DANGCEM', name: 'Dangote Cement', asset_type: 'ngx' },
  { symbol: 'MTNN', name: 'MTN Nigeria', asset_type: 'ngx' },
  { symbol: 'AIRTELAFRI', name: 'Airtel Africa', asset_type: 'ngx' },
  { symbol: 'BUACEMENT', name: 'BUA Cement', asset_type: 'ngx' },
  { symbol: 'GTCO', name: 'Guaranty Trust Holding', asset_type: 'ngx' },
  { symbol: 'ZENITHBANK', name: 'Zenith Bank', asset_type: 'ngx' },
  { symbol: 'SEPLAT', name: 'Seplat Energy', asset_type: 'ngx' },
  { symbol: 'NB', name: 'Nigerian Breweries', asset_type: 'ngx' },
  { symbol: 'FBNH', name: 'FBN Holdings', asset_type: 'ngx' },
  { symbol: 'ACCESSCORP', name: 'Access Holdings', asset_type: 'ngx' },
]

const AssetSelector = ({
  assets: providedAssets,
  selectedAsset,
  onSelect,
  category = 'All',
  risk = 'All',
}) => {
  const assets = providedAssets?.length ? providedAssets : DEFAULT_ASSETS
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selected = useMemo(
    () => assets.find((asset) => asset.symbol === selectedAsset),
    [assets, selectedAsset]
  )

  const filteredAssets = useMemo(() => {
    const query = (searchQuery || '').trim().toLowerCase()
    return assets.filter((asset) => {
      const symbol = (asset.symbol || '').toLowerCase()
      const name = (asset.name || '').toLowerCase()
      const matchesQuery = !query || symbol.includes(query) || name.includes(query)
      const matchesCategory = category === 'All' || asset.category === category || asset.asset_type === category.toLowerCase()
      return matchesQuery && matchesCategory
    })
  }, [assets, searchQuery, category])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (asset) => {
    onSelect(asset.symbol)
    setIsOpen(false)
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
        <div className="relative" ref={containerRef}>
          <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Asset
          </label>
          <input
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-label="Asset search"
            value={searchQuery}
            placeholder="Search assets..."
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setIsOpen(true)
            }}
            onFocus={() => {
              setSearchQuery('')
              setIsOpen(true)
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {isOpen && (
            <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {filteredAssets.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No matches found.</div>
              ) : (
                filteredAssets.map((asset) => (
                  <button
                    key={asset.symbol}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                    onClick={() => handleSelect(asset)}
                  >
                    {asset.symbol} · {asset.name}
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

      {selected && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Selected: {selected.symbol} · {selected.name}
        </p>
      )}
    </div>
  )
}

AssetSelector.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      asset_type: PropTypes.string,
      category: PropTypes.string,
    })
  ),
  selectedAsset: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  category: PropTypes.string,
  risk: PropTypes.string,
}

AssetSelector.defaultProps = {
  assets: DEFAULT_ASSETS,
  selectedAsset: '',
  category: 'All',
  risk: 'All',
}

export default AssetSelector
