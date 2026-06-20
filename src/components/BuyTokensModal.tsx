import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { createTokenOrder, TOKEN_PACKAGES } from '../lib/orders';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BuyTokensModal({ isOpen, onClose, onSuccess }: Props) {
  const { user, profile } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!user || !profile || selectedPackage === null) return;

    const pkg = TOKEN_PACKAGES[selectedPackage];
    setLoading(true);
    setError(null);

    try {
      await createTokenOrder(
        user.uid,
        profile.email,
        pkg.tokens,
        pkg.priceUSD
      );

      setSuccess(true);
      onSuccess();

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedPackage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create order. Please try again.');
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
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--base)',
        border: '1px solid #1D232B',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }} onClick={(e) => e.stopPropagation()}>

        {success ? (
          /* Success State */
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{
              fontFamily: 'var(--display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--accent)',
              margin: '0 0 0.5rem',
            }}>
              Order Submitted!
            </h3>
            <p style={{
              fontFamily: 'var(--body)',
              fontSize: '0.875rem',
              color: 'var(--muted)',
              margin: 0,
            }}>
              Your token purchase request has been submitted. An admin will review and add tokens to your account shortly.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪙</div>
              <h2 style={{
                fontFamily: 'var(--display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}>
                Buy Tokens
              </h2>
              <p style={{
                fontFamily: 'var(--body)',
                fontSize: '0.875rem',
                color: 'var(--muted)',
                margin: '0.5rem 0 0',
              }}>
                Select a token package to purchase
              </p>
            </div>

            {/* Current Balance */}
            <div style={{
              padding: '1rem',
              background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.75rem',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Current Balance
              </span>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--accent)',
                marginTop: '0.25rem',
              }}>
                🪙 {profile?.tokenBalance || 0} Tokens
              </div>
            </div>

            {/* Package Selection */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              {TOKEN_PACKAGES.map((pkg, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPackage(index)}
                  style={{
                    padding: '1rem',
                    background: selectedPackage === index
                      ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                      : 'var(--wash)',
                    border: `1px solid ${selectedPackage === index ? 'var(--accent)' : '#1D232B'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: selectedPackage === index ? 'var(--accent)' : 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem',
                  }}>
                    {pkg.label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    marginBottom: '0.25rem',
                  }}>
                    {pkg.tokens} Tokens
                  </div>
                  <div style={{
                    fontFamily: 'var(--body)',
                    fontSize: '0.875rem',
                    color: 'var(--muted)',
                  }}>
                    ${pkg.priceUSD.toFixed(2)} USD
                  </div>
                </button>
              ))}
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

            {/* Info Message */}
            <div style={{
              padding: '0.75rem 1rem',
              background: 'var(--wash)',
              border: '1px solid #1D232B',
              borderRadius: '6px',
              fontFamily: 'var(--mono)',
              fontSize: '0.75rem',
              color: 'var(--muted)',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}>
              ℹ️ <strong>How it works:</strong> After submitting your request, an admin will review and approve it.
              Tokens will be added to your account once approved. This usually takes less than 24 hours.
            </div>

            {/* Action Buttons */}
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
                onClick={handleSubmit}
                disabled={selectedPackage === null || loading}
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  background: selectedPackage === null || loading
                    ? '#1D232B'
                    : 'var(--accent)',
                  color: selectedPackage === null || loading
                    ? 'var(--muted)'
                    : 'var(--base)',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: selectedPackage === null || loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Submitting...' : 'Submit Purchase Request'}
              </button>
            </div>
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
