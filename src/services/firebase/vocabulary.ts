import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import type { DialectId, VocabularyItem } from '@/types';

import { getFirestoreDb } from './client';
import { fail, ok, type ServiceResult } from './result';

export interface ListVocabularyOptions {
  dialect?: DialectId;
  category?: string;
  maxResults?: number;
}

export async function listVocabulary(
  options: ListVocabularyOptions = {},
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<VocabularyItem[]>> {
  try {
    const constraints: QueryConstraint[] = [where('validated', '==', true)];
    if (options.dialect) {
      constraints.push(where('dialect', '==', options.dialect));
    }
    if (options.category) {
      constraints.push(where('category', '==', options.category));
    }
    constraints.push(limit(options.maxResults ?? 50));
    const snap = await getDocs(
      query(collection(db, 'vocabulary'), ...constraints),
    );
    return ok(
      snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<VocabularyItem, 'id'>),
      })),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function getVocabularyItem(
  wordId: string,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<VocabularyItem | null>> {
  try {
    const snap = await getDoc(doc(db, 'vocabulary', wordId));
    return ok(
      snap.exists()
        ? { id: snap.id, ...(snap.data() as Omit<VocabularyItem, 'id'>) }
        : null,
    );
  } catch (error) {
    return fail(error);
  }
}
