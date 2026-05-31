import React, { useEffect, useRef } from "react";

export default function TradingViewWidget({
  symbol = "BINANCE:BTCUSDT",
  interval = "60",
  theme = "dark",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Don't run in test env
    if (process.env.NODE_ENV === "test") return;

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      delete containerRef.current.dataset.initialized;
    }

    const attachWidget = () => {
      try {
        // eslint-disable-next-line no-undef
        if (
          window.TradingView &&
          containerRef.current &&
          !containerRef.current.dataset.initialized
        ) {
          const isDark = theme === "dark";
          const toolbarBg = isDark ? "#0b1220" : "#f1f3f6";
          // eslint-disable-next-line no-undef
          new window.TradingView.widget({
            container_id: containerRef.current.id,
            symbol,
            interval,
            autosize: true,
            timezone: "Etc/UTC",
            theme: isDark ? "Dark" : "Light",
            style: "1",
            locale: "en",
            toolbar_bg: toolbarBg,
            hide_top_toolbar: true,
            hide_side_toolbar: true,
            hide_legend: true,
            hide_volume: true,
            allow_symbol_change: false,
            withdateranges: false,
            details: false,
            hotlist: false,
            calendar: false,
            studies: [],
          });
          containerRef.current.dataset.initialized = "1";
        }
      } catch (e) {
        // swallow errors for safety
        // console.warn('TradingView failed to init', e);
      }
    };

    if (window.TradingView) {
      attachWidget();
      return;
    }

    const script = document.createElement("script");
    script.id = "tradingview-widget-script";
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = attachWidget;
    script.onerror = () => {};
    document.head.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        delete containerRef.current.dataset.initialized;
      }
      // keep script to reuse across pages; do not remove
    };
  }, [symbol, interval, theme]);

  return <div id="tv-container" className="h-full w-full" ref={containerRef} />;
}
