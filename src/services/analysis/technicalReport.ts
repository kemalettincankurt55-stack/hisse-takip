/**
 * Teknik Analiz Rapor Motoru
 *
 * Bir hissenin fiyat geçmişini (PricePoint[]) alıp tüm teknik göstergeleri
 * (RSI, MACD, SMA/EMA kesişimleri, Bollinger Bantları, volatilite, destek/direnç,
 * taban tespiti, trend) tek bir yapılandırılmış rapora sentezler.
 *
 * Saf fonksiyonlardır: ağ/veritabanı bağımlılığı yoktur, kolayca test edilebilir.
 * Çıktı: ağırlıklı bir sinyal skoru (-100..+100), AL/TUT/SAT etiketi,
 * boğa/ayı faktörleri ve Türkçe bir özet metni.
 */

import { PricePoint } from '../../store/stockStore';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateVolatility,
  calculateSupportResistance,
  detectBottom,
} from '../../utils/calculations';

export type SignalStrength = 'GÜÇLÜ AL' | 'AL' | 'TUT' | 'SAT' | 'GÜÇLÜ SAT';
export type TrendDirection = 'yükseliş' | 'düşüş' | 'yatay';
export type RsiState = 'aşırı satım' | 'aşırı alım' | 'nötr';
export type MacdCross = 'al' | 'sat' | 'yok';
export type MaCross = 'altın kesişim' | 'ölüm kesişimi' | 'yok';
export type BollingerState = 'üst bant kırılımı' | 'alt bant kırılımı' | 'orta bölge';

export interface IndicatorSnapshot {
  lastClose: number;
  rsi: number | null;
  rsiState: RsiState;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  macdCross: MacdCross;
  sma20: number | null;
  sma50: number | null;
  ema12: number | null;
  maCross: MaCross;
  priceVsSma20Pct: number | null;
  bollingerUpper: number | null;
  bollingerLower: number | null;
  bollingerPercentB: number | null;
  bollingerState: BollingerState;
  volatility: number;
  support: number;
  resistance: number;
  trend: TrendDirection;
  periodHigh: number;
  periodLow: number;
  distanceFromHighPct: number;
  distanceFromLowPct: number;
  bottom: ReturnType<typeof detectBottom>;
}

export interface TechnicalReport {
  symbol?: string;
  generatedAt: string;
  dataPoints: number;
  hasEnoughData: boolean;
  snapshot: IndicatorSnapshot | null;
  score: number; // -100 (güçlü sat) .. +100 (güçlü al)
  signal: SignalStrength;
  bullishFactors: string[];
  bearishFactors: string[];
  summary: string;
}

const last = <T>(arr: T[]): T | undefined => (arr.length ? arr[arr.length - 1] : undefined);
const round = (n: number, d = 2): number => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};

/** Fiyat geçmişini tarihe göre artan (eski → yeni) sıraya getirir. */
const toAscending = (history: PricePoint[]): PricePoint[] => {
  if (history.length < 2) return [...history];
  const copy = [...history];
  // Tarih string'lerine göre sırala; geçersiz tarihlerde mevcut sırayı koru.
  copy.sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
    return ta - tb;
  });
  return copy;
};

/**
 * Bir hissenin tüm teknik göstergelerinden anlık görüntü çıkarır.
 * Yeterli veri yoksa (en az 15 nokta) null döner.
 */
