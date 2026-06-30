/**
 * Gerçek Haber Akışı (Client)
 *
 * Türkçe ekonomi/borsa haberlerini proxy üzerinden (BloombergHT + Dünya RSS,
 * anahtarsız) çeker. Proxy gereklidir: web'de CORS doğrudan RSS çağrısını engeller
 * ve RSS sunucu-taraflı ayrıştırılır.
 *
 * Proxy yoksa/erişilemezse boş dizi döner; çağıran taraf demo haber akışına düşer.
 */

import { NewsItem } from '../../store/newsStore';

const PROXY_BASE = process.env.EXPO_PUBLIC_SOCIAL_PROXY || 'http://localhost:8787';

export const getProxyNews = async (timeoutMs = 12000): Promise<NewsItem[]> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${PROXY_BASE}/news`, { signal: controller.signal });
    if (!res.ok) return [];
    const data = await res.json();
    const items: any[] = Array.isArray(data.items) ? data.items : [];
    return items.map((it, i) => ({
      id: 800000 + i,
      title: String(it.title || ''),
      content: String(it.content || it.title || ''),
      source: String(it.source || 'Haber'),
      sourceUrl: it.sourceUrl || undefined,
      newsType: 'economic' as const,
      publishedAt: String(it.publishedAt || new Date().toISOString()),
      createdAt: new Date().toISOString(),
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
};

export default { getProxyNews };
