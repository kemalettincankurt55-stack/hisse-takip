/**
 * Haber Scraping Servisi
 * Çeşitli kaynaklardan haberleri çeker
 * React Native uyumlu - regex tabanlı HTML parsing
 */

import axios from 'axios';
import { TURKISH_NEWS_SOURCES, US_NEWS_SOURCES, ECONOMIC_SOURCES } from '../../constants/newsSources';

// Haber veri tipi
export interface ScrapedNews {
  title: string;
  content: string;
  source: string;
  sourceUrl: string;
  newsType: 'kap' | 'economic' | 'social' | 'forum' | 'news';
  imageUrl?: string;
  publishedAt: string;
}

// HTML içinden metin çıkarma yardımcı fonksiyonu
const extractTextBetween = (html: string, startTag: string, endTag: string): string => {
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) return '';
  const endIdx = html.indexOf(endTag, startIdx + startTag.length);
  if (endIdx === -1) return '';
  return html.substring(startIdx + startTag.length, endIdx)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// HTML'den ilk linki çıkarma
const extractFirstLink = (html: string, baseUrl: string): string => {
  const match = html.match(/href=["']([^"']+)["']/);
  if (match) {
    const href = match[1];
    return href.startsWith('http') ? href : `${baseUrl}${href}`;
  }
  return '';
};

// HTML'den ilk resmi çıkarma
const extractFirstImage = (html: string): string => {
  const match = html.match(/src=["']([^"']+\.(jpg|jpeg|png|webp))["']/i);
  return match ? match[1] : '';
};

// Basit HTML tag temizleme
const stripTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

// Bloomberg HT haberleri çekme
const scrapeBloombergHT = async (): Promise<ScrapedNews[]> => {
  try {
    const response = await axios.get('https://www.bloomberght.com/borsa', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      timeout: 15000,
    });

    const html = response.data;
    const news: ScrapedNews[] = [];

    // Article bloklarını bul
    const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    let match;

    while ((match = articleRegex.exec(html)) !== null) {
      const block = match[1];

      const titleMatch = block.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
      const title = titleMatch ? stripTags(titleMatch[1]).trim() : '';

      const contentMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const content = contentMatch ? stripTags(contentMatch[1]).trim() : '';

      const link = extractFirstLink(block, 'https://www.bloomberght.com');
      const imageUrl = extractFirstImage(block);

      if (title) {
        news.push({
          title,
          content: content || title,
          source: 'Bloomberg HT',
          sourceUrl: link,
          newsType: 'news',
          imageUrl,
          publishedAt: new Date().toISOString(),
        });
      }
    }

    return news;
  } catch (error) {
    console.error('❌ Bloomberg HT scraping hatası:', error);
    return [];
  }
};

// Dünya Gazetesi haberleri çekme
const scrapeDunya = async (): Promise<ScrapedNews[]> => {
  try {
    const response = await axios.get('https://www.dunya.com/borsa', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      timeout: 15000,
    });

    const html = response.data;
    const news: ScrapedNews[] = [];

    const articleRegex = /<(?:article|div)[^>]*class=["'][^"']*(?:news|card|item)[^"']*["'][^>]*>([\s\S]*?)<\/(?:article|div)>/gi;
    let match;

    while ((match = articleRegex.exec(html)) !== null) {
      const block = match[1];

      const titleMatch = block.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
      const title = titleMatch ? stripTags(titleMatch[1]).trim() : '';

      const contentMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const content = contentMatch ? stripTags(contentMatch[1]).trim() : '';

      const link = extractFirstLink(block, 'https://www.dunya.com');

      if (title && title.length > 10) {
        news.push({
          title,
          content: content || title,
          source: 'Dünya Gazetesi',
          sourceUrl: link,
          newsType: 'news',
          publishedAt: new Date().toISOString(),
        });
      }
    }

    return news;
  } catch (error) {
    console.error('❌ Dünya Gazetesi scraping hatası:', error);
    return [];
  }
};

// Investing.com TR haberleri çekme
const scrapeInvestingTR = async (): Promise<ScrapedNews[]> => {
  try {
    const response = await axios.get('https://tr.investing.com/news/stock-market-news', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      timeout: 15000,
    });

    const html = response.data;
    const news: ScrapedNews[] = [];

    const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    let match;

    while ((match = articleRegex.exec(html)) !== null) {
      const block = match[1];

      const titleMatch = block.match(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/i);
      const title = titleMatch ? stripTags(titleMatch[1]).trim() : '';

      const contentMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const content = contentMatch ? stripTags(contentMatch[1]).trim() : '';

      const link = extractFirstLink(block, 'https://tr.investing.com');

      if (title && title.length > 10) {
        news.push({
          title,
          content: content || title,
          source: 'Investing.com',
          sourceUrl: link,
          newsType: 'news',
          publishedAt: new Date().toISOString(),
        });
      }
    }

    return news;
  } catch (error) {
    console.error('❌ Investing.com TR scraping hatası:', error);
    return [];
  }
};

// Yahoo Finance haberleri çekme
const scrapeYahooFinance = async (): Promise<ScrapedNews[]> => {
  try {
    const response = await axios.get('https://finance.yahoo.com/news/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    });

    const html = response.data;
    const news: ScrapedNews[] = [];

    const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    let match;

    while ((match = articleRegex.exec(html)) !== null) {
      const block = match[1];

      const titleMatch = block.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
      const title = titleMatch ? stripTags(titleMatch[1]).trim() : '';

      const contentMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const content = contentMatch ? stripTags(contentMatch[1]).trim() : '';

      const link = extractFirstLink(block, 'https://finance.yahoo.com');

      if (title && title.length > 10) {
        news.push({
          title,
          content: content || title,
          source: 'Yahoo Finance',
          sourceUrl: link,
          newsType: 'news',
          publishedAt: new Date().toISOString(),
        });
      }
    }

    return news;
  } catch (error) {
    console.error('❌ Yahoo Finance scraping hatası:', error);
    return [];
  }
};

// Tüm haber kaynaklarından toplu çekim
export const scrapeAllNews = async (): Promise<ScrapedNews[]> => {
  const allNews: ScrapedNews[] = [];

  try {
    const results = await Promise.allSettled([
      scrapeBloombergHT(),
      scrapeDunya(),
      scrapeInvestingTR(),
      scrapeYahooFinance(),
    ]);

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    });

    allNews.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    console.log(`✅ Toplam ${allNews.length} haber çekildi`);
    return allNews;
  } catch (error) {
    console.error('❌ Toplu haber çekme hatası:', error);
    return allNews;
  }
};

// Haber türüne göre filtreleme
export const scrapeNewsByType = async (
  type: 'turkish' | 'us' | 'economic'
): Promise<ScrapedNews[]> => {
  switch (type) {
    case 'turkish': {
      const turkishNews = await Promise.allSettled([
        scrapeBloombergHT(),
        scrapeDunya(),
        scrapeInvestingTR(),
      ]);
      return turkishNews
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => (r as PromiseFulfilledResult<ScrapedNews[]>).value);
    }
    case 'us':
      return await scrapeYahooFinance();
    case 'economic':
      return [];
    default:
      return [];
  }
};

export default {
  scrapeAllNews,
  scrapeNewsByType,
  scrapeBloombergHT,
  scrapeDunya,
  scrapeInvestingTR,
  scrapeYahooFinance,
};
