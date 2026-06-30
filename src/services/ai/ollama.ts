/**
 * Ollama AI Servisi
 * Yerel AI modeli ile analiz ve yorumlama
 */

import axios from 'axios';
import { AI_PROMPTS } from '../../constants/aiPrompts';
import { useSettingsStore } from '../../store/settingsStore';

// AI yanıt tipi
export interface AIResponse {
  content: string;
  model: string;
  done: boolean;
  totalDuration?: number;
  evalCount?: number;
}

// Ollamahealthcheck
export const checkOllamaConnection = async (baseUrl?: string): Promise<boolean> => {
  const url = baseUrl || useSettingsStore.getState().settings.ollamaUrl;
  
  try {
    const response = await axios.get(`${url}/api/tags`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('❌ Ollama bağlantı hatası:', error);
    return false;
  }
};

// Mevcut modelleri listeleme
export const listModels = async (baseUrl?: string): Promise<string[]> => {
  const url = baseUrl || useSettingsStore.getState().settings.ollamaUrl;
  
  try {
    const response = await axios.get(`${url}/api/tags`, { timeout: 10000 });
    
    if (response.data && response.data.models) {
      return response.data.models.map((m: any) => m.name);
    }
    return [];
  } catch (error) {
    console.error('❌ Model listesi çekme hatası:', error);
    return [];
  }
};

// Ollama'ya prompt gönderme
const generateResponse = async (
  prompt: string,
  model?: string,
  baseUrl?: string
): Promise<string> => {
  const url = baseUrl || useSettingsStore.getState().settings.ollamaUrl;
  const modelName = model || useSettingsStore.getState().settings.ollamaModel;

  try {
    const response = await axios.post(`${url}/api/generate`, {
      model: modelName,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000,
      },
    }, { timeout: 120000 }); // 2 dakika timeout

    if (response.data && response.data.response) {
      return response.data.response;
    }
    return 'AI yanıt alınamadı.';
  } catch (error) {
    console.error('❌ Ollama yanıt hatası:', error);
    throw error;
  }
};

// Hisse analizi
export const analyzeStock = async (
  stockName: string,
  priceData: string,
  newsData: string
): Promise<string> => {
  const prompt = AI_PROMPTS.stockAnalysis(stockName, priceData, newsData);
  return await generateResponse(prompt);
};

// Taban tespit analizi
export const analyzeBottomDetection = async (
  stockName: string,
  bottomDays: number,
  priceData: string
): Promise<string> => {
  const prompt = AI_PROMPTS.bottomAnalysis(stockName, bottomDays, priceData);
  return await generateResponse(prompt);
};

// Haftalık piyasa analizi
export const generateWeeklyAnalysis = async (
  bistData: string,
  usData: string,
  economicNews: string
): Promise<string> => {
  const prompt = AI_PROMPTS.weeklyMarketAnalysis(bistData, usData, economicNews);
  return await generateResponse(prompt);
};

// Haber özeti
export const summarizeNews = async (
  newsContent: string,
  source: string
): Promise<string> => {
  const prompt = AI_PROMPTS.newsSummary(newsContent, source);
  return await generateResponse(prompt);
};

// Günlük piyasa özeti
export const generateDailySummary = async (
  topStocks: string,
  newsHighlights: string
): Promise<string> => {
  const prompt = AI_PROMPTS.dailyMarketSummary(topStocks, newsHighlights);
  return await generateResponse(prompt);
};

// Chat completion (genel sohbet)
export const chat = async (
  message: string,
  context?: string
): Promise<string> => {
  const fullPrompt = context
    ? `Önceki bağlam: ${context}\n\nKullanıcı: ${message}\n\nLütfen yardımcı bir yanıt ver.`
    : message;
  
  return await generateResponse(fullPrompt);
};

export default {
  checkOllamaConnection,
  listModels,
  analyzeStock,
  analyzeBottomDetection,
  generateWeeklyAnalysis,
  summarizeNews,
  generateDailySummary,
  chat,
};
