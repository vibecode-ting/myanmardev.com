import React from 'react';
import { useLanguage } from './LanguageProvider';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section style={{
      padding: 'clamp(4rem,12vh,8rem) clamp(1.25rem,4vw,3rem)',
      maxWidth: '78rem',
      margin: '0 auto',
      textAlign: 'center',
    }}>
      {/* Eyebrow */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 1rem',
        background: 'var(--glow)',
        border: '1px solid var(--border-accent)',
        borderRadius: '24px',
        marginBottom: '1.5rem',
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--accent)',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '0.75rem',
          color: 'var(--accent)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {t('hero.eyebrow')}
        </span>
      </div>

      {/* Main Heading */}
      <h1 style={{
        fontFamily: 'var(--display)',
        fontSize: 'clamp(2.5rem,6vw,4.5rem)',
        fontWeight: 700,
        lineHeight: 1.1,
        color: 'var(--ink)',
        marginBottom: '1rem',
        letterSpacing: '-0.03em',
      }}>
        {t('hero.heading')}
      </h1>

      {/* Sub */}
      <p style={{
        fontFamily: 'var(--body)',
        fontSize: 'clamp(1rem,2vw,1.25rem)',
        color: 'var(--muted)',
        maxWidth: '500px',
        margin: '0 auto 2rem',
      }}>
        {t('hero.sub')}
      </p>

      {/* CTAs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        <a href="#pricing" className="btn" style={{ padding: '1rem 2rem' }}>
          {t('hero.cta')}
        </a>
        <a href="#how" className="btn btn--ghost" style={{ padding: '1rem 2rem' }}>
          {t('hero.see')}
        </a>
      </div>

      {/* Trust Badges */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        marginTop: '3rem',
        flexWrap: 'wrap',
      }}>
        {[
          { icon: '⚡', text: 'Instant' },
          { icon: '🔒', text: 'Secure' },
          { icon: '💳', text: 'No Card' },
        ].map((badge, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.25rem' }}>{badge.icon}</span>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {badge.text}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
