/**
 * Fiyat Verisi (Client)
 *
 * Gerçek OHLC fiyat geçmişini proxy üzerinden (Yahoo Finance, anahtarsız) çeker.
 * Proxy gereklidir: web'de CORS doğrudan Yahoo çağrısını engeller.
 * BIST sembolleri proxy tarafında `.IS` ile, ABD sembolleri olduğu gibi sorgulanır.
 *
 * Proxy yoksa/erişilemezse boş dizi döner; çağıran taraf demo veriye düşer.
 */

import { PricePoint } from '../../store/stockStore';

const PROXY_BASE = process.env.EXPO_PUBLIC_SOCIAL_PROXY || 'http://localhost:8787';

export interface PriceHistory {
  symbol: string;
  name: string | null;
  currency: 'TRY' | 'USD' | null;
  lastPrice: number | null;
  points: PricePoint[];
}

/**
 * Bir sembol için gerçek fiyat geçmişini getirir.
 * @param exchange 'BIST' ise Yahoo'da `.IS` eklenir; aksi halde ABD sembolü.
 */
export const getPriceHistory = async (
  symbol: string,
  exchange: string,
  range = '6mo',
  timeoutMs = 12000,
): Promise<PriceHistory> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `${PROXY_BASE}/prices?symbol=${encodeURIComponent(symbol)}&exchange=${encodeURIComponent(
        exchange,
      )}&range=${encodeURIComponent(range)}`,
      { signal: controller.signal },
    );
    if (!res.ok) return { symbol, name: null, currency: null, lastPrice: null, points: [] };
    const data = await res.json();
    const points: PricePoint[] = Array.isArray(data.points) ? data.points : [];
    return {
      symbol,
      name: typeof data.name === 'string' ? data.name : null,
      currency: data.currency === 'USD' || data.currency === 'TRY' ? data.currency : null,
      lastPrice: typeof data.lastPrice === 'number' ? data.lastPrice : null,
      points,
    };
  } catch {
    return { symbol, name: null, currency: null, lastPrice: null, points: [] };
  } finally {
    clearTimeout(timer);
  }
};

export default { getPriceHistory };
