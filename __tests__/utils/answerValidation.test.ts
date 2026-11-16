import {
  isAnswerCorrect,
  matchAcceptedAnswer,
  normalizeAnswer,
} from '@/utils/answerValidation';

describe('normalizeAnswer', () => {
  it('folds case by default', () => {
    expect(normalizeAnswer('AZUL')).toBe('azul');
  });

  it('keeps case when ignoreCase is false', () => {
    expect(normalizeAnswer('AZUL', { ignoreCase: false })).toBe('AZUL');
  });

  it('replaces punctuation with spaces', () => {
    expect(normalizeAnswer('azul!')).toBe('azul');
    expect(normalizeAnswer('azul-basics')).toBe('azul basics');
    expect(normalizeAnswer("l'objectif")).toBe('l objectif');
  });

  it('collapses whitespace', () => {
    expect(normalizeAnswer('  azul   \n\t ')).toBe('azul');
  });

  it('normalises Unicode to NFC', () => {
    // "é" as e + combining acute (NFD) must equal the precomposed form.
    expect(normalizeAnswer('cafe\u0301')).toBe('caf\u00e9');
    expect(normalizeAnswer('caf\u00e9')).toBe('caf\u00e9');
  });

  it('leaves Tifinagh untouched apart from whitespace/punctuation', () => {
    expect(normalizeAnswer(' ⴰⵣⵓⵍ ')).toBe('ⴰⵣⵓⵍ');
  });

  it('keeps diacritics by default', () => {
    expect(normalizeAnswer('ḍ')).not.toBe(normalizeAnswer('d'));
  });

  it('strips diacritics when ignoreDiacritics is true', () => {
    expect(normalizeAnswer('ḍ', { ignoreDiacritics: true })).toBe('d');
  });
});

describe('matchAcceptedAnswer', () => {
  it('matches an exact answer', () => {
    expect(matchAcceptedAnswer('azul', ['azul'])).toBe('azul');
  });

  it('matches Tifinagh answers', () => {
    expect(matchAcceptedAnswer('ⴰⵣⵓⵍ', ['ⴰⵣⵓⵍ'])).toBe('ⴰⵣⵓⵍ');
  });

  it('supports multiple accepted answers and returns the matched variant', () => {
    const accepted = ['azul', 'ⴰⵣⵓⵍ'];
    expect(matchAcceptedAnswer(' AZUL! ', accepted)).toBe('azul');
    expect(matchAcceptedAnswer('ⴰⵣⵓⵍ.', accepted)).toBe('ⴰⵣⵓⵍ');
  });

  it('normalises the accepted answers too', () => {
    expect(matchAcceptedAnswer('azul', ['Azul!'])).toBe('Azul!');
  });

  it('returns null when nothing matches', () => {
    expect(matchAcceptedAnswer('goodbye', ['azul', 'ⴰⵣⵓⵍ'])).toBeNull();
  });

  it('returns null for empty or punctuation-only input', () => {
    expect(matchAcceptedAnswer('', ['azul'])).toBeNull();
    expect(matchAcceptedAnswer('!!!', ['azul'])).toBeNull();
  });
});

describe('isAnswerCorrect', () => {
  it('is true when any accepted answer matches', () => {
    expect(isAnswerCorrect('Azul', ['azul'])).toBe(true);
    expect(isAnswerCorrect('ⴰⵣⵓⵍ', ['azul', 'ⴰⵣⵓⵍ'])).toBe(true);
  });

  it('is false otherwise', () => {
    expect(isAnswerCorrect('hola', ['azul', 'ⴰⵣⵓⵍ'])).toBe(false);
  });

  it('respects the ignoreDiacritics option', () => {
    expect(isAnswerCorrect('d', ['ḍ'])).toBe(false);
    expect(isAnswerCorrect('d', ['ḍ'], { ignoreDiacritics: true })).toBe(true);
  });
});