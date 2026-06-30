/**
 * Haber Kaynakları ve Scraping Konfigürasyonu
 */

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: 'kap' | 'economic' | 'social' | 'forum' | 'news';
  language: 'tr' | 'en';
  selectors?: {
    container: string;
    title: string;
    content: string;
    link: string;
    date: string;
    image?: string;
  };
  apiKey?: string;
}

// Türkiye Finansal Haber Kaynakları
export const TURKISH_NEWS_SOURCES: NewsSource[] = [
  {
    id: 'kap',
    name: 'KAP (Kamuyu Aydınlatma Platformu)',
    url: 'https://www.kap.org.tr',
    type: 'kap',
    language: 'tr',
  },
  {
    id: 'bloomberght',
    name: 'Bloomberg HT',
    url: 'https://www.bloomberght.com/borsa',
    type: 'news',
    language: 'tr',
    selectors: {
      container: '.news-list-item',
      title: 'h3',
      content: '.news-content',
      link: 'a',
      date: '.date',
    },
  },
  {
    id: 'dunya',
    name: 'Dünya Gazetesi',
    url: 'https://www.dunya.com/borsa',
    type: 'news',
    language: 'tr',
    selectors: {
      container: '.news-item',
      title: 'h2',
      content: '.summary',
      link: 'a',
      date: '.date',
    },
  },
  {
    id: 'bigpara',
    name: 'BigPara',
    url: 'https://bigpara.hurriyet.com.tr/borsa/',
    type: 'news',
    language: 'tr',
    selectors: {
      container: '.news-list li',
      title: 'a',
      content: 'p',
      link: 'a',
      date: '.date',
    },
  },
  {
    id: 'investing_com',
    name: 'Investing.com TR',
    url: 'https://tr.investing.com/news/stock-market-news',
    type: 'news',
    language: 'tr',
  },
];

// ABD Haber Kaynakları
export const US_NEWS_SOURCES: NewsSource[] = [
  {
    id: 'yahoo_finance',
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/news/',
    type: 'news',
    language: 'en',
  },
  {
    id: 'marketwatch',
    name: 'MarketWatch',
    url: 'https://www.marketwatch.com/latest-news',
    type: 'news',
    language: 'en',
  },
  {
    id: 'seekingalpha',
    name: 'Seeking Alpha',
    url: 'https://seekingalpha.com/market-news',
    type: 'news',
    language: 'en',
  },
];

// Ekonomik Veri Kaynakları
export const ECONOMIC_SOURCES: NewsSource[] = [
  {
    id: 'tcmb',
    name: 'TCMB (Türkiye Cumhuriyet Merkez Bankası)',
    url: 'https://www.tcmb.gov.tr',
    type: 'economic',
    language: 'tr',
  },
  {
    id: 'tuik',
    name: 'TÜİK (Türkiye İstatistik Kurumu)',
    url: 'https://www.tuik.gov.tr',
    type: 'economic',
    language: 'tr',
  },
  {
    id: 'fed',
    name: 'Federal Reserve',
    url: 'https://www.federalreserve.gov/newsevents.htm',
    type: 'economic',
    language: 'en',
  },
  {
    id: 'bls',
    name: 'Bureau of Labor Statistics',
    url: 'https://www.bls.gov/news.release/',
    type: 'economic',
    language: 'en',
  },
];

// Tüm kaynakları birleştirme
export const ALL_NEWS_SOURCES: NewsSource[] = [
  ...TURKISH_NEWS_SOURCES,
  ...US_NEWS_SOURCES,
  ...ECONOMIC_SOURCES,
];

// Kaynak ID'si ile bulma
export const findSourceById = (id: string): NewsSource | undefined => {
  return ALL_NEWS_SOURCES.find(s => s.id === id);
};
