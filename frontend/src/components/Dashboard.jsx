import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { apiFetch } from "../utils/api.js";
import AssetSelector from "./AssetSelector.jsx";
import PriceChart from "./PriceChart.jsx";
import IndicatorCards from "./IndicatorCards.jsx";
import PredictionPanel from "./PredictionPanel.jsx";
import InsightBar from "./InsightBar.jsx";
import TimeRangeSelector from "./TimeRangeSelector.jsx";

const Dashboard = ({ chartTheme, onPredictionGenerated = () => {} }) => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [timeRange, setTimeRange] = useState(180);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await apiFetch("/assets");
        if (!response.ok) throw new Error("Failed to load assets");
        const data = await response.json();
        setAssets(data);
        if (data.length > 0) {
          setSelectedAsset(data[0].symbol);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAssets();
  }, []);

  const fetchPrediction = async (asset = selectedAsset, range = timeRange) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(`/predict?asset=${asset}&days=${range}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Asset not found");
        throw new Error("Failed to load prediction");
      }
      const data = await response.json();
      setPredictionData(data);
      setLastRefresh(new Date());
      onPredictionGenerated();
    } catch (err) {
      setError(err.message);
      setPredictionData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAsset) {
      fetchPrediction(selectedAsset, timeRange);
    }
  }, [selectedAsset, timeRange]);

  useEffect(() => {
    if (!autoRefreshEnabled) return () => {};
    const interval = setInterval(
      () => {
        fetchPrediction();
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, selectedAsset, timeRange]);

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
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--app-muted)]">
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
          <PriceChart data={predictionData} chartTheme={chartTheme} />
          <IndicatorCards indicators={predictionData.indicators} />
          <PredictionPanel prediction={predictionData.prediction} />
          <InsightBar insight={predictionData.insight} />
          {lastRefresh && (
            <div className="text-right text-xs font-medium text-[var(--app-muted)]">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-6 py-12 text-center">
          <p className="text-[var(--app-muted)]">
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
  onPredictionGenerated: PropTypes.func,
};

export default Dashboard;
