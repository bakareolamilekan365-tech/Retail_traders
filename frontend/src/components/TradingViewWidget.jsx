import { useEffect, useRef } from "react";

export default function TradingViewWidget({
  symbol = "BINANCE:BTCUSDT",
  interval = "60",
  theme = "dark",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Don't run in test env
    if (import.meta.env.MODE === "test") return;

    const container = containerRef.current;

    if (container) {
      container.innerHTML = "";
      delete container.dataset.initialized;
    }

    const attachWidget = () => {
      try {
        if (
          window.TradingView &&
          container &&
          !container.dataset.initialized
        ) {
          const isDark = theme === "dark";
          const toolbarBg = isDark ? "#0b1220" : "#f1f3f6";
          new window.TradingView.widget({
            container_id: container.id,
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
          container.dataset.initialized = "1";
        }
      } catch {
        // swallow errors for safety
        // console.warn('TradingView failed to init');
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
      if (container) {
        container.innerHTML = "";
        delete container.dataset.initialized;
      }
      // keep script to reuse across pages; do not remove
    };
  }, [symbol, interval, theme]);

  return <div id="tv-container" className="h-full w-full" ref={containerRef} />;
}
