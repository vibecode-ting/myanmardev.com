import en from './en.json';
import my from './my.json';

const translations = { en, my };

export const languages = {
  en: 'English',
  my: 'မြန်မာ',
};

export type Language = keyof typeof translations;

export function t(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

export function getDefaultLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'my') return stored;
  }
  return 'en';
}
