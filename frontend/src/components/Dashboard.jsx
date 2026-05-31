import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { apiFetch } from "../utils/api.js";
import AssetSelector from "./AssetSelector.jsx";
import PriceChart from "./PriceChart.jsx";
import IndicatorCards from "./IndicatorCards.jsx";
import PredictionPanel from "./PredictionPanel.jsx";
import InsightBar from "./InsightBar.jsx";
import TimeRangeSelector from "./TimeRangeSelector.jsx";
import TradingViewWidget from "./TradingViewWidget.jsx";

const MAX_HISTORY_DAYS = 3650;

const CRYPTO_INTERVAL_OPTIONS = [
  { label: "1m", value: "1" },
  { label: "30m", value: "30" },
  { label: "1h", value: "60" },
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
];

const NGX_RANGE_OPTIONS = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "180d", value: 180 },
  { label: "365d", value: 365 },
  { label: "All", value: 3650 },
];

const Dashboard = ({ chartTheme, theme, onPredictionGenerated = () => {} }) => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [viewSelection, setViewSelection] = useState(180);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await apiFetch("/assets");
        if (!response.ok) throw new Error("Failed to load assets");
        const data = await response.json();
        setAssets(data);
        if (!selectedAsset && data.length > 0) {
          setSelectedAsset(data[0].symbol);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAssets();
  }, []);

  const selectedAssetMeta = assets.find(
    (asset) => asset.symbol === selectedAsset,
  );
  const isCryptoAsset = selectedAssetMeta?.type === "crypto";

  useEffect(() => {
    if (!selectedAssetMeta) return;
    setViewSelection(isCryptoAsset ? "1D" : 180);
  }, [selectedAssetMeta, isCryptoAsset]);

  const fetchPrediction = async (asset = selectedAsset) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(
        `/predict?asset=${asset}&days=${MAX_HISTORY_DAYS}`,
      );
      if (!response.ok) {
        if (response.status === 404) throw new Error("Asset not found");
        throw new Error("Failed to load prediction");
      }
      const data = await response.json();
      setPredictionData(data);
      setLastRefresh(new Date());
      onPredictionGenerated(data);
    } catch (err) {
      setError(err.message);
      setPredictionData(null);
      onPredictionGenerated(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAsset) {
      fetchPrediction(selectedAsset);
    }
  }, [selectedAsset]);

  useEffect(() => {
    if (!autoRefreshEnabled) return () => {};
    const interval = setInterval(
      () => {
        fetchPrediction();
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, selectedAsset]);

  const rangeOptions = isCryptoAsset
    ? CRYPTO_INTERVAL_OPTIONS
    : NGX_RANGE_OPTIONS;
  const chartSelectionValue = rangeOptions.some(
    (option) => option.value === viewSelection,
  )
    ? viewSelection
    : rangeOptions[0]?.value;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <AssetSelector
        assets={assets}
        selectedAsset={selectedAsset}
        onSelect={setSelectedAsset}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {isCryptoAsset ? (
          <TimeRangeSelector
            label="Interval"
            value={chartSelectionValue}
            onChange={setViewSelection}
            options={rangeOptions}
          />
        ) : (
          <div className="text-sm text-slate-700 dark:text-white">
            Use the range controls inside the chart card.
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-white">
          <button
            type="button"
            onClick={() => fetchPrediction()}
            disabled={loading}
            className="btn-secondary px-3 py-1.5"
          >
            {loading ? "Refreshing..." : "Refresh Now"}
          </button>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
        </div>
      </div>

      {loading && !predictionData ? (
        <div data-testid="dashboard-loading" className="space-y-6">
          <div className="h-96 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : predictionData ? (
        <div className="space-y-6">
          {isCryptoAsset ? (
            <div className="card p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--app-text)] dark:text-white">
                    Price Chart
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-white">
                    Crypto uses TradingView intervals for a market-style view.
                  </p>
                </div>
              </div>
              <div className="h-[220px] sm:h-[320px] md:h-[500px]">
                <TradingViewWidget
                  symbol={`BINANCE:${selectedAsset}USDT`}
                  interval={String(chartSelectionValue)}
                  theme={theme}
                />
              </div>
            </div>
          ) : (
            <PriceChart
              data={predictionData}
              chartTheme={chartTheme}
              rangeDays={Number(chartSelectionValue)}
              onRangeChange={setViewSelection}
            />
          )}
          <IndicatorCards indicators={predictionData.indicators} />
          <PredictionPanel prediction={predictionData.prediction} />
          <InsightBar insight={predictionData.insight} />
          {lastRefresh && (
            <div className="text-right text-xs font-medium text-slate-700 dark:text-white">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>
      ) : !selectedAsset ? (
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-6 py-12 text-center">
          <p className="text-slate-700 dark:text-white">
            Select an asset to load historical candles and signal analysis.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-6 py-12 text-center">
          <p className="text-slate-700 dark:text-white">
            Select an asset to view analysis.
          </p>
        </div>
      )}
    </div>
  );
};

Dashboard.propTypes = {
  chartTheme: PropTypes.shape({
    background: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    grid: PropTypes.string.isRequired,
    upColor: PropTypes.string.isRequired,
    downColor: PropTypes.string.isRequired,
    sma14: PropTypes.string.isRequired,
    sma50: PropTypes.string.isRequired,
  }).isRequired,
  theme: PropTypes.oneOf(["dark", "light"]).isRequired,
  onPredictionGenerated: PropTypes.func,
};

export default Dashboard;
