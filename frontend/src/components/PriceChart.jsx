import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import TimeRangeSelector from "./TimeRangeSelector.jsx";

const REPLAY_INTERVAL_MS = 500;

const PriceChart = ({
  data,
  chartTheme,
  rangeDays,
  onRangeChange,
  rangeOptions,
  rangeLabel,
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const sma14SeriesRef = useRef(null);
  const sma50SeriesRef = useRef(null);
  const replayTimerRef = useRef(null);
  const replayIndexRef = useRef(0);

  const [replayState, setReplayState] = useState("idle");
  const sourceOhlcv = data?.full_ohlcv || data?.ohlcv || [];

  const chartData = useMemo(() => {
    if (!sourceOhlcv.length) return [];
    return sourceOhlcv.map((row) => ({
      time: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
    }));
  }, [sourceOhlcv]);

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

  const computeVisible = (allSeries, days) => {
    if (!allSeries || !allSeries.length) return [];
    if (!days || days <= 0) return allSeries;
    const last = allSeries[allSeries.length - 1];
    const lastDate = new Date(last.time);
    const startTs = new Date(lastDate.getTime() - days * 24 * 60 * 60 * 1000);
    return allSeries.filter((r) => new Date(r.time) >= startTs);
  };

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

  const applyVisibleData = () => {
    if (
      !candleSeriesRef.current ||
      !sma14SeriesRef.current ||
      !sma50SeriesRef.current
    ) {
      return;
    }

    const visibleCandles = computeVisible(chartData, rangeDays);
    const visibleSma14 = computeVisible(indicatorData.sma14, rangeDays).filter(
      (row) => row.value !== null,
    );
    const visibleSma50 = computeVisible(indicatorData.sma50, rangeDays).filter(
      (row) => row.value !== null,
    );

    candleSeriesRef.current.setData(visibleCandles);
    sma14SeriesRef.current.setData(visibleSma14);
    sma50SeriesRef.current.setData(visibleSma50);
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
      handleScale: {
        axisPressedMouseMove: true,
        pinch: true,
        mouseWheel: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      timeScale: {
        borderColor: chartTheme.grid,
        timeVisible: true,
        secondsVisible: false,
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
      applyVisibleData();
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
    applyVisibleData();
  }, [chartData, indicatorData, rangeDays]);

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

      const visibleCandles = computeVisible(chartData, rangeDays);
      const visibleSma14 = computeVisible(indicatorData.sma14, rangeDays);
      const visibleSma50 = computeVisible(indicatorData.sma50, rangeDays);
      const candle = visibleCandles[currentIndex];
      const sma14 = visibleSma14[currentIndex];
      const sma50 = visibleSma50[currentIndex];

      if (candle) candleSeriesRef.current?.update(candle);
      if (sma14?.value !== null && sma14?.value !== undefined) {
        sma14SeriesRef.current?.update(sma14);
      }
      if (sma50?.value !== null && sma50?.value !== undefined) {
        sma50SeriesRef.current?.update(sma50);
      }

      replayIndexRef.current = currentIndex + 1;
    }, REPLAY_INTERVAL_MS);

    return () => clearReplayTimer();
  }, [replayState, chartData, indicatorData, rangeDays]);

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
    <div className="card p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--app-text)] dark:text-white">
            Price Chart
          </h3>
          <p className="text-xs text-slate-700 dark:text-white">
            Historical candles with SMA overlays. Replay runs at 500ms per
            candle and is not live data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-left sm:text-right">
          {rangeOptions?.length ? (
            <TimeRangeSelector
              label={rangeLabel}
              value={rangeDays}
              onChange={onRangeChange}
              options={rangeOptions}
            />
          ) : null}
          <div className="rounded-full border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text)] dark:text-white">
            Range: {rangeDays}d
          </div>
          <button
            type="button"
            className="btn-secondary px-3 py-1.5 text-xs"
            onClick={() => onRangeChange?.(180)}
            disabled={rangeDays === 180}
          >
            Reset
          </button>
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
      <div ref={containerRef} className="w-full h-[220px] sm:h-[300px] md:h-[500px]" />
    </div>
  );
};

PriceChart.propTypes = {
  data: PropTypes.shape({
    full_ohlcv: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        open: PropTypes.number.isRequired,
        high: PropTypes.number.isRequired,
        low: PropTypes.number.isRequired,
        close: PropTypes.number.isRequired,
      }),
    ),
    ohlcv: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        open: PropTypes.number.isRequired,
        high: PropTypes.number.isRequired,
        low: PropTypes.number.isRequired,
        close: PropTypes.number.isRequired,
      }),
    ).isRequired,
    rangeDays: PropTypes.number,
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
  rangeDays: PropTypes.number.isRequired,
  onRangeChange: PropTypes.func,
  rangeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }),
  ),
  rangeLabel: PropTypes.string,
};

PriceChart.defaultProps = {
  onRangeChange: () => {},
  rangeOptions: null,
  rangeLabel: "Range",
};

export default PriceChart;