export const buildIndicatorSnapshot = (history: PricePoint[]): IndicatorSnapshot | null => {
  const data = toAscending(history);
  if (data.length < 15) return null;

  const closes = data.map((d) => d.close);
  const lastClose = closes[closes.length - 1];

  // --- RSI ---
  const rsiSeries = calculateRSI(closes, 14);
  const rsi = last(rsiSeries) ?? null;
  let rsiState: RsiState = 'nötr';
  if (rsi !== null) {
    if (rsi <= 30) rsiState = 'aşırı satım';
    else if (rsi >= 70) rsiState = 'aşırı alım';
  }

  // --- MACD ---
  let macd: number | null = null;
  let macdSignal: number | null = null;
  let macdHistogram: number | null = null;
  let macdCross: MacdCross = 'yok';
  if (closes.length >= 35) {
    const m = calculateMACD(closes);
    macd = last(m.macd) ?? null;
    macdSignal = last(m.signal) ?? null;
    macdHistogram = last(m.histogram) ?? null;
    if (m.histogram.length >= 2) {
      const prev = m.histogram[m.histogram.length - 2];
      const curr = m.histogram[m.histogram.length - 1];
      if (prev <= 0 && curr > 0) macdCross = 'al';
      else if (prev >= 0 && curr < 0) macdCross = 'sat';
    }
  }

  // --- Hareketli Ortalamalar ---
  const sma20Series = calculateSMA(closes, 20);
  const sma50Series = closes.length >= 50 ? calculateSMA(closes, 50) : [];
  const ema12Series = calculateEMA(closes, 12);
  const sma20 = last(sma20Series) ?? null;
  const sma50 = sma50Series.length ? last(sma50Series)! : null;
  const ema12 = last(ema12Series) ?? null;

  let maCross: MaCross = 'yok';
  if (sma20Series.length >= 2 && sma50Series.length >= 2) {
    const s20Curr = sma20Series[sma20Series.length - 1];
    const s20Prev = sma20Series[sma20Series.length - 2];
    const s50Curr = sma50Series[sma50Series.length - 1];
    const s50Prev = sma50Series[sma50Series.length - 2];
    const diffPrev = s20Prev - s50Prev;
    const diffCurr = s20Curr - s50Curr;
    if (diffPrev <= 0 && diffCurr > 0) maCross = 'altın kesişim';
    else if (diffPrev >= 0 && diffCurr < 0) maCross = 'ölüm kesişimi';
  }

  const priceVsSma20Pct = sma20 ? round(((lastClose - sma20) / sma20) * 100) : null;

  // --- Bollinger ---
  const bb = calculateBollingerBands(closes, 20, 2);
  const bbUpper = last(bb.upper) ?? null;
  const bbLower = last(bb.lower) ?? null;
  let bollingerPercentB: number | null = null;
  let bollingerState: BollingerState = 'orta bölge';
  if (bbUpper !== null && bbLower !== null && bbUpper !== bbLower) {
    bollingerPercentB = round((lastClose - bbLower) / (bbUpper - bbLower), 3);
    if (lastClose >= bbUpper) bollingerState = 'üst bant kırılımı';
    else if (lastClose <= bbLower) bollingerState = 'alt bant kırılımı';
  }

  // --- Volatilite & Destek/Direnç ---
  const volatility = round(calculateVolatility(closes.slice(-20)));
  const { support, resistance } = calculateSupportResistance(
    data.map((d) => ({ high: d.high, low: d.low, close: d.close })),
  );

  // --- Dönemsel zirve/dip ---
  const highs = data.map((d) => d.high);
  const lows = data.map((d) => d.low);
  const periodHigh = Math.max(...highs);
  const periodLow = Math.min(...lows);
  const distanceFromHighPct = round(((lastClose - periodHigh) / periodHigh) * 100);
  const distanceFromLowPct = round(((lastClose - periodLow) / periodLow) * 100);

  // --- Trend ---
  let trend: TrendDirection = 'yatay';
  if (sma20Series.length >= 5) {
    const slope = sma20Series[sma20Series.length - 1] - sma20Series[sma20Series.length - 5];
    const slopePct = (slope / sma20Series[sma20Series.length - 5]) * 100;
    if (slopePct > 1) trend = 'yükseliş';
    else if (slopePct < -1) trend = 'düşüş';
  }

  // --- Taban tespiti ---
  const bottom = detectBottom(
    data.map((d) => ({ close: d.close, changePercent: d.changePercent, low: d.low })),
  );

  return {
    lastClose: round(lastClose),
    rsi: rsi !== null ? round(rsi) : null,
    rsiState,
    macd: macd !== null ? round(macd, 4) : null,
    macdSignal: macdSignal !== null ? round(macdSignal, 4) : null,
    macdHistogram: macdHistogram !== null ? round(macdHistogram, 4) : null,
    macdCross,
    sma20: sma20 !== null ? round(sma20) : null,
    sma50: sma50 !== null ? round(sma50) : null,
    ema12: ema12 !== null ? round(ema12) : null,
    maCross,
    priceVsSma20Pct,
    bollingerUpper: bbUpper !== null ? round(bbUpper) : null,
    bollingerLower: bbLower !== null ? round(bbLower) : null,
    bollingerPercentB,
    bollingerState,
    volatility,
    support,
    resistance,
    trend,
    periodHigh: round(periodHigh),
    periodLow: round(periodLow),
    distanceFromHighPct,
    distanceFromLowPct,
    bottom,
  };
};

interface Weighted {
  bullish: string[];
  bearish: string[];
  score: number;
}

