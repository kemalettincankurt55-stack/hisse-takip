/**
 * Format Yardımcı Fonksiyonları
 * Tarih, fiyat, para birimi formatlama
 */

// Para birimi formatlama
export const formatCurrency = (
  value: number,
  currency: 'TRY' | 'USD' = 'TRY',
  decimals: number = 2
): string => {
  if (currency === 'TRY') {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Yüzdelik değişim formatlama
export const formatPercentChange = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// Sayı formatlama (binlik ayracı ile)
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Büyük sayı formatlama (1K, 1M, 1B)
export const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

// Tarih formatlama
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Kısa tarih formatlama
export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Saat formatlama
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Tarih ve saat formatlama
export const formatDateTime = (dateString: string): string => {
  return `${formatShortDate(dateString)} ${formatTime(dateString)}`;
};

// Göreceli zaman formatlama (x dakika önce, x saat önce vb.)
export const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Az önce';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} dakika önce`;
  }
  if (diffHours < 24) {
    return `${diffHours} saat önce`;
  }
  if (diffDays < 7) {
    return `${diffDays} gün önce`;
  }
  return formatShortDate(dateString);
};

// Hisse adı kısaltması
export const formatStockName = (name: string, maxLength: number = 15): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
};

// Duygu durumu metni
export const formatSentiment = (sentiment: string): { text: string; color: string } => {
  switch (sentiment) {
    case 'positive':
      return { text: 'Olumlu', color: '#22C55E' };
    case 'negative':
      return { text: 'Olumsuz', color: '#EF4444' };
    default:
      return { text: 'Nötr', color: '#F59E0B' };
  }
};

export default {
  formatCurrency,
  formatPercentChange,
  formatNumber,
  formatLargeNumber,
  formatDate,
  formatShortDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatStockName,
  formatSentiment,
};
