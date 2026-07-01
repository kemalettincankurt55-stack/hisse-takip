/**
 * useNews Hook'u
 * Haber verilerini yönetmek için custom hook
 */

import { useState, useEffect, useCallback } from 'react';
import { useNewsStore, NewsItem } from '../store/newsStore';
import { scrapeAllNews, scrapeNewsByType } from '../services/scraper/newsScraper';
import { getLatestKAPNews, getCompanyKAPNews } from '../services/api/kap';
import { summarizeNews } from '../services/ai/aiProvider';
import { getSampleNews } from '../services/scraper/sampleNews';
import { getProxyNews } from '../services/scraper/newsFeed';
import { getSocialPosts } from '../services/social/socialFeed';

// Haber içeriğine göre "Borsa" mı "Ekonomi" mi olduğunu belirler
const BORSA_KEYWORDS = [
  'borsa', 'hisse', 'bist', 'endeks', 'xu100', 'halka arz', 'temettü', 'temettu',
  'bilanço', 'bilanco', 'şirket', 'sirket', 'kap', 'tahvil', 'yatırımcı', 'yatirimci',
];
const categorizeNews = (title: string, content: string): NewsItem['newsType'] => {
  const text = `${title} ${content}`.toLowerCase();
  return BORSA_KEYWORDS.some((k) => text.includes(k)) ? 'news' : 'economic';
};

// Hook dönüş tipi
interface UseNewsReturn {
  // Gerçek kaynaklar boş döndüğünde demo haber akışı kullanıldı mı
  usingSampleNews: boolean;
  // Veriler
  news: NewsItem[];
  filteredNews: NewsItem[];
  selectedNews: NewsItem | null;
  
  // Filtreler
  activeFilter: string;
  searchQuery: string;
  
  // Yükleme durumları
  isLoading: boolean;
  error: string | null;
  
  // Aksiyonlar
  refreshNews: () => Promise<void>;
  loadKAPNews: (companyCode?: string) => Promise<void>;
  loadTurkishNews: () => Promise<void>;
  loadUSNews: () => Promise<void>;
  searchNews: (query: string) => void;
  setFilter: (filter: string) => void;
  selectNews: (news: NewsItem | null) => void;
  getNewsSummary: (content: string, source: string) => Promise<string>;
}

