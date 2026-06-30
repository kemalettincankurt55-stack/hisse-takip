/**
 * Sosyal Medya Akışı (Client)
 *
 * Sosyal medya borsa gönderilerini (StockTwits + opsiyonel Reddit) bir proxy
 * üzerinden çeker. Proxy gereklidir çünkü:
 *  - Web'de CORS doğrudan StockTwits çağrısını engeller,
 *  - API anahtarları (Reddit) client'ta açıkta kalmamalı.
 *
 * Proxy adresi `EXPO_PUBLIC_SOCIAL_PROXY` ile yapılandırılır
 * (varsayılan: http://localhost:8787 — geliştirme). Proxy yoksa/erişilemezse
 * sessizce boş dizi döner; çağıran taraf buna göre boş durum gösterir.
 *
 * Proxy'yi çalıştırmak için:  node server/socialProxy.mjs
 */

const PROXY_BASE = process.env.EXPO_PUBLIC_SOCIAL_PROXY || 'http://localhost:8787';

export type SocialSentiment = 'positive' | 'negative' | 'neutral';

export interface SocialPost {
  id: string;
  source: 'stocktwits' | 'reddit';
  author: string;
  avatar: string | null;
  content: string;
  sentiment: SocialSentiment;
  likes: number;
  url: string;
  publishedAt: string;
  symbols: string[];
}

// Temel HTML entity çözümü (StockTwits gövdesinde &quot; vb. gelebilir)
const decodeEntities = (s: string): string =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');

/**
 * Bir sembol için sosyal medya gönderilerini getirir.
 * Hata/zaman aşımı durumunda boş dizi döner (uygulama çökmez).
 */
export const getSocialPosts = async (
  symbol: string,
  timeoutMs = 12000,
): Promise<SocialPost[]> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `${PROXY_BASE}/social?symbol=${encodeURIComponent(symbol)}`,
      { signal: controller.signal },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const posts: any[] = Array.isArray(data.posts) ? data.posts : [];
    return posts.map((p) => ({
      id: String(p.id),
      source: p.source === 'reddit' ? 'reddit' : 'stocktwits',
      author: String(p.author || 'anonim'),
      avatar: p.avatar || null,
      content: decodeEntities(String(p.content || '')),
      sentiment:
        p.sentiment === 'positive' || p.sentiment === 'negative' ? p.sentiment : 'neutral',
      likes: Number(p.likes) || 0,
      url: String(p.url || ''),
      publishedAt: String(p.publishedAt || new Date().toISOString()),
      symbols: Array.isArray(p.symbols) ? p.symbols.map(String) : [],
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
};

/** Proxy'nin ayakta olup olmadığını kontrol eder. */
export const isSocialProxyAvailable = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${PROXY_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
};

export default { getSocialPosts, isSocialProxyAvailable };
