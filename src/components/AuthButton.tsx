import React, { useState, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import SignInModal from './SignInModal';

const styles: Record<string, React.CSSProperties> = {
  loading: { fontSize: '.75rem', color: 'var(--muted)', fontFamily: 'var(--mono)' },
  container: { display: 'flex', alignItems: 'center', gap: '.6rem' },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '2px solid color-mix(in srgb, var(--accent) 50%, transparent)',
  },
  userName: {
    fontSize: '.75rem',
    color: 'var(--ink)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100px',
    fontFamily: 'var(--mono)',
    fontWeight: 600,
  },
  tokenBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontFamily: 'var(--mono)',
    fontSize: '.75rem',
    fontWeight: 700,
    background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
    color: 'var(--accent)',
    border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
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
    return <span style={styles.loading}>...</span>;
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
            <div style={{
              ...styles.avatar,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--base)',
            }}>
              {(profile.displayName || profile.email || '?')[0].toUpperCase()}
            </div>
          )}

          {/* Username */}
          <span style={styles.userName}>
            {profile.displayName || profile.email?.split('@')[0]}
          </span>

          {/* Token Balance */}
          <span style={styles.tokenBadge}>
            🪙 {profile.tokenBalance}
          </span>

          {/* Sign Out Button */}
          <button
            onClick={signOut}
            className="btn btn--ghost"
            style={{ padding: '.35rem .8rem', fontSize: '.6875rem' }}
          >
            Sign Out
          </button>
        </div>

        {/* Sign In Modal */}
        <SignInModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSignInGoogle={handleGoogleSignIn}
          onSignInGitHub={handleGitHubSignIn}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleSignInClick}
        className="btn"
        style={{ padding: '.4rem .9rem', fontSize: '.6875rem' }}
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
