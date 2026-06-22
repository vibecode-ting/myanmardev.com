import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthProvider';

const EXCHANGE_RATE_MMK = 4000;

type PaymentMethod = 'tokens' | 'crypto' | 'card' | 'bank';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  tokenCost: number;
  onPaymentComplete: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  productName,
  tokenCost,
  onPaymentComplete,
}: Props) {
  const { profile, refreshProfile } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('tokens');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Derive price from token cost (assume 1 token = $2.50 for display)
  const priceUSD = tokenCost * 2.5;
  const priceMMK = Math.round(priceUSD * EXCHANGE_RATE_MMK);
  const tokenBalance = profile?.tokenBalance ?? 0;
  const hasEnoughTokens = tokenBalance >= tokenCost;

  // ─── Focus trap & Escape key ─────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    // Save current focus and move into dialog
    previousFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    // Focus the dialog itself so screen readers announce it
    requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  // Reset state when reopening
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('tokens');
      setLoading(false);
      setSuccess(false);
      setComingSoon(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ─── Confirm handler ──────────────────────────────────────────
  const handleConfirm = async () => {
    if (selectedMethod === 'tokens') {
      if (!hasEnoughTokens) return;
      setLoading(true);
      try {
        // TODO: integrate real payment gateway — deduct tokens via Firestore
        const { deductTokens } = await import('../lib/auth');
        if (!profile) return;
        const ok = await deductTokens(profile.uid, tokenCost);
        if (!ok) {
          setLoading(false);
          return;
        }
        await refreshProfile();
        setSuccess(true);
        onPaymentComplete();
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2500);
      } catch (err) {
        console.error('Token payment failed:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // TODO: integrate real payment gateways — crypto / card / bank
      setComingSoon(true);
    }
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Payment for ${productName}`}
        tabIndex={-1}
        style={{
          position: 'relative',
          background: 'var(--base)',
          border: '1px solid #1D232B',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '480px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          outline: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close payment dialog"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '0.25rem',
            lineHeight: 1,
          }}
        >
          &#x2715;
        </button>

        {success ? (
          /* ─── Success state ─── */
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#x2705;</div>
            <h3
              style={{
                fontFamily: 'var(--display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--accent)',
                margin: '0 0 0.5rem',
              }}
            >
              Payment Successful!
            </h3>
            <p
              style={{
                fontFamily: 'var(--body)',
                fontSize: '0.875rem',
                color: 'var(--muted)',
                margin: 0,
              }}
            >
              Your order for <strong style={{ color: 'var(--ink)' }}>{productName}</strong> has been
              confirmed.
            </p>
          </div>
        ) : (
          <>
            {/* ─── Header ─── */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>&#x1F4E6;</div>
              <h2
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  margin: 0,
                }}
              >
                Complete Your Order
              </h2>
              <p
                style={{
                  fontFamily: 'var(--body)',
                  fontSize: '0.875rem',
                  color: 'var(--muted)',
                  margin: '0.5rem 0 0',
                }}
              >
                {productName}
              </p>
            </div>

            {/* ─── Price & balance row ─── */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'var(--wash)',
                border: '1px solid #1D232B',
                borderRadius: '8px',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem',
                  }}
                >
                  Price
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  ${priceUSD.toFixed(2)} / {priceMMK.toLocaleString()} MMK
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem',
                  }}
                >
                  Your Balance
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: hasEnoughTokens ? 'var(--accent)' : '#E8A33D',
                  }}
                >
                  &#x1FA99; {tokenBalance} Tokens
                </div>
              </div>
            </div>

            {/* ─── Payment method selector ─── */}
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.6875rem',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Payment Method
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              {(
                [
                  { key: 'tokens', label: 'Tokens', desc: 'Pre-purchased, instant', icon: '\u{1FA99}' },
                  { key: 'crypto', label: 'Crypto (USDT)', desc: 'Wallet transfer', icon: '\u{20BF}' },
                  { key: 'card', label: 'Card (Stripe)', desc: 'Credit / Debit', icon: '\u{1F4B3}' },
                  { key: 'bank', label: 'Local Banks', desc: 'AYA / KBZ / CB / Wave', icon: '\u{1F3E6}' },
                ] as const
              ).map((method) => {
                const selected = selectedMethod === method.key;
                return (
                  <button
                    key={method.key}
                    onClick={() => {
                      setSelectedMethod(method.key);
                      setComingSoon(false);
                    }}
                    style={{
                      padding: '0.75rem',
                      background: selected
                        ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                        : 'var(--wash)',
                      border: `1px solid ${selected ? 'var(--accent)' : '#1D232B'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: selected ? 'var(--accent)' : 'var(--ink)',
                        marginBottom: '0.125rem',
                      }}
                    >
                      {method.icon} {method.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--body)',
                        fontSize: '0.6875rem',
                        color: 'var(--muted)',
                      }}
                    >
                      {method.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ─── Method-specific details ─── */}
            {selectedMethod === 'tokens' && !hasEnoughTokens && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'color-mix(in srgb, #E8A33D 10%, transparent)',
                  border: '1px solid color-mix(in srgb, #E8A33D 30%, transparent)',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.8125rem',
                  color: '#E8A33D',
                  marginBottom: '1rem',
                }}
              >
                Insufficient tokens. You need {tokenCost} tokens but have {tokenBalance}. Please buy
                more tokens or choose another payment method.
              </div>
            )}

            {selectedMethod === 'crypto' && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--wash)',
                  border: '1px solid #1D232B',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  marginBottom: '1rem',
                  lineHeight: 1.6,
                }}
              >
                {/* TODO: integrate real payment gateway — show actual USDT wallet address */}
                <div style={{ marginBottom: '0.25rem', color: 'var(--ink)', fontWeight: 600 }}>
                  USDT (TRC-20)
                </div>
                <code
                  style={{
                    display: 'block',
                    padding: '0.5rem',
                    background: '#0D1117',
                    borderRadius: '4px',
                    wordBreak: 'break-all',
                    fontSize: '0.6875rem',
                  }}
                >
                  Wallet address will appear here
                </code>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--wash)',
                  border: '1px solid #1D232B',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  marginBottom: '1rem',
                  lineHeight: 1.6,
                }}
              >
                {/* TODO: integrate real payment gateway — Stripe Checkout redirect */}
                Stripe Checkout will open in a new window. You can pay with Visa, Mastercard, or
                AMEX.
              </div>
            )}

            {selectedMethod === 'bank' && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--wash)',
                  border: '1px solid #1D232B',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  marginBottom: '1rem',
                  lineHeight: 1.6,
                }}
              >
                {/* TODO: integrate real payment gateway — local bank transfer details */}
                <div style={{ marginBottom: '0.25rem', color: 'var(--ink)', fontWeight: 600 }}>
                  Supported Banks
                </div>
                AYA Bank, KBZ Bank, CB Bank, WavePay
                <br />
                Transfer details will be shown after confirmation.
              </div>
            )}

            {/* ─── Coming Soon message ─── */}
            {comingSoon && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--accent)',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                Coming Soon &mdash; this payment method is not yet available.
              </div>
            )}

            {/* ─── Action buttons ─── */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: '1px solid #1D232B',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={
                  loading || (selectedMethod === 'tokens' && !hasEnoughTokens)
                }
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  background:
                    loading || (selectedMethod === 'tokens' && !hasEnoughTokens)
                      ? '#1D232B'
                      : 'var(--accent)',
                  color:
                    loading || (selectedMethod === 'tokens' && !hasEnoughTokens)
                      ? 'var(--muted)'
                      : 'var(--base)',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor:
                    loading || (selectedMethod === 'tokens' && !hasEnoughTokens)
                      ? 'not-allowed'
                      : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? 'Processing...'
                  : selectedMethod === 'tokens'
                    ? `Pay ${tokenCost} Tokens`
                    : 'Confirm'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