/** Göstergelerden ağırlıklı sinyal skoru ve faktör listeleri üretir. */
const scoreSnapshot = (s: IndicatorSnapshot): Weighted => {
  const bullish: string[] = [];
  const bearish: string[] = [];
  let score = 0;

  // RSI (ağırlık ±25)
  if (s.rsi !== null) {
    if (s.rsi <= 30) {
      score += 25;
      bullish.push(`RSI ${s.rsi} ile aşırı satım bölgesinde — tepki yükselişi olası`);
    } else if (s.rsi >= 70) {
      score -= 25;
      bearish.push(`RSI ${s.rsi} ile aşırı alım bölgesinde — düzeltme riski`);
    } else if (s.rsi < 45) {
      score += 8;
    } else if (s.rsi > 55) {
      score -= 4;
    }
  }

  // MACD kesişim (ağırlık ±20) + konum (±8)
  if (s.macdCross === 'al') {
    score += 20;
    bullish.push('MACD sinyal çizgisini yukarı kesti (al sinyali)');
  } else if (s.macdCross === 'sat') {
    score -= 20;
    bearish.push('MACD sinyal çizgisini aşağı kesti (sat sinyali)');
  }
  if (s.macdHistogram !== null) {
    if (s.macdHistogram > 0) score += 8;
    else if (s.macdHistogram < 0) score -= 8;
  }

  // Hareketli ortalama kesişimi (ağırlık ±20)
  if (s.maCross === 'altın kesişim') {
    score += 20;
    bullish.push('SMA20, SMA50’yi yukarı kesti (altın kesişim)');
  } else if (s.maCross === 'ölüm kesişimi') {
    score -= 20;
    bearish.push('SMA20, SMA50’yi aşağı kesti (ölüm kesişimi)');
  }

  // Fiyatın SMA20’ye konumu (ağırlık ±10)
  if (s.priceVsSma20Pct !== null) {
    if (s.priceVsSma20Pct > 0) {
      score += 10;
      bullish.push(`Fiyat SMA20’nin %${s.priceVsSma20Pct} üzerinde`);
    } else {
      score -= 10;
      bearish.push(`Fiyat SMA20’nin %${Math.abs(s.priceVsSma20Pct)} altında`);
    }
  }

  // Trend (ağırlık ±15)
  if (s.trend === 'yükseliş') {
    score += 15;
    bullish.push('Kısa vadeli trend yükseliş yönünde');
  } else if (s.trend === 'düşüş') {
    score -= 15;
    bearish.push('Kısa vadeli trend düşüş yönünde');
  }

  // Bollinger (ağırlık ±12)
  if (s.bollingerState === 'alt bant kırılımı') {
    score += 12;
    bullish.push('Fiyat Bollinger alt bandında — aşırı satım/tepki bölgesi');
  } else if (s.bollingerState === 'üst bant kırılımı') {
    score -= 6;
    bearish.push('Fiyat Bollinger üst bandında — momentum yüksek ama aşırı alım riski');
  }

  // Taban tespiti (ağırlık +18)
  if (s.bottom) {
    const w = s.bottom.potential === 'high' ? 18 : s.bottom.potential === 'medium' ? 12 : 6;
    score += w;
    bullish.push(`${s.bottom.days} gündür taban yapısı (potansiyel: ${s.bottom.potential})`);
  }

  // Dönem dibine/zirvesine yakınlık (ağırlık ±8)
  if (s.distanceFromLowPct <= 3) {
    score += 8;
    bullish.push('Fiyat dönem dibine çok yakın');
  }
  if (s.distanceFromHighPct >= -3) {
    score -= 8;
    bearish.push('Fiyat dönem zirvesine çok yakın');
  }

  // -100..100 aralığına sıkıştır
  score = Math.max(-100, Math.min(100, score));
  return { bullish, bearish, score };
};

const scoreToSignal = (score: number): SignalStrength => {
  if (score >= 45) return 'GÜÇLÜ AL';
  if (score >= 18) return 'AL';
  if (score <= -45) return 'GÜÇLÜ SAT';
  if (score <= -18) return 'SAT';
  return 'TUT';
};

const buildSummary = (
  symbol: string | undefined,
  s: IndicatorSnapshot,
  signal: SignalStrength,
  score: number,
): string => {
  const name = symbol ? `${symbol} ` : 'Hisse ';
  const rsiText =
    s.rsi !== null
      ? `RSI ${s.rsi} (${s.rsiState})`
      : 'RSI hesaplanamadı';
  const parts: string[] = [];
  parts.push(
    `${name}için teknik görünüm ${s.trend} eğiliminde. Güncel fiyat ${s.lastClose}; ${rsiText}.`,
  );
  if (s.support && s.resistance) {
    parts.push(`Destek ~${s.support}, direnç ~${s.resistance} seviyelerinde.`);
  }
  parts.push(`Volatilite %${s.volatility}.`);
  if (s.bottom) {
    parts.push(
      `Son ${s.bottom.days} gündür taban yapısı gözleniyor; toparlanma potansiyeli ${s.bottom.potential}.`,
    );
  }
  parts.push(
    `Bileşik teknik skor ${score}/100 → sinyal: ${signal}. ` +
      `Bu değerlendirme yalnızca teknik göstergelere dayanır, yatırım tavsiyesi değildir.`,
  );
  return parts.join(' ');
};

/**
 * Bir hisse için tam teknik analiz raporu üretir.
 */
export const generateTechnicalReport = (
  history: PricePoint[],
  symbol?: string,
): TechnicalReport => {
  const snapshot = buildIndicatorSnapshot(history);
  const generatedAt = new Date().toISOString();

  if (!snapshot) {
    return {
      symbol,
      generatedAt,
      dataPoints: history.length,
      hasEnoughData: false,
      snapshot: null,
      score: 0,
      signal: 'TUT',
      bullishFactors: [],
      bearishFactors: [],
      summary:
        'Teknik analiz için yeterli fiyat verisi yok (en az 15 günlük veri gerekir).',
    };
  }

  const { bullish, bearish, score } = scoreSnapshot(snapshot);
  const signal = scoreToSignal(score);
  const summary = buildSummary(symbol, snapshot, signal, score);

  return {
    symbol,
    generatedAt,
    dataPoints: history.length,
    hasEnoughData: true,
    snapshot,
    score,
    signal,
    bullishFactors: bullish,
    bearishFactors: bearish,
    summary,
  };
};

export default { generateTechnicalReport, buildIndicatorSnapshot };
