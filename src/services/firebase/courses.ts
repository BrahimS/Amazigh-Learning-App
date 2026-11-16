import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import type { Course, DialectId } from '@/types';

import { getFirestoreDb } from './client';
import { fail, ok, type ServiceResult } from './result';

export interface ListCoursesOptions {
  /** Filter by dialect; omit to list all published courses. */
  dialect?: DialectId;
}

function courseFromSnapshot(id: string, data: Record<string, unknown>): Course {
  return { id, ...(data as Omit<Course, 'id'>) };
}

export async function listCourses(
  options: ListCoursesOptions = {},
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<Course[]>> {
  try {
    const constraints: QueryConstraint[] = [
      where('published', '==', true),
      orderBy('order', 'asc'),
    ];
    if (options.dialect) {
      constraints.push(where('dialect', '==', options.dialect));
    }
    const snap = await getDocs(
      query(collection(db, 'courses'), ...constraints),
    );
    return ok(snap.docs.map(d => courseFromSnapshot(d.id, d.data())));
  } catch (error) {
    return fail(error);
  }
}

export async function getCourse(
  courseId: string,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<Course | null>> {
  try {
    const snap = await getDoc(doc(db, 'courses', courseId));
    return ok(snap.exists() ? courseFromSnapshot(snap.id, snap.data()) : null);
  } catch (error) {
    return fail(error);
  }
}
