import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useCurrency, type Currency } from './CurrencyToggle';

// TODO: integrate payment method storage
type PaymentMethod = 'tokens' | 'crypto' | 'card' | 'banks';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'tokens', label: 'Tokens', icon: '🪙' },
  { value: 'crypto', label: 'Crypto', icon: '₿' },
  { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { value: 'banks', label: 'Bank Transfer', icon: '🏦' },
];

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'MMK', label: 'MMK (K)' },
];

export default function PaymentSettings() {
  const { isSignedIn, profile } = useAuth();
  const { currency } = useCurrency();
  const [defaultMethod, setDefaultMethod] = useState<PaymentMethod>('tokens');
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>(currency);
  // TODO: integrate payment method storage — load saved methods from Firestore
  const [savedMethods] = useState<{ id: string; label: string; type: PaymentMethod }[]>([]);

  if (!isSignedIn || !profile) return null;

  return (
    <div style={{
      background: 'var(--wash)',
      border: '1px solid #1D232B',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #1D232B',
      }}>
        <h3 style={{
          fontFamily: 'var(--display)',
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--ink)',
          margin: 0,
        }}>
          Payment Settings
        </h3>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Default payment method */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            fontFamily: 'var(--mono)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem',
          }}>
            Default Payment Method
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
          }}>
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.value}
                onClick={() => setDefaultMethod(method.value)}
                style={{
                  padding: '0.875rem',
                  background: defaultMethod === method.value
                    ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                    : 'var(--base)',
                  border: `1px solid ${defaultMethod === method.value ? 'var(--accent)' : '#1D232B'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                  {method.icon}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: defaultMethod === method.value ? 'var(--accent)' : 'var(--ink)',
                }}>
                  {method.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Saved payment methods */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            fontFamily: 'var(--mono)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem',
          }}>
            Saved Payment Methods
          </label>
          {/* TODO: integrate payment method storage — display saved methods from Firestore */}
          {savedMethods.length === 0 ? (
            <div style={{
              padding: '1.25rem',
              background: 'var(--base)',
              border: '1px solid #1D232B',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.8125rem',
                color: 'var(--muted)',
                margin: 0,
              }}>
                No saved payment methods yet.
              </p>
              <p style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.75rem',
                color: 'var(--muted)',
                margin: '0.5rem 0 0',
                opacity: 0.7,
              }}>
                Payment methods will be saved after your first purchase.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {savedMethods.map((method) => {
                const meta = PAYMENT_METHODS.find((m) => m.value === method.type);
                return (
                  <div
                    key={method.id}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--base)',
                      border: '1px solid #1D232B',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1rem' }}>{meta?.icon || '💳'}</span>
                      <span style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '0.8125rem',
                        color: 'var(--ink)',
                      }}>
                        {method.label}
                      </span>
                    </div>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        fontFamily: 'var(--mono)',
                        fontSize: '0.6875rem',
                        cursor: 'pointer',
                        padding: '0.25rem 0.5rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Currency preference */}
        <div>
          <label style={{
            display: 'block',
            fontFamily: 'var(--mono)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem',
          }}>
            Currency Preference
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {CURRENCIES.map((cur) => (
              <button
                key={cur.value}
                onClick={() => setPreferredCurrency(cur.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: preferredCurrency === cur.value
                    ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                    : 'var(--base)',
                  border: `1px solid ${preferredCurrency === cur.value ? 'var(--accent)' : '#1D232B'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: preferredCurrency === cur.value ? 'var(--accent)' : 'var(--ink)',
                }}
              >
                {cur.label}
              </button>
            ))}
          </div>
          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.6875rem',
            color: 'var(--muted)',
            margin: '0.5rem 0 0',
            opacity: 0.7,
          }}>
            {/* TODO: integrate payment method storage — persist currency preference to Firestore */}
            This syncs with the currency toggle in the header.
          </p>
        </div>
      </div>
    </div>
  );
}
