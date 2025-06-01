import path from 'path';

import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: path.resolve(__dirname, '.env.test') });

import '@testing-library/jest-dom';
import i18n from '@infrastructure/i18n';
import esTranslations from '@infrastructure/i18n/locales/es-ES.json';

let consoleErrorSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;

jest.mock('redux-persist', () => ({
  persistReducer: (_config: unknown, reducers: unknown) => reducers,
  persistStore: () => ({ purge: jest.fn(), flush: jest.fn() }),
  createTransform: jest.fn(() => ({})),
}));

beforeAll(async () => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  if (!i18n.hasResourceBundle('es-ES', 'translation')) {
    i18n.addResourceBundle('es-ES', 'translation', esTranslations, true, true);
  }

  if (i18n.language !== 'es-ES') {
    await i18n.changeLanguage('es-ES');
  }
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

afterAll(() => {
  if (consoleErrorSpy) {
    consoleErrorSpy.mockRestore();
  }
  if (consoleWarnSpy) {
    consoleWarnSpy.mockRestore();
  }
});
