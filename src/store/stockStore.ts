/**
 * Hisse Store - Zustand
 * Hisse senedi verilerini yöneten store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hisse veri tipi
export interface StockData {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currency: string;
  currentPrice?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: number;
}

// Fiyat geçmişi tipi
export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePercent: number;
}

// Store tipi
interface StockState {
  // Veriler
  stocks: StockData[];
  selectedStock: StockData | null;
  priceHistory: PricePoint[];
  watchlist: StockData[];
  
  // Yükleme durumları
  isLoading: boolean;
  error: string | null;
  
  // Aksiyonlar
  setStocks: (stocks: StockData[]) => void;
  addStock: (stock: StockData) => void;
  removeStock: (symbol: string) => void;
  selectStock: (stock: StockData | null) => void;
  setPriceHistory: (history: PricePoint[]) => void;
  setWatchlist: (watchlist: StockData[]) => void;
  addToWatchlist: (stock: StockData) => void;
  removeFromWatchlist: (symbol: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Hisse fiyat güncelleme
  updateStockPrice: (symbol: string, price: number, changePercent: number) => void;
}

// Store oluştur
export const useStockStore = create<StockState>()(
  persist(
    (set, get) => ({
  // Başlangıç değerleri
  stocks: [],
  selectedStock: null,
  priceHistory: [],
  watchlist: [],
  isLoading: false,
  error: null,

  // Aksiyonlar
  setStocks: (stocks) => set({ stocks }),
  
  addStock: (stock) => set((state) => ({
    stocks: [...state.stocks, stock]
  })),
  
  removeStock: (symbol) => set((state) => ({
    stocks: state.stocks.filter(s => s.symbol !== symbol)
  })),
  
  selectStock: (stock) => set({ selectedStock: stock }),
  
  setPriceHistory: (history) => set({ priceHistory: history }),
  
  setWatchlist: (watchlist) => set({ watchlist }),
  
  addToWatchlist: (stock) => set((state) => {
    // Zaten listede varsa ekleme
    if (state.watchlist.some(s => s.symbol === stock.symbol)) {
      return state;
    }
    return { watchlist: [...state.watchlist, stock] };
  }),
  
  removeFromWatchlist: (symbol) => set((state) => ({
    watchlist: state.watchlist.filter(s => s.symbol !== symbol)
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  // Fiyat güncelleme
  updateStockPrice: (symbol, price, changePercent) => set((state) => ({
    stocks: state.stocks.map(s => 
      s.symbol === symbol 
        ? { ...s, currentPrice: price, changePercent }
        : s
    ),
    watchlist: state.watchlist.map(s => 
      s.symbol === symbol 
        ? { ...s, currentPrice: price, changePercent }
        : s
    ),
    selectedStock: state.selectedStock?.symbol === symbol
      ? { ...state.selectedStock, currentPrice: price, changePercent }
      : state.selectedStock,
  })),
    }),
    {
      name: 'hisse-takip-watchlist',
      storage: createJSONStorage(() => AsyncStorage),
      // Yalnızca takip listesini kalıcı yap (canlı fiyatlar/haberler her açılışta yenilenir)
      partialize: (state) => ({ watchlist: state.watchlist }),
    },
  ),
);

export default useStockStore;
