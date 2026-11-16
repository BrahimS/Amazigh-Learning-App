import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  signInAnonymously,
  type Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import { getCourse, listCourses } from '@/services/firebase/courses';
import {
  getLesson,
  listLessons,
  listModules,
} from '@/services/firebase/modules';
import {
  getUserProfile,
  updateLearningPreferences,
} from '@/services/firebase/users';
import { listVocabulary } from '@/services/firebase/vocabulary';
import { AppError } from '@/utils/errors';

const PROJECT_ID = 'demo-amazigh-learning';

let testEnv: RulesTestEnvironment;
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let uid: string;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(
        path.resolve(__dirname, '../../firebase/firestore.rules'),
        'utf8',
      ),
    },
  });

  // The Auth SDK requires an apiKey even when talking to the emulators.
  app = initializeApp(
    { projectId: PROJECT_ID, apiKey: 'fake-api-key' },
    'services-test',
  );
  db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const credential = await signInAnonymously(auth);
  uid = credential.user.uid;
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async admin => {
    const adminDb = admin.firestore();
    await setDoc(doc(adminDb as never, 'courses', 'c1'), {
      title: { fr: 'Bases', en: 'Basics' },
      description: { fr: '…', en: '…' },
      dialect: 'tachelhit',
      level: 'A1',
      order: 1,
      published: true,
      moduleCount: 1,
    });
    await setDoc(doc(adminDb as never, 'courses', 'c2'), {
      title: { fr: 'Brouillon', en: 'Draft' },
      dialect: 'tachelhit',
      level: 'A1',
      order: 2,
      published: false,
      moduleCount: 0,
    });
    await setDoc(doc(adminDb as never, 'courses', 'c3'), {
      title: { fr: 'Tarifit 1', en: 'Tarifit 1' },
      dialect: 'tarifit',
      level: 'A1',
      order: 1,
      published: true,
      moduleCount: 0,
    });
    await setDoc(doc(adminDb as never, 'courses', 'c1', 'modules', 'm1'), {
      title: { fr: 'Module 1', en: 'Module 1' },
      order: 1,
      lessonCount: 2,
    });
    await setDoc(doc(adminDb as never, 'courses', 'c1', 'modules', 'm2'), {
      title: { fr: 'Module 2', en: 'Module 2' },
      order: 2,
      lessonCount: 1,
    });
    await setDoc(
      doc(adminDb as never, 'courses', 'c1', 'modules', 'm1', 'lessons', 'l1'),
      {
        title: { fr: 'Leçon 1', en: 'Lesson 1' },
        order: 1,
        estimatedMinutes: 10,
        xpReward: 20,
        steps: [
          {
            type: 'content',
            title: { fr: 'Intro', en: 'Intro' },
            body: { fr: '…', en: '…' },
          },
          { type: 'exercise', exerciseId: 'ex-1' },
        ],
      },
    );
    await setDoc(
      doc(adminDb as never, 'courses', 'c1', 'modules', 'm1', 'lessons', 'l2'),
      {
        title: { fr: 'Leçon 2', en: 'Lesson 2' },
        order: 2,
        estimatedMinutes: 12,
        xpReward: 25,
        steps: [{ type: 'exercise', exerciseId: 'ex-2' }],
      },
    );
    await setDoc(
      doc(adminDb as never, 'courses', 'c1', 'modules', 'm2', 'lessons', 'l3'),
      {
        title: { fr: 'Leçon 3', en: 'Lesson 3' },
        order: 1,
        estimatedMinutes: 15,
        xpReward: 30,
        steps: [],
      },
    );
    await setDoc(doc(adminDb as never, 'vocabulary', 'w1'), {
      text: { tifinagh: 'ⴰⵣⵓⵍ', latin: 'azul' },
      translations: { fr: 'Bonjour', en: 'Hello' },
      dialect: 'tachelhit',
      validated: true,
      category: 'greetings',
    });
    await setDoc(doc(adminDb as never, 'vocabulary', 'w2'), {
      text: { tifinagh: 'ⴰⵎⴰⵣⵉⵖ', latin: 'amaziɣ' },
      translations: { fr: 'Liberté', en: 'Freedom' },
      dialect: 'tachelhit',
      validated: false,
      category: 'greetings',
    });
    await setDoc(doc(adminDb as never, 'users', uid), {
      displayName: 'Test User',
      dialect: 'tachelhit',
      uiLanguage: 'fr',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });
});

describe('courses service', () => {
  it('lists only published courses ordered by order', async () => {
    const result = await listCourses({}, db);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map(c => c.id)).toEqual(['c1', 'c3']);
    }
  });

  it('filters by dialect', async () => {
    const result = await listCourses({ dialect: 'tarifit' }, db);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map(c => c.id)).toEqual(['c3']);
    }
  });

  it('gets a single course or null', async () => {
    const found = await getCourse('c1', db);
    expect(found.ok && found.data?.id).toBe('c1');
    const missing = await getCourse('nope', db);
    expect(missing.ok && missing.data).toBeNull();
  });
});

describe('modules service', () => {
  it('lists modules of a course ordered by order', async () => {
    const result = await listModules('c1', db);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map(m => m.id)).toEqual(['m1', 'm2']);
      expect(result.data[0].courseId).toBe('c1');
      expect(result.data[0].lessonCount).toBe(2);
    }
  });

  it('lists lessons of a module ordered by order', async () => {
    const result = await listLessons('c1', 'm1', db);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map(l => l.id)).toEqual(['l1', 'l2']);
      expect(result.data[0].moduleId).toBe('m1');
    }
  });

  it('gets a lesson with its steps or null', async () => {
    const found = await getLesson('c1', 'm1', 'l1', db);
    expect(found.ok && found.data?.id).toBe('l1');
    if (found.ok && found.data) {
      expect(found.data.steps).toHaveLength(2);
      expect(found.data.steps[1]).toEqual({
        type: 'exercise',
        exerciseId: 'ex-1',
      });
    }
    const missing = await getLesson('c1', 'm1', 'nope', db);
    expect(missing.ok && missing.data).toBeNull();
  });
});

describe('vocabulary service', () => {
  it('returns only validated words', async () => {
    const result = await listVocabulary({}, db);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map(v => v.id)).toEqual(['w1']);
    }
  });

  it('includes unvalidated words only when asked', async () => {
    const result = await listVocabulary(
      { dialect: 'tachelhit', includeUnvalidated: true },
      db,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map(v => v.id).sort()).toEqual(['w1', 'w2']);
    }
  });
});

describe('users service', () => {
  it('updates own learning preferences through security rules', async () => {
    const result = await updateLearningPreferences(
      uid,
      {
        dialect: 'tamazight',
        uiLanguage: 'en',
        learningGoal: 'travel',
        dailyGoalMinutes: 15,
      },
      db,
    );
    expect(result.ok).toBe(true);

    const profile = await getUserProfile(uid, db);
    expect(profile.ok && profile.data?.dialect).toBe('tamazight');
    expect(profile.ok && profile.data?.uiLanguage).toBe('en');
  });

  it('maps errors to typed results', async () => {
    // Updating a document that does not exist is rejected by Firestore.
    const result = await updateLearningPreferences(
      'missing-user',
      {
        dialect: 'tachelhit',
        uiLanguage: 'fr',
        learningGoal: null,
        dailyGoalMinutes: 10,
      },
      db,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AppError);
    }
  });
});
