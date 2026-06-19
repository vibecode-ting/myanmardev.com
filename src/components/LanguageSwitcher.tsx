import React, { useState } from 'react';
import { languages, type Language } from '../i18n/utils';

interface Props {
  lang: Language;
}

const styles = {
  btn: { display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.35rem .6rem', fontSize: '.6875rem', background: 'transparent', border: '1px solid #1D232B', borderRadius: '4px', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--mono)' },
  dropdown: { position: 'absolute', top: 'calc(100% + 4px)', right: 0, minWidth: '120px', background: 'var(--wash)', border: '1px solid #1D232B', borderRadius: '6px', zIndex: 50, overflow: 'hidden' },
  wrapper: { position: 'relative' },
};

export default function LanguageSwitcher({ lang }: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Language>(lang);

  const handleSelect = (l: Language) => {
    setCurrent(l);
    setOpen(false);
    localStorage.setItem('lang', l);
    window.location.reload();
  };

  return (
    <div style={styles.wrapper}>
      <button onClick={() => setOpen(!open)} style={styles.btn}>
        {languages[current]}
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
                background: current === l ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
                color: current === l ? 'var(--accent)' : 'var(--muted)',
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
