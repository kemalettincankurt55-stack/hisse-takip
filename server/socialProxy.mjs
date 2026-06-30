/**
 * Sosyal Medya Proxy Sunucusu
 *
 * Neden gerekli? Uygulama tarayıcıda (web) çalışırken CORS, doğrudan
 * StockTwits/Reddit çağrılarını engeller; ayrıca anahtarlar client'ta açıkta
 * kalmamalı. Bu küçük proxy aradaki katmandır: borsa sosyal akışını toplar,
 * normalize eder ve CORS başlıklarıyla uygulamaya sunar.
 *
 * Bağımlılık yok (Node 18+ yerleşik fetch/http kullanır).
 *
 * Çalıştırma:   node server/socialProxy.mjs
 * Uç nokta:     GET /social?symbol=AAPL   ->  { symbol, posts: [...] }
 *               GET /health
 *
 * Reddit (opsiyonel): REDDIT_CLIENT_ID ve REDDIT_CLIENT_SECRET ortam
 * değişkenleri tanımlıysa Reddit gönderileri de eklenir (OAuth uygulama akışı).
 */

import http from 'node:http';
import { setDefaultResultOrder } from 'node:dns';
import { BIST_ALL_SYMBOLS } from './bistSymbols.mjs';

// Bazı ortamlarda IPv6 yolu kopuk olabilir; IPv4'ü önceleyerek bağlantı
// zaman aşımlarını (Connect Timeout) önle.
try {
  setDefaultResultOrder('ipv4first');
} catch {}
import { BIST_NAMES } from './bistNames.mjs';

const PORT = process.env.PORT || process.env.SOCIAL_PROXY_PORT || 8787;
const UA = 'borsa-takip-proxy/1.0';

// Sunucu-taraflı Gemini anahtarı (client bundle'ında DEĞİL).
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.5-flash';

async function generateGemini(prompt, maxTokens = 2048) {
  if (!GEMINI_KEY) throw new Error('Sunucuda GEMINI_API_KEY tanımlı değil');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: maxTokens,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  // Geçici bağlantı hatalarına karşı 3 denemeli retry
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Gemini hatası (${res.status}): ${t.slice(0, 160)}`);
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('');
      if (!text) throw new Error('Gemini boş yanıt');
      return text.trim();
    } catch (e) {
      lastErr = e;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
  throw lastErr;
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => {
      body += c;
      if (body.length > 1e6) req.destroy();
    });
    req.on('end', () => resolve(body));
    req.on('error', () => resolve(''));
  });
}

// ---- StockTwits ----
async function fetchStockTwits(symbol) {
  const url = `https://api.stocktwits.com/api/2/streams/symbol/${encodeURIComponent(symbol)}.json`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return [];
  const data = await res.json();
  const messages = Array.isArray(data.messages) ? data.messages : [];
  return messages.map((m) => ({
    id: `st-${m.id}`,
    source: 'stocktwits',
    author: m.user?.username || 'anonim',
    avatar: m.user?.avatar_image || null,
    content: m.body || '',
    sentiment: m.entities?.sentiment?.basic
      ? m.entities.sentiment.basic.toLowerCase() === 'bullish'
        ? 'positive'
        : 'negative'
      : 'neutral',
    likes: m.likes?.total || 0,
    url: `https://stocktwits.com/${m.user?.username}/message/${m.id}`,
    publishedAt: m.created_at || new Date().toISOString(),
    symbols: (m.symbols || []).map((s) => s.symbol),
  }));
}

// ---- Reddit (opsiyonel, OAuth) ----
let redditToken = null;
let redditTokenExp = 0;
async function getRedditToken() {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (redditToken && Date.now() < redditTokenExp) return redditToken;
  const auth = Buffer.from(`${id}:${secret}`).toString('base64');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) return null;
  const j = await res.json();
  redditToken = j.access_token;
  redditTokenExp = Date.now() + (j.expires_in - 60) * 1000;
  return redditToken;
}

async function fetchReddit(symbol) {
  const token = await getRedditToken();
  if (!token) return []; // creds yoksa sessizce atla
  const url = `https://oauth.reddit.com/r/stocks+borsa/search?q=${encodeURIComponent(symbol)}&sort=new&limit=10&restrict_sr=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, 'User-Agent': UA } });
  if (!res.ok) return [];
  const data = await res.json();
  const children = data.data?.children || [];
  return children.map((c) => ({
    id: `rd-${c.data.id}`,
    source: 'reddit',
    author: `u/${c.data.author}`,
    avatar: null,
    content: c.data.title,
    sentiment: 'neutral',
    likes: c.data.score || 0,
    url: `https://www.reddit.com${c.data.permalink}`,
    publishedAt: new Date((c.data.created_utc || 0) * 1000).toISOString(),
    symbols: [symbol.toUpperCase()],
  }));
}

// ---- Yahoo Finance (fiyat, anahtarsız) ----
const YAHOO_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const toYahooSymbol = (symbol, exchange) => {
  const ex = (exchange || '').toUpperCase();
  if (ex === 'BIST') return `${symbol}.IS`;
  return symbol; // NYSE/NASDAQ
};

