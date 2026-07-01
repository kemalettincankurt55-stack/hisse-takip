/**
 * Hesaplama Fonksiyonları
 * Teknik analiz ve istatistik hesaplamaları
 */

// Basit Hareketli Ortalama (SMA)
export const calculateSMA = (prices: number[], period: number): number[] => {
  const sma: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  
  return sma;
};

// Üstel Hareketli Ortalama (EMA)
export const calculateEMA = (prices: number[], period: number): number[] => {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // İlk EMA, SMA olarak başlar
  const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(firstSMA);
  
  // Sonraki değerler
  for (let i = period; i < prices.length; i++) {
    const prevEMA = ema[ema.length - 1];
    const currentEMA = (prices[i] - prevEMA) * multiplier + prevEMA;
    ema.push(currentEMA);
  }
  
  return ema;
};

// RSI (Relative Strength Index)
export const calculateRSI = (prices: number[], period: number = 14): number[] => {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Fiyat değişimlerini hesapla
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // İlk ortalama kazanç ve kayıp
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // İlk RSI
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));
  
  // Sonraki RSI değerleri
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  
  return rsi;
};

// MACD (Moving Average Convergence Divergence)
export const calculateMACD = (
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } => {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  // MACD çizgisi (hızlı EMA - yavaş EMA)
  const offset = slowPeriod - fastPeriod;
  const macdLine: number[] = [];
  
  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + offset] - slowEMA[i]);
  }
  
  // Sinyal çizgisi (MACD'nin EMA'sı)
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  // Histogram
  const histogram: number[] = [];
  const histOffset = signalPeriod - 1;
  
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + histOffset] - signalLine[i]);
  }
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
  };
};

// Bollinger Bantları
export const calculateBollingerBands = (
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[] } => {
  const sma = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = sma[i - period + 1];
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    upper.push(mean + stdDev * std);
    lower.push(mean - stdDev * std);
  }
  
  return {
    upper,
    middle: sma,
    lower,
  };
};

// Volatilite hesaplama
export const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0;
  
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * 100; // Yüzde olarak
};

// Taban tespit algoritması
export const detectBottom = (
  priceData: Array<{ close: number; changePercent: number; low: number }>
): {
  isBottoming: boolean;
  days: number;
  lowestPrice: number;
  currentPrice: number;
  potential: 'high' | 'medium' | 'low';
} | null => {
  if (priceData.length < 3) return null;
  
  const recent7Days = priceData.slice(-7);
  const recent5Days = priceData.slice(-5);
  const recent3Days = priceData.slice(-3);
  
  // Volatilite hesapla
  const closes = recent7Days.map(d => d.close);
  const volatility = calculateVolatility(closes);
  
  // Fiyat aralığını kontrol et
  const priceRange = Math.max(...closes) - Math.min(...closes);
  const avgPrice = closes.reduce((a, b) => a + b, 0) / closes.length;
  const rangePercent = (priceRange / avgPrice) * 100;
  
  // Net (kümülatif) değişim — pencerenin başından sonuna yüzde
  const netChangePct = ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100;

  // TABAN = düşük dalgalanma (yatay) VE belirgin trend YOK.
  // Yavaş ama istikrarlı bir DÜŞÜŞ taban değildir; bu yüzden net değişim de
  // yaklaşık sıfıra yakın (yatay) olmalı. Düşüş trendini eler.
  const isBottoming = rangePercent < 4 && Math.abs(netChangePct) < 2.5;

  // Bir alt pencerenin gerçekten yatay olup olmadığını kontrol eder
  // (günlük küçük değişim + net değişim yaklaşık sıfır, yani ne düşüş ne yükseliş)
  const isFlat = (window: typeof recent7Days): boolean => {
    if (window.length < 2) return false;
    const net = ((window[window.length - 1].close - window[0].close) / window[0].close) * 100;
    return window.every(d => Math.abs(d.changePercent) < 1.2) && Math.abs(net) < 2;
  };

  if (isBottoming) {
    let days = 0;
    if (isFlat(recent3Days)) days = 3;
    if (isFlat(recent5Days)) days = 5;
    if (isFlat(recent7Days)) days = 7;

    if (days >= 3) {
      return {
        isBottoming: true,
        days,
        lowestPrice: Math.min(...recent7Days.map(d => d.low)),
        currentPrice: closes[closes.length - 1],
        potential: days >= 7 ? 'high' : days >= 5 ? 'medium' : 'low',
      };
    }
  }

  return null;
};

// Destek ve direnç seviyeleri hesaplama
export const calculateSupportResistance = (
  priceData: Array<{ high: number; low: number; close: number }>
): { support: number; resistance: number } => {
  if (priceData.length === 0) {
    return { support: 0, resistance: 0 };
  }
  
  const highs = priceData.map(d => d.high);
  const lows = priceData.map(d => d.low);
  
  // Basit destek/direnç: son N dönem最高 ve 最低
  const recentData = priceData.slice(-20);
  const recentHighs = recentData.map(d => d.high);
  const recentLows = recentData.map(d => d.low);
  
  // Destek: En sık görülen düşük seviye
  const support = recentLows.reduce((a, b) => a + b, 0) / recentLows.length;
  
  // Direnç: En sık görülen yüksek seviye
  const resistance = recentHighs.reduce((a, b) => a + b, 0) / recentHighs.length;
  
  return {
    support: Math.round(support * 100) / 100,
    resistance: Math.round(resistance * 100) / 100,
  };
};

// Günlük getiri hesaplama
export const calculateDailyReturns = (prices: number[]): number[] => {
  const returns: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    returns.push(((prices[i] - prices[i - 1]) / prices[i - 1]) * 100);
  }
  
  return returns;
};

// Toplam getiri hesaplama
export const calculateTotalReturn = (startPrice: number, endPrice: number): number => {
  return ((endPrice - startPrice) / startPrice) * 100;
};

export default {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateVolatility,
  detectBottom,
  calculateSupportResistance,
  calculateDailyReturns,
  calculateTotalReturn,
};
