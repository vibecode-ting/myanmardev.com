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
        gap: '0.4rem',
      }}>
        {/* Buy Tokens Button */}
        <button
          onClick={() => setShowBuyModal(true)}
          style={{
            padding: '4px 10px',
            background: 'var(--accent)',
            color: 'var(--base)',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'var(--mono)',
            fontSize: '0.625rem',
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--accent-dim)';
            e.currentTarget.style.boxShadow = '0 0 12px var(--glow)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'var(--accent)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          + Buy
        </button>

        {/* Redeem Code Button */}
        <button
          onClick={() => setShowRedeemModal(true)}
          style={{
            padding: '4px 10px',
            background: 'transparent',
            color: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontFamily: 'var(--mono)',
            fontSize: '0.625rem',
            fontWeight: 600,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--muted)';
          }}
        >
          Redeem
        </button>
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
