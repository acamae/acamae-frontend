import { defineConfig } from 'cypress';
import { config as dotenvConfig } from 'dotenv';

const env = process.env.REACT_APP_NODE_ENV || 'development';

// Cargar variables de entorno según el ambiente
dotenvConfig({ path: `.env.${env}` });

export default defineConfig({
  e2e: {
    baseUrl:
      process.env.REACT_APP_CYPRESS_BASE_URL === '/'
        ? 'https://localhost'
        : process.env.REACT_APP_CYPRESS_BASE_URL || 'https://localhost',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    async setupNodeEvents(on) {
      // Verificación de seguridad para Cypress
      if (process.env.NODE_ENV !== 'testing') {
        console.error('❌ SEGURIDAD: Cypress solo puede ejecutarse en NODE_ENV=testing');
        console.error(`   NODE_ENV actual: ${process.env.NODE_ENV}`);
        process.exit(1);
      }
      // Configuración para manejar certificados SSL
      if (
        process.env.REACT_APP_NODE_ENV === 'development' ||
        process.env.REACT_APP_NODE_ENV === 'testing'
      ) {
        on('before:browser:launch', (browser, launchOptions) => {
          if (browser.name === 'chrome' || browser.name === 'chromium') {
            launchOptions.args.push('--ignore-certificate-errors');
            launchOptions.args.push('--ignore-ssl-errors');
            launchOptions.args.push('--ignore-certificate-errors-spki-list');
            launchOptions.args.push('--disable-web-security');
            launchOptions.args.push('--allow-running-insecure-content');
            launchOptions.args.push('--unsafely-treat-insecure-origin-as-secure=https://localhost');
          }
          return launchOptions;
        });
      }

      // Configuración de tareas de base de datos
      const testDbModule = await import('./scripts/test-db-setup.js');
      const { setupTestDatabase, cleanTestDatabase, resetTestDatabase } = testDbModule;

      on('task', {
        dbSetup: () => {
          return setupTestDatabase().then(() => null);
        },
        dbClean: () => {
          return cleanTestDatabase().then(() => null);
        },
        dbReset: () => {
          return resetTestDatabase().then(() => null);
        },
      });
    },
  },
});
