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
      moduleCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  await db
    .collection('courses')
    .doc('azul-basics-a1')
    .collection('modules')
    .doc('mod-1')
    .set({
      title: { fr: 'Module 1 — Premiers mots', en: 'Module 1 — First words' },
      order: 1,
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
    .collection('exercises')
    .doc('ex-greeting-1')
    .set({
      type: 'mcq',
      prompt: {
        tifinagh: 'ⵄⵣⵓⵍ',
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
    .collection('vocabulary')
    .doc('word-azul')
    .set({
      text: { tifinagh: 'ⴰⵣⵓⵍ', latin: 'azul' },
      translations: { fr: 'Bonjour', en: 'Hello' },
      dialect: 'tachelhit',
      partOfSpeech: 'interjection',
      category: 'greetings',
      examples: [
        {
          text: { tifinagh: 'ⴰⵣⵓⵍ ⵏⵉⵖ', latin: 'azul nigh' },
          translations: { fr: 'Bonjour (informel)', en: 'Hello (informal)' },
        },
      ],
      audioPath: 'audio/words/tachelhit/word-azul.m4a',
      validated: true,
      validatedBy: 'seed',
    });

  await db
    .collection('tifinaghLetters')
    .doc('ya')
    .set({
      glyph: 'ⵢ',
      unicode: 'U+2D62',
      name: 'ya',
      latin: 'y',
      ipa: '/j/',
      order: 2,
      examples: ['word-azul'],
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
    'Seeded: 1 course, 1 module, 1 lesson, 1 exercise, 1 word, 1 letter, 1 achievement',
  );
});

await testEnv.cleanup();
