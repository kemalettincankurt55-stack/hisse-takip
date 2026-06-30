/**
 * Ayarlar Store - Zustand
 * Uygulama ayarlarını yöneten store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ayarlar tipi
export interface AppSettings {
  // Bildirim ayarları
  pushNotifications: boolean;
  dailyDigest: boolean;
  weeklyAnalysis: boolean;
  bottomDetectionAlerts: boolean;
  newsAlerts: boolean;
  
  // Borsa tercihleri
  trackBIST: boolean;
  trackUS: boolean;
  trackForex: boolean;
  
  // AI ayarları
  ollamaUrl: string;
  ollamaModel: string;
  analysisFrequency: 'daily' | 'weekly';
  
  // Görünüm
  theme: 'dark' | 'light';
  currency: 'TRY' | 'USD';
  
  // Dil
  language: 'tr' | 'en';
}

// Store tipi
interface SettingsState {
  // Ayarlar
  settings: AppSettings;
  
  // Yükleme durumları
  isLoading: boolean;
  
  // Aksiyonlar
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  setLoading: (loading: boolean) => void;
  
  // Belirli ayarları güncelleme
  togglePushNotifications: () => void;
  toggleDailyDigest: () => void;
  toggleWeeklyAnalysis: () => void;
  toggleBottomDetection: () => void;
  toggleNewsAlerts: () => void;
  toggleBIST: () => void;
  toggleUS: () => void;
  toggleForex: () => void;
  setOllamaUrl: (url: string) => void;
  setOllamaModel: (model: string) => void;
  setAnalysisFrequency: (freq: 'daily' | 'weekly') => void;
}

// Varsayılan ayarlar
const defaultSettings: AppSettings = {
  pushNotifications: true,
  dailyDigest: true,
  weeklyAnalysis: true,
  bottomDetectionAlerts: true,
  newsAlerts: true,
  trackBIST: true,
  trackUS: true,
  trackForex: false,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.1',
  analysisFrequency: 'weekly',
  theme: 'dark',
  currency: 'TRY',
  language: 'tr',
};

// Store oluştur
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
  // Başlangıç değerleri
  settings: defaultSettings,
  isLoading: false,

  // Aksiyonlar
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  resetSettings: () => set({ settings: defaultSettings }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  // Belirli ayar toggle'ları
  togglePushNotifications: () => set((state) => ({
    settings: {
      ...state.settings,
      pushNotifications: !state.settings.pushNotifications
    }
  })),
  
  toggleDailyDigest: () => set((state) => ({
    settings: {
      ...state.settings,
      dailyDigest: !state.settings.dailyDigest
    }
  })),
  
  toggleWeeklyAnalysis: () => set((state) => ({
    settings: {
      ...state.settings,
      weeklyAnalysis: !state.settings.weeklyAnalysis
    }
  })),
  
  toggleBottomDetection: () => set((state) => ({
    settings: {
      ...state.settings,
      bottomDetectionAlerts: !state.settings.bottomDetectionAlerts
    }
  })),
  
  toggleNewsAlerts: () => set((state) => ({
    settings: {
      ...state.settings,
      newsAlerts: !state.settings.newsAlerts
    }
  })),
  
  toggleBIST: () => set((state) => ({
    settings: {
      ...state.settings,
      trackBIST: !state.settings.trackBIST
    }
  })),
  
  toggleUS: () => set((state) => ({
    settings: {
      ...state.settings,
      trackUS: !state.settings.trackUS
    }
  })),
  
  toggleForex: () => set((state) => ({
    settings: {
      ...state.settings,
      trackForex: !state.settings.trackForex
    }
  })),
  
  setOllamaUrl: (url) => set((state) => ({
    settings: { ...state.settings, ollamaUrl: url }
  })),
  
  setOllamaModel: (model) => set((state) => ({
    settings: { ...state.settings, ollamaModel: model }
  })),
  
  setAnalysisFrequency: (freq) => set((state) => ({
    settings: { ...state.settings, analysisFrequency: freq }
  })),
    }),
    {
      name: 'hisse-takip-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);

export default useSettingsStore;
