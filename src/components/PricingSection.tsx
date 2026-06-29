import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

const packages = [
  { key: 'starter', popular: false },
  { key: 'basic', popular: false },
  { key: 'pro', popular: true },
  { key: 'business', popular: false },
];

export default function PricingSection() {
  const { t } = useLanguage();
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [currency, setCurrency] = useState<'usd' | 'mmk'>('usd');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const handleBuy = (pkgKey: string) => {
    setSelectedPkg(pkgKey);
    setShowPayment(true);
  };

  const handleConfirmPayment = () => {
    // TODO: Integrate with payment gateway
    alert(`Payment confirmed!\nPackage: ${selectedPkg}\nCurrency: ${currency.toUpperCase()}\nMethod: ${paymentMethod}`);
    setShowPayment(false);
    setSelectedPkg(null);
    setPaymentMethod(null);
  };

  return (
    <section id="pricing" style={{
      padding: 'clamp(3rem,8vw,5rem) clamp(1.25rem,4vw,3rem)',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: '78rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            {t('pricing.section')}
          </span>
          <h2 style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(1.5rem,3vw,2.5rem)',
            fontWeight: 600,
            color: 'var(--ink)',
            marginTop: '0.5rem',
          }}>
            {t('pricing.heading')}
          </h2>
          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.875rem',
            color: 'var(--muted)',
            marginTop: '0.5rem',
          }}>
            {t('pricing.sub')}
          </p>
        </div>

        {/* Currency Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}>
          <button
            onClick={() => setCurrency('usd')}
            style={{
              padding: '0.5rem 1.5rem',
              background: currency === 'usd' ? 'var(--accent)' : 'var(--surface)',
              color: currency === 'usd' ? 'var(--base)' : 'var(--ink)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontFamily: 'var(--mono)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            💵 USD
          </button>
          <button
            onClick={() => setCurrency('mmk')}
            style={{
              padding: '0.5rem 1.5rem',
              background: currency === 'mmk' ? 'var(--accent)' : 'var(--surface)',
              color: currency === 'mmk' ? 'var(--base)' : 'var(--ink)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontFamily: 'var(--mono)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🇲🇲 MMK
          </button>
        </div>

        {/* Packages */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}>
          {packages.map((pkg) => (
            <div
              key={pkg.key}
              style={{
                padding: '2rem',
                background: 'var(--surface)',
                border: pkg.popular ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: '10px',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--accent)',
                  color: 'var(--base)',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {t('pricing.popular')}
                </div>
              )}

              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.75rem',
                color: pkg.popular ? 'var(--accent)' : 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}>
                {t(`pricing.${pkg.key}.name`)}
              </div>

              <div style={{
                fontFamily: 'var(--display)',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'var(--ink)',
              }}>
                {t(`pricing.${pkg.key}.tokens`)}
              </div>

              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.875rem',
                color: 'var(--muted)',
                marginBottom: '1.5rem',
              }}>
                Tokens
              </div>

              <div style={{
                fontFamily: 'var(--display)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--accent)',
                marginBottom: '0.25rem',
              }}>
                {currency === 'usd' ? t(`pricing.${pkg.key}.usd`) : t(`pricing.${pkg.key}.mmk`)}
              </div>

              <button
                onClick={() => handleBuy(pkg.key)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '1.5rem',
                  background: pkg.popular ? 'var(--accent)' : 'transparent',
                  color: pkg.popular ? 'var(--base)' : 'var(--ink)',
                  border: pkg.popular ? 'none' : '1px solid var(--border)',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('pricing.buy')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedPkg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8, 9, 10, 0.85)',
          backdropFilter: 'blur(4px)',
        }} onClick={() => setShowPayment(false)}>
          <div style={{
            background: 'var(--base)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '2rem',
            maxWidth: '450px',
            width: '90%',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontFamily: 'var(--display)',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              {t('payment.heading')}
            </h3>

            {/* Currency Toggle */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <button
                onClick={() => setCurrency('usd')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: currency === 'usd' ? 'var(--accent)' : 'var(--surface)',
                  color: currency === 'usd' ? 'var(--base)' : 'var(--ink)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                💵 {t('payment.usd')}
              </button>
              <button
                onClick={() => setCurrency('mmk')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: currency === 'mmk' ? 'var(--accent)' : 'var(--surface)',
                  color: currency === 'mmk' ? 'var(--base)' : 'var(--ink)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🇲🇲 {t('payment.mmk')}
              </button>
            </div>

            {/* Payment Methods */}
            {currency === 'mmk' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                }}>
                  {t('payment.methods')}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                }}>
                  {['aya', 'kbz', 'wave', 'cb', 'bank'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '0.75rem',
                        background: paymentMethod === method
                          ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                          : 'var(--surface)',
                        border: `1px solid ${paymentMethod === method ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: '6px',
                        fontFamily: 'var(--mono)',
                        fontSize: '0.8125rem',
                        color: paymentMethod === method ? 'var(--accent)' : 'var(--ink)',
                        cursor: 'pointer',
                      }}
                    >
                      {t(`payment.${method}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div style={{
              padding: '1rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--mono)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}>
                <span style={{ color: 'var(--muted)' }}>Package:</span>
                <span style={{ color: 'var(--ink)' }}>{t(`pricing.${selectedPkg}.name`)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--mono)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}>
                <span style={{ color: 'var(--muted)' }}>Tokens:</span>
                <span style={{ color: 'var(--ink)' }}>{t(`pricing.${selectedPkg}.tokens`)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--mono)',
                fontSize: '1rem',
                fontWeight: 700,
              }}>
                <span style={{ color: 'var(--muted)' }}>Total:</span>
                <span style={{ color: 'var(--accent)' }}>
                  {currency === 'usd' ? t(`pricing.${selectedPkg}.usd`) : t(`pricing.${selectedPkg}.mmk`)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowPayment(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                {t('payment.cancel')}
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={currency === 'mmk' && !paymentMethod}
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  background: (currency === 'usd' || paymentMethod) ? 'var(--accent)' : 'var(--border)',
                  color: (currency === 'usd' || paymentMethod) ? 'var(--base)' : 'var(--muted)',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: (currency === 'usd' || paymentMethod) ? 'pointer' : 'not-allowed',
                }}
              >
                {t('payment.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
