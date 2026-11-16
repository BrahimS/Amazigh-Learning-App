import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { usePreferencesStore } from '@/store/preferencesStore';

import en from './locales/en';
import fr from './locales/fr';

export const resources = {
  fr: { translation: fr },
  en: { translation: en },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: usePreferencesStore.getState().uiLanguage,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

// Keep the UI language in sync with the persisted preference.
usePreferencesStore.subscribe((state, previous) => {
  if (state.uiLanguage !== previous.uiLanguage) {
    void i18n.changeLanguage(state.uiLanguage);
  }
});

export default i18n;
