/**
 * Loads and validates the vocabulary seed CSVs in content/vocabulary/.
 *
 * CSV columns: latin,fr,en,partOfSpeech,category[,exampleLatin,exampleFr,exampleEn]
 * Values must not contain commas (use " / " for alternatives).
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isTifinagh, latinToTifinagh } from './tifinagh.mjs';

export const CONTENT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../content/vocabulary',
);

export const DIALECTS = ['tachelhit', 'tamazight', 'tarifit'];

export const CATEGORIES = [
  'greetings',
  'numbers',
  'family',
  'food',
  'animals',
  'colors',
  'body',
  'verbs',
  'time',
  'nature',
  'house',
  'adjectives',
  'places',
];

export const PARTS_OF_SPEECH = ['n', 'v', 'adj', 'num', 'intj', 'adv', 'pron'];

const HEADER =
  'latin,fr,en,partOfSpeech,category,exampleLatin,exampleFr,exampleEn';

function slug(latin) {
  return latin
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ɣ/g, 'gh')
    .replace(/ɛ/g, 'e')
    .replace(/ʷ/g, 'w')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * @returns {{ entries: object[], errors: string[] }}
 */
export function loadDialect(dialect) {
  const file = path.join(CONTENT_DIR, `${dialect}.csv`);
  const lines = readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
  const errors = [];
  const entries = [];
  const seen = new Set();

  if (lines[0] !== HEADER) {
    errors.push(`${dialect}: header must be "${HEADER}"`);
    return { entries, errors };
  }

  lines.slice(1).forEach((line, idx) => {
    const where = `${dialect}.csv:${idx + 2}`;
    const cols = line.split(',').map(c => c.trim());
    if (cols.length < 5 || cols.length > 8) {
      errors.push(`${where}: expected 5-8 columns, got ${cols.length}`);
      return;
    }
    const [latin, fr, en, partOfSpeech, category, exLatin, exFr, exEn] = cols;
    if (!latin || !fr || !en) {
      errors.push(`${where}: latin, fr and en are required`);
      return;
    }
    if (!PARTS_OF_SPEECH.includes(partOfSpeech)) {
      errors.push(`${where}: unknown partOfSpeech "${partOfSpeech}"`);
    }
    if (!CATEGORIES.includes(category)) {
      errors.push(`${where}: unknown category "${category}"`);
    }
    const id = `${dialect}-${slug(latin)}-${partOfSpeech}`;
    if (seen.has(id)) {
      errors.push(`${where}: duplicate entry "${latin}" (${partOfSpeech})`);
      return;
    }
    seen.add(id);

    let tifinagh;
    try {
      tifinagh = latinToTifinagh(latin);
    } catch (e) {
      errors.push(`${where}: ${e.message}`);
      return;
    }
    if (!isTifinagh(tifinagh)) {
      errors.push(`${where}: generated Tifinagh is invalid`);
      return;
    }

    const entry = {
      id,
      text: { tifinagh, latin },
      translations: { fr, en },
      dialect,
      partOfSpeech,
      category,
      validated: false,
    };
    if (exLatin) {
      try {
        entry.examples = [
          {
            text: { tifinagh: latinToTifinagh(exLatin), latin: exLatin },
            translations: { fr: exFr ?? '', en: exEn ?? '' },
          },
        ];
      } catch (e) {
        errors.push(`${where}: example ${e.message}`);
      }
    }
    entries.push(entry);
  });

  return { entries, errors };
}

export function listDialectFiles() {
  return readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.csv'))
    .map(f => f.replace(/\.csv$/, ''));
}
