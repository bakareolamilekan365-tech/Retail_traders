import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { apiFetch } from '../utils/api.js'
import AssetSelector from './AssetSelector.jsx'
import PriceChart from './PriceChart.jsx'
import IndicatorCards from './IndicatorCards.jsx'
import PredictionPanel from './PredictionPanel.jsx'
import InsightBar from './InsightBar.jsx'

const Dashboard = ({ darkMode, onToggleDarkMode }) => {
  const [assets, setAssets] = useState([])
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [predictionData, setPredictionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastRefresh, setLastRefresh] = useState(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await apiFetch('/assets')
        if (!response.ok) throw new Error('Failed to load assets')
        const data = await response.json()
        setAssets(data)
        if (data.length > 0) {
          setSelectedAsset(data[0].symbol)
        }
      } catch (err) {
        setError(err.message)
      }
    }
    fetchAssets()
  }, [])

  const fetchPrediction = async (asset = selectedAsset) => {
    setLoading(true)
    setError('')
    try {
      const response = await apiFetch(`/predict?asset=${asset}&days=180`)
      if (!response.ok) {
        if (response.status === 404) throw new Error('Asset not found')
        throw new Error('Failed to load prediction')
      }
      const data = await response.json()
      setPredictionData(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err.message)
      setPredictionData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedAsset) {
      fetchPrediction(selectedAsset)
    }
  }, [selectedAsset])

  useEffect(() => {
    if (!autoRefreshEnabled) return () => {}
    const interval = setInterval(() => {
      fetchPrediction()
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoRefreshEnabled, selectedAsset])

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Asset Analysis Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Technical indicators and ML predictions for retail traders
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fetchPrediction()}
                  disabled={loading}
                  className="btn-secondary dark:bg-slate-700 dark:text-slate-100"
                >
                  {loading ? 'Refreshing...' : 'Refresh Now'}
                </button>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoRefreshEnabled}
                    onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                    className="rounded"
                  />
                  Auto-refresh
                </label>
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                >
                  {darkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="mb-6">
            <AssetSelector
              assets={assets}
              selectedAsset={selectedAsset}
              onSelect={setSelectedAsset}
            />
          </div>

          {loading && !predictionData ? (
            <div data-testid="dashboard-loading" className="space-y-6">
              <div className="h-96 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
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
              <PriceChart data={predictionData} />
              <IndicatorCards indicators={predictionData.indicators} />
              <PredictionPanel prediction={predictionData.prediction} />
              <InsightBar insight={predictionData.insight} />
              {lastRefresh && (
                <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-6 py-12 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Select an asset to view analysis.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

Dashboard.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  onToggleDarkMode: PropTypes.func.isRequired,
}

export default Dashboard
