export type DialectId = 'tachelhit' | 'tamazight' | 'tarifit' | 'standard';

/** Dialects a user can select during onboarding. `standard` is reference content only. */
export const USER_DIALECTS: readonly DialectId[] = [
  'tachelhit',
  'tamazight',
  'tarifit',
];

export type UiLanguage = 'fr' | 'en';
