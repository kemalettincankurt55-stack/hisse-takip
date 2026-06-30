/**
 * Veritabanı Sorgu Fonksiyonları
 * CRUD işlemleri için yardımcı fonksiyonlar
 */

import * as SQLite from 'expo-sqlite';
import { StockInfo } from '../constants/stockList';

// Hisse ekleme
export const insertStock = async (
  db: SQLite.SQLiteDatabase,
  stock: StockInfo
): Promise<number> => {
  const result = await db.runAsync(
    `INSERT OR IGNORE INTO stocks (symbol, name, exchange, sector, currency) 
     VALUES (?, ?, ?, ?, ?)`,
    [stock.symbol, stock.name, stock.exchange, stock.sector, stock.currency]
  );
  return result.lastInsertRowId;
};

// Hisse sembolü ile bulma
export const getStockBySymbol = async (
  db: SQLite.SQLiteDatabase,
  symbol: string
): Promise<any> => {
  return await db.getFirstAsync(
    'SELECT * FROM stocks WHERE symbol = ?',
    [symbol]
  );
};

// Tüm hisseleri getirme
export const getAllStocks = async (db: SQLite.SQLiteDatabase): Promise<any[]> => {
  return await db.getAllAsync('SELECT * FROM stocks WHERE is_active = 1');
};

// Takip listesine ekleme
export const addToWatchlist = async (
  db: SQLite.SQLiteDatabase,
  userId: string,
  stockId: number
): Promise<void> => {
  await db.runAsync(
    `INSERT OR IGNORE INTO watchlist (user_id, stock_id) VALUES (?, ?)`,
    [userId, stockId]
  );
};

// Takip listesinden çıkarma
export const removeFromWatchlist = async (
  db: SQLite.SQLiteDatabase,
  userId: string,
  stockId: number
): Promise<void> => {
  await db.runAsync(
    'DELETE FROM watchlist WHERE user_id = ? AND stock_id = ?',
    [userId, stockId]
  );
};

// Takip listesini getirme
export const getWatchlist = async (
  db: SQLite.SQLiteDatabase,
  userId: string
): Promise<any[]> => {
  return await db.getAllAsync(
    `SELECT w.*, s.symbol, s.name, s.exchange, s.sector 
     FROM watchlist w 
     JOIN stocks s ON w.stock_id = s.id 
     WHERE w.user_id = ?`,
    [userId]
  );
};

