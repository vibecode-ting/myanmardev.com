import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { redeemCode } from '../lib/redeem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RedeemCodeModal({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ tokens: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !code.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await redeemCode(user.uid, code);

      if (result.success) {
        setSuccess({ tokens: result.tokens || 0 });
        onSuccess();

        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
          setSuccess(null);
          setCode('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to redeem code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to redeem code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(8, 9, 10, 0.85)',
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '2rem',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }} onClick={(e) => e.stopPropagation()}>

        {success ? (
          /* Success State */
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{
              fontFamily: 'var(--display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--accent)',
              margin: '0 0 0.5rem',
            }}>
              Code Redeemed!
            </h3>
            <p style={{
              fontFamily: 'var(--body)',
              fontSize: '0.875rem',
              color: 'var(--muted)',
              margin: '0 0 1rem',
            }}>
              You received <strong style={{ color: 'var(--accent)' }}>{success.tokens} tokens</strong>!
            </p>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.75rem',
              color: 'var(--muted)',
            }}>
              Closing automatically...
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎟️</div>
              <h2 style={{
                fontFamily: 'var(--display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}>
                Redeem Code
              </h2>
              <p style={{
                fontFamily: 'var(--body)',
                fontSize: '0.875rem',
                color: 'var(--muted)',
                margin: '0.5rem 0 0',
              }}>
                Enter your promo code to receive free tokens
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Code Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Promo Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="ENTER-CODE"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'color-mix(in srgb, var(--base) 80%, #0D1117)',
                    border: `1px solid ${error ? '#E8A33D' : 'var(--border)'}`,
                    borderRadius: '6px',
                    fontFamily: 'var(--mono)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    letterSpacing: '0.1em',
                    textAlign: 'center',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    if (!error) e.target.style.borderColor = 'var(--accent)';
                  }}
                  onBlur={(e) => {
                    if (!error) e.target.style.borderColor = 'var(--border)';
                  }}
                  autoFocus
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'color-mix(in srgb, #E8A33D 10%, transparent)',
                  border: '1px solid color-mix(in srgb, #E8A33D 30%, transparent)',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.8125rem',
                  color: '#E8A33D',
                  marginBottom: '1rem',
                }}>
                  {error}
                </div>
              )}

              {/* Info */}
              <div style={{
                padding: '0.75rem 1rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontFamily: 'var(--mono)',
                fontSize: '0.75rem',
                color: 'var(--muted)',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}>
                ℹ️ Promo codes are case-insensitive and can only be used once per account.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'transparent',
                    color: 'var(--ink)',
                    border: '1px solid var(--border)',
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
                  type="submit"
                  disabled={!code.trim() || loading}
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    background: !code.trim() || loading ? 'var(--border)' : 'var(--accent)',
                    color: !code.trim() || loading ? 'var(--muted)' : 'var(--base)',
                    border: 'none',
                    borderRadius: '6px',
                    fontFamily: 'var(--mono)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: !code.trim() || loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Redeeming...' : 'Redeem Code'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
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
          ✕
        </button>
      </div>
    </div>
  );
}
