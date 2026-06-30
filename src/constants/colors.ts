/**
 * Uygulama Renk Teması
 * Koyu tema ile borsa uygulaması için profesyonel görünüm
 */

export const Colors = {
  // Ana renkler
  primary: '#3B82F6',        // Mavi - ana aksiyonlar
  primaryDark: '#1E40AF',    // Koyu mavi
  primaryLight: '#93C5FD',   // Açık mavi

  // Borsa renkleri
  positive: '#22C55E',       // Yeşil - yükseliş
  negative: '#EF4444',       // Kırmızı - düşüş
  neutral: '#F59E0B',        // Sarı - nötr
  bottom: '#8B5CF6',         // Mor - taban tespiti

  // Vurgu renkleri (mat, az doygun)
  accent: '#56A8C7',         // Mat teal vurgu
  accentPurple: '#8B83C9',   // Mat mor vurgu

  // Arka plan renkleri
  background: '#0B1120',     // Daha derin koyu arka plan
  backgroundElevated: '#111A2E', // Hafif yükseltilmiş bölüm zemini
  surface: '#172033',        // Kart yüzeyi
  surfaceLight: '#1F2A40',   // Açık kart yüzeyi
  surfaceAlt: '#0F1828',     // Alternatif yüzey

  // Metin renkleri
  text: '#F8FAFC',           // Ana metin (beyaz)
  textSecondary: '#94A3B8',  // İkincil metin (gri)
  textMuted: '#64748B',      // Soluk metin
  textDark: '#1E293B',       // Koyu metin (beyaz zemin için)

  // Sınır ve çizgi
  border: '#243044',
  borderLight: '#2F3D54',
  divider: '#1A2334',

  // Bildirim renkleri
  info: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorKey = keyof typeof Colors;
