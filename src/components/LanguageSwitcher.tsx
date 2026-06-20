import React, { useState, useEffect } from 'react';
import { languages, type Language } from '../i18n/utils';

const styles = {
  btn: { display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.35rem .6rem', fontSize: '.6875rem', background: 'transparent', border: '1px solid #1D232B', borderRadius: '4px', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--mono)' },
  dropdown: { position: 'absolute', top: 'calc(100% + 4px)', right: 0, minWidth: '120px', background: 'var(--wash)', border: '1px solid #1D232B', borderRadius: '6px', zIndex: 50, overflow: 'hidden' },
  wrapper: { position: 'relative' },
};

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');

  useEffect(() => {
    // Detect current language from URL
    const path = window.location.pathname;
    if (path.startsWith('/my')) {
      setCurrentLang('my');
    } else {
      setCurrentLang('en');
    }
  }, []);

  const handleSelect = (l: Language) => {
    setOpen(false);

    // Get current path
    const path = window.location.pathname;

    // Remove existing language prefix
    let newPath = path;
    if (path.startsWith('/my')) {
      newPath = path.substring(3) || '/';
    } else if (path.startsWith('/en')) {
      newPath = path.substring(3) || '/';
    }

    // Add new language prefix (English is default, no prefix needed for root)
    if (l === 'my') {
      newPath = '/my' + newPath;
    }

    // Navigate to new URL
    window.location.href = newPath;
  };

  return (
    <div style={styles.wrapper}>
      <button onClick={() => setOpen(!open)} style={styles.btn}>
        {languages[currentLang]}
        <svg style={{ width: '10px', height: '10px', transition: 'transform .15s', ...(open ? { transform: 'rotate(180deg)' } : {}) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div style={styles.dropdown}>
          {(Object.entries(languages) as [Language, string][]).map(([l, label]) => (
            <button
              key={l}
              onClick={() => handleSelect(l)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '.45rem .7rem', fontSize: '.6875rem',
                background: currentLang === l ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
                color: currentLang === l ? 'var(--accent)' : 'var(--muted)',
                border: 0, cursor: 'pointer', transition: 'background .15s', fontFamily: 'var(--mono)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
