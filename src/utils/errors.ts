import i18n from '@/i18n';

/** Error with a stable code that can be mapped to a user-friendly message. */
export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'AppError';
    this.code = code;
  }
}

function errorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code;
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return 'unknown';
}

/**
 * Maps Firebase Auth/Firestore (and other) error codes to localized,
 * user-friendly messages. Unknown codes fall back to `errors.default`.
 */
export function mapFirebaseError(error: unknown): string {
  const code = errorCode(error);
  const key = `errors.${code}`;
  return i18n.exists(key) ? i18n.t(key) : i18n.t('errors.default');
}

/** Logs errors with context while developing; silent in production builds. */
export function logError(context: string, error: unknown): void {
  if (__DEV__) {
    console.error(`[${context}]`, error);
  }
}