export const useNews = (): UseNewsReturn => {
  const {
    news,
    filteredNews,
    selectedNews,
    activeFilter,
    searchQuery,
    isLoading,
    error,
    setNews,
    addNews,
    selectNews,
    setFilter: storeSetFilter,
    setSearchQuery: storeSetSearchQuery,
    setLoading,
    setError,
  } = useNewsStore();

  const [usingSampleNews, setUsingSampleNews] = useState(false);

  // Tüm haberleri yenileme
  const refreshNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Paralel olarak farklı kaynaklardan haber çek
      // Birincil: proxy üzerinden gerçek RSS (BloombergHT + Dünya) + sosyal (StockTwits)
      const [proxyNews, scrapedNews, kapNews, social1, social2] = await Promise.allSettled([
        getProxyNews(),
        scrapeAllNews(),
        getLatestKAPNews(50),
        getSocialPosts('AAPL'),
        getSocialPosts('TSLA'),
      ]);

      const allNews: NewsItem[] = [];
      let idCounter = 1;

      // Proxy (RSS) haberlerini ekle — içeriğe göre Ekonomi/Borsa olarak kategorize et
      if (proxyNews.status === 'fulfilled') {
        proxyNews.value.forEach((item) => {
          allNews.push({ ...item, id: idCounter++, newsType: categorizeNews(item.title, item.content) });
        });
      }

      // Sosyal medya gönderilerini (StockTwits) "Sosyal" haberi olarak ekle
      const socialPosts = [
        ...(social1.status === 'fulfilled' ? social1.value : []),
        ...(social2.status === 'fulfilled' ? social2.value : []),
      ];
      socialPosts.slice(0, 20).forEach((p) => {
        allNews.push({
          id: idCounter++,
          title: `${p.symbols[0] || ''} · @${p.author}`.trim(),
          content: p.content,
          source: p.source === 'reddit' ? 'Reddit' : 'StockTwits',
          sourceUrl: p.url,
          newsType: 'social',
          sentiment: p.sentiment,
          publishedAt: p.publishedAt,
          createdAt: new Date().toISOString(),
        });
      });

      // Scraped haberleri ekle
      if (scrapedNews.status === 'fulfilled') {
        scrapedNews.value.forEach(item => {
          allNews.push({
            id: idCounter++,
            title: item.title,
            content: item.content,
            source: item.source,
            sourceUrl: item.sourceUrl,
            newsType: item.newsType,
            imageUrl: item.imageUrl,
            publishedAt: item.publishedAt,
            createdAt: new Date().toISOString(),
          });
        });
      }

      // KAP haberlerini ekle
      if (kapNews.status === 'fulfilled') {
        kapNews.value.forEach(item => {
          allNews.push({
            id: idCounter++,
            stockSymbol: item.companyCode,
            stockName: item.companyName,
            title: item.title,
            content: item.summary || item.title,
            source: 'KAP',
            sourceUrl: item.url,
            newsType: 'kap',
            publishedAt: item.publishDate,
            createdAt: new Date().toISOString(),
          });
        });
      }

      // Tarihe göre sırala
      allNews.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      // Gerçek kaynaklar boş döndüyse demo haber akışına düş
      if (allNews.length === 0) {
        setNews(getSampleNews());
        setUsingSampleNews(true);
        console.log('ℹ️ Gerçek haber kaynağı boş döndü, demo haber akışı kullanılıyor');
      } else {
        setNews(allNews);
        setUsingSampleNews(false);
        console.log(`✅ Toplam ${allNews.length} haber yüklendi`);
      }
    } catch (err) {
      console.error('❌ Haber yenileme hatası:', err);
      // Hata durumunda da kullanıcı boş ekran görmesin
      setNews(getSampleNews());
      setUsingSampleNews(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [setNews, setLoading, setError]);

  // KAP haberlerini yükleme
  const loadKAPNews = useCallback(async (companyCode?: string) => {
    try {
      setLoading(true);
      
      const kapNews = companyCode
        ? await getCompanyKAPNews(companyCode)
        : await getLatestKAPNews(50);

      const newsItems: NewsItem[] = kapNews.map((item, index) => ({
        id: Date.now() + index,
        stockSymbol: item.companyCode,
        stockName: item.companyName,
        title: item.title,
        content: item.summary || item.title,
        source: 'KAP',
        sourceUrl: item.url,
        newsType: 'kap' as const,
        publishedAt: item.publishDate,
        createdAt: new Date().toISOString(),
      }));

      // Mevcut haberlere ekle (duplicate kontrolü ile)
      const existingIds = new Set(news.map(n => n.title));
      const newItems = newsItems.filter(item => !existingIds.has(item.title));
      
      newItems.forEach(item => addNews(item));
    } catch (err) {
      console.error('❌ KAP haber yükleme hatası:', err);
      setError('KAP haberleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [news, addNews, setLoading, setError]);

  // Türkçe haberleri yükleme
  const loadTurkishNews = useCallback(async () => {
    try {
      setLoading(true);
      
      const turkishNews = await scrapeNewsByType('turkish');
      
      const newsItems: NewsItem[] = turkishNews.map((item, index) => ({
        id: Date.now() + index,
        title: item.title,
        content: item.content,
        source: item.source,
        sourceUrl: item.sourceUrl,
        newsType: 'news' as const,
        imageUrl: item.imageUrl,
        publishedAt: item.publishedAt,
        createdAt: new Date().toISOString(),
      }));

      newsItems.forEach(item => addNews(item));
    } catch (err) {
      console.error('❌ Türkçe haber yükleme hatası:', err);
      setError('Türkçe haberler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [addNews, setLoading, setError]);

  // ABD haberlerini yükleme
  const loadUSNews = useCallback(async () => {
    try {
      setLoading(true);
      
      const usNews = await scrapeNewsByType('us');
      
      const newsItems: NewsItem[] = usNews.map((item, index) => ({
        id: Date.now() + index,
        title: item.title,
        content: item.content,
        source: item.source,
        sourceUrl: item.sourceUrl,
        newsType: 'news' as const,
        imageUrl: item.imageUrl,
        publishedAt: item.publishedAt,
        createdAt: new Date().toISOString(),
      }));

      newsItems.forEach(item => addNews(item));
    } catch (err) {
      console.error('❌ ABD haber yükleme hatası:', err);
      setError('ABD haberleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [addNews, setLoading, setError]);

  // Haber arama
  const searchNews = useCallback((query: string) => {
    storeSetSearchQuery(query);
  }, [storeSetSearchQuery]);

  // Filtre ayarlama
  const setFilter = useCallback((filter: string) => {
    storeSetFilter(filter);
  }, [storeSetFilter]);

  // AI ile haber özeti
  const getNewsSummary = useCallback(async (content: string, source: string): Promise<string> => {
    try {
      return await summarizeNews(content, source);
    } catch (err) {
      console.error('❌ Haber özeti alma hatası:', err);
      return 'Özet oluşturulamadı.';
    }
  }, []);

  // İlk yükleme
  useEffect(() => {
    if (news.length === 0) {
      refreshNews();
    }
  }, []);

  return {
    usingSampleNews,
    news,
    filteredNews,
    selectedNews,
    activeFilter,
    searchQuery,
    isLoading,
    error,
    refreshNews,
    loadKAPNews,
    loadTurkishNews,
    loadUSNews,
    searchNews,
    setFilter,
    selectNews,
    getNewsSummary,
  };
};

export default useNews;
