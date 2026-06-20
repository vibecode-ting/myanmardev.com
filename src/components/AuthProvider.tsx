import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../lib/auth';

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
    const fb = await import('../lib/firebase');
    const authMod = await import('firebase/auth');
    const auth = fb.getAuthInstance();
    if (!auth) return;
    const provider = fb.getGoogleProvider();
    await authMod.signInWithPopup(auth, provider);
  };

  const signInWithGitHub = async () => {
    const fb = await import('../lib/firebase');
    const authMod = await import('firebase/auth');
    const auth = fb.getAuthInstance();
    if (!auth) return;
    const provider = fb.getGithubProvider();
    await authMod.signInWithPopup(auth, provider);
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
