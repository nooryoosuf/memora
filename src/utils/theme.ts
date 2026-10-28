import { WeddingTheme, ThemeConfig } from '../types';

export const THEMES: Record<WeddingTheme, ThemeConfig> = {
  'tuscan-sage': {
    id: 'tuscan-sage',
    name: 'Tuscan Sage & Champagne',
    primary: '#6E7E62',
    primaryHover: '#57654E',
    accent: '#C5A880',
    bgLight: '#FAF8F5',
    bgCard: '#F7F4EE',
    badgeBg: '#E6EBE6',
    badgeText: '#434E3C',
  },
  'black-champagne': {
    id: 'black-champagne',
    name: 'Black Tie & Golden Champagne',
    primary: '#1C1A18',
    primaryHover: '#2B2825',
    accent: '#D4AF37',
    bgLight: '#FCFBFA',
    bgCard: '#F5F4F0',
    badgeBg: '#F0EAD6',
    badgeText: '#1C1A18',
  },
  'romantic-blush': {
    id: 'romantic-blush',
    name: 'French Garden Blush & Rose',
    primary: '#9E5B66',
    primaryHover: '#874954',
    accent: '#D4A373',
    bgLight: '#FAF6F6',
    bgCard: '#F5EEEE',
    badgeBg: '#FBE8EB',
    badgeText: '#7A3642',
  },
  'mediterranean-blue': {
    id: 'mediterranean-blue',
    name: 'Mediterranean Riviera & Olive',
    primary: '#33536D',
    primaryHover: '#254056',
    accent: '#C29F64',
    bgLight: '#F5F8FA',
    bgCard: '#EDF2F6',
    badgeBg: '#E0EBF3',
    badgeText: '#1E374D',
  },
  'terracotta-earth': {
    id: 'terracotta-earth',
    name: 'Warm Terracotta & Desert Sand',
    primary: '#A8573D',
    primaryHover: '#8E462E',
    accent: '#D9B48F',
    bgLight: '#FBF8F4',
    bgCard: '#F5ECE3',
    badgeBg: '#FDEAE2',
    badgeText: '#7B3A25',
  },
};

export function getThemeConfig(themeKey?: WeddingTheme): ThemeConfig {
  if (themeKey && THEMES[themeKey]) {
    return THEMES[themeKey];
  }
  return THEMES['tuscan-sage'];
}
