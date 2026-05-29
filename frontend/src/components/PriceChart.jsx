import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";

const REPLAY_INTERVAL_MS = 500;

const PriceChart = ({ data, chartTheme }) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const sma14SeriesRef = useRef(null);
  const sma50SeriesRef = useRef(null);
  const replayTimerRef = useRef(null);
  const replayIndexRef = useRef(0);

  const [replayState, setReplayState] = useState("idle");

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

  const clearReplayTimer = () => {
    if (replayTimerRef.current) {
      window.clearInterval(replayTimerRef.current);
      replayTimerRef.current = null;
    }
  };

  const restoreStaticData = () => {
    if (
      !candleSeriesRef.current ||
      !sma14SeriesRef.current ||
      !sma50SeriesRef.current
    ) {
      return;
    }

    candleSeriesRef.current.setData(chartData);
    sma14SeriesRef.current.setData(
      indicatorData.sma14.filter((row) => row.value !== null),
    );
    sma50SeriesRef.current.setData(
      indicatorData.sma50.filter((row) => row.value !== null),
    );
    chartRef.current?.timeScale().fitContent();
  };

  const stopReplay = (restoreHistory = true) => {
    clearReplayTimer();
    replayIndexRef.current = 0;
    setReplayState("idle");

    if (restoreHistory) {
      restoreStaticData();
    }
  };

  useEffect(() => {
    if (!containerRef.current) return undefined;

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
      height: containerRef.current.clientHeight,
      timeScale: {
        borderColor: chartTheme.grid,
      },
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

    if (chartData.length) {
      candleSeriesRef.current.setData(chartData);
      sma14SeriesRef.current.setData(
        indicatorData.sma14.filter((row) => row.value !== null),
      );
      sma50SeriesRef.current.setData(
        indicatorData.sma50.filter((row) => row.value !== null),
      );
      chartRef.current.timeScale().fitContent();
    }

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
      clearReplayTimer();
      chartRef.current?.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      sma14SeriesRef.current = null;
      sma50SeriesRef.current = null;
    };
  }, [chartTheme]);

  useEffect(() => {
    if (
      !chartRef.current ||
      !candleSeriesRef.current ||
      !sma14SeriesRef.current ||
      !sma50SeriesRef.current
    ) {
      return;
    }

    stopReplay(true);
  }, [chartData, indicatorData]);

  useEffect(() => {
    if (replayState !== "playing") {
      clearReplayTimer();
      return undefined;
    }

    replayTimerRef.current = window.setInterval(() => {
      const currentIndex = replayIndexRef.current;

      if (currentIndex >= chartData.length) {
        stopReplay(true);
        return;
      }

      const candle = chartData[currentIndex];
      const sma14 = indicatorData.sma14[currentIndex];
      const sma50 = indicatorData.sma50[currentIndex];

      candleSeriesRef.current?.update(candle);
      if (sma14?.value !== null && sma14?.value !== undefined) {
        sma14SeriesRef.current?.update(sma14);
      }
      if (sma50?.value !== null && sma50?.value !== undefined) {
        sma50SeriesRef.current?.update(sma50);
      }

      replayIndexRef.current = currentIndex + 1;
    }, REPLAY_INTERVAL_MS);

    return () => clearReplayTimer();
  }, [replayState, chartData, indicatorData]);

  const startReplay = () => {
    if (
      !chartData.length ||
      !candleSeriesRef.current ||
      !sma14SeriesRef.current ||
      !sma50SeriesRef.current
    ) {
      return;
    }

    if (replayState === "paused") {
      setReplayState("playing");
      return;
    }

    stopReplay(false);
    candleSeriesRef.current.setData([]);
    sma14SeriesRef.current.setData([]);
    sma50SeriesRef.current.setData([]);
    replayIndexRef.current = 0;
    setReplayState("playing");
  };

  const pauseReplay = () => {
    if (replayState !== "playing") return;
    clearReplayTimer();
    setReplayState("paused");
  };

  const isReplayActive = replayState === "playing" || replayState === "paused";
  const replayButtonLabel =
    replayState === "playing"
      ? "Pause replay"
      : replayState === "paused"
        ? "Resume replay"
        : "Replay history";

  return (
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--app-text)]">
            Price Chart
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Historical candles with SMA overlays. Replay runs at 500ms per
            candle and is not live data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary px-3 py-1.5 text-xs"
            onClick={replayState === "playing" ? pauseReplay : startReplay}
            disabled={!chartData.length}
          >
            {replayButtonLabel}
          </button>
          <button
            type="button"
            className="btn-secondary px-3 py-1.5 text-xs"
            onClick={() => stopReplay(true)}
            disabled={!isReplayActive}
          >
            Stop
          </button>
        </div>
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
  chartTheme: PropTypes.shape({
    background: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    grid: PropTypes.string.isRequired,
    upColor: PropTypes.string.isRequired,
    downColor: PropTypes.string.isRequired,
    sma14: PropTypes.string.isRequired,
    sma50: PropTypes.string.isRequired,
  }).isRequired,
};

export default PriceChart;
