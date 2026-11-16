import { AppError, mapFirebaseError } from '@/utils/errors';

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : 'unknown';
  return new AppError(code, mapFirebaseError(error));
}

export function fail<T>(error: unknown): ServiceResult<T> {
  return { ok: false, error: toAppError(error) };
}
