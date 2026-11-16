import { readFileSync } from 'node:fs';
import path from 'node:path';

import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import { getCourse, listCourses } from '@/services/firebase/courses';
import { listVocabulary } from '@/services/firebase/vocabulary';
import { updateLearningPreferences } from '@/services/firebase/users';
import { AppError } from '@/utils/errors';

const PROJECT_ID = 'demo-amazigh-learning';

let testEnv: RulesTestEnvironment;
let adminDb: Firestore;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(path.resolve(__dirname, '../../firebase/firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async db => {
    adminDb = db;
    await setDoc(doc(db, 'courses', 'c1'), {
      title: { fr: 'Bases', en: 'Basics' },
      description: { fr: '…', en: '…' },
      dialect: 'tachelhit',
      level: 'A1',
      order: 1,
      published: true,
      moduleCount: 1,
    });
    await setDoc(doc(db, 'courses', 'c2'), {
      title: { fr: 'Brouillon', en: 'Draft' },
      dialect: 'tachelhit',
      level: 'A1',
      order: 2,
      published: false,
      moduleCount: 0,
    });
    await setDoc(doc(db, 'courses', 'c3'), {
      title: { fr: 'Tarifit 1', en: 'Tarifit 1' },
      dialect: 'tarifit',
      level: 'A1',
      order: 1,
      published: true,
      moduleCount: 0,
    });
    await setDoc(doc(db, 'vocabulary', 'w1'), {
      text: { tifinagh: 'ⴰⵣⵓⵍ', latin: 'azul' },
      translations: { fr: 'Bonjour', en: 'Hello' },
      dialect: 'tachelhit',
      validated: true,
      category: 'greetings',
    });
    await setDoc(doc(db, 'vocabulary', 'w2'), {
      text: { tifinagh: 'ⴰⵎⴰⵣⵉⵖ', latin: 'amaziɣ' },
      translations: { fr: 'Liberté', en: 'Freedom' },
      dialect: 'tachelhit',
      validated: false,
      category: 'greetings',
    });
    await setDoc(doc(db, 'users', 'alice'), {
      displayName: 'Alice',
      dialect: 'tachelhit',
      uiLanguage: 'fr',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });
});

describe('courses service', () => {
  it('lists only published courses ordered by order', async () => {
    const result = await listCourses({}, adminDb);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map(c => c.id)).toEqual(['c1', 'c3']);
    }
  });

  it('filters by dialect', async () => {
    const result = await listCourses({ dialect: 'tarifit' }, adminDb);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map(c => c.id)).toEqual(['c3']);
    }
  });

  it('gets a single course or null', async () => {
    const found = await getCourse('c1', adminDb);
    expect(found.ok && found.data?.id).toBe('c1');
    const missing = await getCourse('nope', adminDb);
    expect(missing.ok && missing.data).toBeNull();
  });
});

describe('vocabulary service', () => {
  it('returns only validated words', async () => {
    const result = await listVocabulary({}, adminDb);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map(v => v.id)).toEqual(['w1']);
    }
  });
});

describe('users service', () => {
  it('updates learning preferences through security rules', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const result = await updateLearningPreferences(
      'alice',
      { dialect: 'tamazight', uiLanguage: 'en', learningGoal: 'travel', dailyGoalMinutes: 15 },
      aliceDb,
    );
    expect(result.ok).toBe(true);

    const { getUserProfile } = await import('@/services/firebase/users');
    const profile = await getUserProfile('alice', adminDb);
    expect(profile.ok && profile.data?.dialect).toBe('tamazight');
    expect(profile.ok && profile.data?.uiLanguage).toBe('en');
  });

  it('maps errors to typed results', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    // bob's document does not exist → Firestore rejects the update
    const result = await updateLearningPreferences(
      'bob',
      { dialect: 'tachelhit', uiLanguage: 'fr', learningGoal: null, dailyGoalMinutes: 10 },
      aliceDb,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AppError);
    }
  });
});
