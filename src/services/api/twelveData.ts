/**
 * Twelve Data API Servisi
 * BIST ve ABD borsası verilerini çeker
 */

import axios from 'axios';

// API yapılandırması
const API_KEY = process.env.EXPO_PUBLIC_TWELVE_DATA_API_KEY || '';
const BASE_URL = 'https://api.twelvedata.com';

// Fiyat verisi tipi
export interface TimeSeriesData {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

// Quote verisi tipi
export interface QuoteData {
  symbol: string;
  name: string;
  exchange: string;
  close: string;
  previous_close: string;
  change: string;
  percent_change: string;
  volume: string;
  average_volume: string;
  fifty_two_week: {
    high: string;
    low: string;
  };
}

// Zaman serisi verisi çekme
export const getTimeSeries = async (
  symbol: string,
  interval: string = '1day',
  outputsize: number = 30
): Promise<TimeSeriesData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/time_series`, {
      params: {
        symbol,
        interval,
        outputsize,
        apikey: API_KEY,
      },
    });

    if (response.data && response.data.values) {
      return response.data.values;
    }
    return [];
  } catch (error) {
    console.error(`❌ ${symbol} zaman serisi çekme hatası:`, error);
    return [];
  }
};

// Hisse quote bilgisi çekme
export const getQuote = async (symbol: string): Promise<QuoteData | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol,
        apikey: API_KEY,
      },
    });

    if (response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`❌ ${symbol} quote çekme hatası:`, error);
    return null;
  }
};

// Birden fazla hisse için toplu quote
export const getBatchQuotes = async (
  symbols: string[]
): Promise<QuoteData[]> => {
  try {
    const results: QuoteData[] = [];
    
    // Sınırlı paralel istek (API rate limit için)
    const batchSize = 8;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const promises = batch.map(symbol => getQuote(symbol));
      const batchResults = await Promise.all(promises);
      results.push(...(batchResults.filter(r => r !== null) as QuoteData[]));
      
      // Rate limit için kısa bekleme
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Toplu quote çekme hatası:', error);
    return [];
  }
};

// Teknik göstergeler - RSI
export const getRSI = async (
  symbol: string,
  interval: string = '1day',
  timePeriod: number = 14
): Promise<number | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/rsi`, {
      params: {
        symbol,
        interval,
        time_period: timePeriod,
        apikey: API_KEY,
      },
    });

    if (response.data && response.data.values && response.data.values.length > 0) {
      return parseFloat(response.data.values[0].rsi);
    }
    return null;
  } catch (error) {
    console.error(`❌ ${symbol} RSI hesaplama hatası:`, error);
    return null;
  }
};

// SMA (Simple Moving Average)
export const getSMA = async (
  symbol: string,
  interval: string = '1day',
  timePeriod: number = 20
): Promise<number | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/sma`, {
      params: {
        symbol,
        interval,
        time_period: timePeriod,
        apikey: API_KEY,
      },
    });

    if (response.data && response.data.values && response.data.values.length > 0) {
      return parseFloat(response.data.values[0].sma);
    }
    return null;
  } catch (error) {
    console.error(`❌ ${symbol} SMA hesaplama hatası:`, error);
    return null;
  }
};

export default {
  getTimeSeries,
  getQuote,
  getBatchQuotes,
  getRSI,
  getSMA,
};
