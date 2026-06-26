import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { UserProfile } from '../lib/auth';
import type { Auth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

interface AuthState {
  /** Is auth system still loading? */
  loading: boolean;
  /** Is the user signed in at all? */
  isSignedIn: boolean;
  /** GitHub username (null if not signed in or not GitHub auth) */
  githubUsername: string | null;
  /** Is this GitHub user in the approved_users Firestore collection? */
  isApproved: boolean;
  /** User profile from Firestore */
  profile: UserProfile | null;
  /** The raw Firebase user object (null if not signed in) */
  user: any;
  /** Sign in with Google */
  signInWithGoogle: () => Promise<void>;
  /** Sign in with GitHub */
  signInWithGitHub: () => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Refresh user profile from Firestore */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  loading: true,
  isSignedIn: false,
  githubUsername: null,
  isApproved: false,
  profile: null,
  user: null,
  signInWithGoogle: async () => {},
  signInWithGitHub: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

/** Hook to read auth state anywhere in the React tree */
export function useAuth(): AuthState {
  return useContext(AuthContext);
}

/**
 * AuthProvider — wraps the app with Firebase auth state.
 * Supports both Google and GitHub OAuth.
 *
 * IMPORTANT: Must be rendered with client:load in Astro.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Cache Firebase modules so signIn can call signInWithPopup synchronously
  // (async import() breaks the browser's "user gesture" detection and blocks popups)
  const authRef = useRef<Auth | null>(null);
  const authModRef = useRef<typeof import('firebase/auth') | null>(null);
  const googleProviderRef = useRef<GoogleAuthProvider | null>(null);
  const githubProviderRef = useRef<GithubAuthProvider | null>(null);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { getUserProfile } = await import('../lib/auth');
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
    } catch (e) {
      console.warn('Failed to refresh profile:', e);
    }
  };

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      try {
        const fb = await import('../lib/firebase');
        const authMod = await import('firebase/auth');
        const { getGitHubUsername, isApproved, createOrUpdateUserProfile, getUserProfile } = await import('../lib/auth');

        const auth = fb.getAuthInstance();
        if (!auth) {
          setLoading(false);
          return;
        }

        // Cache modules for signIn functions (must be sync for popup to work)
        authRef.current = auth;
        authModRef.current = authMod;
        googleProviderRef.current = fb.getGoogleProvider();
        githubProviderRef.current = fb.getGithubProvider();

        unsub = authMod.onAuthStateChanged(auth, async (u: any) => {
          setUser(u);
          if (u) {
            // Determine provider
            const provider = u.providerData?.[0]?.providerId;
            const authProvider = provider === 'google.com' ? 'google' : 'github';

            // Create or update user profile in Firestore
            try {
              const userProfile = await createOrUpdateUserProfile(u, authProvider);
              setProfile(userProfile);

              // Set GitHub username if available
              const username = userProfile.githubUsername || getGitHubUsername(u);
              setGithubUsername(username);

              // Check approval for GitHub users (legacy support)
              if (username) {
                const ok = await isApproved(username);
                setIsApproved(ok);
              } else {
                // Google users are auto-approved
                setIsApproved(true);
              }
            } catch (e) {
              console.warn('Failed to create/update profile:', e);
              // Fallback to legacy behavior
              const username = getGitHubUsername(u);
              setGithubUsername(username);
              if (username) {
                const ok = await isApproved(username);
                setIsApproved(ok);
              }
            }
          } else {
            setGithubUsername(null);
            setIsApproved(false);
            setProfile(null);
          }
          setLoading(false);
        });
      } catch (e) {
        console.warn('AuthProvider: Firebase not configured:', e);
        setLoading(false);
      }
    })();

    return () => { if (unsub) unsub(); };
  }, []);

  const signInWithGoogle = async () => {
    const auth = authRef.current;
    const authMod = authModRef.current;
    const provider = googleProviderRef.current;
    if (!auth || !authMod || !provider) {
      console.error('[Auth] Firebase not initialized yet — try again in a moment');
      return;
    }
    try {
      await authMod.signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('[Auth] Google sign-in failed:', err?.code, err?.message);
      alert(`Sign-in failed: ${err?.message || err}`);
    }
  };

  const signInWithGitHub = async () => {
    const auth = authRef.current;
    const authMod = authModRef.current;
    const provider = githubProviderRef.current;
    if (!auth || !authMod || !provider) {
      console.error('[Auth] Firebase not initialized yet — try again in a moment');
      return;
    }
    try {
      await authMod.signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('[Auth] GitHub sign-in failed:', err?.code, err?.message);
      alert(`Sign-in failed: ${err?.message || err}`);
    }
  };

  const signOut = async () => {
    const fb = await import('../lib/firebase');
    const authMod = await import('firebase/auth');
    const auth = fb.getAuthInstance();
    if (!auth) return;
    await authMod.signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        isSignedIn: !!user,
        githubUsername,
        isApproved,
        profile,
        user,
        signInWithGoogle,
        signInWithGitHub,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
