import { defineConfig } from 'cypress';

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
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_NAME: 'acamae_test',
      DB_USER: 'acamae_test',
      DB_PASSWORD: 'acamae_test_password',
      DB_ADMIN_USER: 'root',
      DB_ADMIN_PASSWORD: 'rootpassword',
      NODE_ENV: 'test',
    },

    // Test configuration
    baseUrl: 'https://localhost',
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
