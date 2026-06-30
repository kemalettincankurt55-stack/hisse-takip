/**
 * usePriceHistory / usePriceHistories
 * Gerçek fiyat geçmişini (Yahoo via proxy) yükler. Erişilemezse demo veriye düşer.
 */

import { useState, useEffect } from 'react';
import { StockData, PricePoint } from '../store/stockStore';
import { getPriceHistory } from '../services/api/priceFeed';
import { generateSamplePriceHistory } from '../services/analysis/sampleData';

interface SingleResult {
  history: PricePoint[];
  currency: 'TRY' | 'USD';
  lastPrice: number | null;
  name: string | null;
  isLoading: boolean;
  usingSample: boolean;
}

/** Tek sembol için fiyat geçmişi (detay ekranı). */
export const usePriceHistory = (
  symbol: string | null | undefined,
  exchange: string,
  currencyHint: 'TRY' | 'USD' = 'TRY',
): SingleResult => {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [currency, setCurrency] = useState<'TRY' | 'USD'>(currencyHint);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usingSample, setUsingSample] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!symbol) {
      setHistory([]);
      return;
    }
    setIsLoading(true);
    (async () => {
      const data = await getPriceHistory(symbol, exchange);
      if (cancelled) return;
      if (data.points.length >= 15) {
        setHistory(data.points);
        setCurrency(data.currency || currencyHint);
        setLastPrice(data.lastPrice);
        setName(data.name);
        setUsingSample(false);
      } else {
        setHistory(generateSamplePriceHistory(symbol, 132));
        setCurrency(currencyHint);
        setLastPrice(null);
        setName(null);
        setUsingSample(true);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol, exchange, currencyHint]);

  return { history, currency, lastPrice, name, isLoading, usingSample };
};

interface MultiResult {
  historyBySymbol: Record<string, PricePoint[]>;
  isLoading: boolean;
  usingSample: boolean;
}

/** Birden çok sembol için gerçek fiyat geçmişi (Analiz taraması). */
export const usePriceHistories = (stocks: StockData[], limit = 10): MultiResult => {
  const [historyBySymbol, setHistoryBySymbol] = useState<Record<string, PricePoint[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [usingSample, setUsingSample] = useState(false);

  // Sembol listesini sabit anahtara çevirip gereksiz yeniden çekmeyi önle
  const key = stocks.slice(0, limit).map((s) => s.symbol).join(',');

  useEffect(() => {
    let cancelled = false;
    const list = stocks.slice(0, limit);
    if (list.length === 0) return;
    setIsLoading(true);
    (async () => {
      const results = await Promise.allSettled(
        list.map((s) => getPriceHistory(s.symbol, s.exchange)),
      );
      if (cancelled) return;
      const map: Record<string, PricePoint[]> = {};
      let anyReal = false;
      let anySample = false;
      results.forEach((r, i) => {
        const sym = list[i].symbol;
        if (r.status === 'fulfilled' && r.value.points.length >= 15) {
          map[sym] = r.value.points;
          anyReal = true;
        } else {
          anySample = true;
        }
      });
      setHistoryBySymbol(map);
      setUsingSample(anySample && !anyReal ? true : anySample);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, limit]);

  return { historyBySymbol, isLoading, usingSample };
};

export default usePriceHistory;
