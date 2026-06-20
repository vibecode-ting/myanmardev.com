import { doc, getDoc, setDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { getDB } from './firebase';

// ─── User Profile Types ─────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: 'google' | 'github';
  githubUsername?: string;
  tokenBalance: number;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// ─── User Profile Functions ─────────────────────────────

/**
 * Create or update user profile in Firestore on login
 */
export async function createOrUpdateUserProfile(user: any, provider: 'google' | 'github'): Promise<UserProfile> {
  const db = getDB();
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const now = Timestamp.now();

  if (userSnap.exists()) {
    // Update existing user
    const updateData: any = {
      lastLoginAt: now,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
    };

    // Update GitHub username if signing in with GitHub
    if (provider === 'github') {
      const githubUsername = extractGithubUsername(user);
      if (githubUsername) {
        updateData.githubUsername = githubUsername;
      }
    }

    await updateDoc(userRef, updateData);

    return { ...userSnap.data(), ...updateData } as UserProfile;
  } else {
    // Create new user with 0 tokens
    const githubUsername = provider === 'github' ? extractGithubUsername(user) : undefined;

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      provider,
      githubUsername: githubUsername || undefined,
      tokenBalance: 0,
      createdAt: now,
      lastLoginAt: now,
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getDB();
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
}

/**
 * Update user token balance (atomic increment)
 */
export async function updateTokenBalance(uid: string, amount: number): Promise<void> {
  const db = getDB();
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    tokenBalance: increment(amount),
  });
}

/**
 * Deduct tokens from user balance (returns false if insufficient)
 */
export async function deductTokens(uid: string, amount: number): Promise<boolean> {
  const profile = await getUserProfile(uid);
  if (!profile || profile.tokenBalance < amount) {
    return false;
  }
  await updateTokenBalance(uid, -amount);
  return true;
}

/**
 * Extract GitHub username from Firebase user object
 */
function extractGithubUsername(user: any): string | null {
  // Try providerData first
  for (const provider of user.providerData || []) {
    if (provider.providerId === 'github.com') {
      // GitHub username is in the email (username@github.com) or displayName
      if (provider.email && provider.email.endsWith('@github.com')) {
        return provider.email.replace('@github.com', '');
      }
      // Sometimes it's in the displayName
      if (provider.displayName) {
        return provider.displayName.toLowerCase().replace(/\s+/g, '');
      }
    }
  }

  // Fallback: try to extract from email
  if (user.email && user.email.endsWith('@github.com')) {
    return user.email.replace('@github.com', '');
  }

  return null;
}

/**
 * Legacy: Check if GitHub user is approved (kept for backward compatibility)
 */
export async function isApproved(username: string): Promise<boolean> {
  const db = getDB();
  const ref = doc(db, 'approved_users', username.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists();
}

/**
 * Legacy: Get GitHub username from user (kept for backward compatibility)
 */
export function getGitHubUsername(user: any): string | null {
  return extractGithubUsername(user);
}
