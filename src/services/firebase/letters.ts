import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import type { TifinaghLetter } from '@/types';

import { getFirestoreDb } from './client';
import { fail, ok, type ServiceResult } from './result';

/** All Tifinagh letters, sorted by their teaching order. */
export async function listLetters(
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<TifinaghLetter[]>> {
  try {
    const snap = await getDocs(collection(db, 'tifinaghLetters'));
    return ok(
      snap.docs
        .map(d => ({
          id: d.id,
          ...(d.data() as Omit<TifinaghLetter, 'id'>),
        }))
        .sort((a, b) => a.order - b.order),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function getLetter(
  letterId: string,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<TifinaghLetter | null>> {
  try {
    const snap = await getDoc(doc(db, 'tifinaghLetters', letterId));
    return ok(
      snap.exists()
        ? { id: snap.id, ...(snap.data() as Omit<TifinaghLetter, 'id'>) }
        : null,
    );
  } catch (error) {
    return fail(error);
  }
}
