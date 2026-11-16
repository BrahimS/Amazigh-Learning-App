import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import type { CultureArticle, CultureCategory } from '@/types';

import { getFirestoreDb } from './client';
import { fail, ok, type ServiceResult } from './result';

export interface ListArticlesOptions {
  category?: CultureCategory;
  maxResults?: number;
}

/** Published culture articles, optionally filtered by category. */
export async function listArticles(
  options: ListArticlesOptions = {},
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<CultureArticle[]>> {
  try {
    const constraints: QueryConstraint[] = [where('published', '==', true)];
    if (options.category) {
      constraints.push(where('category', '==', options.category));
    }
    const snap = await getDocs(
      query(collection(db, 'cultureArticles'), ...constraints),
    );
    const articles = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<CultureArticle, 'id'>),
    }));
    articles.sort((a, b) => a.title.localeCompare(b.title));
    return ok(
      options.maxResults ? articles.slice(0, options.maxResults) : articles,
    );
  } catch (error) {
    return fail(error);
  }
}

export async function getArticle(
  articleId: string,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<CultureArticle | null>> {
  try {
    const snap = await getDoc(doc(db, 'cultureArticles', articleId));
    return ok(
      snap.exists()
        ? { id: snap.id, ...(snap.data() as Omit<CultureArticle, 'id'>) }
        : null,
    );
  } catch (error) {
    return fail(error);
  }
}
