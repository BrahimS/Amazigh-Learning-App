/**
 * Latin → Tifinagh (IRCAM / Unicode Neo-Tifinagh) transliteration.
 *
 * Deterministic and dependency-free so it can run in plain Node (seed and
 * validation scripts). Labialisation is written with ʷ (e.g. "gʷ" → ⴳⵯ).
 */
const MULTI = [
  ['gʷ', 'ⴳⵯ'],
  ['kʷ', 'ⴽⵯ'],
];

const SINGLE = {
  a: 'ⴰ',
  b: 'ⴱ',
  c: 'ⵛ',
  d: 'ⴷ',
  ḍ: 'ⴹ',
  e: 'ⴻ',
  ɛ: 'ⵄ',
  f: 'ⴼ',
  g: 'ⴳ',
  ɣ: 'ⵖ',
  h: 'ⵀ',
  ḥ: 'ⵃ',
  i: 'ⵉ',
  j: 'ⵊ',
  k: 'ⴽ',
  l: 'ⵍ',
  m: 'ⵎ',
  n: 'ⵏ',
  q: 'ⵇ',
  r: 'ⵔ',
  ṛ: 'ⵕ',
  s: 'ⵙ',
  ṣ: 'ⵚ',
  t: 'ⵜ',
  ṭ: 'ⵟ',
  u: 'ⵓ',
  w: 'ⵡ',
  x: 'ⵅ',
  y: 'ⵢ',
  z: 'ⵣ',
  ẓ: 'ⵥ',
};

const PASSTHROUGH = new Set([' ', '-', '’', "'"]);

/**
 * @param {string} latin lowercase Latin-script Amazigh
 * @returns {string} Tifinagh text
 * @throws {Error} on characters outside the supported alphabet
 */
export function latinToTifinagh(latin) {
  const input = latin.normalize('NFC').toLowerCase();
  let out = '';
  let i = 0;
  while (i < input.length) {
    const multi = MULTI.find(([src]) => input.startsWith(src, i));
    if (multi) {
      out += multi[1];
      i += multi[0].length;
      continue;
    }
    const ch = input[i];
    if (SINGLE[ch]) {
      out += SINGLE[ch];
    } else if (PASSTHROUGH.has(ch)) {
      out += ch === '-' ? ' ' : ch === '’' || ch === "'" ? '' : ch;
    } else {
      throw new Error(`Unsupported character "${ch}" in "${latin}"`);
    }
    i += 1;
  }
  return out;
}

const TIFINAGH_RANGE = /^[\u2D30-\u2D7F ]+$/u;

/** True if the string only contains Tifinagh block characters and spaces. */
export function isTifinagh(text) {
  return TIFINAGH_RANGE.test(text);
}
