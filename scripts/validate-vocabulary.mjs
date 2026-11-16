/**
 * Validates content/vocabulary/*.csv and reports counts per dialect.
 *
 *   npm run validate:vocabulary
 *
 * Exits non-zero on schema errors. Counts below the MVP target (100 per
 * dialect, issue #77) are reported as warnings, not errors.
 */
import { DIALECTS, listDialectFiles, loadDialect } from './lib/vocabulary.mjs';

const TARGET_PER_DIALECT = 100;

let failed = false;
const files = listDialectFiles();

for (const dialect of DIALECTS) {
  if (!files.includes(dialect)) {
    console.error(`✖ missing content/vocabulary/${dialect}.csv`);
    failed = true;
    continue;
  }
  const { entries, errors } = loadDialect(dialect);
  errors.forEach(e => console.error(`✖ ${e}`));
  if (errors.length) {
    failed = true;
  }
  const status = entries.length >= TARGET_PER_DIALECT ? '✔' : '⚠';
  console.log(
    `${status} ${dialect}: ${entries.length}/${TARGET_PER_DIALECT} words (all unvalidated)`,
  );
}

process.exit(failed ? 1 : 0);
