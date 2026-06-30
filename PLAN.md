# 📊 Borsa Takip Uygulaması - Mimari Plan

## 🎯 Uygulamanın Amacı

**BIST100 ve ABD borsalarını takip eden, yapay zeka destekli analizler veren, anlık bildirimler gönderen mobil uygulama.**

### Temel Prensipler
- ❌ **Alım-Satım yapılmaz** - Sadece takip ve analiz
- 📰 **Alıntı haberler** - Forum, sosyal medya, haber sitelerinden derlenen haberler
- 🤖 **AI destekli analiz** - Yerel Ollama modeli ile haftalık analiz
- 📱 **Anlık bildirimler** - Ekonomi ve borsa haberleri için push bildirim
- 📈 **Taban tespiti** - 3-5-7 gündür taban yapan hisseleri bulma
- 🎯 **Kişiselleştirme** - Takip listesi oluşturma ve kaydetme

---

## 🏗️ Teknoloji Stack

| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| **Frontend** | React Native + Expo | Cross-platform, hızlı geliştirme |
| **State Management** | Zustand | Hafif, basit state yönetimi |
| **Veritabanı** | SQLite (expo-sqlite) | Yerel, sıfır maliyet, offline çalışır |
| **AI Motoru** | Ollama (Llama 3.1 / Mistral) | Ücretsiz, yerel, gizlilik |
| **Borsa Verisi** | Twelve Data API + BigPara Scraping | BIST + ABD verisi |
| **Haber Scraping** | Axios + Cheerio | KAP, BigPara, Ekonomim, DHA |
| **Sosyal Medya** | X API (v2) + Custom Scraping | Tweet analizi |
| **Bildirimler** | Expo Notifications | Push bildirim |
| **Grafikler** | react-native-chart-kit | Candlestick, line charts |
| **Navigasyon** | Expo Router | File-based routing |

---

## 📱 Uygulama Ekranları ve Modülleri

### 1. Ana Sayfa (Dashboard)
```
┌─────────────────────────────────┐
│  📊 Piyasa Özeti                │
│  ┌─────────┐ ┌─────────┐       │
│  │ BIST100 │ │ S&P500  │       │
│  │ +2.3%   │ │ -0.5%   │       │
│  └─────────┘ └─────────┘       │
│                                 │
│  🔔 Anlık Bildirimler          │
│  ├─ ASELSAN taban yapıyor!     │
│  ├─ Fed faiz kararı açıklandı  │
│  └─ TÜFE verisi yayınlandı     │
│                                 │
│  📈 Taban Yapan Hisseler       │
│  ├─ ASELSAN (5 gün taban)      │
│  ├─ THYAO (3 gün taban)        │
│  └─ KCHOL (7 gün taban)        │
│                                 │
│  📰 Son Haberler               │
│  └─ [Alıntı haber listesi]     │
└─────────────────────────────────┘
```

### 2. Hisse Detay Sayfası
```
┌─────────────────────────────────┐
│  ← Geri    ASELSAN (ASELS)      │
│                                 │
│  📊 Fiyat: 48.50 TL  +3.2%     │
│  📈 [Candlestick Grafik]        │
│                                 │
│  🏢 Şirket Bilgileri           │
│  ├─ Sektör: Savunma             │
│  ├─ Piyasa Değeri: 145B TL     │
│  ├─ F/K Oranı: 28.5            │
│  └─ PD/DD: 4.2                  │
│                                 │
│  📰 KAP Haberleri              │
│  ├─ Finansal Tablolar           │
│  ├─ Yönetim Kurulu Kararları   │
│  └─ Özel Durum Açıklamaları    │
│                                 │
│  📱 Sosyal Medya Haberleri     │
│  ├─ X.com Tweetleri            │
│  ├─ Ekonomi Forumları          │
│  └─ Haber Siteleri             │
│                                 │
│  🤖 AI Yorumu                   │
│  "ASELSAN son 5 gündür taban   │
│   yapıyor. Savunma sanayiinde   │
│   artan talep fiyat baskısı     │
│   yaratıyor. Teknik göstergeler │
│   aşırı satım bölgesinde..."    │
│                                 │
│  ⭐ Takip Listeme Ekle          │
└─────────────────────────────────┘
```

