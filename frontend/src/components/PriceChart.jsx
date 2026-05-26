import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";

const PriceChart = ({ data, darkMode, chartTheme, liveDataEnabled }) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const sma14SeriesRef = useRef(null);
  const sma50SeriesRef = useRef(null);
  const replayTimerRef = useRef(null);
  const [isReplaying, setIsReplaying] = useState(false);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.ohlcv.map((row) => ({
      time: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
    }));
  }, [data]);

  const indicatorData = useMemo(() => {
    if (!data) return { sma14: [], sma50: [] };
    return {
      sma14: data.indicators.map((row) => ({
        time: row.date,
        value: row.sma_14 ?? null,
      })),
      sma50: data.indicators.map((row) => ({
        time: row.date,
        value: row.sma_50 ?? null,
      })),
    };
  }, [data]);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current, {
      layout: {
        background: { color: chartTheme.background },
        textColor: chartTheme.text,
      },
      grid: {
        vertLines: { color: chartTheme.grid },
        horzLines: { color: chartTheme.grid },
      },
      width: containerRef.current.clientWidth,
      timeScale: { borderColor: chartTheme.grid },
    });

    candleSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: chartTheme.upColor,
      downColor: chartTheme.downColor,
      borderVisible: false,
      wickUpColor: chartTheme.upColor,
      wickDownColor: chartTheme.downColor,
    });

    sma14SeriesRef.current = chartRef.current.addSeries(LineSeries, {
      color: chartTheme.sma14,
      lineWidth: 2,
    });

    sma50SeriesRef.current = chartRef.current.addSeries(LineSeries, {
      color: chartTheme.sma50,
      lineWidth: 2,
    });

    candleSeriesRef.current.setData(chartData);
    sma14SeriesRef.current.setData(
      indicatorData.sma14.filter((row) => row.value !== null),
    );
    sma50SeriesRef.current.setData(
      indicatorData.sma50.filter((row) => row.value !== null),
    );

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartRef.current?.remove();
    };
  }, [chartData, indicatorData, chartTheme]);

  useEffect(() => {
    if (liveDataEnabled && isReplaying) {
      setIsReplaying(false);
    }
  }, [liveDataEnabled, isReplaying]);

  useEffect(() => {
    if (!isReplaying || chartData.length === 0) return () => {};

    let index = 1;
    candleSeriesRef.current?.setData([]);
    sma14SeriesRef.current?.setData([]);
    sma50SeriesRef.current?.setData([]);

    replayTimerRef.current = setInterval(() => {
      if (index > chartData.length) {
        clearInterval(replayTimerRef.current);
        setIsReplaying(false);
        return;
      }
      const slice = chartData.slice(0, index);
      const cutoff = slice[slice.length - 1]?.time;
      candleSeriesRef.current?.setData(slice);
      sma14SeriesRef.current?.setData(
        indicatorData.sma14.filter(
          (row) => row.value !== null && row.time <= cutoff,
        ),
      );
      sma50SeriesRef.current?.setData(
        indicatorData.sma50.filter(
          (row) => row.value !== null && row.time <= cutoff,
        ),
      );
      index += 1;
    }, 250);

    return () => {
      clearInterval(replayTimerRef.current);
    };
  }, [chartData, indicatorData, isReplaying]);

  const canReplay = !liveDataEnabled && chartData.length > 0 && !isReplaying;

  return (
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--app-text)]">
            Price Chart
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Candles with SMA overlays
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => setIsReplaying(true)}
          disabled={!canReplay}
        >
          {isReplaying ? "Replaying..." : "Replay"}
        </button>
      </div>
      <div ref={containerRef} className="w-full h-[420px] md:h-[500px]" />
    </div>
  );
};

PriceChart.propTypes = {
  data: PropTypes.shape({
    ohlcv: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        open: PropTypes.number.isRequired,
        high: PropTypes.number.isRequired,
        low: PropTypes.number.isRequired,
        close: PropTypes.number.isRequired,
      }),
    ).isRequired,
    indicators: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        sma_14: PropTypes.number,
        sma_50: PropTypes.number,
      }),
    ).isRequired,
  }).isRequired,
  darkMode: PropTypes.bool.isRequired,
  chartTheme: PropTypes.shape({
    background: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    grid: PropTypes.string.isRequired,
    upColor: PropTypes.string.isRequired,
    downColor: PropTypes.string.isRequired,
    sma14: PropTypes.string.isRequired,
    sma50: PropTypes.string.isRequired,
  }).isRequired,
  liveDataEnabled: PropTypes.bool,
};

PriceChart.defaultProps = {
  liveDataEnabled: false,
};

export default PriceChart;
