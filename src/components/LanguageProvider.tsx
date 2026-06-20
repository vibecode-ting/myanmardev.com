import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import my from '../i18n/my.json';

export type Language = 'en' | 'my';

const translations = { en, my };

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const { t } = useLanguage();
  return t;
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/my')) {
      setLangState('my');
    } else {
      setLangState('en');
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    document.documentElement.lang = newLang;
  };

  const t = (key: string): string => {
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
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