// Haber ekleme
export const insertNews = async (
  db: SQLite.SQLiteDatabase,
  news: {
    stockId?: number;
    title: string;
    content: string;
    source: string;
    sourceUrl?: string;
    newsType: string;
    sentiment?: string;
    aiSummary?: string;
    imageUrl?: string;
    publishedAt: string;
  }
): Promise<number> => {
  const result = await db.runAsync(
    `INSERT INTO news (stock_id, title, content, source, source_url, news_type, sentiment, ai_summary, image_url, published_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      news.stockId || null,
      news.title,
      news.content,
      news.source,
      news.sourceUrl || null,
      news.newsType,
      news.sentiment || null,
      news.aiSummary || null,
      news.imageUrl || null,
      news.publishedAt,
    ]
  );
  return result.lastInsertRowId;
};

// Haberleri getirme (son N haber)
export const getLatestNews = async (
  db: SQLite.SQLiteDatabase,
  limit: number = 20,
  newsType?: string
): Promise<any[]> => {
  let query = `SELECT n.*, s.symbol, s.name 
               FROM news n 
               LEFT JOIN stocks s ON n.stock_id = s.id`;
  const params: any[] = [];

  if (newsType) {
    query += ' WHERE n.news_type = ?';
    params.push(newsType);
  }

  query += ' ORDER BY n.published_at DESC LIMIT ?';
  params.push(limit);

  return await db.getAllAsync(query, params);
};

// Hisseye ait haberleri getirme
export const getNewsByStock = async (
  db: SQLite.SQLiteDatabase,
  stockId: number,
  limit: number = 10
): Promise<any[]> => {
  return await db.getAllAsync(
    `SELECT * FROM news 
     WHERE stock_id = ? 
     ORDER BY published_at DESC 
     LIMIT ?`,
    [stockId, limit]
  );
};

// AI raporu ekleme
export const insertAIReport = async (
  db: SQLite.SQLiteDatabase,
  report: {
    reportType: string;
    stockId?: number;
    title: string;
    content: string;
    analysisDate: string;
  }
): Promise<number> => {
  const result = await db.runAsync(
    `INSERT INTO ai_reports (report_type, stock_id, title, content, analysis_date) 
     VALUES (?, ?, ?, ?, ?)`,
    [report.reportType, report.stockId || null, report.title, report.content, report.analysisDate]
  );
  return result.lastInsertRowId;
};

// Son AI raporlarını getirme
export const getLatestReports = async (
  db: SQLite.SQLiteDatabase,
  reportType: string,
  limit: number = 5
): Promise<any[]> => {
  return await db.getAllAsync(
    `SELECT r.*, s.symbol, s.name 
     FROM ai_reports r 
     LEFT JOIN stocks s ON r.stock_id = s.id 
     WHERE r.report_type = ? 
     ORDER BY r.created_at DESC 
     LIMIT ?`,
    [reportType, limit]
  );
};

// Bildirim ekleme
export const insertNotification = async (
  db: SQLite.SQLiteDatabase,
  notification: {
    title: string;
    body: string;
    type: string;
    stockId?: number;
  }
): Promise<number> => {
  const result = await db.runAsync(
    `INSERT INTO notifications (title, body, type, stock_id) 
     VALUES (?, ?, ?, ?)`,
    [notification.title, notification.body, notification.type, notification.stockId || null]
  );
  return result.lastInsertRowId;
};

// Okunmamış bildirimleri getirme
export const getUnreadNotifications = async (
  db: SQLite.SQLiteDatabase,
  userId: string = 'default'
): Promise<any[]> => {
  return await db.getAllAsync(
    `SELECT n.*, s.symbol, s.name 
     FROM notifications n 
     LEFT JOIN stocks s ON n.stock_id = s.id 
     WHERE n.user_id = ? AND n.is_read = 0 
     ORDER BY n.created_at DESC`,
    [userId]
  );
};

// Bildirimi okundu olarak işaretleme
export const markNotificationAsRead = async (
  db: SQLite.SQLiteDatabase,
  notificationId: number
): Promise<void> => {
  await db.runAsync(
    'UPDATE notifications SET is_read = 1 WHERE id = ?',
    [notificationId]
  );
};

// Taban tespiti ekleme
export const insertBottomDetection = async (
  db: SQLite.SQLiteDatabase,
  detection: {
    stockId: number;
    detectionDate: string;
    consecutiveBottomDays: number;
    lowestPrice: number;
    currentPrice: number;
    recoveryPotential?: string;
    aiCommentary?: string;
  }
): Promise<number> => {
  const result = await db.runAsync(
    `INSERT OR REPLACE INTO bottom_detection 
     (stock_id, detection_date, consecutive_bottom_days, lowest_price, current_price, recovery_potential, ai_commentary) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      detection.stockId,
      detection.detectionDate,
      detection.consecutiveBottomDays,
      detection.lowestPrice,
      detection.currentPrice,
      detection.recoveryPotential || null,
      detection.aiCommentary || null,
    ]
  );
  return result.lastInsertRowId;
};

// Son taban tespitlerini getirme
export const getLatestBottomDetections = async (
  db: SQLite.SQLiteDatabase,
  limit: number = 10
): Promise<any[]> => {
  return await db.getAllAsync(
    `SELECT b.*, s.symbol, s.name, s.sector 
     FROM bottom_detection b 
     JOIN stocks s ON b.stock_id = s.id 
     ORDER BY b.created_at DESC 
     LIMIT ?`,
    [limit]
  );
};

// Kullanıcı tercihi kaydetme
export const setUserPreference = async (
  db: SQLite.SQLiteDatabase,
  userId: string,
  key: string,
  value: string
): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO user_preferences (user_id, preference_key, preference_value) 
     VALUES (?, ?, ?)`,
    [userId, key, value]
  );
};

// Kullanıcı tercihini okuma
export const getUserPreference = async (
  db: SQLite.SQLiteDatabase,
  userId: string,
  key: string
): Promise<string | null> => {
  const result = await db.getFirstAsync(
    'SELECT preference_value FROM user_preferences WHERE user_id = ? AND preference_key = ?',
    [userId, key]
  );
  return result ? (result as any).preference_value : null;
};
