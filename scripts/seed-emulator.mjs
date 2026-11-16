/**
 * Seeds the Firestore emulator with sample curriculum content.
 *
 * Usage (emulator must be running):
 *   npm run seed:emulator
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';

const projectId = process.env.GCLOUD_PROJECT ?? 'demo-amazigh-learning';
const rulesPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../firebase/firestore.rules',
);

const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: { rules: readFileSync(rulesPath, 'utf8') },
});

await testEnv.withSecurityRulesDisabled(async db => {
  await setDoc(doc(db, 'courses', 'azul-basics-a1'), {
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

  await setDoc(doc(db, 'courses', 'azul-basics-a1', 'modules', 'mod-1'), {
    title: { fr: 'Module 1 — Premiers mots', en: 'Module 1 — First words' },
    order: 1,
    lessonCount: 1,
  });

  await setDoc(doc(db, 'courses', 'azul-basics-a1', 'modules', 'mod-1', 'lessons', 'lesson-1'), {
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

  await setDoc(doc(db, 'exercises', 'ex-greeting-1'), {
    type: 'mcq',
    prompt: { tifinagh: 'ⵄⵣⵓⵍ', latin: 'azul', fr: '« ___ » signifie bonjour', en: '“___” means hello' },
    options: ['azul', 'agadir', 'amaziɣ'],
    answer: 'azul',
    audioPath: 'audio/sentences/tachelhit/ex-greeting-1.m4a',
    dialect: 'tachelhit',
  });

  await setDoc(doc(db, 'vocabulary', 'word-azul'), {
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

  await setDoc(doc(db, 'tifinaghLetters', 'ya'), {
    glyph: 'ⵢ',
    unicode: 'U+2D62',
    name: 'ya',
    latin: 'y',
    ipa: '/j/',
    order: 2,
    examples: ['word-azul'],
  });

  await setDoc(doc(db, 'achievements', 'first-lesson'), {
    title: { fr: 'Première leçon', en: 'First lesson' },
    description: { fr: 'Terminez votre première leçon', en: 'Complete your first lesson' },
    icon: 'star',
    criteria: { type: 'lessons', threshold: 1 },
  });

  console.log('Seeded: 1 course, 1 module, 1 lesson, 1 exercise, 1 word, 1 letter, 1 achievement');
});

await testEnv.cleanup();
