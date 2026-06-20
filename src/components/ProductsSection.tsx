import React from 'react';
import { useLanguage } from './LanguageProvider';

const products = [
  { key: 'p1', icon: '🌐', available: true },
  { key: 'p2', icon: '🏗️', available: false },
  { key: 'p3', icon: '💼', available: false },
];

export default function ProductsSection() {
  const { t } = useLanguage();

  return (
    <section id="products" style={{
      padding: 'clamp(3rem,8vw,5rem) clamp(1.25rem,4vw,3rem)',
      borderTop: '1px solid #1D232B',
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
            {t('products.section')}
          </span>
          <h2 style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(1.5rem,3vw,2.5rem)',
            fontWeight: 600,
            color: 'var(--ink)',
            marginTop: '0.5rem',
          }}>
            {t('products.heading')}
          </h2>
          <p style={{
            fontFamily: 'var(--body)',
            fontSize: '1rem',
            color: 'var(--muted)',
            marginTop: '0.5rem',
          }}>
            {t('products.sub')}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}>
          {products.map((product) => (
            <div
              key={product.key}
              style={{
                padding: '2rem',
                background: 'var(--wash)',
                border: '1px solid #1D232B',
                borderRadius: '12px',
                textAlign: 'center',
                opacity: product.available ? 1 : 0.6,
                transition: 'all 0.3s',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                {product.icon}
              </div>
              <h3 style={{
                fontFamily: 'var(--display)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '0.5rem',
              }}>
                {t(`products.${product.key}.name`)}
              </h3>
              <p style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.875rem',
                color: 'var(--muted)',
                marginBottom: '1rem',
              }}>
                {t(`products.${product.key}.desc`)}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                }}>
                  🪙 {t(`products.${product.key}.price`)}
                </span>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6875rem',
                  color: product.available ? 'var(--accent)' : 'var(--muted)',
                  background: product.available
                    ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                    : '#1D232B',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}>
                  {t(`products.${product.key}.status`)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
