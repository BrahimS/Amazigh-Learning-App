/**
 * Answer validation for exercises (issue #75).
 *
 * Learners are judged fairly across scripts and spellings: answers are folded
 * into a canonical form (Unicode NFC, case, punctuation, whitespace) before
 * comparison, and exercises may list several accepted variants — e.g. both the
 * Tifinagh and Latin spellings of a word. Cross-script equivalence is NOT
 * inferred automatically (transliteration is too risky); authors list each
 * accepted script as its own variant.
 */

export interface AnswerValidationOptions {
  /** Fold case before comparing (default true). Tifinagh has no case. */
  ignoreCase?: boolean;
  /**
   * Strip combining marks (default false). Tamazight Latin uses diacritics
   * (e.g. ḍ, ṭ, ṣ, ḥ) as distinct letters, so stripping is opt-in only.
   */
  ignoreDiacritics?: boolean;
  /** Treat punctuation and symbols as word separators (default true). */
  ignorePunctuation?: boolean;
}

const DEFAULT_OPTIONS: Required<AnswerValidationOptions> = {
  ignoreCase: true,
  ignoreDiacritics: false,
  ignorePunctuation: true,
};

/**
 * Folds an answer into a canonical form for comparison: NFC normalisation,
 * optional case folding and diacritic stripping, punctuation/symbols replaced
 * by spaces, whitespace collapsed.
 */
export function normalizeAnswer(
  input: string,
  options: AnswerValidationOptions = {},
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let text = typeof input === 'string' ? input : String(input ?? '');
  text = text.normalize('NFC');
  if (opts.ignoreDiacritics) {
    text = text.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
  }
  if (opts.ignoreCase) {
    text = text.toLowerCase();
  }
  if (opts.ignorePunctuation) {
    // Keep letters, numbers and combining marks; everything else becomes a
    // space so hyphenated or apostrophe-separated words compare word-by-word.
    text = text.replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ');
  }
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Returns the accepted variant the input matches (in its original form, for
 * display in feedback), or null when none of the accepted answers match.
 * Accepted answers are normalised with the same options.
 */
export function matchAcceptedAnswer(
  input: string,
  acceptedAnswers: readonly string[],
  options: AnswerValidationOptions = {},
): string | null {
  const normalizedInput = normalizeAnswer(input, options);
  if (normalizedInput === '') {
    return null;
  }
  for (const accepted of acceptedAnswers) {
    if (normalizeAnswer(accepted, options) === normalizedInput) {
      return accepted;
    }
  }
  return null;
}

/** True when the input matches any of the accepted answers. */
export function isAnswerCorrect(
  input: string,
  acceptedAnswers: readonly string[],
  options: AnswerValidationOptions = {},
): boolean {
  return matchAcceptedAnswer(input, acceptedAnswers, options) !== null;
}

/**
 * Normalises an `Exercise.answer` field into accepted answer variants. The
 * schema allows a single string or an array of variants (e.g. Tifinagh and
 * Latin spellings); anything else yields no accepted answers.
 */
export function toAcceptedAnswers(answer: unknown): string[] {
  const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim() !== '';
  if (isNonEmptyString(answer)) {
    return [answer];
  }
  if (Array.isArray(answer)) {
    return answer.filter(isNonEmptyString);
  }
  return [];
}
