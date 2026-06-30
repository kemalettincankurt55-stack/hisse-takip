/**
 * Haftalık Yükselen/Düşen Hisseler (Client)
 *
 * Verilen hisse evreni için haftalık yüzde değişimi proxy üzerinden (Yahoo)
 * hesaplatır ve en çok yükselen/düşen listelerini döndürür.
 */

import { StockData } from '../../store/stockStore';

const PROXY_BASE = process.env.EXPO_PUBLIC_SOCIAL_PROXY || 'http://localhost:8787';

export interface WeeklyMovers {
  gainers: StockData[];
  losers: StockData[];
}

// Sembol → bilinen isim/sektör eşlemesi (BIST tam listesinde olmayanlar için isim = sembol)
const buildLookup = (nameSource: StockData[]) =>
  new Map(nameSource.map((s) => [s.symbol, s]));

const mapItem = (it: any, lookup: Map<string, StockData>): StockData => {
  const base = lookup.get(it.symbol);
  return {
    id: base?.id ?? 0,
    symbol: it.symbol,
    name: it.name || base?.name || it.symbol,
    exchange: it.exchange || base?.exchange || 'BIST',
    sector: base?.sector || '',
    currency: it.currency || base?.currency || 'TRY',
    currentPrice: typeof it.lastPrice === 'number' ? it.lastPrice : undefined,
    changePercent: typeof it.weeklyChange === 'number' ? it.weeklyChange : undefined,
  };
};

const fetchMovers = async (
  query: string,
  lookup: Map<string, StockData>,
  timeoutMs: number,
): Promise<WeeklyMovers> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${PROXY_BASE}/movers?${query}`, { signal: controller.signal });
    if (!res.ok) return { gainers: [], losers: [] };
    const data = await res.json();
    return {
      gainers: (Array.isArray(data.gainers) ? data.gainers : []).map((x: any) => mapItem(x, lookup)),
      losers: (Array.isArray(data.losers) ? data.losers : []).map((x: any) => mapItem(x, lookup)),
    };
  } catch {
    return { gainers: [], losers: [] };
  } finally {
    clearTimeout(timer);
  }
};

/** Tüm BIST evreni üzerinde haftalık en çok yükselen/düşenler. */
export const getBistMovers = async (
  nameSource: StockData[],
  limit = 5,
  timeoutMs = 30000,
): Promise<WeeklyMovers> => fetchMovers(`market=bist&limit=${limit}`, buildLookup(nameSource), timeoutMs);

/** Verilen küçük hisse listesi üzerinde haftalık movers (özel kullanım). */
export const getWeeklyMovers = async (
  universe: StockData[],
  limit = 5,
  timeoutMs = 20000,
): Promise<WeeklyMovers> => {
  if (universe.length === 0) return { gainers: [], losers: [] };
  const symbolsParam = universe.map((s) => `${s.symbol}:${s.exchange}`).join(',');
  return fetchMovers(
    `symbols=${encodeURIComponent(symbolsParam)}&limit=${limit}`,
    buildLookup(universe),
    timeoutMs,
  );
};

export default { getWeeklyMovers, getBistMovers };
