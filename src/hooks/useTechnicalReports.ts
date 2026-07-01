/**
 * useTechnicalReports
 * Verilen hisseler için teknik analiz raporları üretir ve teknik sinyallerden
 * anlık bildirimler tetikler.
 *
 * Gerçek fiyat geçmişi (priceHistoryBySymbol) verilmişse onu kullanır;
 * yoksa örnek (demo) veri üretir ve `usingSampleData` bayrağını true yapar.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StockData, PricePoint } from '../store/stockStore';
import {
  generateTechnicalReport,
  TechnicalReport,
} from '../services/analysis/technicalReport';
import { generateSamplePriceHistory } from '../services/analysis/sampleData';
import {
  detectAlertsForReports,
  TechnicalAlert,
} from '../services/analysis/alertEngine';
import { dispatchAlerts } from '../services/analysis/alertDispatcher';

interface Options {
  /** Sembol → gerçek fiyat geçmişi. Eksik olanlar için örnek veri üretilir. */
  priceHistoryBySymbol?: Record<string, PricePoint[]>;
  /** Üretilecek azami rapor sayısı (performans için). Varsayılan 12. */
  limit?: number;
  /** true ise teknik sinyallerden otomatik bildirim gönderilir. */
  autoNotify?: boolean;
  /** false ise taban tespiti bildirimleri gönderilmez (Ayarlar'daki toggle). Varsayılan true. */
  bottomAlerts?: boolean;
}

interface Result {
  reports: TechnicalReport[];
  alerts: TechnicalAlert[];
  usingSampleData: boolean;
  notifyAlerts: () => Promise<TechnicalAlert[]>;
}

export const useTechnicalReports = (
  stocks: StockData[],
  options: Options = {},
): Result => {
  const { priceHistoryBySymbol, limit = 12, autoNotify = false, bottomAlerts = true } = options;

  const { reports, usingSampleData } = useMemo(() => {
    let sampleUsed = false;
    const list = stocks.slice(0, limit).map((stock) => {
      const real = priceHistoryBySymbol?.[stock.symbol];
      let history: PricePoint[];
      if (real && real.length >= 15) {
        history = real;
      } else {
        history = generateSamplePriceHistory(stock.symbol);
        sampleUsed = true;
      }
      return generateTechnicalReport(history, stock.symbol);
    });
    return { reports: list, usingSampleData: sampleUsed };
  }, [stocks, priceHistoryBySymbol, limit]);

  const alerts = useMemo(() => {
    const all = detectAlertsForReports(reports);
    // Ayarlar'da taban bildirimleri kapalıysa 'bottom' türü uyarıları çıkar
    return bottomAlerts ? all : all.filter((a) => a.type !== 'bottom');
  }, [reports, bottomAlerts]);

  const notifyAlerts = useCallback(async () => {
    return dispatchAlerts(alerts, { minPriority: 'high', maxNotifications: 3 });
  }, [alerts]);

  useEffect(() => {
    if (autoNotify && alerts.length > 0) {
      // Yalnızca yüksek öncelikli sinyalleri bildir (spam koruması alertEngine'de)
      void notifyAlerts();
    }
  }, [autoNotify, alerts, notifyAlerts]);

  return { reports, alerts, usingSampleData, notifyAlerts };
};

export default useTechnicalReports;
