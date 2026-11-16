import { collection, getDocs } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import type { Achievement } from '@/types';

import { getFirestoreDb } from './client';
import { fail, ok, type ServiceResult } from './result';

/** All published achievements, in server order. */
export async function listAchievements(
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<Achievement[]>> {
  try {
    const snap = await getDocs(collection(db, 'achievements'));
    return ok(
      snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Achievement, 'id'>),
      })),
    );
  } catch (error) {
    return fail(error);
  }
}