async function fetchYahooChart(symbol, exchange, range = '6mo') {
  const ysym = toYahooSymbol(symbol, exchange);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    ysym,
  )}?range=${range}&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': YAHOO_UA } });
  if (!res.ok) return { symbol, currency: null, points: [] };
  const data = await res.json();
  const r = data?.chart?.result?.[0];
  if (!r || !Array.isArray(r.timestamp)) return { symbol, currency: null, points: [] };
  const q = r.indicators?.quote?.[0] || {};
  const points = [];
  for (let i = 0; i < r.timestamp.length; i++) {
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const c = q.close?.[i];
    if (o == null || h == null || l == null || c == null) continue;
    const prev = points.length ? points[points.length - 1].close : o;
    points.push({
      date: new Date(r.timestamp[i] * 1000).toISOString().slice(0, 10),
      open: +o.toFixed(4),
      high: +h.toFixed(4),
      low: +l.toFixed(4),
      close: +c.toFixed(4),
      volume: q.volume?.[i] || 0,
      changePercent: prev ? +(((c - prev) / prev) * 100).toFixed(2) : 0,
    });
  }
  const ex = (exchange || '').toUpperCase();
  const name =
    (ex === 'BIST' ? BIST_NAMES[symbol] : null) ||
    r.meta?.longName ||
    r.meta?.shortName ||
    symbol;
  return {
    symbol,
    name,
    currency: r.meta?.currency || null,
    lastPrice: r.meta?.regularMarketPrice ?? (points.length ? points[points.length - 1].close : null),
    points,
  };
}

// ---- Haber RSS (anahtarsız, sunucu-taraflı) ----
const RSS_FEEDS = [
  { url: 'https://www.bloomberght.com/rss', source: 'Bloomberg HT' },
  { url: 'https://www.dunya.com/rss', source: 'Dünya' },
];

const stripTags = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const pick = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? stripTags(m[1]) : '';
};

async function fetchRssFeed(feed) {
  try {
    const res = await fetch(feed.url, { headers: { 'User-Agent': YAHOO_UA } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [];
    const re = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const block = m[1];
      const title = pick(block, 'title');
      if (!title) continue;
      const link = pick(block, 'link');
      const desc = pick(block, 'description');
      const pub = pick(block, 'pubDate');
      const dt = pub ? new Date(pub) : new Date();
      items.push({
        id: `rss-${feed.source}-${items.length}-${title.slice(0, 20)}`,
        title,
        content: desc || title,
        source: feed.source,
        sourceUrl: link,
        newsType: 'economic',
        publishedAt: Number.isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString(),
      });
    }
    return items;
  } catch {
    return [];
  }
}

async function fetchAllNews() {
  const results = await Promise.allSettled(RSS_FEEDS.map(fetchRssFeed));
  const all = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  return all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

// ---- Haftalık yükselen/düşen hisseler ----
const moversCache = new Map(); // key -> { ts, data }

// Yahoo toplu "spark" ile çok sayıda sembolün haftalık değişimini hesaplar.
async function fetchSparkChunk(yahooSymbols) {
  const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${encodeURIComponent(
    yahooSymbols.join(','),
  )}&range=1mo&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': YAHOO_UA } });
  if (!res.ok) return [];
  const data = await res.json();
  const out = [];
  for (const ysym of Object.keys(data)) {
    const node = data[ysym];
    const closes = (node?.close || []).filter((v) => v != null);
    if (closes.length < 6) continue;
    const last = closes[closes.length - 1];
    const back = closes[Math.max(0, closes.length - 6)];
    if (!back) continue;
    const clean = ysym.replace(/\.IS$/, '');
    out.push({
      symbol: clean,
      name: BIST_NAMES[clean] || clean,
      exchange: 'BIST',
      currency: 'TRY',
      lastPrice: +last.toFixed(2),
      weeklyChange: +(((last - back) / back) * 100).toFixed(2),
    });
  }
  return out;
}

// Tüm BIST evrenini spark ile (50'şerlik gruplar) tarar.
async function computeBistMovers() {
  const symbols = BIST_ALL_SYMBOLS.map((s) => `${s}.IS`);
  const chunks = [];
  for (let i = 0; i < symbols.length; i += 20) chunks.push(symbols.slice(i, i + 20));
  // Aşırı eşzamanlılıkta Yahoo 429 verebilir; 6'şarlık gruplar halinde işle.
  const all = [];
  for (let i = 0; i < chunks.length; i += 6) {
    const group = chunks.slice(i, i + 6);
    const results = await Promise.allSettled(group.map((c) => fetchSparkChunk(c)));
    results.forEach((r) => {
      if (r.status === 'fulfilled') all.push(...r.value);
    });
  }
  return all;
}

async function computeMovers(pairs) {
  const results = await Promise.allSettled(
    pairs.map((p) => fetchYahooChart(p.symbol, p.exchange, '1mo')),
  );
  const items = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.points.length >= 6) {
      const pts = r.value.points;
      const last = pts[pts.length - 1];
      const back = pts[Math.max(0, pts.length - 6)]; // ~5 işlem günü önce
      const weeklyChange = back.close ? ((last.close - back.close) / back.close) * 100 : 0;
      items.push({
        symbol: pairs[i].symbol,
        exchange: pairs[i].exchange,
        currency: r.value.currency,
        lastPrice: last.close,
        weeklyChange: +weeklyChange.toFixed(2),
      });
    }
  });
  return items;
}