### 3. Takip Listesi Sayfası
```
┌─────────────────────────────────┐
│  ⭐ Takip Listem                │
│                                 │
│  🔍 Hisse ara...               │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ASELSAN    48.50 +3.2%  │   │
│  │ THYAO      285.0 +1.5%  │   │
│  │ GARAN      142.0 -0.8%  │   │
│  │ AAPL       $185.2 +0.3% │   │
│  └─────────────────────────┘   │
│                                 │
│  📊 performans Analizi          │
│  ├─ Haftalık değişim           │
│  ├─ Aylık değişim              │
│  └─ AI tavsiyeleri             │
└─────────────────────────────────┘
```

### 4. Haberler Sayfası
```
┌─────────────────────────────────┐
│  📰 Haberler                   │
│                                 │
│  [Filtreler]                    │
│  ├─ Tümü | Ekonomi | Borsa    │
│  ├─ BIST100 | ABD | Global     │
│  └─ Son 24 saat | Son hafta    │
│                                 │
│  📋 Haber Listesi              │
│  ├─ 🔴 Fed faiz indirimi sinyali│
│  │   "Kaynak: Bloomberg"        │
│  │   AI: "Piyasalara olumlu..." │
│  │                              │
│  ├─ 🟢 ASELSAN rekor sipariş   │
│  │   "Kaynak: KAP"             │
│  │   AI: "Savunma sektörü..."   │
│  │                              │
│  └─ 🟡 TÜFE verisi beklenti...│
│     "Kaynak: TÜİK"             │
│     AI: "Enflasyon baskısı..."  │
└─────────────────────────────────┘
```

### 5. Analiz Sayfası (Haftalık)
```
┌─────────────────────────────────┐
│  📊 Haftalık Analiz             │
│                                 │
│  📅 23-29 Haziran 2025         │
│                                 │
│  📈 Piyasa Özeti               │
│  ├─ BIST100: +1.8%             │
│  ├─ S&P500: +0.5%              │
│  └─ Dolar/TL: -0.3%            │
│                                 │
│  🎯 AI Analiz Raporu            │
│  "Bu hafta piyasalarda...       │
│   Taban yapan hisseler:         │
│   1. ASELSAN - Savunma sanayii  │
│   2. THYAO - Turizm sezonu     │
│   3. KCHOL - Enerji talebi..."  │
│                                 │
│  📊 Sektör Performansı         │
│  ├─ Savunma: +4.2%             │
│  ├─ Bankacılık: +1.5%          │
│  └─ Teknoloji: -0.8%           │
│                                 │
│  🔮 Gelecek Hafta Tahmini      │
│  "Piyasalar Powell'ın          │
│   açıklamalarına odaklanacak..."│
└─────────────────────────────────┘
```

### 6. Ayarlar Sayfası
```
┌─────────────────────────────────┐
│  ⚙️ Ayarlar                    │
│                                 │
│  🔔 Bildirim Ayarları          │
│  ├─ Anlık bildirimler          │
│  ├─ Günlük özet                │
│  ├─ Haftalık analiz            │
│  └─ Taban tespit uyarıları     │
│                                 │
│  📊 Borsa Tercihleri           │
│  ├─ BIST100 takibi             │
│  ├─ ABD borsası takibi         │
│  └─ Döviz kurları              │
│                                 │
│  🤖 AI Ayarları                │
│  ├─ Ollama URL: localhost:11434│
│  ├─ Model: llama3.1            │
│  └─ Analiz sıklığı             │
│                                 │
│  📱 Profil                      │
│  ├─ Kullanıcı adı              │
│  └─ Favori sectors              │
└─────────────────────────────────┘
```

---

## 🗃️ Veritabanı Şeması (SQLite)

### Tablolar

