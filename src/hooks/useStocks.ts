/**
 * useStocks Hook'u
 * Hisse verilerini yönetmek için custom hook
 */

import { useState, useEffect, useCallback } from 'react';
import { useStockStore, StockData, PricePoint } from '../store/stockStore';
import { getTimeSeries, getQuote } from '../services/api/twelveData';
import { getLiveBISTData } from '../services/api/bigPara';
import { ALL_STOCKS } from '../constants/stockList';

// Hook dönüş tipi
interface UseStocksReturn {
  // Veriler
  stocks: StockData[];
  watchlist: StockData[];
  selectedStock: StockData | null;
  priceHistory: PricePoint[];
  
  // Yükleme durumları
  isLoading: boolean;
  error: string | null;
  
  // Aksiyonlar
  refreshStocks: () => Promise<void>;
  loadStockDetail: (symbol: string) => Promise<void>;
  loadPriceHistory: (symbol: string, days?: number) => Promise<void>;
  searchStocks: (query: string) => StockData[];
  addToWatchlist: (stock: StockData) => void;
  removeFromWatchlist: (symbol: string) => void;
  selectStock: (stock: StockData | null) => void;
  isOnWatchlist: (symbol: string) => boolean;
}

export const useStocks = (): UseStocksReturn => {
  const {
    stocks,
    watchlist,
    selectedStock,
    priceHistory,
    isLoading,
    error,
    setStocks,
    setWatchlist,
    selectStock,
    setPriceHistory,
    setLoading,
    setError,
    addToWatchlist: storeAddToWatchlist,
    removeFromWatchlist: storeRemoveFromWatchlist,
  } = useStockStore();

  // Hisse verilerini yenileme
  const refreshStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // BIST canlı verilerini çek
      const bistData = await getLiveBISTData();
      
      // StockData formatına dönüştür
      const formattedStocks: StockData[] = bistData.map(item => {
        const stockInfo = ALL_STOCKS.find(s => s.symbol === item.symbol);
        return {
          id: 0,
          symbol: item.symbol,
          name: item.name || stockInfo?.name || item.symbol,
          exchange: 'BIST',
          sector: stockInfo?.sector || 'Diğer',
          currency: 'TRY',
          currentPrice: item.lastPrice,
          changePercent: item.changePercent,
          volume: item.volume,
        };
      });

      setStocks(formattedStocks);
      console.log(`✅ ${formattedStocks.length} hisse güncellendi`);
    } catch (err) {
      console.error('❌ Hisse yenileme hatası:', err);
      setError('Hisse verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [setStocks, setLoading, setError]);

  // Hisse detay yükleme
  const loadStockDetail = useCallback(async (symbol: string) => {
    try {
      setLoading(true);
      
      const quote = await getQuote(symbol);
      if (quote) {
        const stockData: StockData = {
          id: 0,
          symbol: quote.symbol,
          name: quote.name,
          exchange: quote.exchange,
          sector: ALL_STOCKS.find(s => s.symbol === symbol)?.sector || 'Diğer',
          currency: quote.exchange.includes('BIST') ? 'TRY' : 'USD',
          currentPrice: parseFloat(quote.close),
          changePercent: parseFloat(quote.percent_change),
          volume: parseInt(quote.volume) || 0,
        };
        
        selectStock(stockData);
      }
    } catch (err) {
      console.error(`❌ ${symbol} detay yükleme hatası:`, err);
      setError(`${symbol} detayları yüklenirken hata oluştu`);
    } finally {
      setLoading(false);
    }
  }, [selectStock, setLoading, setError]);

  // Fiyat geçmişi yükleme
  const loadPriceHistory = useCallback(async (symbol: string, days: number = 30) => {
    try {
      const timeSeriesData = await getTimeSeries(symbol, '1day', days);
      
      const history: PricePoint[] = timeSeriesData.map(item => ({
        date: item.date,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume) || 0,
        changePercent: ((parseFloat(item.close) - parseFloat(item.open)) / parseFloat(item.open)) * 100,
      }));

      setPriceHistory(history);
    } catch (err) {
      console.error(`❌ ${symbol} fiyat geçmişi yükleme hatası:`, err);
    }
  }, [setPriceHistory]);

  // Hisse arama
  const searchStocks = useCallback((query: string): StockData[] => {
    if (!query.trim()) return [];
    
    const upperQuery = query.toUpperCase();
    return stocks.filter(stock => 
      stock.symbol.toUpperCase().includes(upperQuery) ||
      stock.name.toUpperCase().includes(upperQuery)
    );
  }, [stocks]);

  // Takip listesine ekleme
  const addToWatchlist = useCallback((stock: StockData) => {
    storeAddToWatchlist(stock);
  }, [storeAddToWatchlist]);

  // Takip listesinden çıkarma
  const removeFromWatchlist = useCallback((symbol: string) => {
    storeRemoveFromWatchlist(symbol);
  }, [storeRemoveFromWatchlist]);

  // Takip listesinde mi kontrol
  const isOnWatchlist = useCallback((symbol: string): boolean => {
    return watchlist.some(s => s.symbol === symbol);
  }, [watchlist]);

  // İlk yükleme
  useEffect(() => {
    if (stocks.length === 0) {
      refreshStocks();
    }
  }, []);

  return {
    stocks,
    watchlist,
    selectedStock,
    priceHistory,
    isLoading,
    error,
    refreshStocks,
    loadStockDetail,
    loadPriceHistory,
    searchStocks,
    addToWatchlist,
    removeFromWatchlist,
    selectStock,
    isOnWatchlist,
  };
};

export default useStocks;
