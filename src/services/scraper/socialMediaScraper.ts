/**
 * Sosyal Medya Scraping Servisi
 * X.com (Twitter) ve forumlardan haber çeker
 * React Native uyumlu - regex tabanlı HTML parsing
 */

import axios from 'axios';

// Tweet veri tipi
export interface SocialPost {
  id: string;
  author: string;
  content: string;
  source: 'x' | 'reddit' | 'forum';
  url: string;
  likes?: number;
  retweets?: number;
  publishedAt: string;
  relatedSymbols?: string[];
}

// HTML tag temizleme
const stripTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

// İlk linki çıkarma
const extractFirstLink = (html: string, baseUrl: string): string => {
  const match = html.match(/href=["']([^"']+)["']/);
  if (match) {
    const href = match[1];
    return href.startsWith('http') ? href : `${baseUrl}${href}`;
  }
  return '';
};

// X.com hashtag araması (şimdilik boş - API gerekli)
export const searchXByHashtag = async (hashtag: string): Promise<SocialPost[]> => {
  try {
    console.log(`ℹ️ X.com hashtag araması: ${hashtag} (API gerekli)`);
    return [];
  } catch (error) {
    console.error('❌ X.com arama hatası:', error);
    return [];
  }
};

// Borsa forumu araması
export const searchBorsaForums = async (query: string): Promise<SocialPost[]> => {
  try {
    const results: SocialPost[] = [];

    const response = await axios.get(`https://www.hisse.com/arama?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      timeout: 10000,
    });

    const html = response.data;
    const articleRegex = /<(?:article|div)[^>]*class=["'][^"']*(?:post|forum|item)[^"']*["'][^>]*>([\s\S]*?)<\/(?:article|div)>/gi;
    let match;
    let index = 0;

    while ((match = articleRegex.exec(html)) !== null) {
      const block = match[1];

      const titleMatch = block.match(/<h[34][^>]*>([\s\S]*?)<\/h[34]>/i);
      const title = titleMatch ? stripTags(titleMatch[1]).trim() : '';

      const contentMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const content = contentMatch ? stripTags(contentMatch[1]).trim() : '';

      const authorMatch = block.match(/class=["'][^"']*(?:author|username)[^"']*["'][^>]*>([\s\S]*?)</i);
      const author = authorMatch ? stripTags(authorMatch[1]).trim() : 'Anonim';

      const link = extractFirstLink(block, 'https://www.hisse.com');

      if (title || content) {
        results.push({
          id: `hisse-${index++}`,
          author: author || 'Anonim',
          content: title || content,
          source: 'forum',
          url: link,
          publishedAt: new Date().toISOString(),
          relatedSymbols: [query.toUpperCase()],
        });
      }
    }

    return results;
  } catch (error) {
    console.error('❌ Forum arama hatası:', error);
    return [];
  }
};

// Ekonomi forumları araması
export const searchEconomicForums = async (): Promise<SocialPost[]> => {
  try {
    const results: SocialPost[] = [];

    const response = await axios.get('https://www.ekonomim.com/forum/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      timeout: 10000,
    });

    const html = response.data;
    const articleRegex = /<(?:article|div)[^>]*class=["'][^"']*(?:topic|post|item)[^"']*["'][^>]*>([\s\S]*?)<\/(?:article|div)>/gi;
    let match;
    let index = 0;

    while ((match = articleRegex.exec(html)) !== null) {
      const block = match[1];

      const titleMatch = block.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
      const title = titleMatch ? stripTags(titleMatch[1]).trim() : '';

      const contentMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const content = contentMatch ? stripTags(contentMatch[1]).trim() : '';

      const link = extractFirstLink(block, 'https://www.ekonomim.com');

      if (title && title.length > 5) {
        results.push({
          id: `forum-${index++}`,
          author: 'Anonim',
          content: content || title,
          source: 'forum',
          url: link,
          publishedAt: new Date().toISOString(),
        });
      }
    }

    return results;
  } catch (error) {
    console.error('❌ Ekonomi forumu arama hatası:', error);
    return [];
  }
};

// Hisse bazlı sosyal medya araması
export const searchStockSocialMedia = async (symbol: string): Promise<SocialPost[]> => {
  const results: SocialPost[] = [];

  try {
    const forumResults = await searchBorsaForums(symbol);
    results.push(...forumResults);

    const economicResults = await searchEconomicForums();
    const relevantResults = economicResults.filter(post =>
      post.content.toLowerCase().includes(symbol.toLowerCase())
    );
    results.push(...relevantResults);

    return results;
  } catch (error) {
    console.error('❌ Sosyal medya arama hatası:', error);
    return results;
  }
};

// Tüm sosyal medya kaynaklarını tara
export const scrapeAllSocialMedia = async (): Promise<SocialPost[]> => {
  const allPosts: SocialPost[] = [];

  try {
    const results = await Promise.allSettled([
      searchEconomicForums(),
    ]);

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allPosts.push(...result.value);
      }
    });

    return allPosts;
  } catch (error) {
    console.error('❌ Toplu sosyal medya çekme hatası:', error);
    return allPosts;
  }
};

export default {
  searchXByHashtag,
  searchBorsaForums,
  searchEconomicForums,
  searchStockSocialMedia,
  scrapeAllSocialMedia,
};