```sql
-- 1. Hisse Senetleri Tablosu
CREATE TABLE stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT UNIQUE NOT NULL,        -- 'ASELS', 'THYAO', 'AAPL'
    name TEXT NOT NULL,                 -- 'ASELSAN', 'Türk Hava Yolları'
    exchange TEXT NOT NULL,             -- 'BIST', 'NYSE', 'NASDAQ'
    sector TEXT,                        -- 'Savunma', 'Teknoloji'
    currency TEXT DEFAULT 'TRY',        -- 'TRY', 'USD'
    market_cap REAL,                    -- Piyasa değeri
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fiyat Geçmişi Tablosu (Zaman Serisi)
CREATE TABLE price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_id INTEGER NOT NULL,
    date DATE NOT NULL,
    open REAL NOT NULL,
    high REAL NOT NULL,
    low REAL NOT NULL,
    close REAL NOT NULL,
    volume INTEGER,
    change_percent REAL,
    FOREIGN KEY (stock_id) REFERENCES stocks(id),
    UNIQUE(stock_id, date)
);

-- 3. Haberler Tablosu
CREATE TABLE news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_id INTEGER,                   -- NULL ise genel haber
    title TEXT NOT NULL,
    content TEXT NOT NULL,              -- Alıntı haber içeriği
    source TEXT NOT NULL,               -- 'KAP', 'Bloomberg', 'X.com'
    source_url TEXT,                    -- Haber linki
    news_type TEXT NOT NULL,            -- 'kap', 'social', 'forum', 'economic'
    sentiment TEXT,                     -- 'positive', 'negative', 'neutral'
    ai_summary TEXT,                    -- AI özeti
    image_url TEXT,
    published_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

-- 4. Takip Listesi Tablosu
CREATE TABLE watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL DEFAULT 'default',
    stock_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,                         -- Kullanıcı notları
    alert_enabled BOOLEAN DEFAULT 1,    -- Bildirim açma/kapama
    FOREIGN KEY (stock_id) REFERENCES stocks(id),
    UNIQUE(user_id, stock_id)
);

-- 5. AI Analiz Raporları Tablosu
CREATE TABLE ai_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_type TEXT NOT NULL,          -- 'daily', 'weekly', 'stock_analysis'
    stock_id INTEGER,                   -- NULL ise genel rapor
    title TEXT NOT NULL,
    content TEXT NOT NULL,              -- AI-generated analiz
    analysis_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

-- 6. Bildirimler Tablosu
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL DEFAULT 'default',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL,                 -- 'price_alert', 'news', 'analysis'
    stock_id INTEGER,
    is_read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

-- 7. Taban Tespit Tablosu
CREATE TABLE bottom_detection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_id INTEGER NOT NULL,
    detection_date DATE NOT NULL,
    consecutive_bottom_days INTEGER NOT NULL,  -- 3, 5, 7
    lowest_price REAL NOT NULL,
    current_price REAL NOT NULL,
    recovery_potential TEXT,             -- 'high', 'medium', 'low'
    ai_commentary TEXT,
    is_notified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id),
    UNIQUE(stock_id, detection_date)
);

-- 8. Ekonomik Takvim Tablosu
CREATE TABLE economic_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,           -- 'TCMB Faiz Kararı', 'ABD Tarımdışı İstihdam'
    country TEXT NOT NULL,              -- 'TR', 'US', 'EU'
    event_date TIMESTAMP NOT NULL,
    impact_level TEXT,                  -- 'high', 'medium', 'low'
    forecast TEXT,
    previous TEXT,
    actual TEXT,
    is_notified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Kullanıcı Tercihleri Tablosu
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL DEFAULT 'default',
    preference_key TEXT NOT NULL,
    preference_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);
```

### İndeksler (Performans İçin)

```sql
-- Hızlı sorgulama için indeksler
CREATE INDEX idx_price_history_stock_date ON price_history(stock_id, date DESC);
CREATE INDEX idx_news_stock_published ON news(stock_id, published_at DESC);
CREATE INDEX idx_news_type ON news(news_type);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_bottom_detection_date ON bottom_detection(detection_date DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

---

## 🔄 Uygulama Akış Diyagramları

### 1. Veri Toplama Akışı
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Twelve     │     │   BigPara    │     │  Haber Siteleri│
│   Data API   │     │   Scraping   │     │  Scraping     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Veri İşleme  │
                    │   Motoru      │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
      ┌───────▼───────┐ ┌──▼──────┐ ┌───▼───────┐
      │ SQLite DB     │ │ AI      │ │ Bildirim  │
      │ Kaydet        │ │ Analiz  │ │ Gönder    │
      └───────────────┘ └─────────┘ └───────────┘
```

