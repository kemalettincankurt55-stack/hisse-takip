/**
 * useAI Hook'u
 * Ollama AI servisi ile iletişim için custom hook
 */

import { useState, useEffect, useCallback } from 'react';
import {
  checkConnection as checkAIConnection,
  listModels,
  analyzeStock,
  analyzeBottomDetection,
  generateWeeklyAnalysis,
  generateDailySummary,
  chat,
  activeProvider,
  providerLabel,
} from '../services/ai/aiProvider';
import { useSettingsStore } from '../store/settingsStore';

// Hook dönüş tipi
interface UseAIReturn {
  // Durum
  isConnected: boolean;
  availableModels: string[];
  currentModel: string;
  
  // Yükleme durumları
  isLoading: boolean;
  error: string | null;
  
  // Aksiyonlar
  checkConnection: () => Promise<void>;
  refreshModels: () => Promise<void>;
  analyzeStockAsync: (stockName: string, priceData: string, newsData: string) => Promise<string>;
  analyzeBottomAsync: (stockName: string, days: number, priceData: string) => Promise<string>;
  generateWeeklyAsync: (bistData: string, usData: string, economicNews: string) => Promise<string>;
  generateDailyAsync: (topStocks: string, newsHighlights: string) => Promise<string>;
  chatAsync: (message: string, context?: string) => Promise<string>;
  setModel: (model: string) => void;
  setUrl: (url: string) => void;
}

export const useAI = (): UseAIReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { settings, updateSettings } = useSettingsStore();

  // Ollama bağlantısını kontrol etme
  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const connected = await checkAIConnection(settings.ollamaUrl);
      setIsConnected(connected);

      if (connected) {
        console.log(`✅ AI bağlantısı başarılı (${providerLabel()})`);
        await refreshModels();
      } else {
        console.log('❌ AI bağlantısı kurulamadı');
      }
    } catch (err) {
      console.error('❌ AI bağlantı kontrolü hatası:', err);
      setIsConnected(false);
      setError('AI bağlantısı kontrol edilemedi');
    } finally {
      setIsLoading(false);
    }
  }, [settings.ollamaUrl]);

  // Mevcut modelleri yenileme
  const refreshModels = useCallback(async () => {
    try {
      const models = await listModels(settings.ollamaUrl);
      setAvailableModels(models);
      
      // Eğer mevcut model listede yoksa, ilk modeli seç
      if (models.length > 0 && !models.includes(settings.ollamaModel)) {
        updateSettings({ ollamaModel: models[0] });
      }
    } catch (err) {
      console.error('❌ Model listesi yükleme hatası:', err);
    }
  }, [settings.ollamaUrl, settings.ollamaModel, updateSettings]);

  // Hisse analizi
  const analyzeStockAsync = useCallback(async (
    stockName: string,
    priceData: string,
    newsData: string
  ): Promise<string> => {
    if (!isConnected) {
      return 'AI bağlantısı yok. Lütfen Ollama\'yı kontrol edin.';
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyzeStock(stockName, priceData, newsData);
      return result;
    } catch (err) {
      console.error('❌ Hisse analiz hatası:', err);
      setError('Hisse analizi yapılamadı');
      return 'Analiz sırasında hata oluştu.';
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Taban tespit analizi
  const analyzeBottomAsync = useCallback(async (
    stockName: string,
    days: number,
    priceData: string
  ): Promise<string> => {
    if (!isConnected) {
      return 'AI bağlantısı yok.';
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyzeBottomDetection(stockName, days, priceData);
      return result;
    } catch (err) {
      console.error('❌ Taban analiz hatası:', err);
      setError('Taban analizi yapılamadı');
      return 'Analiz sırasında hata oluştu.';
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Haftalık analiz
  const generateWeeklyAsync = useCallback(async (
    bistData: string,
    usData: string,
    economicNews: string
  ): Promise<string> => {
    if (!isConnected) {
      return 'AI bağlantısı yok.';
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await generateWeeklyAnalysis(bistData, usData, economicNews);
      return result;
    } catch (err) {
      console.error('❌ Haftalık analiz hatası:', err);
      setError('Haftalık analiz yapılamadı');
      return 'Analiz sırasında hata oluştu.';
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Günlük özet
  const generateDailyAsync = useCallback(async (
    topStocks: string,
    newsHighlights: string
  ): Promise<string> => {
    if (!isConnected) {
      return 'AI bağlantısı yok.';
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await generateDailySummary(topStocks, newsHighlights);
      return result;
    } catch (err) {
      console.error('❌ Günlük özet hatası:', err);
      setError('Günlük özet oluşturulamadı');
      return 'Özet sırasında hata oluştu.';
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Sohbet
  const chatAsync = useCallback(async (
    message: string,
    context?: string
  ): Promise<string> => {
    if (!isConnected) {
      return 'AI bağlantısı yok.';
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await chat(message, context);
      return result;
    } catch (err) {
      console.error('❌ Sohbet hatası:', err);
      setError('Sohbet sırasında hata oluştu');
      return 'Sohbet sırasında hata oluştu.';
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Model değiştirme
  const setModel = useCallback((model: string) => {
    updateSettings({ ollamaModel: model });
  }, [updateSettings]);

  // URL değiştirme
  const setUrl = useCallback((url: string) => {
    updateSettings({ ollamaUrl: url });
  }, [updateSettings]);

  // İlk yüklemede bağlantıyı kontrol et
  useEffect(() => {
    checkConnection();
  }, [settings.ollamaUrl]);

  return {
    isConnected,
    availableModels,
    currentModel: activeProvider() === 'gemini' ? 'gemini-2.5-flash' : settings.ollamaModel,
    isLoading,
    error,
    checkConnection,
    refreshModels,
    analyzeStockAsync,
    analyzeBottomAsync,
    generateWeeklyAsync,
    generateDailyAsync,
    chatAsync,
    setModel,
    setUrl,
  };
};

export default useAI;