function sendJSON(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=60',
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJSON(res, 204, {});
  const u = new URL(req.url, `http://localhost:${PORT}`);

  if (u.pathname === '/health') return sendJSON(res, 200, { ok: true });

  if (u.pathname === '/ai') {
    if (req.method === 'GET') return sendJSON(res, 200, { configured: !!GEMINI_KEY });
    if (req.method === 'POST') {
      try {
        const raw = await readBody(req);
        const { prompt, maxTokens } = JSON.parse(raw || '{}');
        if (!prompt) return sendJSON(res, 400, { error: 'prompt gerekli' });
        const text = await generateGemini(String(prompt), Number(maxTokens) || 2048);
        return sendJSON(res, 200, { text });
      } catch (e) {
        return sendJSON(res, 502, { error: String(e?.message || e) });
      }
    }
    return sendJSON(res, 405, { error: 'yöntem desteklenmiyor' });
  }

  if (u.pathname === '/prices') {
    const symbol = (u.searchParams.get('symbol') || '').trim();
    const exchange = (u.searchParams.get('exchange') || '').trim();
    const range = (u.searchParams.get('range') || '6mo').trim();
    if (!symbol) return sendJSON(res, 400, { error: 'symbol gerekli' });
    try {
      const data = await fetchYahooChart(symbol, exchange, range);
      return sendJSON(res, 200, data);
    } catch (e) {
      return sendJSON(res, 502, { error: String(e?.message || e), points: [] });
    }
  }

  if (u.pathname === '/movers') {
    const market = (u.searchParams.get('market') || '').trim().toLowerCase();
    const raw = (u.searchParams.get('symbols') || '').trim();
    const limit = Math.min(parseInt(u.searchParams.get('limit') || '5', 10) || 5, 25);

    // Önbellek anahtarı: tüm BIST taraması daha uzun süre cache'lenir
    const cacheKey = market === 'bist' ? 'market:bist' : raw;
    const ttl = market === 'bist' ? 300_000 : 60_000;
    if (market !== 'bist' && !raw) {
      return sendJSON(res, 400, { error: 'market=bist veya symbols=SYM:EX,... gerekli' });
    }

    try {
      const cached = moversCache.get(cacheKey);
      let items;
      if (cached && Date.now() - cached.ts < ttl) {
        items = cached.data;
      } else if (market === 'bist') {
        items = await computeBistMovers();
        moversCache.set(cacheKey, { ts: Date.now(), data: items });
      } else {
        const pairs = raw
          .split(',')
          .map((s) => {
            const [symbol, exchange] = s.split(':');
            return { symbol: (symbol || '').trim(), exchange: (exchange || '').trim() };
          })
          .filter((p) => p.symbol);
        items = await computeMovers(pairs);
        moversCache.set(cacheKey, { ts: Date.now(), data: items });
      }
      const sorted = [...items].sort((a, b) => b.weeklyChange - a.weeklyChange);
      return sendJSON(res, 200, {
        gainers: sorted.slice(0, limit),
        losers: sorted.slice(-limit).reverse(),
        count: items.length,
      });
    } catch (e) {
      return sendJSON(res, 502, { error: String(e?.message || e), gainers: [], losers: [] });
    }
  }

  if (u.pathname === '/news') {
    try {
      const items = await fetchAllNews();
      return sendJSON(res, 200, { count: items.length, items });
    } catch (e) {
      return sendJSON(res, 502, { error: String(e?.message || e), items: [] });
    }
  }

  if (u.pathname === '/social') {
    const symbol = (u.searchParams.get('symbol') || '').trim();
    if (!symbol) return sendJSON(res, 400, { error: 'symbol gerekli' });
    try {
      const [st, rd] = await Promise.allSettled([fetchStockTwits(symbol), fetchReddit(symbol)]);
      const posts = [
        ...(st.status === 'fulfilled' ? st.value : []),
        ...(rd.status === 'fulfilled' ? rd.value : []),
      ].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      return sendJSON(res, 200, { symbol: symbol.toUpperCase(), count: posts.length, posts });
    } catch (e) {
      return sendJSON(res, 502, { error: String(e?.message || e), posts: [] });
    }
  }

  sendJSON(res, 404, { error: 'bulunamadı' });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} zaten kullanımda. Proxy muhtemelen çalışıyor.`);
    process.exit(0);
  }
  console.error('❌ Proxy hatası:', err.message);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`✅ Sosyal medya proxy çalışıyor: http://localhost:${PORT}`);
  console.log(`   Dene: http://localhost:${PORT}/social?symbol=AAPL`);
  if (!process.env.REDDIT_CLIENT_ID) {
    console.log('ℹ️ Reddit devre dışı (REDDIT_CLIENT_ID/SECRET tanımlı değil). StockTwits aktif.');
  }
});
