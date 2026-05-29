import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

const DEFAULT_ASSETS = [
  { symbol: "BTC", name: "Bitcoin", type: "crypto", asset_type: "crypto" },
  { symbol: "ETH", name: "Ethereum", type: "crypto", asset_type: "crypto" },
  { symbol: "BNB", name: "Binance Coin", type: "crypto", asset_type: "crypto" },
  { symbol: "SOL", name: "Solana", type: "crypto", asset_type: "crypto" },
  { symbol: "ADA", name: "Cardano", type: "crypto", asset_type: "crypto" },
  { symbol: "DANGCEM", name: "Dangote Cement", type: "ngx", asset_type: "ngx" },
  { symbol: "MTNN", name: "MTN Nigeria", type: "ngx", asset_type: "ngx" },
  {
    symbol: "AIRTELAFRI",
    name: "Airtel Africa",
    type: "ngx",
    asset_type: "ngx",
  },
  { symbol: "BUACEMENT", name: "BUA Cement", type: "ngx", asset_type: "ngx" },
  {
    symbol: "GTCO",
    name: "Guaranty Trust Holding",
    type: "ngx",
    asset_type: "ngx",
  },
  { symbol: "ZENITHBANK", name: "Zenith Bank", type: "ngx", asset_type: "ngx" },
  { symbol: "SEPLAT", name: "Seplat Energy", type: "ngx", asset_type: "ngx" },
  { symbol: "NB", name: "Nigerian Breweries", type: "ngx", asset_type: "ngx" },
  { symbol: "FBNH", name: "FBN Holdings", type: "ngx", asset_type: "ngx" },
  {
    symbol: "ACCESSCORP",
    name: "Access Holdings",
    type: "ngx",
    asset_type: "ngx",
  },
];

const normalizeAssetType = (asset) => {
  const rawType = (asset.type || asset.asset_type || "").toLowerCase();
  if (rawType === "stock") {
    return "ngx";
  }
  if (rawType === "crypto" || rawType === "ngx") {
    return rawType;
  }
  return rawType;
};

const AssetSelector = ({
  assets: providedAssets,
  selectedAsset,
  onSelect,
  category = "All",
  risk = "All",
}) => {
  const assets = providedAssets?.length ? providedAssets : DEFAULT_ASSETS;
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedRisk, setSelectedRisk] = useState(risk);
  const containerRef = useRef(null);

  const selected = useMemo(
    () => assets.find((asset) => asset.symbol === selectedAsset),
    [assets, selectedAsset],
  );

  const filteredAssets = useMemo(() => {
    const query = (searchQuery || "").trim().toLowerCase();
    return assets.filter((asset) => {
      const symbol = (asset.symbol || "").toLowerCase();
      const name = (asset.name || "").toLowerCase();
      const matchesQuery =
        !query || symbol.includes(query) || name.includes(query);
      const matchesCategory =
        selectedCategory === "All" ||
        asset.category === selectedCategory ||
        normalizeAssetType(asset) === selectedCategory.toLowerCase();
      return matchesQuery && matchesCategory;
    });
  }, [assets, searchQuery, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (asset) => {
    onSelect(asset.symbol);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-[var(--app-text)] dark:text-white">
          Asset Overview
        </h2>
        <p className="text-sm text-slate-700 dark:text-white">
          Choose an asset to load its chart and signal.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
        <div className="relative" ref={containerRef}>
          <label className="text-xs font-semibold uppercase text-slate-700 dark:text-white">
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
              setSearchQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setSearchQuery("");
              setIsOpen(true);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--card)] px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 dark:text-white dark:placeholder:text-white"
          />
          {isOpen && (
            <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[var(--app-border)] bg-[var(--card)] shadow-lg">
              {filteredAssets.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-700 dark:text-white">
                  No matches found.
                </div>
              ) : (
                filteredAssets.map((asset) => (
                  <button
                    key={asset.symbol}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-slate-900 hover:bg-[var(--app-soft)] dark:text-white"
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
          <label
            className="text-xs font-semibold uppercase text-slate-700 dark:text-white"
            htmlFor="asset-category"
          >
            Category
          </label>
          <select
            id="asset-category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--app-text)] dark:text-white shadow-sm"
          >
            <option value="All">All</option>
            <option value="Crypto">Crypto</option>
            <option value="NGX">NGX</option>
          </select>
        </div>

        <div>
          <label
            className="text-xs font-semibold uppercase text-slate-700 dark:text-white"
            htmlFor="asset-risk"
          >
            Risk
          </label>
          <select
            id="asset-risk"
            value={selectedRisk}
            onChange={(event) => setSelectedRisk(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--app-text)] dark:text-white shadow-sm"
          >
            <option value="All">All</option>
            <option value="Conservative">Conservative</option>
            <option value="Moderate">Moderate</option>
            <option value="Aggressive">Aggressive</option>
          </select>
        </div>
      </div>

      {selected && (
        <p className="text-xs text-slate-700 dark:text-white">
          Selected: {selected.symbol} · {selected.name}
        </p>
      )}
    </div>
  );
};

AssetSelector.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      asset_type: PropTypes.string,
      category: PropTypes.string,
    }),
  ),
  selectedAsset: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  category: PropTypes.string,
  risk: PropTypes.string,
};

AssetSelector.defaultProps = {
  assets: DEFAULT_ASSETS,
  selectedAsset: "",
  category: "All",
  risk: "All",
};

export default AssetSelector;
