import { useState, useEffect } from 'react';

export type Currency = 'USD' | 'MMK';

const STORAGE_KEY = 'currency';
const EVENT_NAME = 'currency-changed';

function detectDefault(): Currency {
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('my')) {
    return 'MMK';
  }
  return 'MMK';
}

export function useCurrency(): { currency: Currency; toggle: () => void } {
  const [currency, setCurrency] = useState<Currency>(detectDefault);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
    if (stored === 'USD' || stored === 'MMK') {
      setCurrency(stored);
    }

    const onChange = () => {
      const latest = localStorage.getItem(STORAGE_KEY) as Currency | null;
      if (latest === 'USD' || latest === 'MMK') {
        setCurrency(latest);
      }
    };

    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  const toggle = () => {
    const next: Currency = currency === 'USD' ? 'MMK' : 'USD';
    localStorage.setItem(STORAGE_KEY, next);
    setCurrency(next);
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  };

  return { currency, toggle };
}

const btnStyle: React.CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: '0.6875rem',
  border: '1px solid #1D232B',
  borderRadius: '4px',
  padding: '0.35rem 0.6rem',
  background: 'transparent',
  color: 'var(--muted)',
  cursor: 'pointer',
};

export default function CurrencyToggle() {
  const { currency, toggle } = useCurrency();

  return (
    <button onClick={toggle} style={btnStyle}>
      {currency}
    </button>
  );
}
