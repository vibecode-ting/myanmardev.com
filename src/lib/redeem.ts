import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { getDB } from './firebase';

// ─── Redeem Code Types ──────────────────────────────────

export interface RedeemCode {
  code: string;
  tokenAmount: number;
  maxUses: number;
  currentUses: number;
  usedBy: string[];
  expiresAt: Timestamp | null;
  createdAt: Timestamp;
  createdBy: string;
  description?: string;
}

export interface RedeemResult {
  success: boolean;
  tokens?: number;
  error?: string;
}

// ─── Redeem Functions ────────────────────────────────────

/**
 * Redeem a code for tokens
 */
export async function redeemCode(userId: string, code: string): Promise<RedeemResult> {
  const db = getDB();
  const codeUpper = code.trim().toUpperCase();

  // Get the redeem code document
  const codeRef = doc(db, 'redeemCodes', codeUpper);
  const codeSnap = await getDoc(codeRef);

  if (!codeSnap.exists()) {
    return { success: false, error: 'Invalid redeem code' };
  }

  const codeData = codeSnap.data() as RedeemCode;

  // Check if code has expired
  if (codeData.expiresAt && codeData.expiresAt.toMillis() < Date.now()) {
    return { success: false, error: 'This code has expired' };
  }

  // Check if code has been fully used
  if (codeData.currentUses >= codeData.maxUses) {
    return { success: false, error: 'This code has been fully redeemed' };
  }

  // Check if user has already used this code
  if (codeData.usedBy.includes(userId)) {
    return { success: false, error: 'You have already redeemed this code' };
  }

  // Redeem the code (atomic operations)
  try {
    // 1. Mark code as used by this user
    await updateDoc(codeRef, {
      currentUses: increment(1),
      usedBy: arrayUnion(userId),
    });

    // 2. Add tokens to user balance
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      tokenBalance: increment(codeData.tokenAmount),
    });

    // 3. Record the redemption
    const redeemHistoryRef = doc(db, 'userRedeems', userId);
    const redeemHistorySnap = await getDoc(redeemHistoryRef);

    if (redeemHistorySnap.exists()) {
      await updateDoc(redeemHistoryRef, {
        redeems: arrayUnion({
          code: codeUpper,
          tokens: codeData.tokenAmount,
          redeemedAt: Timestamp.now(),
        }),
      });
    } else {
      await setDoc(redeemHistoryRef, {
        userId,
        redeems: [{
          code: codeUpper,
          tokens: codeData.tokenAmount,
          redeemedAt: Timestamp.now(),
        }],
      });
    }

    return { success: true, tokens: codeData.tokenAmount };
  } catch (err: any) {
    console.error('Redeem failed:', err);
    return { success: false, error: 'Failed to redeem code. Please try again.' };
  }
}

/**
 * Get redeem code details (for admin)
 */
export async function getRedeemCodeDetails(code: string): Promise<RedeemCode | null> {
  const db = getDB();
  const codeRef = doc(db, 'redeemCodes', code.toUpperCase());
  const codeSnap = await getDoc(codeRef);

  if (codeSnap.exists()) {
    return codeSnap.data() as RedeemCode;
  }
  return null;
}

/**
 * Check if a user has already redeemed a specific code
 */
export async function hasUserRedeemedCode(userId: string, code: string): Promise<boolean> {
  const db = getDB();
  const codeRef = doc(db, 'redeemCodes', code.toUpperCase());
  const codeSnap = await getDoc(codeRef);

  if (codeSnap.exists()) {
    const codeData = codeSnap.data() as RedeemCode;
    return codeData.usedBy.includes(userId);
  }
  return false;
}
