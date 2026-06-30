/**
 * KAP (Kamuyu Aydınlatma Platformu) Servisi
 * Şirket haberlerini ve finansal verileri çeker
 */

import axios from 'axios';

// KAP haber veri tipi
export interface KAPNews {
  id: number;
  companyName: string;
  companyCode: string;
  title: string;
  summary: string;
  publishDate: string;
  category: string;
  url: string;
}

// KAP finansal veri tipi
export interface KAPFinancial {
  period: string;
  revenue: number;
  netIncome: number;
  totalAssets: number;
  totalDebt: number;
  equity: number;
  eps: number;
  bvps: number;
}

// Son KAP haberlerini çekme
export const getLatestKAPNews = async (limit: number = 50): Promise<KAPNews[]> => {
  try {
    const response = await axios.get('https://www.kap.org.tr/tr/api/MetadataDisclosureEventList', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 15000,
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data.slice(0, limit).map((item: any) => ({
        id: item.metadataDisclosureEventId || 0,
        companyName: item.companyName || '',
        companyCode: item.companyCode || '',
        title: item.eventTitle || '',
        summary: item.summary || '',
        publishDate: item.publishDate || '',
        category: item.eventCategory || '',
        url: `https://www.kap.org.tr/tr/sirket-bilgileri/genel/${item.companyCode}`,
      }));
    }
    return [];
  } catch (error) {
    console.error('❌ KAP haber çekme hatası:', error);
    return [];
  }
};

// Belirli bir şirkete ait KAP haberlerini çekme
export const getCompanyKAPNews = async (companyCode: string): Promise<KAPNews[]> => {
  try {
    const allNews = await getLatestKAPNews(200);
    return allNews.filter(news => 
      news.companyCode.toUpperCase() === companyCode.toUpperCase()
    );
  } catch (error) {
    console.error(`❌ ${companyCode} KAP haber çekme hatası:`, error);
    return [];
  }
};

// Şirket finansal verilerini çekme
export const getCompanyFinancials = async (companyCode: string): Promise<KAPFinancial | null> => {
  try {
    const response = await axios.get(
      `https://www.kap.org.tr/tr/api/CompanyFinancialSummary/${companyCode}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (response.data) {
      const data = response.data;
      return {
        period: data.period || '',
        revenue: parseFloat(data.revenue) || 0,
        netIncome: parseFloat(data.netIncome) || 0,
        totalAssets: parseFloat(data.totalAssets) || 0,
        totalDebt: parseFloat(data.totalDebt) || 0,
        equity: parseFloat(data.equity) || 0,
        eps: parseFloat(data.eps) || 0,
        bvps: parseFloat(data.bvps) || 0,
      };
    }
    return null;
  } catch (error) {
    console.error(`❌ ${companyCode} finansal veri çekme hatası:`, error);
    return null;
  }
};

// Şirket bilgilerini çekme
export const getCompanyInfo = async (companyCode: string): Promise<any> => {
  try {
    const response = await axios.get(
      `https://www.kap.org.tr/tr/api/CompanyDetail/${companyCode}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 15000,
      }
    );

    return response.data || null;
  } catch (error) {
    console.error(`❌ ${companyCode} şirket bilgisi çekme hatası:`, error);
    return null;
  }
};

// KAP'tan toplu şirket haberleri çekme
export const getMultipleCompanyNews = async (
  companyCodes: string[]
): Promise<Map<string, KAPNews[]>> => {
  const result = new Map<string, KAPNews[]>();
  
  // Sınırlı paralel istek
  const batchSize = 5;
  for (let i = 0; i < companyCodes.length; i += batchSize) {
    const batch = companyCodes.slice(i, i + batchSize);
    const promises = batch.map(async (code) => {
      const news = await getCompanyKAPNews(code);
      return { code, news };
    });
    
    const results = await Promise.all(promises);
    results.forEach(({ code, news }) => {
      result.set(code, news);
    });
    
    // Rate limit için bekleme
    if (i + batchSize < companyCodes.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return result;
};

export default {
  getLatestKAPNews,
  getCompanyKAPNews,
  getCompanyFinancials,
  getCompanyInfo,
  getMultipleCompanyNews,
};
