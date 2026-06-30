/**
 * SQLite Veritabanı Şeması ve Migration
 * Borsa Takip Uygulaması - Veritabanı Yapısı
 */

import * as SQLite from 'expo-sqlite';

// Veritabanı tablolarını oluşturma
export const createTables = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  // 1. Hisse Senetleri Tablosu
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      exchange TEXT NOT NULL,
      sector TEXT,
      currency TEXT DEFAULT 'TRY',
      market_cap REAL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 2. Fiyat Geçmişi Tablosu (Zaman Serisi)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      open REAL NOT NULL,
      high REAL NOT NULL,
      low REAL NOT NULL,
      close REAL NOT NULL,
      volume INTEGER,
      change_percent REAL,
      FOREIGN KEY (stock_id) REFERENCES stocks(id),
      UNIQUE(stock_id, date)
    );
  `);

  // 3. Haberler Tablosu
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_id INTEGER,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT NOT NULL,
      source_url TEXT,
      news_type TEXT NOT NULL,
      sentiment TEXT,
      ai_summary TEXT,
      image_url TEXT,
      published_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (stock_id) REFERENCES stocks(id)
    );
  `);

  // 4. Takip Listesi Tablosu
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'default',
      stock_id INTEGER NOT NULL,
      added_at TEXT DEFAULT (datetime('now')),
      notes TEXT,
      alert_enabled INTEGER DEFAULT 1,
      FOREIGN KEY (stock_id) REFERENCES stocks(id),
      UNIQUE(user_id, stock_id)
    );
  `);

  // 5. AI Analiz Raporları Tablosu
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ai_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_type TEXT NOT NULL,
      stock_id INTEGER,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      analysis_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (stock_id) REFERENCES stocks(id)
    );
  `);

  // 6. Bildirimler Tablosu
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'default',
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT NOT NULL,
      stock_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (stock_id) REFERENCES stocks(id)
    );
  `);

  // 7. Taban Tespit Tablosu
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bottom_detection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_id INTEGER NOT NULL,
      detection_date TEXT NOT NULL,
      consecutive_bottom_days INTEGER NOT NULL,
      lowest_price REAL NOT NULL,
      current_price REAL NOT NULL,
      recovery_potential TEXT,
      ai_commentary TEXT,
      is_notified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (stock_id) REFERENCES stocks(id),
      UNIQUE(stock_id, detection_date)
    );
  `);

  // 8. Ekonomik Takvim Tablosu
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS economic_calendar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      country TEXT NOT NULL,
      event_date TEXT NOT NULL,
      impact_level TEXT,
      forecast TEXT,
      previous TEXT,
      actual TEXT,
      is_notified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 9. Kullanıcı Tercihleri Tablosu
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'default',
      preference_key TEXT NOT NULL,
      preference_value TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, preference_key)
    );
  `);

  // İndeksler (Performans İçin)
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_price_history_stock_date ON price_history(stock_id, date DESC);
    CREATE INDEX IF NOT EXISTS idx_news_stock_published ON news(stock_id, published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_news_type ON news(news_type);
    CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
    CREATE INDEX IF NOT EXISTS idx_bottom_detection_date ON bottom_detection(detection_date DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
  `);

  console.log('✅ Tüm tablolar ve indeksler oluşturuldu');
};

// Veritabanını başlatma
export const initializeDatabase = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    await createTables(db);
    console.log('✅ Veritabanı başarıyla başlatıldı');
  } catch (error) {
    console.error('❌ Veritabanı başlatma hatası:', error);
    throw error;
  }
};
