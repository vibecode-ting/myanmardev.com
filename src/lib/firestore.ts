import { getDB } from './firebase';
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

export async function getDocuments<T = DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  try {
    const q = constraints.length
      ? query(collection(getDB(), collectionName), ...constraints)
      : query(collection(getDB(), collectionName));
    const snapshot: QuerySnapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as (T & { id: string })[];
  } catch (error) {
    console.error(`[Firestore] Error fetching ${collectionName}:`, error);
    return [];
  }
}

export async function getDocument<T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<(T & { id: string }) | null> {
  try {
    const snapshot: DocumentSnapshot = await getDoc(doc(getDB(), collectionName, documentId));
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
  } catch (error) {
    console.error(`[Firestore] Error fetching ${documentId}:`, error);
    return null;
  }
}

export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(getDB(), collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`[Firestore] Error adding to ${collectionName}:`, error);
    return null;
  }
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<boolean> {
  try {
    await updateDoc(doc(getDB(), collectionName, documentId), {
      ...data,
      updatedAt: new Date().toISOString(),
    } as DocumentData);
    return true;
  } catch (error) {
    console.error(`[Firestore] Error updating ${documentId}:`, error);
    return false;
  }
}

export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<boolean> {
  try {
    await deleteDoc(doc(getDB(), collectionName, documentId));
    return true;
  } catch (error) {
    console.error(`[Firestore] Error deleting ${documentId}:`, error);
    return false;
  }
}

export function whereEqual(field: string, value: unknown) {
  return where(field, '==', value);
}

export function orderByField(field: string, direction: 'asc' | 'desc' = 'desc') {
  return orderBy(field, direction);
}

export function limitResults(n: number) {
  return limit(n);
}

export function timestampToDate(ts: Timestamp): Date {
  return ts.toDate();
}

export interface Timestamped {
  createdAt?: string;
  updatedAt?: string;
}
