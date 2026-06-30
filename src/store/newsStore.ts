/**
 * Haber Store - Zustand
 * Haber verilerini yöneten store
 */

import { create } from 'zustand';

// Haber veri tipi
export interface NewsItem {
  id: number;
  stockId?: number;
  stockSymbol?: string;
  stockName?: string;
  title: string;
  content: string;
  source: string;
  sourceUrl?: string;
  newsType: 'kap' | 'economic' | 'social' | 'forum' | 'news';
  sentiment?: 'positive' | 'negative' | 'neutral';
  aiSummary?: string;
  imageUrl?: string;
  publishedAt: string;
  createdAt: string;
}

// Store tipi
interface NewsState {
  // Veriler
  news: NewsItem[];
  filteredNews: NewsItem[];
  selectedNews: NewsItem | null;
  
  // Filtreler
  activeFilter: string;
  searchQuery: string;
  
  // Yükleme durumları
  isLoading: boolean;
  error: string | null;
  
  // Aksiyonlar
  setNews: (news: NewsItem[]) => void;
  addNews: (item: NewsItem) => void;
  removeNews: (id: number) => void;
  selectNews: (news: NewsItem | null) => void;
  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filtreleme
  applyFilters: () => void;
}

// Store oluştur
export const useNewsStore = create<NewsState>((set, get) => ({
  // Başlangıç değerleri
  news: [],
  filteredNews: [],
  selectedNews: null,
  activeFilter: 'all',
  searchQuery: '',
  isLoading: false,
  error: null,

  // Aksiyonlar
  setNews: (news) => {
    set({ news, filteredNews: news });
    // Filtreleri uygula
    get().applyFilters();
  },
  
  addNews: (item) => set((state) => ({
    news: [item, ...state.news],
    filteredNews: [item, ...state.filteredNews]
  })),
  
  removeNews: (id) => set((state) => ({
    news: state.news.filter(n => n.id !== id),
    filteredNews: state.filteredNews.filter(n => n.id !== id)
  })),
  
  selectNews: (news) => set({ selectedNews: news }),
  
  setFilter: (filter) => {
    set({ activeFilter: filter });
    get().applyFilters();
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  // Filtreleri uygulama
  applyFilters: () => {
    const { news, activeFilter, searchQuery } = get();
    let filtered = [...news];
    
    // Haber türü filtresi
    if (activeFilter !== 'all') {
      filtered = filtered.filter(n => n.newsType === activeFilter);
    }
    
    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query) ||
        n.source.toLowerCase().includes(query) ||
        n.stockSymbol?.toLowerCase().includes(query) ||
        n.stockName?.toLowerCase().includes(query)
      );
    }
    
    set({ filteredNews: filtered });
  },
}));

export default useNewsStore;