### 2. Taban Tespit Akışı
```
┌─────────────────────────────────────────────────┐
│  Her gün saat 18:00'de (piyasa kapanışı sonrası)│
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  BIST100 ve ABD hisselerinin son 7 günlük       │
│  fiyat verilerini çek                           │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Her hisse için:                                │
│  - Son 3, 5, 7 günün kapanış fiyatlarını kontrol│
│  - Fiyatın belirli bir aralıkta olup olmadığını │
│    test et (%2-3 arası dalgalanma)              │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Taban yapan hisseleri tespit et:               │
│  - 3 gündür taban yapan → Dikkat               │
│  - 5 gündür taban yapan → Yüksek potansiyel     │
│  - 7 gündür taban yapan → Çok yüksek potansiyel │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  AI ile analiz et:                              │
│  - Neden taban yapıyor?                         │
│  - Yükselme potansiyeli nedir?                  │
│  - Hangi haberler etkiliyor?                    │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Bildirim gönder:                               │
│  "🔔 ASELSAN 5 gündür taban yapıyor!            │
│   Yükselme potansiyeli yüksek.                  │
│   Takip listene ekle?"                          │
└─────────────────────────────────────────────────┘
```

### 3. AI Analiz Akışı
```
┌──────────────────┐
│ Veri Toplama     │
│ - Fiyat verileri │
│ - Haberler       │
│ - Sosyal medya   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Prompt Oluşturma │
│ - Haftalık özet  │
│ - Hisse analizi  │
│ - Piyasa yorumu  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Ollama API       │
│ localhost:11434  │
│ Model: llama3.1  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Yanıt İşleme     │
│ - Formatlama     │
│ - Kaydetme       │
│ - Bildirim       │
└──────────────────┘
```

---

## 📡 API Entegrasyon Detayları

### 1. Borsa Veri API'leri

#### Twelve Data (BIST + ABD)
```javascript
// BIST100 verisi
const getBISTData = async (symbol) => {
  const response = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&apikey=YOUR_KEY`
  );
  return response.json();
};

