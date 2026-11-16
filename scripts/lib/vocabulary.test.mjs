import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isTifinagh, latinToTifinagh } from './tifinagh.mjs';
import { DIALECTS, loadDialect } from './vocabulary.mjs';

test('transliterates common words', () => {
  assert.equal(latinToTifinagh('azul'), 'ⴰⵣⵓⵍ');
  assert.equal(latinToTifinagh('tamazirt'), 'ⵜⴰⵎⴰⵣⵉⵔⵜ');
  assert.equal(latinToTifinagh('tamɣart'), 'ⵜⴰⵎⵖⴰⵔⵜ');
});

test('handles emphatics and labialisation', () => {
  assert.equal(latinToTifinagh('kraḍ'), 'ⴽⵔⴰⴹ');
  assert.equal(latinToTifinagh('kkuẓ'), 'ⴽⴽⵓⵥ');
  assert.equal(latinToTifinagh('aseggʷas'), 'ⴰⵙⴻⴳⴳⵯⴰⵙ');
});

test('rejects unsupported characters', () => {
  assert.throws(() => latinToTifinagh('azul!'), /Unsupported character/);
  assert.throws(() => latinToTifinagh('ö'), /Unsupported character/);
});

test('isTifinagh accepts only Tifinagh and spaces', () => {
  assert.equal(isTifinagh('ⴰⵣⵓⵍ ⴼⵍⵍⴰⵡⵏ'), true);
  assert.equal(isTifinagh('azul'), false);
});

test('all dialect CSVs load without errors and stay unvalidated', () => {
  for (const dialect of DIALECTS) {
    const { entries, errors } = loadDialect(dialect);
    assert.deepEqual(errors, [], `${dialect} errors`);
    assert.ok(entries.length > 0, `${dialect} has entries`);
    for (const entry of entries) {
      assert.equal(entry.validated, false);
      assert.equal(entry.dialect, dialect);
      assert.ok(isTifinagh(entry.text.tifinagh), entry.id);
    }
  }
});
