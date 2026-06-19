import React, { useState } from 'react';
import { languages, type Language } from '../i18n/utils';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageSwitcher({
  currentLang,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = (lang: Language) => {
    onLanguageChange(lang);
    setIsOpen(false);
    // Update URL
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    
    if (pathSegments[0] in languages) {
      pathSegments[0] = lang;
    } else {
      pathSegments.unshift(lang);
    }
    
    const newPath = '/' + pathSegments.join('/');
    window.location.pathname = newPath;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
        aria-label="Language selector"
      >
        <span className="text-sm font-medium">{languages[currentLang]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg z-50 border border-slate-200 dark:border-slate-700">
          {(Object.entries(languages) as [Language, string][]).map(([lang, label]) => (
            <button
              key={lang}
              onClick={() => handleLanguageSelect(lang)}
              className={`w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                currentLang === lang
                  ? 'bg-slate-100 dark:bg-slate-800 font-semibold'
                  : ''
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
