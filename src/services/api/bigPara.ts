/**
 * BigPara Scraping Servisi
 * BIST verilerini BigPara'dan çeker
 */

import axios from 'axios';

// BigPara hisse veri tipi
export interface BigParaStock {
  symbol: string;
  name: string;
  lastPrice: number;
  changePercent: number;
  volume: number;
  dailyHigh: number;
  dailyLow: number;
}

// Canlı borsa verisi çekme
export const getLiveBISTData = async (): Promise<BigParaStock[]> => {
  try {
    const response = await axios.get('https://bigpara.hurriyet.com.tr/borsa/canli-borsa/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      timeout: 15000,
    });

    const html = response.data;
    const stocks: BigParaStock[] = [];

    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(html)) !== null) {
      try {
        const row = rowMatch[1];
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells: string[] = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(row)) !== null) {
          cells.push(tdMatch[1].replace(/<[^>]*>/g, '').trim());
        }

        if (cells.length >= 6) {
          const symbol = cells[1];
          const name = cells[2];
          const lastPrice = parseFloat(cells[3].replace(',', '.').trim());
          const changePercent = parseFloat(cells[4].replace(',', '.').replace('%', '').trim());
          const volume = parseInt(cells[5].replace(/\./g, '').trim()) || 0;

          if (symbol && !isNaN(lastPrice)) {
            stocks.push({ symbol, name, lastPrice, changePercent, volume, dailyHigh: lastPrice, dailyLow: lastPrice });
          }
        }
      } catch (parseError) {
        // Satır parse hatası
      }
    }

    return stocks;
  } catch (error) {
    console.error('❌ BigPara veri çekme hatası:', error);
    return [];
  }
};

// Tek hisse detayı çekme
export const getStockDetail = async (symbol: string): Promise<BigParaStock | null> => {
  try {
    const allStocks = await getLiveBISTData();
    return allStocks.find(s => s.symbol === symbol) || null;
  } catch (error) {
    console.error(`❌ ${symbol} BigPara detay çekme hatası:`, error);
    return null;
  }
};

// Piyasa özeti çekme
export const getMarketSummary = async (): Promise<{
  bist100: number;
  bist100Change: number;
  usdTry: number;
  eurTry: number;
  goldPrice: number;
}> => {
  try {
    const response = await axios.get('https://bigpara.hurriyet.com.tr/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const html = response.data;
    let bist100 = 0;
    let bist100Change = 0;
    let usdTry = 0;
    let eurTry = 0;
    let goldPrice = 0;

    try {
      const bistMatch = html.match(/class=["'][^"']*bist[^"']*["'][^>]*>[\s\S]*?class=["'][^"']*value[^"']*["'][^>]*>([\s\S]*?)</i);
      if (bistMatch) {
        bist100 = parseFloat(bistMatch[1].replace(/[.\s]/g, '').replace(',', '.')) || 0;
      }
      const bistChgMatch = html.match(/class=["'][^"']*bist[^"']*["'][^>]*>[\s\S]*?class=["'][^"']*change[^"']*["'][^>]*>([\s\S]*?)</i);
      if (bistChgMatch) {
        bist100Change = parseFloat(bistChgMatch[1].replace(',', '.')) || 0;
      }
      const usdMatch = html.match(/class=["'][^"']*usd[^"']*["'][^>]*>[\s\S]*?class=["'][^"']*value[^"']*["'][^>]*>([\s\S]*?)</i);
      if (usdMatch) {
        usdTry = parseFloat(usdMatch[1].replace(',', '.')) || 0;
      }
      const eurMatch = html.match(/class=["'][^"']*eur[^"']*["'][^>]*>[\s\S]*?class=["'][^"']*value[^"']*["'][^>]*>([\s\S]*?)</i);
      if (eurMatch) {
        eurTry = parseFloat(eurMatch[1].replace(',', '.')) || 0;
      }
    } catch (e) {
      // Parse hatası
    }

    return { bist100, bist100Change, usdTry, eurTry, goldPrice };
  } catch (error) {
    console.error('❌ BigPara piyasa özeti çekme hatası:', error);
    return { bist100: 0, bist100Change: 0, usdTry: 0, eurTry: 0, goldPrice: 0 };
  }
};

// BIST100 endeks bileşenlerini çekme
export const getBIST100Components = async (): Promise<string[]> => {
  try {
    const stocks = await getLiveBISTData();
    return stocks.map(s => s.symbol);
  } catch (error) {
    console.error('❌ BIST100 bileşenleri çekme hatası:', error);
    return [];
  }
};

export default {
  getLiveBISTData,
  getStockDetail,
  getMarketSummary,
  getBIST100Components,
};
