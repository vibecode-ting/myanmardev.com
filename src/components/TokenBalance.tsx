import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import BuyTokensModal from './BuyTokensModal';
import RedeemCodeModal from './RedeemCodeModal';

export default function TokenBalance() {
  const { isSignedIn, profile, refreshProfile } = useAuth();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  if (!isSignedIn || !profile) return null;

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        {/* Token Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
          borderRadius: '24px',
        }}>
          <span style={{ fontSize: '1.1rem' }}>🪙</span>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--accent)',
          }}>
            {profile.tokenBalance}
          </span>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.6875rem',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Tokens
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowBuyModal(true)}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--accent)',
              color: 'var(--base)',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'var(--mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Buy Tokens
          </button>

          <button
            onClick={() => setShowRedeemModal(true)}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              color: 'var(--ink)',
              border: '1px solid #1D232B',
              borderRadius: '6px',
              fontFamily: 'var(--mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#1D232B';
              e.currentTarget.style.color = 'var(--ink)';
            }}
          >
            Redeem Code
          </button>
        </div>
      </div>

      {/* Modals */}
      <BuyTokensModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={refreshProfile}
      />

      <RedeemCodeModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onSuccess={refreshProfile}
      />
    </>
  );
}
