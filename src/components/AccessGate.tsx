import React from 'react';
import { useAuth } from './AuthProvider';

interface Props {
  children: React.ReactNode;
  /** Custom fallback when user is not signed in */
  signInFallback?: React.ReactNode;
  /** Custom fallback when user is signed in but not approved */
  pendingFallback?: React.ReactNode;
}

/**
 * AccessGate — shows children only when the user is signed in
 * with GitHub AND their username is in the approved_users Firestore
 * collection.
 *
 * Must be used inside an AuthProvider.
 */
export default function AccessGate({ children, signInFallback, pendingFallback }: Props) {
  const { loading, isSignedIn, githubUsername, isApproved } = useAuth();

  // Still loading auth state — show nothing (or a spinner)
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '.8125rem', color: 'var(--muted)' }}>
          Loading...
        </span>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <>
        {signInFallback ?? (
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

  // Signed in but not approved
  if (!isApproved) {
    return (
      <>
        {pendingFallback ?? (
          <div style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            border: '1px solid color-mix(in srgb, #E8A33D 30%, transparent)',
            borderRadius: '10px',
            background: 'color-mix(in srgb, #E8A33D 6%, transparent)',
            maxWidth: '520px',
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
              lineHeight: 1.7,
            }}>
              Your GitHub account{' '}
              <strong style={{ color: 'var(--ink)', fontFamily: 'var(--mono)' }}>{githubUsername}</strong>
              {' '}is not yet approved. Contact the administrator to get access.
            </p>
          </div>
        )}
      </>
    );
  }

  // Approved — render children
  return <>{children}</>;
}
