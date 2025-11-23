import { Platform } from 'react-native';

// Fargepalett for ConjugHero
// Moderne, ungdommelig stil med franske farger som inspirasjon

export const colors = {
  // Primærfarger (fransk-inspirert blå)
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',

  // Sekundærfarger
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  secondaryDark: '#7C3AED',

  // Aksent (varm oransje/rød)
  accent: '#F97316',
  accentLight: '#FB923C',
  accentDark: '#EA580C',

  // Suksess (grønn)
  success: '#22C55E',
  successLight: '#4ADE80',
  successDark: '#16A34A',

  // Feil (rød)
  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',

  // Advarsel (gul)
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',

  // Nøytrale
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Tekst
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  // Verbgruppe-farger
  verbER: '#3B82F6', // Blå
  verbIR: '#8B5CF6', // Lilla
  verbRE: '#EC4899', // Rosa

  // Nivå-farger
  levelEasy: '#22C55E',
  levelMedium: '#F59E0B',
  levelHard: '#EF4444',

  // Gamification
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  star: '#FBBF24',
};

// Typografi
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Skygger - web-kompatible
const createShadow = (offsetY: number, blur: number, opacity: number, elevation: number) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${offsetY}px ${blur}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur / 2,
    elevation,
  };
};

export const shadows = {
  sm: createShadow(1, 2, 0.05, 1),
  md: createShadow(2, 4, 0.1, 3),
  lg: createShadow(4, 8, 0.15, 5),
};
