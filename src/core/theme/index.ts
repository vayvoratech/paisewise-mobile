
export * from './theme';

export const colors = {
  // Surface & Backgrounds
  surface: '#FFFFFF',
  surfaceAlt: '#F9FAFB',
  surfaceMuted: '#F3F4F6',
  // Text
  text: '#111827',
  textMuted: '#6B7280',
  textMutedDark: '#9CA3AF',
  textFaint: '#9CA3AF',
  textOnDark: '#FFFFFF',
  // Accents & Status
  green: '#10B981',
  greenSoft: '#DCFCE7',
  indigoChip: '#E0E7FF',
  star: '#F59E0B',
  pink: '#EC4899',
  black: '#000000',
  white: '#FFFFFF',
  border: '#E5E7EB',
  borderDark: 'rgba(255, 255, 255, 0.2)', 
};

export const radius = {
  md: 8,
  lg: 16,
  xl: 24,
  full: 999,
};

export const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  hero: { fontSize: 30, fontWeight: '700' as const },
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  overline: { fontSize: 10, fontWeight: '700' as const },
};