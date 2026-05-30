import React, { useEffect, useRef } from 'react';

export default function TradingViewWidget({ symbol = 'BINANCE:BTCUSDT', interval = '60' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Don't run in test env
    if (process.env.NODE_ENV === 'test') return;

    const existing = document.getElementById('tradingview-widget-script');
    const attachWidget = () => {
      try {
        // eslint-disable-next-line no-undef
        if (window.TradingView && containerRef.current && !containerRef.current.dataset.initialized) {
          const isDark = document.documentElement.classList.contains('dark');
          const toolbarBg = isDark ? '#0b1220' : '#f1f3f6';
          // eslint-disable-next-line no-undef
          new window.TradingView.widget({
            container_id: containerRef.current.id,
            symbol,
            interval,
            timezone: 'Etc/UTC',
            theme: isDark ? 'Dark' : 'Light',
            style: '1',
            locale: 'en',
            toolbar_bg: toolbarBg,
            hide_top_toolbar: true,
            hide_side_toolbar: true,
            allow_symbol_change: false,
            withdateranges: false,
            details: false,
            hotlist: false,
            calendar: false,
            studies: [],
          });
          containerRef.current.dataset.initialized = '1';
        }
      } catch (e) {
        // swallow errors for safety
        // console.warn('TradingView failed to init', e);
      }
    };

    if (window.TradingView) {
      attachWidget();
    }

    if (existing) {
      existing.addEventListener('load', attachWidget, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'tradingview-widget-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = attachWidget;
    script.onerror = () => {};
    document.head.appendChild(script);

    // watch for theme changes (documentElement.class) and re-init widget
    const obs = new MutationObserver(() => {
      try {
        if (!containerRef.current) return;
        const initialized = !!containerRef.current.dataset.initialized;
        if (initialized) {
          // remove existing widget DOM so we can reattach with new theme
          containerRef.current.innerHTML = '';
          delete containerRef.current.dataset.initialized;
          attachWidget();
        }
      } catch (e) {
        // ignore
      }
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      obs.disconnect();
      // keep script to reuse across pages; do not remove
    };
  }, [symbol, interval]);

  return (
    <div id="tv-container" className="h-full w-full" ref={containerRef} />
  );
}
