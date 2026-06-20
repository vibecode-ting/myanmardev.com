import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  /** Children to render when user is signed in AND approved */
  children: React.ReactNode;
  /** Fallback shown when not signed in or not approved */
  fallback?: React.ReactNode;
  /** Optional className for the wrapper */
  className?: string;
}

/**
 * AuthGuard — gates content behind GitHub sign-in + Firestore approval.
 *
 * Listens for auth state via onAuthStateChanged and checks the
 * approved_users Firestore collection. Shows children only when
 * the user is both authenticated and approved.
 *
 * Must be rendered with client:load in Astro.
 */
export default function AuthGuard({ children, fallback, className }: Props) {
  const [state, setState] = useState<'loading' | 'unauthenticated' | 'pending' | 'approved'>('loading');
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      try {
        const fb = await import('../lib/firebase');
        const authMod = await import('firebase/auth');
        const { getGitHubUsername, isApproved } = await import('../lib/auth');

        const auth = fb.getAuthInstance();
        if (!auth) {
          setState('unauthenticated');
          return;
        }

        unsub = authMod.onAuthStateChanged(auth, async (u: any) => {
          if (!u) {
            setState('unauthenticated');
            setUsername(null);
            return;
          }

          const ghUsername = getGitHubUsername(u);
          setUsername(ghUsername);

          if (!ghUsername) {
            setState('unauthenticated');
            return;
          }

          const ok = await isApproved(ghUsername);
          setState(ok ? 'approved' : 'pending');
        });
      } catch (e) {
        console.warn('AuthGuard: Firebase not configured:', e);
        setState('unauthenticated');
      }
    })();

    return () => { if (unsub) unsub(); };
  }, []);

  if (state === 'loading') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '.8125rem', color: 'var(--muted)' }}>
          Loading...
        </span>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return (
      <>
        {fallback || (
          <div style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            border: '1px solid #1D232B',
            borderRadius: '10px',
            background: 'var(--wash)',
            maxWidth: '480px',
            margin: '0 auto',
          }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '.75rem',
              color: 'var(--accent)',
              marginBottom: '.8rem',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}>
              🔐 Sign In Required
            </div>
            <p style={{
              color: 'color-mix(in srgb, var(--ink) 60%, transparent)',
              fontSize: '.875rem',
              margin: 0,
            }}>
              Sign in with your GitHub account to access this product.
              Only pre-approved accounts can use our services.
            </p>
          </div>
        )}
      </>
    );
  }

  if (state === 'pending') {
    return (
      <>
        {fallback || (
          <div style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            border: '1px solid color-mix(in srgb, #E8A33D 30%, transparent)',
            borderRadius: '10px',
            background: 'color-mix(in srgb, #E8A33D 6%, transparent)',
            maxWidth: '480px',
            margin: '0 auto',
          }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '.75rem',
              color: '#E8A33D',
              marginBottom: '.8rem',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}>
              ⏳ Awaiting Approval
            </div>
            <p style={{
              color: 'color-mix(in srgb, var(--ink) 60%, transparent)',
              fontSize: '.875rem',
              margin: 0,
            }}>
              Your GitHub account <strong style={{ color: 'var(--ink)' }}>{username}</strong> is
              not yet approved. Contact the admin to get access.
            </p>
          </div>
        )}
      </>
    );
  }

  return <div className={className}>{children}</div>;
}
