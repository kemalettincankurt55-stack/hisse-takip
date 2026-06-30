/**
 * Örnek Fiyat Verisi Üreteci
 *
 * Gerçek fiyat geçmişi (Twelve Data API anahtarı) henüz yokken, teknik analiz
 * ve grafik özelliklerinin görünür ve test edilebilir olması için sembol bazlı
 * DETERMİNİSTİK, gerçekçi bir rastgele yürüyüş (random walk) OHLC serisi üretir.
 *
 * Deterministiktir: aynı sembol her zaman aynı seriyi verir (seed = sembol).
 * UI'da bu verinin "örnek/demo" olduğu kullanıcıya açıkça belirtilmelidir.
 */

import { PricePoint } from '../../store/stockStore';

// Sembolden sayısal seed üretir
const seedFromSymbol = (symbol: string): number => {
  let h = 2166136261;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// Basit deterministik PRNG (mulberry32)
const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const basePriceFor = (symbol: string, rand: () => number): number => {
  // ABD hisseleri genelde düşük nominal, BIST yüksek; kabaca rastgele bir taban
  const r = rand();
  return Math.round((15 + r * 285) * 100) / 100; // 15 .. 300
};

/**
 * Bir sembol için `days` günlük örnek OHLC serisi üretir (eski → yeni).
 */
export const generateSamplePriceHistory = (symbol: string, days = 90): PricePoint[] => {
  const rand = mulberry32(seedFromSymbol(symbol));
  let price = basePriceFor(symbol, rand);

  // Hafif bir trend eğilimi (sembole göre) ve volatilite
  const drift = (rand() - 0.5) * 0.004; // günlük ortalama getiri ±0.2%
  const vol = 0.012 + rand() * 0.02; // günlük volatilite %1.2 .. %3.2

  const points: PricePoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const prevClose = price;
    // Gaussian benzeri gürültü (iki rand ortalaması)
    const shock = (rand() + rand() - 1) * vol;
    const ret = drift + shock;
    const close = Math.max(0.5, prevClose * (1 + ret));

    const high = Math.max(prevClose, close) * (1 + rand() * vol * 0.5);
    const low = Math.min(prevClose, close) * (1 - rand() * vol * 0.5);
    const open = prevClose;
    const volume = Math.round(100000 + rand() * 5000000);
    const changePercent = ((close - open) / open) * 100;

    points.push({
      date: date.toISOString().slice(0, 10),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
      changePercent: Math.round(changePercent * 100) / 100,
    });

    price = close;
  }

  return points;
};

export default { generateSamplePriceHistory };
