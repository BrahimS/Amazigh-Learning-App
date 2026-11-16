import en from '@/i18n/locales/en';
import fr from '@/i18n/locales/fr';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      return flattenKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

it('fr and en resources have identical key sets', () => {
  expect(flattenKeys(fr).sort()).toEqual(flattenKeys(en).sort());
});

it('resources contain the onboarding and settings sections', () => {
  expect(fr.onboarding.dialectTitle).toBeTruthy();
  expect(en.settings.language).toBeTruthy();
});
