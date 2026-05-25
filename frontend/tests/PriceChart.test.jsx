import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import PriceChart from '../src/components/PriceChart.jsx'
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts'

vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(),
  CandlestickSeries: Symbol('CandlestickSeries'),
  LineSeries: Symbol('LineSeries'),
}))

describe('PriceChart', () => {
  it('renders chart and overlays', async () => {
    const candleSetData = vi.fn()
    const sma14SetData = vi.fn()
    const sma50SetData = vi.fn()

    const addSeries = vi
      .fn()
      .mockImplementationOnce(() => ({ setData: candleSetData }))
      .mockImplementationOnce(() => ({ setData: sma14SetData }))
      .mockImplementationOnce(() => ({ setData: sma50SetData }))

    createChart.mockReturnValue({
      addSeries,
      applyOptions: vi.fn(),
      remove: vi.fn(),
    })

    const data = {
      ohlcv: [
        { date: '2024-01-01', open: 1, high: 2, low: 1, close: 2 },
        { date: '2024-01-02', open: 2, high: 3, low: 2, close: 3 },
      ],
      indicators: [
        { date: '2024-01-01', sma_14: 1, sma_50: null },
        { date: '2024-01-02', sma_14: 2, sma_50: 2.5 },
      ],
    }

    const chartTheme = {
      background: '#111b2e',
      text: '#e5e7eb',
      grid: 'rgba(148,163,184,0.2)',
      upColor: '#3b82f6',
      downColor: '#ef4444',
      sma14: '#3b82f6',
      sma50: '#f97316',
    }

    render(<PriceChart data={data} darkMode={false} chartTheme={chartTheme} />)

    expect(screen.getByText(/price chart/i)).toBeInTheDocument()

    await waitFor(() => expect(createChart).toHaveBeenCalled())
    expect(createChart).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        layout: expect.objectContaining({
          background: { color: chartTheme.background },
          textColor: chartTheme.text,
        }),
      })
    )
    expect(addSeries).toHaveBeenNthCalledWith(1, CandlestickSeries, expect.any(Object))
    expect(addSeries).toHaveBeenNthCalledWith(2, LineSeries, expect.any(Object))
    expect(addSeries).toHaveBeenNthCalledWith(3, LineSeries, expect.any(Object))
    expect(candleSetData).toHaveBeenCalledWith([
      { time: '2024-01-01', open: 1, high: 2, low: 1, close: 2 },
      { time: '2024-01-02', open: 2, high: 3, low: 2, close: 3 },
    ])
    expect(sma14SetData).toHaveBeenCalledWith([
      { time: '2024-01-01', value: 1 },
      { time: '2024-01-02', value: 2 },
    ])
    expect(sma50SetData).toHaveBeenCalledWith([{ time: '2024-01-02', value: 2.5 }])
  })
})
