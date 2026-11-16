/**
 * Seeds the Firestore emulator with sample curriculum content.
 *
 * Usage (emulator must be running):
 *   npm run seed:emulator
 *
 * Uses the compat API because @firebase/rules-unit-testing exposes compat
 * Firestore instances (rules are bypassed via withSecurityRulesDisabled).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

import { DIALECTS, loadDialect } from './lib/vocabulary.mjs';

const projectId = process.env.GCLOUD_PROJECT ?? 'demo-amazigh-learning';
const rulesPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../firebase/firestore.rules',
);

const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: { rules: readFileSync(rulesPath, 'utf8') },
});

await testEnv.withSecurityRulesDisabled(async context => {
  const db = context.firestore();

  await db
    .collection('courses')
    .doc('azul-basics-a1')
    .set({
      title: { fr: 'Les bases de l’azul', en: 'Azul basics' },
      description: {
        fr: 'Premiers pas en tamazight : salutations et phrases essentielles.',
        en: 'First steps in Tamazight: greetings and essential phrases.',
      },
      dialect: 'tachelhit',
      level: 'A1',
      order: 1,
      imageUrl: 'https://example.com/courses/azul-basics-a1.webp',
      published: true,
      moduleCount: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  // NOTE: all linguistic content below is placeholder pending native-speaker
  // review (issue #85); exercise answers are not validated.

  await db
    .collection('courses')
    .doc('azul-basics-a1')
    .collection('modules')
    .doc('mod-1')
    .set({
      title: { fr: 'Module 1 — Premiers mots', en: 'Module 1 — First words' },
      order: 1,
      lessonCount: 2,
    });

  await db
    .collection('courses')
    .doc('azul-basics-a1')
    .collection('modules')
    .doc('mod-2')
    .set({
      title: { fr: 'Module 2 — Vie quotidienne', en: 'Module 2 — Daily life' },
      order: 2,
      lessonCount: 1,
    });

  await db
    .collection('courses')
    .doc('azul-basics-a1')
    .collection('modules')
    .doc('mod-1')
    .collection('lessons')
    .doc('lesson-1')
    .set({
      title: { fr: 'Salutations', en: 'Greetings' },
      order: 1,
      estimatedMinutes: 10,
      xpReward: 20,
      steps: [
        {
          type: 'content',
          title: { fr: 'Bonjour en tamazight', en: 'Hello in Tamazight' },
          body: {
            fr: '« Azul » est la façon la plus courante de dire bonjour.',
            en: '“Azul” is the most common way to say hello.',
          },
        },
        { type: 'exercise', exerciseId: 'ex-greeting-1' },
      ],
    });

  await db
    .collection('courses')
    .doc('azul-basics-a1')
    .collection('modules')
    .doc('mod-1')
    .collection('lessons')
    .doc('lesson-2')
    .set({
      title: { fr: 'Se présenter', en: 'Introducing yourself' },
      order: 2,
      estimatedMinutes: 12,
      xpReward: 25,
      steps: [
        {
          type: 'content',
          title: { fr: 'Dire son nom', en: 'Saying your name' },
          body: {
            fr: 'Structure de base : « ⵉⵙⴻⵎ / isem » pour « nom ».',
            en: 'Basic structure: “ⵉⵙⴻⵎ / isem” for “name”.',
          },
        },
        { type: 'exercise', exerciseId: 'ex-intro-1' },
      ],
    });

  await db
    .collection('courses')
    .doc('azul-basics-a1')
    .collection('modules')
    .doc('mod-2')
    .collection('lessons')
    .doc('lesson-3')
    .set({
      title: { fr: 'La famille', en: 'Family' },
      order: 1,
      estimatedMinutes: 15,
      xpReward: 30,
      steps: [
        {
          type: 'content',
          title: { fr: 'Membres de la famille', en: 'Family members' },
          body: {
            fr: 'Vocabulaire de base pour parler de la famille proche.',
            en: 'Basic vocabulary for talking about close family.',
          },
        },
        { type: 'exercise', exerciseId: 'ex-family-1' },
      ],
    });

  await db
    .collection('exercises')
    .doc('ex-greeting-1')
    .set({
      type: 'mcq',
      prompt: {
        tifinagh: 'ⴰⵣⵓⵍ',
        latin: 'azul',
        fr: '« ___ » signifie bonjour',
        en: '“___” means hello',
      },
      options: ['azul', 'agadir', 'amaziɣ'],
      answer: 'azul',
      audioPath: 'audio/sentences/tachelhit/ex-greeting-1.m4a',
      dialect: 'tachelhit',
    });

  await db
    .collection('exercises')
    .doc('ex-intro-1')
    .set({
      type: 'mcq',
      prompt: {
        fr: 'Comment dit-on « nom » en tamazight (latin) ?',
        en: 'How do you say “name” in Tamazight (Latin script)?',
      },
      options: ['isem', 'idurar', 'asif'],
      answer: 'isem',
      dialect: 'tachelhit',
    });

  await db
    .collection('exercises')
    .doc('ex-family-1')
    .set({
      type: 'mcq',
      prompt: {
        fr: 'Quel mot désigne la « mère » ? (placeholder)',
        en: 'Which word means “mother”? (placeholder)',
      },
      options: ['tamettut', 'argaz', 'aqcic'],
      answer: 'tamettut',
      dialect: 'tachelhit',
    });

  // Vocabulary starter lists from content/vocabulary/*.csv (all unvalidated, #85).
  let wordCount = 0;
  for (const dialect of DIALECTS) {
    const { entries, errors } = loadDialect(dialect);
    if (errors.length) {
      throw new Error(`Invalid ${dialect} vocabulary:\n${errors.join('\n')}`);
    }
    const batch = db.batch();
    for (const { id, ...word } of entries) {
      batch.set(db.collection('vocabulary').doc(id), word);
    }
    await batch.commit();
    wordCount += entries.length;
  }

  await db
    .collection('tifinaghLetters')
    .doc('ya')
    .set({
      glyph: 'ⴰ',
      unicode: 'U+2D30',
      name: 'ya',
      latin: 'a',
      ipa: '/a/',
      order: 1,
      examples: ['tachelhit-azul-intj'],
    });

  await db
    .collection('achievements')
    .doc('first-lesson')
    .set({
      title: { fr: 'Première leçon', en: 'First lesson' },
      description: {
        fr: 'Terminez votre première leçon',
        en: 'Complete your first lesson',
      },
      icon: 'star',
      criteria: { type: 'lessons', threshold: 1 },
    });

  console.log(
    `Seeded: 1 course (2 modules, 3 lessons), 3 exercises, ${wordCount} words (unvalidated), 1 letter, 1 achievement`,
  );
});

await testEnv.cleanup();
