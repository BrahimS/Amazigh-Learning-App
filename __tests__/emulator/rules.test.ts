import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';

const PROJECT_ID = 'demo-amazigh-learning';

let testEnv: RulesTestEnvironment;

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
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

function context(uid: string, claims: Record<string, unknown> = {}) {
  return testEnv.authenticatedContext(uid, claims).firestore();
}

describe('users collection', () => {
  it('denies reads to unauthenticated users', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'users', 'alice')));
  });

  it('allows a user to read and update their own profile', async () => {
    const aliceDb = context('alice');
    await testEnv.withSecurityRulesDisabled(async admin => {
      const adminDb = admin.firestore();
      await setDoc(doc(adminDb, 'users', 'alice'), {
        displayName: 'Alice',
        xp: 10,
      });
    });

    await assertSucceeds(getDoc(doc(aliceDb, 'users', 'alice')));
    await assertSucceeds(
      updateDoc(doc(aliceDb, 'users', 'alice'), {
        dialect: 'tachelhit',
        uiLanguage: 'fr',
      }),
    );
  });

  it("denies reading another user's profile", async () => {
    const aliceDb = context('alice');
    const bobDb = context('bob');
    await testEnv.withSecurityRulesDisabled(async admin => {
      const adminDb = admin.firestore();
      await setDoc(doc(adminDb, 'users', 'alice'), { displayName: 'Alice' });
    });

    await assertFails(getDoc(doc(bobDb, 'users', 'alice')));
    await assertSucceeds(getDoc(doc(aliceDb, 'users', 'alice')));
  });

  it('denies changing role or xp directly', async () => {
    const aliceDb = context('alice');
    await testEnv.withSecurityRulesDisabled(async admin => {
      const adminDb = admin.firestore();
      await setDoc(doc(adminDb, 'users', 'alice'), {
        displayName: 'Alice',
        role: 'learner',
        xp: 10,
      });
    });

    await assertFails(
      updateDoc(doc(aliceDb, 'users', 'alice'), { role: 'admin' }),
    );
    await assertFails(updateDoc(doc(aliceDb, 'users', 'alice'), { xp: 9999 }));
  });

  it('denies creating a profile with a role', async () => {
    const aliceDb = context('alice');
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'alice'), {
        displayName: 'Alice',
        role: 'admin',
      }),
    );
    await assertSucceeds(
      setDoc(doc(aliceDb, 'users', 'alice'), {
        displayName: 'Alice',
        dialect: 'tamazight',
      }),
    );
  });

  it('allows admins to read any profile', async () => {
    const adminDb = context('admin1', { role: 'admin' });
    await testEnv.withSecurityRulesDisabled(async admin => {
      await setDoc(doc(admin.firestore(), 'users', 'alice'), {
        displayName: 'Alice',
      });
    });

    await assertSucceeds(getDoc(doc(adminDb, 'users', 'alice')));
  });
});

describe('content collections', () => {
  it('allows signed-in users to read courses but not write them', async () => {
    const aliceDb = context('alice');
    await testEnv.withSecurityRulesDisabled(async admin => {
      const adminDb = admin.firestore();
      await setDoc(doc(adminDb, 'courses', 'c1'), {
        title: 'Basics',
        published: true,
      });
    });

    await assertSucceeds(getDoc(doc(aliceDb, 'courses', 'c1')));
    await assertFails(setDoc(doc(aliceDb, 'courses', 'c2'), { title: 'Nope' }));
  });

  it('lets contributors create vocabulary drafts but not learners', async () => {
    const learnerDb = context('learner1');
    const contributorDb = context('contrib1', { role: 'contributor' });

    await assertFails(
      setDoc(doc(learnerDb, 'vocabulary', 'w1'), {
        text: { tifinagh: 'ⴰ' },
        validated: false,
      }),
    );
    await assertSucceeds(
      setDoc(doc(contributorDb, 'vocabulary', 'w1'), {
        text: { tifinagh: 'ⴰ' },
        validated: false,
      }),
    );
  });

  it('denies unauthenticated access to reference content', async () => {
    const anonymousDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anonymousDb, 'tifinaghLetters', 'ya')));
  });
});
