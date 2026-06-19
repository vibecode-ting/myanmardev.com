import en from './en.json';
import my from './my.json';

const translations = { en, my };

export const languages = {
  en: 'English',
  my: 'ဗမာ',
};

export type Language = keyof typeof translations;

export function getTranslation(lang: Language, key: string): string {
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

export function t(lang: Language, key: string): string {
  return getTranslation(lang, key);
}

export function getLanguageFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) return lang as Language;
  return 'en';
}
