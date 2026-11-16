import type { LocalizedText } from '@/types';

/** Picks the display string for localized content (English first, French fallback). */
export function localizedText(text: LocalizedText | undefined): string {
  return text?.en ?? text?.fr ?? '';
}
