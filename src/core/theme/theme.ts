/**
 * PaiseWise design tokens, derived from the provided screens.
 *
 * The app mixes a dark navy "hero" backdrop (top of most screens) with light
 * card sheets that slide up from the bottom. Accent is a warm amber/orange;
 * gains are teal-green, losses are red/pink. Tokens here are the single source
 * of truth so the whole app restyles from one place.
 */
export const colors = {
  // Dark hero backdrop
  bg: '#0E0F1A',
  bgDeep: '#080912',
  navy: '#1E1B4B', // purple-navy used behind hero sections
  navyGradientTop: '#26224F',
  navyGradientBottom: '#14152A',

  // Light card surfaces
  surface: '#FFFFFF',
  surfaceAlt: '#F4F3EF', // warm off-white sheet background
  surfaceMuted: '#F1F0F8',

  // Text
  text: '#0F172A', // on light
  textOnDark: '#FFFFFF',
  textMuted: '#64748B', // on light
  textMutedDark: '#8B8FA3', // on dark
  textFaint: '#475063',

  // Brand accents
  amber: '#F59E0B',
  amberBright: '#FB923C',
  orange: '#F97316',
  purple: '#6D5DF6',
  purpleDeep: '#5B21B6',
  indigoChip: '#EEF0FF',

  // Semantic — gains / losses
  green: '#10B981',
  greenBright: '#2DE3A4', // "Trade Successful" mint
  greenSoft: '#D6F5E8',
  red: '#EF4444',
  pink: '#F43F5E',
  redSoft: '#FCE8EC',

  // Misc
  border: '#E2E8F0',
  borderDark: '#2A2C42',
  yellowCard: '#FEF6E0', // "Why up today" callout
  yellowBorder: '#F6E2A8',
  star: '#FFC83D',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const typography = {
  hero: { fontSize: 34, fontWeight: '800' as const },
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '700' as const },
  caption: { fontSize: 13, fontWeight: '500' as const },
  overline: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 1.5 },
  mono: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 1 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;
