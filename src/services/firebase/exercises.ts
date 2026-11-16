import { doc, getDoc, type Firestore } from 'firebase/firestore';

import type { Exercise } from '@/types';

import { getFirestoreDb } from './client';
import { fail, ok, type ServiceResult } from './result';

/** Top-level `exercises/{exerciseId}` documents (DATABASE_SCHEMA.md). */
export async function getExercise(
  exerciseId: string,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<Exercise | null>> {
  try {
    const snap = await getDoc(doc(db, 'exercises', exerciseId));
    return ok(
      snap.exists()
        ? { id: snap.id, ...(snap.data() as Omit<Exercise, 'id'>) }
        : null,
    );
  } catch (error) {
    return fail(error);
  }
}
