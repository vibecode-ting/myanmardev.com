import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import SignInModal from './SignInModal';
import BuyTokensModal from './BuyTokensModal';
import PaymentModal from './PaymentModal';

interface Props {
  productName: string;
  tokenCost: number;
  productSlug: string;
}

type ModalState = 'closed' | 'signin' | 'buyTokens' | 'payment' | 'success';

export default function OrderButton({ productName, tokenCost, productSlug }: Props) {
  const { isSignedIn, profile, signInWithGoogle, signInWithGitHub, refreshProfile } = useAuth();
  const [modal, setModal] = useState<ModalState>('closed');
  const [successMsg, setSuccessMsg] = useState(false);

  const tokenBalance = profile?.tokenBalance ?? 0;

  const handleClick = () => {
    // 1. Check sign-in
    if (!isSignedIn) {
      setModal('signin');
      return;
    }

    // 2. Check token balance
    if (tokenBalance < tokenCost) {
      setModal('buyTokens');
      return;
    }

    // 3. All good — open payment modal
    setModal('payment');
  };

  const handlePaymentComplete = () => {
    setModal('closed');
    setSuccessMsg(true);
    refreshProfile();
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  return (
    <>
      <button
        className="btn"
        onClick={handleClick}
        style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
      >
        Order Now
      </button>

      {/* Success message (inline, not a modal) */}
      {successMsg && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            borderRadius: '6px',
            fontFamily: 'var(--mono)',
            fontSize: '0.8125rem',
            color: 'var(--accent)',
            textAlign: 'center',
          }}
        >
          Order confirmed! Your product is being provisioned.
        </div>
      )}

      {/* Sign-in modal */}
      <SignInModal
        isOpen={modal === 'signin'}
        onClose={() => setModal('closed')}
        onSignInGoogle={async () => {
          await signInWithGoogle();
          setModal('closed');
        }}
        onSignInGitHub={async () => {
          await signInWithGitHub();
          setModal('closed');
        }}
      />

      {/* Buy tokens modal (for insufficient balance) */}
      <BuyTokensModal
        isOpen={modal === 'buyTokens'}
        onClose={() => setModal('closed')}
        onSuccess={() => {
          refreshProfile();
          // After buying tokens, re-check and open payment if now sufficient
          setModal('closed');
        }}
      />

      {/* Payment modal */}
      <PaymentModal
        isOpen={modal === 'payment'}
        onClose={() => setModal('closed')}
        productName={productName}
        tokenCost={tokenCost}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
}
