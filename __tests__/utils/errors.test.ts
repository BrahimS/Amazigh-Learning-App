import i18n from '@/i18n';
import { AppError, mapFirebaseError } from '@/utils/errors';

describe('mapFirebaseError', () => {
  it('maps known Firebase Auth codes to localized messages', () => {
    expect(mapFirebaseError({ code: 'auth/wrong-password' })).toBe(
      i18n.t('errors.auth/wrong-password'),
    );
    expect(mapFirebaseError({ code: 'auth/email-already-in-use' })).toBe(
      i18n.t('errors.auth/email-already-in-use'),
    );
  });

  it('maps Firestore codes', () => {
    expect(mapFirebaseError({ code: 'permission-denied' })).toBe(
      i18n.t('errors.permission-denied'),
    );
  });

  it('supports AppError instances', () => {
    expect(mapFirebaseError(new AppError('unavailable'))).toBe(
      i18n.t('errors.unavailable'),
    );
  });

  it('falls back for unknown errors', () => {
    expect(mapFirebaseError(new Error('boom'))).toBe(i18n.t('errors.unknown'));
    expect(mapFirebaseError(null)).toBe(i18n.t('errors.unknown'));
  });
});
