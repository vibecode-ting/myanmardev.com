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
  avatarBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    lineHeight: 0,
    borderRadius: '50%',
    transition: 'box-shadow 0.2s ease',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1.5px solid var(--border-accent)',
    objectFit: 'cover' as const,
  },
  avatarFallback: {
    width: '28px',
    height: '28px',
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

function getDashboardPath(): string {
  if (typeof window === 'undefined') return '/en/dashboard';
  return window.location.pathname.startsWith('/my') ? '/my' : '/en/dashboard';
}

export default function AuthButton() {
  const { loading, isSignedIn, profile, signInWithGoogle, signInWithGitHub, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignInClick = useCallback(() => {
    setShowModal(true);
    setError(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setError(null);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setShowModal(false);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err?.message || 'Sign-in failed');
    }
  }, [signInWithGoogle]);

  const handleGitHubSignIn = useCallback(async () => {
    setShowModal(false);
    setError(null);
    try {
      await signInWithGitHub();
    } catch (err: any) {
      console.error('GitHub sign-in error:', err);
      setError(err?.message || 'Sign-in failed');
    }
  }, [signInWithGitHub]);

  const goToProfile = useCallback(() => {
    window.location.href = getDashboardPath();
  }, []);

  if (loading) {
    return <span style={styles.loading}>···</span>;
  }

  if (isSignedIn && profile) {
    return (
      <>
        <div style={styles.container}>
          {/* Profile Avatar — clickable → dashboard */}
          <button
            onClick={goToProfile}
            style={styles.avatarBtn}
            title="Profile settings"
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
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
          </button>

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
