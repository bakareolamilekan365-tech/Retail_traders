import { useEffect, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts'

const PriceChart = ({ data }) => {
  const chartRef = useRef(null)
  const containerRef = useRef(null)

  const chartData = useMemo(() => {
    if (!data) return []
    return data.ohlcv.map((row) => ({
      time: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
    }))
  }, [data])

  const indicatorData = useMemo(() => {
    if (!data) return { sma14: [], sma50: [] }
    return {
      sma14: data.indicators.map((row) => ({
        time: row.date,
        value: row.sma_14 ?? null,
      })),
      sma50: data.indicators.map((row) => ({
        time: row.date,
        value: row.sma_50 ?? null,
      })),
    }
  }, [data])

  useEffect(() => {
    if (!containerRef.current) return

    chartRef.current = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: containerRef.current.clientWidth,
      height: 420,
      timeScale: { borderColor: '#334155' },
    })

    const candleSeries = chartRef.current.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    const sma14Series = chartRef.current.addSeries(LineSeries, {
      color: '#60a5fa',
      lineWidth: 2,
    })

    const sma50Series = chartRef.current.addSeries(LineSeries, {
      color: '#f97316',
      lineWidth: 2,
    })

    candleSeries.setData(chartData)
    sma14Series.setData(indicatorData.sma14.filter((row) => row.value !== null))
    sma50Series.setData(indicatorData.sma50.filter((row) => row.value !== null))

    const handleResize = () => {
      if (containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartRef.current?.remove()
    }
  }, [chartData, indicatorData])

  return (
    <div className="card p-4 dark:bg-slate-800 dark:ring-slate-700">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Price Chart</h3>
      <div ref={containerRef} className="w-full" />
    </div>
  )
}

PriceChart.propTypes = {
  data: PropTypes.shape({
    ohlcv: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        open: PropTypes.number.isRequired,
        high: PropTypes.number.isRequired,
        low: PropTypes.number.isRequired,
        close: PropTypes.number.isRequired,
      })
    ).isRequired,
    indicators: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        sma_14: PropTypes.number,
        sma_50: PropTypes.number,
      })
    ).isRequired,
  }).isRequired,
}

export default PriceChart
