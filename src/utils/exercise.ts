import type { AmazighText, ExerciseType, LocalizedText } from '@/types';

/** A prompt may be LocalizedText, AmazighText, or a mix of both key sets. */
export type ExercisePrompt = LocalizedText | AmazighText;

/** Tifinagh glyph of the prompt, when present. */
export function promptTifinagh(prompt: ExercisePrompt): string | null {
  return 'tifinagh' in prompt ? prompt.tifinagh : null;
}

/** Latin transcription paired with the Tifinagh glyph, when present. */
export function promptLatinTranscription(
  prompt: ExercisePrompt,
): string | null {
  return 'latin' in prompt ? prompt.latin ?? null : null;
}

/** Localized instruction line (English first, French fallback). */
export function promptLocalized(prompt: ExercisePrompt): string | null {
  if ('en' in prompt && prompt.en) {
    return prompt.en;
  }
  if ('fr' in prompt && prompt.fr) {
    return prompt.fr;
  }
  return null;
}

/** Human-readable label for an MCQ option (string or Amazigh text object). */
export function optionLabel(option: unknown): string {
  if (typeof option === 'string') {
    return option;
  }
  if (option && typeof option === 'object') {
    const record = option as Record<string, unknown>;
    for (const key of ['latin', 'tifinagh', 'en', 'fr']) {
      const value = record[key];
      if (typeof value === 'string' && value) {
        return value;
      }
    }
  }
  return String(option ?? '');
}

/** Exercise types answered with a free-text input (vs. option picking). */
export const TEXT_INPUT_TYPES: readonly ExerciseType[] = [
  'translation',
  'sentence',
  'fillBlank',
  'listening',
];

export function usesTextInput(type: ExerciseType): boolean {
  return TEXT_INPUT_TYPES.includes(type);
}
