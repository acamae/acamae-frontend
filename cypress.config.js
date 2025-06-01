import { defineConfig } from 'cypress';
import { config as dotenvConfig } from 'dotenv';

const env = process.env.REACT_APP_NODE_ENV || 'development'; // eslint-disable-line no-undef

// Cargar variables de entorno según el ambiente
dotenvConfig({ path: `.env.${env}` });

export default defineConfig({
  e2e: {
    baseUrl: process.env.REACT_APP_CYPRESS_BASE_URL || 'http://localhost:3000', // eslint-disable-line no-undef
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on) {
      // Configuración para manejar certificados SSL en desarrollo
      // eslint-disable-next-line no-undef
      if (process.env.REACT_APP_NODE_ENV === 'development') {
        on('before:browser:launch', (browser, launchOptions) => {
          if (browser.name === 'chrome' || browser.name === 'chromium') {
            launchOptions.args.push('--ignore-certificate-errors');
          }
          return launchOptions;
        });
      }
    },
  },
});
