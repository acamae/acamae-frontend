import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import locales
import enGB from './locales/en-GB.json';
import esES from './locales/es-ES.json';

// Configure i18n for tests
i18n.use(initReactI18next).init({
  lng: 'en-GB',
  fallbackLng: 'en-GB',
  debug: false,
  resources: {
    'en-GB': {
      translation: enGB,
    },
    'es-ES': {
      translation: esES,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
