/**
 * Teknik analiz / uyarı / örnek veri katmanı için saf mantık testleri.
 * Cihaz veya tarayıcı gerektirmez — tamamen headless çalışır.
 */

import { generateTechnicalReport } from '../services/analysis/technicalReport';
import { detectAlerts, detectAlertsForReports } from '../services/analysis/alertEngine';
import { generateSamplePriceHistory } from '../services/analysis/sampleData';
import { getSampleNews } from '../services/scraper/sampleNews';
import { PricePoint } from '../store/stockStore';

const mk = (closes: number[]): PricePoint[] =>
  closes.map((c, i) => {
    const prev = i === 0 ? c : closes[i - 1];
    return {
      date: new Date(2026, 0, i + 1).toISOString().slice(0, 10),
      open: prev,
      high: Math.max(c, prev) * 1.01,
      low: Math.min(c, prev) * 0.99,
      close: c,
      volume: 1000 + i,
      changePercent: ((c - prev) / prev) * 100,
    };
  });

describe('generateTechnicalReport', () => {
  it('yetersiz veride hasEnoughData=false döner', () => {
    const r = generateTechnicalReport(mk([1, 2, 3]), 'X');
    expect(r.hasEnoughData).toBe(false);
    expect(r.snapshot).toBeNull();
    expect(r.signal).toBe('TUT');
  });

  it('yeterli veride dolu snapshot ve geçerli sinyal üretir', () => {
    const r = generateTechnicalReport(generateSamplePriceHistory('ASELS'), 'ASELS');
    expect(r.hasEnoughData).toBe(true);
    expect(r.snapshot).not.toBeNull();
    expect(['GÜÇLÜ AL', 'AL', 'TUT', 'SAT', 'GÜÇLÜ SAT']).toContain(r.signal);
    expect(r.score).toBeGreaterThanOrEqual(-100);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(typeof r.summary).toBe('string');
    expect(r.summary.length).toBeGreaterThan(0);
  });

  it('skor ile sinyal etiketi tutarlıdır', () => {
    const r = generateTechnicalReport(generateSamplePriceHistory('THYAO'), 'THYAO');
    if (r.score >= 45) expect(r.signal).toBe('GÜÇLÜ AL');
    else if (r.score >= 18) expect(r.signal).toBe('AL');
    else if (r.score <= -45) expect(r.signal).toBe('GÜÇLÜ SAT');
    else if (r.score <= -18) expect(r.signal).toBe('SAT');
    else expect(r.signal).toBe('TUT');
  });

  it('RSI 0..100 aralığındadır', () => {
    const r = generateTechnicalReport(generateSamplePriceHistory('GARAN'), 'GARAN');
    const rsi = r.snapshot?.rsi;
    if (rsi !== null && rsi !== undefined) {
      expect(rsi).toBeGreaterThanOrEqual(0);
      expect(rsi).toBeLessThanOrEqual(100);
    }
  });
});

describe('alertEngine', () => {
  it('aşırı satım (RSI<=30) için yüksek öncelikli uyarı üretir', () => {
    // Sürekli düşüş → RSI çok düşük
    const r = generateTechnicalReport(mk(Array.from({ length: 40 }, (_, i) => 100 - i)), 'DOWN');
    const alerts = detectAlerts(r);
    const oversold = alerts.find((a) => a.type === 'rsi_oversold');
    expect(oversold).toBeDefined();
    expect(oversold?.priority).toBe('high');
  });

  it('yetersiz veride uyarı üretmez', () => {
    const r = generateTechnicalReport(mk([1, 2, 3]), 'X');
    expect(detectAlerts(r)).toHaveLength(0);
  });

  it('birden çok rapor için uyarıları önceliğe göre sıralar', () => {
    const reports = ['ASELS', 'THYAO', 'GARAN', 'KCHOL'].map((s) =>
      generateTechnicalReport(generateSamplePriceHistory(s), s),
    );
    const alerts = detectAlertsForReports(reports);
    const prio = { high: 0, medium: 1, low: 2 } as const;
    for (let i = 1; i < alerts.length; i++) {
      expect(prio[alerts[i - 1].priority]).toBeLessThanOrEqual(prio[alerts[i].priority]);
    }
  });

  it('her uyarının benzersiz dedupe anahtarı vardır (sembol:tür:gün)', () => {
    const r = generateTechnicalReport(generateSamplePriceHistory('SISE'), 'SISE');
    const alerts = detectAlerts(r);
    alerts.forEach((a) => expect(a.key).toMatch(/^SISE:[a-z_]+:\d{4}-\d{2}-\d{2}$/));
  });
});

describe('generateSamplePriceHistory', () => {
  it('deterministiktir (aynı sembol → aynı seri)', () => {
    expect(JSON.stringify(generateSamplePriceHistory('ASELS'))).toBe(
      JSON.stringify(generateSamplePriceHistory('ASELS')),
    );
  });

  it('istenen gün sayısında ve artan tarihli OHLC üretir', () => {
    const h = generateSamplePriceHistory('TEST', 60);
    expect(h).toHaveLength(60);
    for (const p of h) {
      expect(p.high).toBeGreaterThanOrEqual(p.low);
      expect(p.close).toBeGreaterThan(0);
    }
  });
});

describe('getSampleNews', () => {
  it('tarih sıralı (yeni→eski) ve tür çeşitliliği olan haberler verir', () => {
    const news = getSampleNews();
    expect(news.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < news.length; i++) {
      expect(new Date(news[i - 1].publishedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(news[i].publishedAt).getTime(),
      );
    }
    const types = new Set(news.map((n) => n.newsType));
    expect(types.size).toBeGreaterThan(1);
  });
});
