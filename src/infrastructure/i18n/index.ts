/* eslint-disable import/no-named-as-default-member, import/no-named-as-default */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enGB from '@infrastructure/i18n/locales/en-GB.json';
import esES from '@infrastructure/i18n/locales/es-ES.json';

const resources = {
  'es-ES': { translation: esES },
  'en-GB': { translation: enGB },
};

i18n
  .use(LanguageDetector) // Detects language from browser
  .use(initReactI18next) // Integrates i18next with React
  .init({
    resources,
    fallbackLng: 'es-ES', // Default language if translation is not found
    supportedLngs: ['es-ES', 'en-GB'],
    interpolation: {
      escapeValue: false, // React already escapes values by default
    },
    detection: {
      order: ['localStorage', 'navigator'], // Detection order: first localStorage, then navigator
      caches: ['localStorage'], // Stores language preference in localStorage
    },
  });

export default i18n;
