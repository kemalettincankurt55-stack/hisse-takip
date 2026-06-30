/**
 * Alert Dispatcher
 *
 * `alertEngine` tarafından üretilen (saf) teknik uyarıları yerel bildirim olarak
 * gönderen yan etkili katman. expo-notifications burada izole edilir; böylece
 * uyarı tespit mantığı (alertEngine) ağ/native bağımlılığından bağımsız ve
 * test edilebilir kalır.
 */

import { sendLocalNotification } from '../../utils/notifications';
import { TechnicalAlert, AlertPriority } from './alertEngine';

// Oturum içi gönderim geçmişi (aynı uyarıyı tekrar göndermemek için)
const sentKeys = new Set<string>();

export const resetAlertHistory = (): void => {
  sentKeys.clear();
};

export interface DispatchOptions {
  /** Yalnızca bu öncelik ve üstündeki uyarılar gönderilir. Varsayılan: hepsi. */
  minPriority?: AlertPriority;
  /** Tek seferde gönderilecek azami bildirim sayısı (spam koruması). */
  maxNotifications?: number;
}

/**
 * Uyarıları yerel bildirim olarak gönderir. Daha önce gönderilenleri atlar.
 * Gönderilen uyarıların listesini döndürür.
 */
export const dispatchAlerts = async (
  alerts: TechnicalAlert[],
  options: DispatchOptions = {},
): Promise<TechnicalAlert[]> => {
  const order: Record<AlertPriority, number> = { high: 0, medium: 1, low: 2 };
  const threshold = order[options.minPriority ?? 'low'];
  const max = options.maxNotifications ?? 10;

  const sent: TechnicalAlert[] = [];
  for (const alert of alerts) {
    if (sent.length >= max) break;
    if (order[alert.priority] > threshold) continue;
    if (sentKeys.has(alert.key)) continue;

    await sendLocalNotification(alert.title, alert.body, {
      type: 'technical_alert',
      alertType: alert.type,
      symbol: alert.symbol,
    });
    sentKeys.add(alert.key);
    sent.push(alert);
  }
  return sent;
};

export default { dispatchAlerts, resetAlertHistory };
