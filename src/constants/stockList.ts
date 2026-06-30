/**
 * BIST100 ve ABD Borsası Hisse Listeleri
 */

export interface StockInfo {
  symbol: string;
  name: string;
  exchange: 'BIST' | 'NYSE' | 'NASDAQ';
  sector: string;
  currency: 'TRY' | 'USD';
}

// BIST100 Önde Gelen Hisseler
export const BIST_STOCKS: StockInfo[] = [
  { symbol: 'ASELS', name: 'ASELSAN', exchange: 'BIST', sector: 'Savunma', currency: 'TRY' },
  { symbol: 'THYAO', name: 'Türk Hava Yolları', exchange: 'BIST', sector: 'Ulaştırma', currency: 'TRY' },
  { symbol: 'GARAN', name: 'Garanti Bankası', exchange: 'BIST', sector: 'Bankacılık', currency: 'TRY' },
  { symbol: 'KCHOL', name: 'Koç Holding', exchange: 'BIST', sector: 'Holding', currency: 'TRY' },
  { symbol: 'SISE', name: 'Şişecam', exchange: 'BIST', sector: 'Cam', currency: 'TRY' },
  { symbol: 'EREGL', name: 'Ereğli Demir Çelik', exchange: 'BIST', sector: 'Demir Çelik', currency: 'TRY' },
  { symbol: 'BIMAS', name: 'BİM Mağazalar', exchange: 'BIST', sector: 'Perakende', currency: 'TRY' },
  { symbol: 'AKBNK', name: 'Akbank', exchange: 'BIST', sector: 'Bankacılık', currency: 'TRY' },
  { symbol: 'SAHOL', name: 'Sabancı Holding', exchange: 'BIST', sector: 'Holding', currency: 'TRY' },
  { symbol: 'TUPRS', name: 'Tüpraş', exchange: 'BIST', sector: 'Enerji', currency: 'TRY' },
  { symbol: 'TAVHL', name: 'TAV Havalimanları', exchange: 'BIST', sector: 'Ulaştırma', currency: 'TRY' },
  { symbol: 'TOASO', name: 'Tofaş Otomobil', exchange: 'BIST', sector: 'Otomotiv', currency: 'TRY' },
  { symbol: 'TCELL', name: 'Turkcell', exchange: 'BIST', sector: 'Telekomünikasyon', currency: 'TRY' },
  { symbol: 'HALKB', name: 'Halkbank', exchange: 'BIST', sector: 'Bankacılık', currency: 'TRY' },
  { symbol: 'PGSUS', name: 'Pegasus Hava Yolları', exchange: 'BIST', sector: 'Ulaştırma', currency: 'TRY' },
  { symbol: 'KOZAL', name: 'Koza Altın', exchange: 'BIST', sector: 'Madencilik', currency: 'TRY' },
  { symbol: 'FROTO', name: 'Ford Otosan', exchange: 'BIST', sector: 'Otomotiv', currency: 'TRY' },
  { symbol: 'YKBNK', name: 'Yapı Kredi Bankası', exchange: 'BIST', sector: 'Bankacılık', currency: 'TRY' },
  { symbol: 'ENKAI', name: 'Enka İnşaat', exchange: 'BIST', sector: 'İnşaat', currency: 'TRY' },
  { symbol: 'KOZAA', name: 'Koza Anadolu Metal', exchange: 'BIST', sector: 'Madencilik', currency: 'TRY' },
];

// ABD Borsası Önde Gelen Hisseler
export const US_STOCKS: StockInfo[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Teknoloji', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', sector: 'Teknoloji', currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Teknoloji', currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'E-Ticaret', currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ', sector: 'Yarı İletken', currency: 'USD' },
  { symbol: 'META', name: 'Meta Platforms', exchange: 'NASDAQ', sector: 'Sosyal Medya', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Otomotiv', currency: 'USD' },
  { symbol: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE', sector: 'Bankacılık', currency: 'USD' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', sector: 'Finans', currency: 'USD' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Sağlık', currency: 'USD' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', sector: 'Perakende', currency: 'USD' },
  { symbol: 'UNH', name: 'UnitedHealth', exchange: 'NYSE', sector: 'Sağlık', currency: 'USD' },
  { symbol: 'XOM', name: 'Exxon Mobil', exchange: 'NYSE', sector: 'Enerji', currency: 'USD' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE', sector: 'Finans', currency: 'USD' },
  { symbol: 'PG', name: 'Procter & Gamble', exchange: 'NYSE', sector: 'Tüketim', currency: 'USD' },
];

// Tüm hisseleri birleştirme
export const ALL_STOCKS: StockInfo[] = [...BIST_STOCKS, ...US_STOCKS];

// Sembol ile hisse bulma
export const findStockBySymbol = (symbol: string): StockInfo | undefined => {
  return ALL_STOCKS.find(s => s.symbol === symbol);
};

// Borsaya göre filtreleme
export const getStocksByExchange = (exchange: 'BIST' | 'NYSE' | 'NASDAQ'): StockInfo[] => {
  return ALL_STOCKS.filter(s => s.exchange === exchange);
};

// Sektöre göre filtreleme
export const getStocksBySector = (sector: string): StockInfo[] => {
  return ALL_STOCKS.filter(s => s.sector === sector);
};
