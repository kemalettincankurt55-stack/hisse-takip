/**
 * Bildirim Yardımcı Fonksiyonları
 * Push bildirimleri ve yerel bildirimler için
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Bildirim yapılandırması
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Android'de bildirim kanalı — Android 8+ için ŞART (yoksa bildirimler görünmez/hata verir)
let channelReady = false;
const ensureAndroidChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android' || channelReady) return;
  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Genel Bildirimler',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
    channelReady = true;
  } catch (error) {
    console.error('❌ Bildirim kanalı hatası:', error);
  }
};

// Bildirim izni isteme
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    await ensureAndroidChannel();
    const existing = await Notifications.getPermissionsAsync();
    const existingStatus = (existing as any).status || (existing as any).granted;

    if (existingStatus === 'granted' || existingStatus === true) {
      return true;
    }

    const result = await Notifications.requestPermissionsAsync();
    const resultStatus = (result as any).status || (result as any).granted;
    return resultStatus === 'granted' || resultStatus === true;
  } catch (error) {
    console.error('❌ Bildirim izni hatası:', error);
    return false;
  }
};

// Push token alma
export const getPushToken = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('⚠️ Bildirim izni yok');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Expo project ID buraya gelecek
    });

    return token.data;
  } catch (error) {
    console.error('❌ Push token hatası:', error);
    return null;
  }
};

// Yerel bildirim gönderme
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('⚠️ Bildirim izni yok, yerel bildirim gönderilemez');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 } as any, // Hemen gönder
    });

    console.log(`✅ Bildirim gönderildi: ${title}`);
  } catch (error) {
    console.error('❌ Bildirim gönderme hatası:', error);
  }
};

// Zamanlanmış bildirim
export const scheduleNotification = async (
  title: string,
  body: string,
  triggerDate: Date,
  data?: Record<string, any>
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    return id;
  } catch (error) {
    console.error('❌ Zamanlanmış bildirim hatası:', error);
    return null;
  }
};

// Tek hisse bildirimi
export const notifyStockAlert = async (
  symbol: string,
  stockName: string,
  message: string
): Promise<void> => {
  await sendLocalNotification(
    `📈 ${symbol} Uyarı`,
    `${stockName}: ${message}`,
    { type: 'stock_alert', symbol }
  );
};

// Taban tespit bildirimi
export const notifyBottomDetection = async (
  symbol: string,
  stockName: string,
  days: number
): Promise<void> => {
  await sendLocalNotification(
    `🔔 Taban Tespiti`,
    `${stockName} (${symbol}) ${days} gündür taban yapıyor! Yükselme potansiyeli yüksek.`,
    { type: 'bottom_detection', symbol, days }
  );
};

// Haber bildirimi
export const notifyNews = async (
  title: string,
  summary: string,
  source: string
): Promise<void> => {
  await sendLocalNotification(
    `📰 ${source} Haberi`,
    `${title}`,
    { type: 'news', source }
  );
};

// Haftalık analiz bildirimi
export const notifyWeeklyAnalysis = async (): Promise<void> => {
  await sendLocalNotification(
    `📊 Haftalık Analiz Hazır`,
    'Bu haftanın piyasa analizi ve taban tespitleri hazır. Detayları kontrol edin!',
    { type: 'weekly_analysis' }
  );
};

// Günlük özet bildirimi için sabit kimlik (tekrar planlamada eskisini iptal etmek için)
const DAILY_DIGEST_ID = 'daily-digest';

// Günlük özet bildirimini her gün belirtilen saatte planla
export const scheduleDailyDigest = async (
  hour: number = 18,
  minute: number = 0,
): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;
    await Notifications.cancelScheduledNotificationAsync(DAILY_DIGEST_ID).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_DIGEST_ID,
      content: {
        title: '📊 Günlük Piyasa Özeti',
        body: 'Bugünün en çok yükselen/düşen hisseleri ve haberleri hazır. Uygulamayı aç!',
        data: { type: 'daily_digest' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      } as any,
    });
    return true;
  } catch (error) {
    console.error('❌ Günlük özet planlama hatası:', error);
    return false;
  }
};

// Günlük özet bildirimini iptal et
export const cancelDailyDigest = async (): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(DAILY_DIGEST_ID).catch(() => {});
};

// Tüm bildirimleri temizleme
export const clearAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Badge sayısını ayarlama
export const setBadgeCount = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};

export default {
  requestNotificationPermission,
  getPushToken,
  sendLocalNotification,
  scheduleNotification,
  notifyStockAlert,
  notifyBottomDetection,
  notifyNews,
  notifyWeeklyAnalysis,
  clearAllNotifications,
  setBadgeCount,
};
