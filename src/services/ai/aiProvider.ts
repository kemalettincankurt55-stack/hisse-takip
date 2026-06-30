/**
 * AI Sağlayıcı Katmanı
 *
 * `EXPO_PUBLIC_GEMINI_API_KEY` tanımlıysa Google Gemini'yi (bulut, kurulumsuz),
 * aksi halde yerel Ollama'yı kullanır. useAI hook'u doğrudan bu katmanı çağırır;
 * böylece UI sağlayıcıdan bağımsız kalır.
 */

import * as ollama from './ollama';
import * as gemini from './gemini';

export type AIProvider = 'gemini' | 'ollama';

export const activeProvider = (): AIProvider =>
  gemini.isGeminiConfigured() ? 'gemini' : 'ollama';

export const providerLabel = (): string =>
  activeProvider() === 'gemini' ? 'Gemini' : 'Ollama (yerel)';

const useGemini = () => gemini.isGeminiConfigured();

export const checkConnection = async (ollamaUrl?: string): Promise<boolean> =>
  useGemini() ? gemini.checkGeminiConnection() : ollama.checkOllamaConnection(ollamaUrl);

export const listModels = async (ollamaUrl?: string): Promise<string[]> =>
  useGemini() ? ['gemini-2.5-flash'] : ollama.listModels(ollamaUrl);

export const analyzeStock = (stockName: string, priceData: string, newsData: string) =>
  useGemini()
    ? gemini.analyzeStock(stockName, priceData, newsData)
    : ollama.analyzeStock(stockName, priceData, newsData);

export const analyzeBottomDetection = (stockName: string, days: number, priceData: string) =>
  useGemini()
    ? gemini.analyzeBottomDetection(stockName, days, priceData)
    : ollama.analyzeBottomDetection(stockName, days, priceData);

export const generateWeeklyAnalysis = (bistData: string, usData: string, economicNews: string) =>
  useGemini()
    ? gemini.generateWeeklyAnalysis(bistData, usData, economicNews)
    : ollama.generateWeeklyAnalysis(bistData, usData, economicNews);

export const generateDailySummary = (topStocks: string, newsHighlights: string) =>
  useGemini()
    ? gemini.generateDailySummary(topStocks, newsHighlights)
    : ollama.generateDailySummary(topStocks, newsHighlights);

export const summarizeNews = (newsContent: string, source: string) =>
  useGemini()
    ? gemini.summarizeNews(newsContent, source)
    : ollama.summarizeNews(newsContent, source);

export const chat = (message: string, context?: string) =>
  useGemini() ? gemini.chat(message, context) : ollama.chat(message, context);

export default {
  activeProvider,
  providerLabel,
  checkConnection,
  listModels,
  analyzeStock,
  analyzeBottomDetection,
  generateWeeklyAnalysis,
  generateDailySummary,
  summarizeNews,
  chat,
};
