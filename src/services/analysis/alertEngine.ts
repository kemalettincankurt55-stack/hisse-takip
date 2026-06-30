/**
 * Teknik Sinyal Bildirim Motoru (Alert Engine)
 *
 * Teknik analiz raporlarını tarayıp "anlık bildirim"e değer olaylar üretir:
 * RSI aşırı alım/satım, MACD kesişimi, altın/ölüm kesişimi, taban tespiti,
 * Bollinger bant kırılımı ve güçlü bileşik sinyaller.
 *
 * `detectAlerts` saf bir fonksiyondur (ağ/bildirim bağımlılığı yok, test edilebilir).
 * `dispatchAlerts` üretilen uyarıları yerel bildirim olarak gönderir ve
 * aynı uyarının gün içinde tekrar tekrar gönderilmesini önlemek için
 * oturum içi bir dedupe seti tutar.
 */

import { TechnicalReport } from './technicalReport';

export type AlertType =
  | 'rsi_oversold'
  | 'rsi_overbought'
  | 'macd_buy'
  | 'macd_sell'
  | 'golden_cross'
  | 'death_cross'
  | 'bottom'
  | 'breakout_up'
  | 'breakdown'
  | 'strong_buy'
  | 'strong_sell';

export type AlertPriority = 'high' | 'medium' | 'low';

export interface TechnicalAlert {
  symbol: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  body: string;
  /** Aynı gün/aynı tür için tekrarları engelleyen anahtar. */
  key: string;
}

const dayBucket = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().slice(0, 10);
};

/**
 * Bir teknik rapordan bildirime değer uyarıları çıkarır. Saf fonksiyon.
 */
export const detectAlerts = (report: TechnicalReport): TechnicalAlert[] => {
  const alerts: TechnicalAlert[] = [];
  const s = report.snapshot;
  const symbol = report.symbol ?? 'HISSE';
  if (!report.hasEnoughData || !s) return alerts;

  const bucket = dayBucket(report.generatedAt);
  const push = (
    type: AlertType,
    priority: AlertPriority,
    title: string,
    body: string,
  ) => {
    alerts.push({ symbol, type, priority, title, body, key: `${symbol}:${type}:${bucket}` });
  };

  // RSI uç bölgeleri
  if (s.rsi !== null && s.rsi <= 30) {
    push('rsi_oversold', 'high', `📉 ${symbol} aşırı satımda`, `RSI ${s.rsi}. Tepki yükselişi ihtimali artıyor.`);
  } else if (s.rsi !== null && s.rsi >= 70) {
    push('rsi_overbought', 'medium', `📈 ${symbol} aşırı alımda`, `RSI ${s.rsi}. Kısa vadeli düzeltme riski.`);
  }

  // MACD kesişimleri
  if (s.macdCross === 'al') {
    push('macd_buy', 'high', `🟢 ${symbol} MACD al sinyali`, 'MACD sinyal çizgisini yukarı kesti.');
  } else if (s.macdCross === 'sat') {
    push('macd_sell', 'medium', `🔴 ${symbol} MACD sat sinyali`, 'MACD sinyal çizgisini aşağı kesti.');
  }

  // Hareketli ortalama kesişimleri
  if (s.maCross === 'altın kesişim') {
    push('golden_cross', 'high', `✨ ${symbol} altın kesişim`, 'SMA20, SMA50’yi yukarı kesti — orta vadeli al sinyali.');
  } else if (s.maCross === 'ölüm kesişimi') {
    push('death_cross', 'medium', `⚠️ ${symbol} ölüm kesişimi`, 'SMA20, SMA50’yi aşağı kesti — orta vadeli zayıflık.');
  }

  // Taban tespiti
  if (s.bottom) {
    const prio: AlertPriority = s.bottom.potential === 'high' ? 'high' : 'medium';
    push(
      'bottom',
      prio,
      `🔔 ${symbol} taban yapıyor`,
      `${s.bottom.days} gündür taban (potansiyel: ${s.bottom.potential}). Mevcut fiyat ${s.bottom.currentPrice.toFixed(2)}.`,
    );
  }

  // Bollinger bant kırılımları
  if (s.bollingerState === 'üst bant kırılımı') {
    push('breakout_up', 'medium', `🚀 ${symbol} üst bant kırılımı`, `Fiyat Bollinger üst bandını aştı (${s.lastClose}).`);
  } else if (s.bollingerState === 'alt bant kırılımı') {
    push('breakdown', 'medium', `🔻 ${symbol} alt bant kırılımı`, `Fiyat Bollinger alt bandına geriledi (${s.lastClose}).`);
  }

  // Güçlü bileşik sinyaller
  if (report.signal === 'GÜÇLÜ AL') {
    push('strong_buy', 'high', `💪 ${symbol} GÜÇLÜ AL`, `Bileşik teknik skor ${report.score}/100.`);
  } else if (report.signal === 'GÜÇLÜ SAT') {
    push('strong_sell', 'high', `🛑 ${symbol} GÜÇLÜ SAT`, `Bileşik teknik skor ${report.score}/100.`);
  }

  return alerts;
};

/** Birden fazla rapor için uyarıları toplar, önceliğe göre sıralar. */
export const detectAlertsForReports = (reports: TechnicalReport[]): TechnicalAlert[] => {
  const order: Record<AlertPriority, number> = { high: 0, medium: 1, low: 2 };
  return reports
    .flatMap((r) => detectAlerts(r))
    .sort((a, b) => order[a.priority] - order[b.priority]);
};

export default { detectAlerts, detectAlertsForReports };
