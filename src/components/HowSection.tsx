import React from 'react';
import { useLanguage } from './LanguageProvider';

const steps = [
  { num: '1', key: 's1', icon: '🎯' },
  { num: '2', key: 's2', icon: '🔐' },
  { num: '3', key: 's3', icon: '🚀' },
];

export default function HowSection() {
  const { t } = useLanguage();

  return (
    <section id="how" style={{
      padding: 'clamp(3rem,8vw,5rem) clamp(1.25rem,4vw,3rem)',
      borderTop: '1px solid var(--border)',
      background: 'color-mix(in srgb, var(--surface) 50%, transparent)',
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
            {t('how.section')}
          </span>
          <h2 style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(1.5rem,3vw,2.5rem)',
            fontWeight: 600,
            color: 'var(--ink)',
            marginTop: '0.5rem',
          }}>
            {t('how.heading')}
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
        }}>
          {steps.map((step) => (
            <div key={step.key} style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                {step.icon}
              </div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.75rem',
                color: 'var(--accent)',
                fontWeight: 700,
                marginBottom: '0.5rem',
              }}>
                STEP {step.num}
              </div>
              <h3 style={{
                fontFamily: 'var(--display)',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '0.25rem',
              }}>
                {t(`how.${step.key}`)}
              </h3>
              <p style={{
                fontFamily: 'var(--body)',
                fontSize: '0.875rem',
                color: 'var(--muted)',
              }}>
                {t(`how.${step.key}d`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