// ABD hissesi
const getUSSStockData = async (symbol) => {
  const response = await fetch(
    `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=YOUR_KEY`
  );
  return response.json();
};
```

#### BigPara Scraping (BIST için alternatif)
```javascript
// BigPara'dan BIST verisi çekme
const scrapeBigPara = async () => {
  const response = await axios.get('https://bigpara.hurriyet.com.tr/borsa/canli-borsa/');
  const $ = cheerio.load(response.data);
  
  const stocks = [];
  $('table tbody tr').each((i, el) => {
    stocks.push({
      symbol: $(el).find('td:nth-child(2)').text(),
      price: $(el).find('td:nth-child(4)').text(),
      change: $(el).find('td:nth-child(5)').text(),
    });
  });
  return stocks;
};
```

### 2. Haber Kaynakları

#### KAP (Kamuyu Aydınlatma Platformu)
```javascript
// KAP'tan şirket haberleri
const getKAPNews = async (companyCode) => {
  const response = await axios.get(
    `https://www.kap.org.tr/tr/api/MetadataDisclosureEventList/${companyCode}`
  );
  return response.data;
};
```

#### Ekonomi Haber Siteleri
```javascript
// Ekonomim, Bloomberg HT, DHA
const scrapeEconomicNews = async () => {
  const sources = [
    'https://www.bloomberght.com/borsa',
    'https://www.dunya.com/borsa',
    'https://www Ekonomim.com/borsa'
  ];
  
  const news = [];
  for (const url of sources) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    $('article').each((i, el) => {
      news.push({
        title: $(el).find('h2').text(),
        content: $(el).find('p').text(),
        source: url,
        url: $(el).find('a').attr('href'),
      });
    });
  }
  return news;
};
```

### 3. Sosyal Medya Entegrasyonu

#### X.com (Twitter) API
```javascript
// X.com'dan borsa tweetleri
const getTweets = async (query) => {
  const response = await fetch(
    `https://api.twitter.com/2/tweets/search/recent?query=${query}`,
    {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      }
    }
  );
  return response.json();
};
```

### 4. AI Entegrasyonu (Ollama)

```javascript
// Ollama ile analiz
const analyzeWithAI = async (data) => {
  const prompt = `
    Sen bir borsa analistisin. Aşağıdaki verileri analiz et:
    
    Hisse: ${data.stockName}
    Son 7 gün fiyat verileri: ${JSON.stringify(data.prices)}
    İlgili haberler: ${JSON.stringify(data.news)}
    
    Lütfen:
    1. Hissenin neden taban yaptığını açıkla
    2. Yükselme potansiyelini değerlendir
    3. Kısa vadeli tahminini ver
    4. Riskleri listele
    
    Yanıtını Türkçe ver ve max 200 kelime ile özetle.
  `;
  
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1',
      prompt: prompt,
      stream: false
    })
  });
  
  const result = await response.json();
  return result.response;
};
```

---

## 📁 Proje Klasör Yapısı

```
borsa-takip/
├── app/                          # Expo Router sayfaları
│   ├── (tabs)/                   # Tab navigasyonu
│   │   ├── _layout.tsx          # Tab layout
│   │   ├── index.tsx            # Ana sayfa
│   │   ├── watchlist.tsx        # Takip listesi
│   │   ├── news.tsx             # Haberler
│   │   ├── analysis.tsx         # Haftalık analiz
│   │   └── settings.tsx         # Ayarlar
│   ├── stock/
│   │   └── [id].tsx             # Hisse detay sayfası
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Giriş sayfası
│
├── components/                   # React bileşenleri
│   ├── stock/
│   │   ├── StockCard.tsx        # Hisse kartı
│   │   ├── PriceChart.tsx       # Fiyat grafiği
│   │   └── StockHeader.tsx      # Hisse başlık bilgisi
│   ├── news/
│   │   ├── NewsCard.tsx         # Haber kartı
│   │   └── NewsFilter.tsx       # Haber filtresi
│   ├── analysis/
│   │   ├── AnalysisCard.tsx     # Analiz kartı
│   │   └── BottomDetector.tsx   # Taban tespit bileşeni
│   └── ui/
│       ├── Button.tsx           # Buton
│       ├── Card.tsx             # Kart
│       └── Loading.tsx          # Yükleniyor
│
├── services/                     # API ve servisler
│   ├── api/
│   │   ├── twelvedata.ts        # Twelve Data API
│   │   ├── bigpara.ts           # BigPara scraping
│   │   └── kap.ts               # KAP API
│   ├── scraper/
│   │   ├── news.ts              # Haber scraping
│   │   ├── social.ts            # Sosyal medya scraping
│   │   └── economicCalendar.ts  # Ekonomik takvim
│   ├── ai/
│   │   └── ollama.ts            # Ollama API
│   └── database/
│       ├── schema.ts            # DB şeması
│       ├── migrations.ts        # Migration'lar
│       └── queries.ts           # Sorgular
│
├── hooks/                        # Custom React hooks
│   ├── useStocks.ts             # Hisse hook'u
│   ├── useNews.ts               # Haber hook'u
│   └── useAI.ts                 # AI hook'u
│
├── store/                        # Zustand store
│   ├── stockStore.ts            # Hisse store
│   ├── newsStore.ts             # Haber store
│   └── settingsStore.ts         # Ayarlar store
│
├── utils/                        # Yardımcı fonksiyonlar
│   ├── formatters.ts            # Format fonksiyonları
│   ├── calculations.ts          # Hesaplama fonksiyonları
│   └── notifications.ts         # Bildirim yardımcıları
│
├── assets/                       # Statik dosyalar
│   ├── images/
│   └── fonts/
│
├── constants/                    # Sabit değerler
│   ├── stockList.ts             # BIST100 hisse listesi
│   ├── newsSources.ts           # Haber kaynakları
│   └── aiPrompts.ts             # AI prompt'ları
│
├── database/                     # SQLite veritabanı
│   └── borsa.db                  # Ana veritabanı
│
├── app.json                      # Expo yapılandırması
├── package.json                  # Bağımlılıklar
├── tsconfig.json                 # TypeScript yapılandırması
└── README.md                     # Proje dokümantasyonu
```

---

## 🚀 Geliştirme Aşamaları

### Aşama 1: Temel Kurulum (1-2 gün)
- [ ] React Native + Expo projesi oluşturma
- [ ] Temel bağımlılıkları yükleme
- [ ] SQLite veritabanı kurulumu
- [ ] Temel navigasyon yapısını oluşturma
- [ ] Renk teması ve tasarım sistemi

### Aşama 2: Veri Katmanı (2-3 gün)
- [ ] Twelve Data API entegrasyonu
- [ ] BigPara scraping modülü
- [ ] KAP haber çekme
- [ ] Veritabanı CRUD işlemleri
- [ ] Veri senkronizasyonu

### Aşama 3: UI Geliştirme (3-4 gün)
- [ ] Ana sayfa (Dashboard)
- [ ] Hisse kartları ve listeler
- [ ] Fiyat grafikleri
- [ ] Haber kartları
- [ ] Takip listesi yönetimi

### Aşama 4: AI Entegrasyonu (2-3 gün)
- [ ] Ollama kurulumu ve test
- [ ] AI analiz prompt'ları
- [ ] Haftalık rapor oluşturma
- [ ] Taban tespit algoritması
- [ ] AI yorumları UI'a entegrasyon

### Aşama 5: Bildirimler ve Sosyal Medya (1-2 gün)
- [ ] Expo push notification kurulumu
- [ ] Anlık bildirim tetikleyicileri
- [ ] X.com API entegrasyonu
- [ ] Sosyal medya haberleri

### Aşama 6: Test ve Optimizasyon (1-2 gün)
- [ ] Birim testleri
- [ ] Performans optimizasyonu
- [ ] Hata yakalama
- [ ] Kullanıcı deneyimi iyileştirmeleri

---

## 📊 Haftalık Analiz Algoritması

```typescript
// Taban tespit algoritması
const detectBottom = (priceHistory: PriceData[]): BottomDetection | null => {
  if (priceHistory.length < 7) return null;
  
  // Son 7 günlük veriyi al
  const recent7Days = priceHistory.slice(-7);
  const recent5Days = priceHistory.slice(-5);
  const recent3Days = priceHistory.slice(-3);
  
  // Volatilite hesapla
  const volatility = calculateVolatility(recent7Days);
  
  // Fiyat aralığını kontrol et
  const priceRange = Math.max(...recent7Days.map(d => d.close)) - 
                     Math.min(...recent7Days.map(d => d.close));
  const avgPrice = recent7Days.reduce((sum, d) => sum + d.close, 0) / 7;
  const rangePercent = (priceRange / avgPrice) * 100;
  
  // Taban kontrolü (%2-3 arası dalgalanma = taban)
  const isBottoming = rangePercent < 3;
  
  if (isBottoming) {
    let days = 0;
    if (recent3Days.every(d => Math.abs(d.changePercent) < 1)) days = 3;
    if (recent5Days.every(d => Math.abs(d.changePercent) < 1)) days = 5;
    if (recent7Days.every(d => Math.abs(d.changePercent) < 1)) days = 7;
    
    if (days >= 3) {
      return {
        days,
        lowestPrice: Math.min(...recent7Days.map(d => d.low)),
        currentPrice: recent7Days[recent7Days.length - 1].close,
        potential: days >= 7 ? 'high' : days >= 5 ? 'medium' : 'low'
      };
    }
  }
  
  return null;
};
```

---

## 🎨 Tasarım İlkeleri

### Renk Paleti
```javascript
const colors = {
  // Ana renkler
  primary: '#1E3A8A',        // Koyu mavi
  secondary: '#3B82F6',      // Açık mavi
  accent: '#10B981',         // Yeşil (yükseliş)
  danger: '#EF4444',         // Kırmızı (düşüş)
  
  // Nötr renkler
  background: '#F8FAFC',     // Açık gri
  surface: '#FFFFFF',        // Beyaz
  text: '#1E293B',           // Koyu metin
  textSecondary: '#64748B',  // Açık metin
  
  // Özel renkler
  positive: '#22C55E',       // Yükseliş
  negative: '#DC2626',       // Düşüş
  neutral: '#F59E0B',        // Nötr
  bottom: '#8B5CF6',         // Taban (mor)
};
```

### Tipografi
```javascript
const typography = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },
};
```

---

## 🔧 Gereken API Anahtarları

| Servis | Ücretsiz Tier | Gereken |
|--------|---------------|---------|
| Twelve Data | 800 istek/gün | API Key |
| X.com API | 500K tweet/ay | Bearer Token |
| Ollama | Sınırsız (yerel) | Yok |
| Expo | Sınırsız | Project ID |

---

## 📝 Önemli Notlar

1. **Gizlilik**: Tüm AI analizleri yerelde çalışır, veri dışarı çıkmaz
2. **Performans**: SQLite yerel veri tabanı ile offline çalışabilir
3. **Ölçeklenebilirlik**: İleride PostgreSQL'e geçiş yapılabilir
4. **Güvenlik**: API anahtarı güvenliği için .env dosyası kullanılacak
5. **Bakım**: Haber scraping kodları site yapılarına göre düzenli güncellenmeli

---

*Bu plan 29 Haziran 2025 tarihinde oluşturulmuştur.*
*Sonraki adım: Proje kurulumuna başlama*
