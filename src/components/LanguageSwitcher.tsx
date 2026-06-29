import React, { useState, useEffect } from 'react';
import { languages, type Language } from '../i18n/utils';

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '.35rem .6rem',
  fontSize: '.6875rem',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  color: 'var(--muted)',
  cursor: 'pointer',
  fontFamily: 'var(--mono)',
  fontWeight: 600,
  letterSpacing: '0.04em',
  transition: 'all 0.15s ease',
};

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>('en');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/my')) {
      setCurrentLang('my');
    } else {
      setCurrentLang('en');
    }
  }, []);

  const toggle = () => {
    const next: Language = currentLang === 'en' ? 'my' : 'en';
    const path = window.location.pathname;

    // Remove existing language prefix
    let newPath = path;
    if (path.startsWith('/my')) {
      newPath = path.substring(3) || '/';
    } else if (path.startsWith('/en')) {
      newPath = path.substring(3) || '/';
    }

    // Add new language prefix (English is default, no prefix)
    if (next === 'my') {
      newPath = '/my' + newPath;
    }

    window.location.href = newPath;
  };

  return (
    <button onClick={toggle} style={btnStyle}>
      {currentLang === 'en' ? 'EN' : 'MM'}
    </button>
  );
}
