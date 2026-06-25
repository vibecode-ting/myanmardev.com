import React, { useState, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import SignInModal from './SignInModal';

const styles: Record<string, React.CSSProperties> = {
  loading: {
    fontSize: '0.6875rem',
    color: 'var(--muted)',
    fontFamily: 'var(--mono)',
    letterSpacing: '0.05em',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  avatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    border: '1.5px solid var(--border-accent)',
    objectFit: 'cover' as const,
  },
  avatarFallback: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: 'var(--accent)',
    fontFamily: 'var(--mono)',
  },
  userName: {
    fontSize: '0.6875rem',
    color: 'var(--ink)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '90px',
    fontFamily: 'var(--mono)',
    fontWeight: 600,
    letterSpacing: '0.01em',
  },
  tokenBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '4px',
    fontFamily: 'var(--mono)',
    fontSize: '0.6875rem',
    fontWeight: 600,
    background: 'var(--glow)',
    color: 'var(--accent)',
    border: '1px solid var(--border-accent)',
    letterSpacing: '0.02em',
  },
  signOutBtn: {
    padding: '3px 8px',
    fontSize: '0.625rem',
    background: 'transparent',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    fontFamily: 'var(--mono)',
    fontWeight: 600,
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    transition: 'all 0.15s ease',
  },
  signInBtn: {
    padding: '5px 12px',
    fontSize: '0.6875rem',
    background: 'var(--accent)',
    color: 'var(--base)',
    border: 'none',
    borderRadius: '5px',
    fontFamily: 'var(--mono)',
    fontWeight: 600,
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    transition: 'all 0.2s ease',
  },
};

export default function AuthButton() {
  const { loading, isSignedIn, profile, signInWithGoogle, signInWithGitHub, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleSignInClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setShowModal(false);
    await signInWithGoogle();
  }, [signInWithGoogle]);

  const handleGitHubSignIn = useCallback(async () => {
    setShowModal(false);
    await signInWithGitHub();
  }, [signInWithGitHub]);

  if (loading) {
    return <span style={styles.loading}>···</span>;
  }

  if (isSignedIn && profile) {
    return (
      <>
        <div style={styles.container}>
          {/* User Avatar */}
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.displayName}
              style={styles.avatar}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div style={styles.avatarFallback}>
              {(profile.displayName || profile.email || '?')[0].toUpperCase()}
            </div>
          )}

          {/* Username */}
          <span style={styles.userName} className="auth-username">
            {profile.displayName || profile.email?.split('@')[0]}
          </span>

          {/* Token Balance */}
          <span style={styles.tokenBadge}>
            🪙 {profile.tokenBalance}
          </span>

          {/* Sign Out Button */}
          <button
            onClick={signOut}
            style={styles.signOutBtn}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--muted)';
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Sign In Modal (for re-auth scenarios) */}
        <SignInModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSignInGoogle={handleGoogleSignIn}
          onSignInGitHub={handleGitHubSignIn}
        />

        <style>{`
          @media (max-width: 720px) {
            .auth-username { display: none !important; }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleSignInClick}
        style={styles.signInBtn}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--accent-dim)';
          e.currentTarget.style.boxShadow = '0 0 16px var(--glow)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'var(--accent)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Sign In
      </button>

      <SignInModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSignInGoogle={handleGoogleSignIn}
        onSignInGitHub={handleGitHubSignIn}
      />
    </>
  );
}
