import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import PriceChart from '../src/components/PriceChart.jsx'
import { createChart } from 'lightweight-charts'

vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(),
}))

describe('PriceChart', () => {
  it('renders chart and overlays', async () => {
    const candleSetData = vi.fn()
    const sma14SetData = vi.fn()
    const sma50SetData = vi.fn()

    createChart.mockReturnValue({
      addCandlestickSeries: vi.fn(() => ({ setData: candleSetData })),
      addLineSeries: vi
        .fn()
        .mockImplementationOnce(() => ({ setData: sma14SetData }))
        .mockImplementationOnce(() => ({ setData: sma50SetData })),
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

    render(<PriceChart data={data} />)

    expect(screen.getByText(/price chart/i)).toBeInTheDocument()

    await waitFor(() => expect(createChart).toHaveBeenCalled())
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
