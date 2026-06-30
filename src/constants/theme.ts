/**
 * Tasarım Token'ları
 * Tutarlı boşluk, yarıçap, gölge, gradient ve tipografi ölçeği.
 * Premium "dark fintech" görünümü için merkezi tema değerleri.
 */

import { Platform, ViewStyle } from 'react-native';
import { Colors } from './colors';

// 4'lük tabanlı boşluk ölçeği
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Köşe yarıçapı ölçeği
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

/** Platforma uygun gölge/elevation üretir (web'de boxShadow, native'de shadow*). */
const shadow = (elevation: number, opacity: number, radius: number, dy: number): ViewStyle =>
  Platform.select<ViewStyle>({
    web: {
      boxShadow: `0px ${dy}px ${radius}px rgba(0,0,0,${opacity})`,
    } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: dy },
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation,
    },
  }) as ViewStyle;

export const Shadows = {
  card: shadow(3, 0.25, 12, 4),
  raised: shadow(6, 0.35, 20, 8),
  glow: shadow(8, 0.45, 24, 10),
} as const;

// Gradient renk dizileri (expo-linear-gradient için)
export const Gradients = {
  hero: ['#141C2E', '#16243C', '#0B1120'] as const,
  primary: ['#3B82F6', '#2563EB'] as const,
  accent: ['#22D3EE', '#3B82F6'] as const,
  positive: ['#16A34A', '#22C55E'] as const,
  negative: ['#DC2626', '#EF4444'] as const,
  purple: ['#7C3AED', '#A855F7'] as const,
  gold: ['#D97706', '#F59E0B'] as const,
  card: [Colors.surface, Colors.surfaceAlt] as const,
} as const;

// Sinyal rengine göre gradient seçer
export const signalGradient = (score: number): readonly [string, string] => {
  if (score >= 18) return Gradients.positive;
  if (score <= -18) return Gradients.negative;
  return Gradients.gold;
};

export const Typography = {
  display: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.3 },
  h2: { fontSize: 19, fontWeight: '700' as const },
  h3: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  micro: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.5 },
} as const;
