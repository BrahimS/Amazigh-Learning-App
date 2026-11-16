import {
  optionLabel,
  promptLatinTranscription,
  promptLocalized,
  promptTifinagh,
  usesTextInput,
} from '@/utils/exercise';

describe('prompt helpers', () => {
  const mixed = {
    tifinagh: 'ⴰⵣⵓⵍ',
    latin: 'azul',
    en: '“___” means hello',
    fr: '« ___ » signifie bonjour',
  };

  it('splits mixed Tifinagh/localized prompts into separate lines', () => {
    expect(promptTifinagh(mixed)).toBe('ⴰⵣⵓⵍ');
    expect(promptLatinTranscription(mixed)).toBe('azul');
    expect(promptLocalized(mixed)).toBe('“___” means hello');
  });

  it('handles localized-only prompts', () => {
    expect(promptTifinagh({ en: 'Hello' })).toBeNull();
    expect(promptLatinTranscription({ en: 'Hello' })).toBeNull();
    expect(promptLocalized({ fr: 'Bonjour', en: 'Hello' })).toBe('Hello');
    expect(promptLocalized({ fr: 'Bonjour' })).toBe('Bonjour');
  });

  it('handles Tifinagh-only prompts', () => {
    expect(promptTifinagh({ tifinagh: 'ⴰ', latin: 'a' })).toBe('ⴰ');
    expect(promptLocalized({ tifinagh: 'ⴰ', latin: 'a' })).toBeNull();
  });
});

describe('optionLabel', () => {
  it('passes strings through and reads Amazigh text objects', () => {
    expect(optionLabel('azul')).toBe('azul');
    expect(optionLabel({ tifinagh: 'ⴰⵣⵓⵍ', latin: 'azul' })).toBe('azul');
    expect(optionLabel({ latin: 'azul' })).toBe('azul');
    expect(optionLabel({ en: 'Hello' })).toBe('Hello');
    expect(optionLabel(null)).toBe('');
  });
});

describe('usesTextInput', () => {
  it('is true for free-text types and false for mcq/matching', () => {
    expect(usesTextInput('translation')).toBe(true);
    expect(usesTextInput('fillBlank')).toBe(true);
    expect(usesTextInput('mcq')).toBe(false);
    expect(usesTextInput('matching')).toBe(false);
  });
});
