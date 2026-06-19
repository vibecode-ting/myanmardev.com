/**
 * Firestore Utility Service
 *
 * Provides typed CRUD operations for interacting with Firestore collections.
 * Use these helpers in your React components or Astro pages (client-side).
 *
 * Example usage:
 *   import { getDocuments, addDocument } from '../lib/firestore';
 *   const posts = await getDocuments<Post>('posts');
 *   await addDocument('posts', { title: 'Hello', content: 'World' });
 */

import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type QueryConstraint,
  type Timestamp,
  type DocumentSnapshot,
  type QuerySnapshot,
} from 'firebase/firestore';

// ─── Generic CRUD ────────────────────────────────────────

/** Fetch all documents from a collection */
export async function getDocuments<T = DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  try {
    const q = constraints.length
      ? query(collection(db, collectionName), ...constraints)
      : query(collection(db, collectionName));
    const snapshot: QuerySnapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (T & { id: string })[];
  } catch (error) {
    console.error(`[Firestore] Error fetching ${collectionName}:`, error);
    return [];
  }
}

/** Fetch a single document by ID */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<(T & { id: string }) | null> {
  try {
    const snapshot: DocumentSnapshot = await getDoc(doc(db, collectionName, documentId));
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
  } catch (error) {
    console.error(`[Firestore] Error fetching document ${documentId}:`, error);
    return null;
  }
}

/** Add a new document (auto-generated ID) */
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`[Firestore] Error adding document to ${collectionName}:`, error);
    return null;
  }
}

/** Update an existing document */
export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<boolean> {
  try {
    await updateDoc(doc(db, collectionName, documentId), {
      ...data,
      updatedAt: new Date().toISOString(),
    } as DocumentData);
    return true;
  } catch (error) {
    console.error(`[Firestore] Error updating document ${documentId}:`, error);
    return false;
  }
}

/** Delete a document */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<boolean> {
  try {
    await deleteDoc(doc(db, collectionName, documentId));
    return true;
  } catch (error) {
    console.error(`[Firestore] Error deleting document ${documentId}:`, error);
    return false;
  }
}

// ─── Query Helpers ────────────────────────────────────────

/** Query documents where a field equals a value */
export function whereEqual(field: string, value: unknown) {
  return where(field, '==', value);
}

/** Order documents by a field */
export function orderByField(field: string, direction: 'asc' | 'desc' = 'desc') {
  return orderBy(field, direction);
}

/** Limit the number of results */
export function limitResults(n: number) {
  return limit(n);
}

// ─── Type Helpers ─────────────────────────────────────────

/** Convert a Firestore Timestamp to a JS Date */
export function timestampToDate(ts: Timestamp): Date {
  return ts.toDate();
}

/** Type for documents with standard timestamps */
export interface Timestamped {
  createdAt?: string;
  updatedAt?: string;
}
