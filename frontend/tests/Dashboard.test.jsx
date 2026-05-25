import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import Dashboard from '../src/components/Dashboard.jsx'

const mockApiFetch = vi.fn()

vi.mock('../src/utils/api.js', () => ({
  apiFetch: (...args) => mockApiFetch(...args),
}))

vi.mock('../src/components/PriceChart.jsx', () => ({
  default: ({ data }) => <div data-testid="price-chart">{data.asset}</div>,
}))

describe('Dashboard', () => {
  const chartTheme = {
    background: '#111b2e',
    text: '#e5e7eb',
    grid: 'rgba(148,163,184,0.2)',
    upColor: '#3b82f6',
    downColor: '#ef4444',
    sma14: '#3b82f6',
    sma50: '#f97316',
  }
  beforeEach(() => {
    mockApiFetch.mockReset()
  })

  it('shows loading state while fetching prediction', async () => {
    let resolvePrediction
    const predictionPromise = new Promise((resolve) => {
      resolvePrediction = resolve
    })

    mockApiFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ symbol: 'BTC', name: 'Bitcoin', asset_type: 'crypto' }],
      })
      .mockReturnValueOnce(predictionPromise)

    render(<Dashboard darkMode={false} chartTheme={chartTheme} />)

    expect(await screen.findByTestId('dashboard-loading')).toBeInTheDocument()

    resolvePrediction({
      ok: true,
      json: async () => ({
        asset: 'BTC',
        ohlcv: [{ date: '2024-01-01', open: 1, high: 2, low: 1, close: 2 }],
        indicators: [{ date: '2024-01-01', sma_14: 1, sma_50: 1, sma_crossover: 1, rsi_14: 50, volatility_14: 1 }],
        prediction: { signal: 'BUY', expected_return_7d: 2.5, confidence: 0.75 },
        insight: 'Test insight',
      }),
    })

    await waitFor(() => expect(screen.getByText(/test insight/i)).toBeInTheDocument())
  })

  it('renders prediction data when available', async () => {
    mockApiFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ symbol: 'BTC', name: 'Bitcoin', asset_type: 'crypto' }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          asset: 'BTC',
          ohlcv: [{ date: '2024-01-01', open: 1, high: 2, low: 1, close: 2 }],
          indicators: [{ date: '2024-01-01', sma_14: 1, sma_50: 1, sma_crossover: 1, rsi_14: 50, volatility_14: 1 }],
          prediction: { signal: 'BUY', expected_return_7d: 2.5, confidence: 0.75 },
          insight: 'Test insight',
        }),
      })

    render(<Dashboard darkMode={false} chartTheme={chartTheme} />)

    expect(await screen.findByText(/test insight/i)).toBeInTheDocument()
    expect(screen.getByText(/buy/i)).toBeInTheDocument()
  })

  it('shows error when prediction fetch fails', async () => {
    mockApiFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ symbol: 'BTC', name: 'Bitcoin', asset_type: 'crypto' }],
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

    render(<Dashboard darkMode={false} chartTheme={chartTheme} />)

    expect(await screen.findByText(/failed to load prediction/i)).toBeInTheDocument()
  })
})
