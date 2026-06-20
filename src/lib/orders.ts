import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getDB } from './firebase';

// ─── Order Types ─────────────────────────────────────────

export type OrderType = 'token_purchase' | 'subdomain' | 'website' | 'portfolio';
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface TokenOrder {
  id?: string;
  userId: string;
  userEmail: string;
  type: 'token_purchase';
  tokenAmount: number;
  priceUSD: number;
  status: OrderStatus;
  createdAt: Timestamp;
  processedAt?: Timestamp;
  notes?: string;
}

export interface ProductOrder {
  id?: string;
  userId: string;
  userEmail: string;
  type: 'subdomain' | 'website' | 'portfolio';
  tokensUsed: number;
  details: {
    subdomain?: string;
    platform?: string;
    sourceUrl?: string;
    [key: string]: any;
  };
  status: OrderStatus;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export type Order = TokenOrder | ProductOrder;

// ─── Token Packages ─────────────────────────────────────

export const TOKEN_PACKAGES = [
  { tokens: 5, priceUSD: 2.50, label: 'Starter' },
  { tokens: 10, priceUSD: 4.00, label: 'Basic' },
  { tokens: 25, priceUSD: 8.00, label: 'Pro' },
  { tokens: 50, priceUSD: 12.00, label: 'Business' },
];

// ─── Order Functions ─────────────────────────────────────

/**
 * Create a token purchase order (requires admin approval)
 */
export async function createTokenOrder(
  userId: string,
  userEmail: string,
  tokenAmount: number,
  priceUSD: number
): Promise<string> {
  const db = getDB();
  const ordersRef = collection(db, 'orders');

  const order: Omit<TokenOrder, 'id'> = {
    userId,
    userEmail,
    type: 'token_purchase',
    tokenAmount,
    priceUSD,
    status: 'pending',
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(ordersRef, order);
  return docRef.id;
}

/**
 * Create a product order (deducts tokens immediately)
 */
export async function createProductOrder(
  userId: string,
  userEmail: string,
  productType: 'subdomain' | 'website' | 'portfolio',
  tokensUsed: number,
  details: Record<string, any>
): Promise<string> {
  const db = getDB();
  const ordersRef = collection(db, 'orders');

  const order: Omit<ProductOrder, 'id'> = {
    userId,
    userEmail,
    type: productType,
    tokensUsed,
    details,
    status: 'completed',
    createdAt: Timestamp.now(),
    completedAt: Timestamp.now(),
  };

  const docRef = await addDoc(ordersRef, order);
  return docRef.id;
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const db = getDB();
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];
}

/**
 * Get pending token orders (admin function)
 */
export async function getPendingTokenOrders(): Promise<TokenOrder[]> {
  const db = getDB();
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('type', '==', 'token_purchase'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TokenOrder[];
}

/**
 * Update order status (admin function)
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<void> {
  const db = getDB();
  const orderRef = doc(db, 'orders', orderId);

  const updateData: any = {
    status,
    processedAt: Timestamp.now(),
  };

  if (notes) {
    updateData.notes = notes;
  }

  // Note: This requires admin permissions or updated Firestore rules
  // For now, we'll use the admin script to update order status
  await import('firebase/firestore').then(({ updateDoc }) =>
    updateDoc(orderRef, updateData)
  );
}
