import { defineConfig } from 'cypress';
import { config } from 'dotenv';

// Cargar variables de entorno desde .env.test
config({ path: '.env.test' });

export default defineConfig({
  e2e: {
    setupNodeEvents(on, _config) {
      // implement node event listeners here

      // Database tasks using Prisma
      on('task', {
        async dbSetup() {
          const { setupTestDatabase } = await import('./scripts/test-db-prisma.js');
          await setupTestDatabase();
          return null;
        },

        async dbClean() {
          const { cleanTestDatabase } = await import('./scripts/test-db-prisma.js');
          await cleanTestDatabase();
          return null;
        },

        async dbReset() {
          const { resetTestDatabase } = await import('./scripts/test-db-prisma.js');
          await resetTestDatabase();
          return null;
        },

        async createTestUser(userData) {
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient({
            datasources: {
              db: {
                url:
                  process.env.DATABASE_URL ||
                  'mysql://acamae_test:acamae_test_password@localhost:3306/acamae_test',
              },
            },
          });

          try {
            const user = await prisma.user.create({
              data: {
                email: userData.email,
                username: userData.username,
                password: userData.password,
                role: userData.role || 'user',
                isVerified: false,
              },
            });
            return user;
          } finally {
            await prisma.$disconnect();
          }
        },

        async deleteTestUser(email) {
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient({
            datasources: {
              db: {
                url:
                  process.env.DATABASE_URL ||
                  'mysql://acamae_test:acamae_test_password@localhost:3306/acamae_test',
              },
            },
          });

          try {
            await prisma.user.deleteMany({
              where: { email },
            });
            return null;
          } finally {
            await prisma.$disconnect();
          }
        },

        async getTestUser(email) {
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient({
            datasources: {
              db: {
                url:
                  process.env.DATABASE_URL ||
                  'mysql://acamae_test:acamae_test_password@localhost:3306/acamae_test',
              },
            },
          });

          try {
            const user = await prisma.user.findUnique({
              where: { email },
            });
            return user;
          } finally {
            await prisma.$disconnect();
          }
        },
      });
    },

    // Test database environment variables
    env: {
      DB_HOST: process.env.REACT_APP_DB_HOST || 'localhost',
      DB_PORT: parseInt(process.env.REACT_APP_DB_PORT) || 3306,
      DB_NAME: process.env.REACT_APP_DB_NAME || 'acamae_test',
      DB_USER: process.env.REACT_APP_DB_USER || 'acamae_test',
      DB_PASSWORD: process.env.REACT_APP_DB_PASSWORD || 'acamae_test_password',
      DB_ADMIN_USER: process.env.REACT_APP_DB_ADMIN_USER || 'root',
      DB_ADMIN_PASSWORD: process.env.REACT_APP_DB_ADMIN_PASSWORD || 'rootpassword',
      NODE_ENV: process.env.NODE_ENV || 'test',
      BASE_URL: process.env.CYPRESS_BASE_URL || 'https://localhost',
      API_URL: process.env.CYPRESS_API_URL || 'https://localhost/api',
    },

    // Test configuration
    baseUrl:
      process.env.CYPRESS_BASE_URL || `https://localhost:${process.env.CYPRESS_SERVER_PORT || 80}`,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Test files
    specPattern: 'cypress/e2e/**/*.cy.ts',

    // Support files
    supportFile: 'cypress/support/e2e.ts',

    // Downloads and screenshots
    downloadsFolder: 'cypress/downloads',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
  },
});
