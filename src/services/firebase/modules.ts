import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type Firestore,
} from 'firebase/firestore';

import type { CourseModule, Lesson } from '@/types';

import { getFirestoreDb } from './client';
import { fail, ok, type ServiceResult } from './result';

function modulesCollection(courseId: string, db: Firestore) {
  return collection(db, 'courses', courseId, 'modules');
}

function lessonsCollection(courseId: string, moduleId: string, db: Firestore) {
  return collection(db, 'courses', courseId, 'modules', moduleId, 'lessons');
}

export async function listModules(
  courseId: string,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<CourseModule[]>> {
  try {
    const snap = await getDocs(
      query(modulesCollection(courseId, db), orderBy('order', 'asc')),
    );
    return ok(
      snap.docs.map(d => ({
        id: d.id,
        courseId,
        ...d.data(),
      })) as CourseModule[],
    );
  } catch (error) {
    return fail(error);
  }
}

export async function listLessons(
  courseId: string,
  moduleId: string,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<Lesson[]>> {
  try {
    const snap = await getDocs(
      query(lessonsCollection(courseId, moduleId, db), orderBy('order', 'asc')),
    );
    return ok(
      snap.docs.map(d => ({
        id: d.id,
        courseId,
        moduleId,
        ...d.data(),
      })) as Lesson[],
    );
  } catch (error) {
    return fail(error);
  }
}

export async function getLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<Lesson | null>> {
  try {
    const snap = await getDoc(
      doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId),
    );
    if (!snap.exists()) {
      return ok(null);
    }
    return ok({
      id: snap.id,
      courseId,
      moduleId,
      ...(snap.data() as Omit<Lesson, 'id' | 'courseId' | 'moduleId'>),
    });
  } catch (error) {
    return fail(error);
  }
}
