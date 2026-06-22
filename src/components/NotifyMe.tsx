import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { getDB } from '../lib/firebase';

interface Props {
  productName: string;
  productId: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function NotifyMe({ productName, productId }: Props) {
  const { isSignedIn, profile } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if already subscribed
  useEffect(() => {
    if (!isSignedIn || !profile) return;

    const checkSubscription = async () => {
      try {
        const db = getDB();
        const subRef = doc(
          db,
          'product_notifications',
          productId,
          'subscribers',
          profile.email
        );
        const snap = await getDoc(subRef);
        if (snap.exists()) {
          setAlreadySubscribed(true);
        }
      } catch (err) {
        // Silently fail — don't block the UI
        console.warn('Failed to check notification subscription:', err);
      }
    };

    checkSubscription();
  }, [isSignedIn, profile, productId]);

  const handleSubscribe = async (subscriberEmail: string) => {
    if (!subscriberEmail.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const db = getDB();
      const subRef = doc(
        db,
        'product_notifications',
        productId,
        'subscribers',
        subscriberEmail.trim().toLowerCase()
      );

      await setDoc(subRef, {
        email: subscriberEmail.trim().toLowerCase(),
        productId,
        productName,
        subscribedAt: Timestamp.now(),
        uid: profile?.uid || null,
      });

      setStatus('success');
      setAlreadySubscribed(true);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to subscribe. Please try again.');
    }
  };

  const handleClick = () => {
    if (alreadySubscribed || status === 'success') return;

    if (isSignedIn && profile?.email) {
      // Auto-subscribe with the logged-in user's email
      handleSubscribe(profile.email);
    } else {
      // Show email input for anonymous users
      setShowEmailInput(true);
    }
  };

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubscribe(email);
  };

  // Already subscribed state
  if (alreadySubscribed || status === 'success') {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'color-mix(in srgb, #22c55e 10%, transparent)',
        border: '1px solid color-mix(in srgb, #22c55e 25%, transparent)',
        borderRadius: '6px',
        fontFamily: 'var(--mono)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: '#22c55e',
      }}>
        <span>✓</span>
        We'll notify you when {productName} launches!
      </div>
    );
  }

  // Email input state (for non-logged-in users)
  if (showEmailInput) {
    return (
      <form
        onSubmit={handleSubmitEmail}
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorMsg('');
          }}
          placeholder="your@email.com"
          required
          autoFocus
          disabled={status === 'loading'}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'color-mix(in srgb, var(--base) 80%, #0D1117)',
            border: `1px solid ${errorMsg ? '#E8A33D' : '#1D232B'}`,
            borderRadius: '6px',
            fontFamily: 'var(--mono)',
            fontSize: '0.8125rem',
            color: 'var(--ink)',
            outline: 'none',
            transition: 'border-color 0.2s',
            minWidth: '200px',
          }}
          onFocus={(e) => {
            if (!errorMsg) e.target.style.borderColor = 'var(--accent)';
          }}
          onBlur={(e) => {
            if (!errorMsg) e.target.style.borderColor = '#1D232B';
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          style={{
            padding: '0.5rem 1rem',
            background: status === 'loading' || !email.trim() ? '#1D232B' : 'var(--accent)',
            color: status === 'loading' || !email.trim() ? 'var(--muted)' : 'var(--base)',
            border: 'none',
            borderRadius: '6px',
            fontFamily: 'var(--mono)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: status === 'loading' || !email.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowEmailInput(false);
            setEmail('');
            setErrorMsg('');
          }}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'transparent',
            color: 'var(--muted)',
            border: '1px solid #1D232B',
            borderRadius: '6px',
            fontFamily: 'var(--mono)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Cancel
        </button>
        {errorMsg && (
          <div style={{
            width: '100%',
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
            color: '#E8A33D',
            marginTop: '0.25rem',
          }}>
            {errorMsg}
          </div>
        )}
      </form>
    );
  }

  // Default button state
  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'transparent',
        color: 'var(--ink)',
        border: '1px solid #1D232B',
        borderRadius: '6px',
        fontFamily: 'var(--mono)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: status === 'loading' ? 0.7 : 1,
      }}
      onMouseOver={(e) => {
        if (status !== 'loading') {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent)';
        }
      }}
      onMouseOut={(e) => {
        if (status !== 'loading') {
          e.currentTarget.style.borderColor = '#1D232B';
          e.currentTarget.style.color = 'var(--ink)';
        }
      }}
    >
      {status === 'loading' ? (
        'Subscribing...'
      ) : (
        <>
          <span>🔔</span>
          Notify Me When Available
        </>
      )}
    </button>
  );
}
