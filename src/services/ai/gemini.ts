/**
 * Bulut AI Servisi (Gemini, proxy üzerinden)
 *
 * Güvenlik için Gemini çağrıları DOĞRUDAN Google'a değil, kendi proxy'mize
 * (`/ai`) gider; API anahtarı yalnızca sunucuda tutulur, uygulama paketine
 * (client bundle) ASLA gömülmez. ollama.ts ile aynı fonksiyon adlarını sunar.
 */

import { AI_PROMPTS } from '../../constants/aiPrompts';

const PROXY_BASE = process.env.EXPO_PUBLIC_SOCIAL_PROXY || 'http://localhost:8787';

// Bulut AI varsayılan sağlayıcıdır; gerçek erişilebilirlik checkGeminiConnection ile doğrulanır.
export const isGeminiConfigured = (): boolean => true;

/** Proxy AI uç noktası erişilebilir ve sunucuda anahtar tanımlı mı? */
export const checkGeminiConnection = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${PROXY_BASE}/ai`);
    if (!res.ok) return false;
    const data = await res.json();
    return data?.configured === true;
  } catch {
    return false;
  }
};

/** Prompt'u proxy /ai üzerinden Gemini'ye gönderir, üretilen metni döndürür. */
export const generateWithGemini = async (
  prompt: string,
  maxTokens = 2048,
): Promise<string> => {
  const res = await fetch(`${PROXY_BASE}/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `AI hatası (${res.status})`);
  }
  const data = await res.json();
  if (!data?.text) throw new Error('AI boş yanıt döndü');
  return String(data.text).trim();
};

// ---- Ollama ile aynı imzalı sarmalayıcılar ----

export const analyzeStock = (stockName: string, priceData: string, newsData: string) =>
  generateWithGemini(AI_PROMPTS.stockAnalysis(stockName, priceData, newsData));

export const analyzeBottomDetection = (stockName: string, bottomDays: number, priceData: string) =>
  generateWithGemini(AI_PROMPTS.bottomAnalysis(stockName, bottomDays, priceData));

export const generateWeeklyAnalysis = (bistData: string, usData: string, economicNews: string) =>
  generateWithGemini(AI_PROMPTS.weeklyMarketAnalysis(bistData, usData, economicNews));

export const summarizeNews = (newsContent: string, source: string) =>
  generateWithGemini(AI_PROMPTS.newsSummary(newsContent, source), 512);

export const generateDailySummary = (topStocks: string, newsHighlights: string) =>
  generateWithGemini(AI_PROMPTS.dailyMarketSummary(topStocks, newsHighlights));

export const chat = (message: string, context?: string) =>
  generateWithGemini(
    context ? `Önceki bağlam: ${context}\n\nKullanıcı: ${message}` : message,
  );

export default {
  isGeminiConfigured,
  checkGeminiConnection,
  generateWithGemini,
  analyzeStock,
  analyzeBottomDetection,
  generateWeeklyAnalysis,
  summarizeNews,
  generateDailySummary,
  chat,
};
