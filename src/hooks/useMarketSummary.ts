/**
 * useMarketSummary
 * Ana sayfa piyasa özeti için gerçek endeks/kur verilerini (BIST100, S&P500,
 * USD/TRY) Yahoo via proxy ile çeker. Erişilemezse boş döner (UI yer tutucu gösterir).
 */

import { useState, useEffect } from 'react';
import { getPriceHistory } from '../services/api/priceFeed';

export interface MarketMetric {
  key: string;
  label: string;
  value: string;
  changePercent: number;
  up: boolean;
  loaded: boolean;
}

const TARGETS = [
  { key: 'bist', label: 'BIST 100', symbol: 'XU100.IS', decimals: 0 },
  { key: 'sp500', label: 'S&P 500', symbol: '^GSPC', decimals: 0 },
  { key: 'usdtry', label: 'Dolar/TL', symbol: 'USDTRY=X', decimals: 2 },
];

const fmt = (n: number, d: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });

export const useMarketSummary = (): MarketMetric[] => {
  const [metrics, setMetrics] = useState<MarketMetric[]>(
    TARGETS.map((t) => ({ key: t.key, label: t.label, value: '—', changePercent: 0, up: true, loaded: false })),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        TARGETS.map((t) => getPriceHistory(t.symbol, 'RAW', '5d')),
      );
      if (cancelled) return;
      setMetrics(
        TARGETS.map((t, i) => {
          const r = results[i];
          if (r.status === 'fulfilled' && r.value.points.length > 0) {
            const pts = r.value.points;
            const last = pts[pts.length - 1];
            return {
              key: t.key,
              label: t.label,
              value: fmt(last.close, t.decimals),
              changePercent: last.changePercent,
              up: last.changePercent >= 0,
              loaded: true,
            };
          }
          return { key: t.key, label: t.label, value: '—', changePercent: 0, up: true, loaded: false };
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return metrics;
};

export default useMarketSummary;
