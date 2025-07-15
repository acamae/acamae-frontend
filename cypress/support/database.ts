/**
 * Prisma-based database utilities for Cypress tests
 * - Safe and secure (no shell commands)
 * - Type-safe operations
 * - Automatic cleanup after tests
 */

import { PrismaClient } from '@prisma/client';

// Test database configuration
const TEST_CONFIG = {
  host: Cypress.env('DB_HOST') || 'localhost',
  port: Cypress.env('DB_PORT') || 3306,
  database: Cypress.env('DB_NAME') || 'acamae_test',
  username: Cypress.env('DB_USER') || 'acamae_test',
  password: Cypress.env('DB_PASSWORD') || 'acamae_test_password',
  adminUser: Cypress.env('DB_ADMIN_USER') || 'root',
  adminPassword: Cypress.env('DB_ADMIN_PASSWORD') || 'rootpassword',
};

// Initialize Prisma client for tests
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `mysql://${TEST_CONFIG.username}:${TEST_CONFIG.password}@${TEST_CONFIG.host}:${TEST_CONFIG.port}/${TEST_CONFIG.database}`,
    },
  },
});

/**
 * Setup test database (create + migrate + clean)
 */
export async function setupTestDatabase(): Promise<void> {
  console.log('🏗️  Setting up test database with Prisma...');

  try {
    // @ts-expect-error: No existe declaración de tipos para el módulo JS externo
    const { setupTestDatabase: setupDb } = await import('../../scripts/test-db-prisma.js');
    await setupDb();
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    throw error;
  }
}

/**
 * Clean test data (delete all records)
 */
export async function cleanTestDatabase(): Promise<void> {
  console.log('🧹 Cleaning test data with Prisma...');

  try {
    // Clean all tables
    await prisma.user.deleteMany();
    await prisma.testData.deleteMany();

    console.log('✅ Test data cleaned');
  } catch (error) {
    console.error('❌ Error cleaning test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Reset database (drop and recreate)
 */
export async function resetTestDatabase(): Promise<void> {
  console.log('🔄 Resetting test database with Prisma...');

  try {
    // @ts-expect-error: No existe declaración de tipos para el módulo JS externo
    const { resetTestDatabase: resetDb } = await import('../../scripts/test-db-prisma.js');
    await resetDb();
    console.log('✅ Test database reset completed');
  } catch (error) {
    console.error('❌ Error resetting test database:', error);
    throw error;
  }
}

/**
 * Create test user for tests
 */
export async function createTestUser(userData: {
  email: string;
  username: string;
  password: string;
  role?: 'user' | 'manager' | 'admin';
}): Promise<unknown> {
  try {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        role: userData.role || 'user',
        isVerified: false,
      },
      select: {
        // Solo seleccionar campos que aparecen en la API response
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // NO incluir password ni isVerified en respuestas
      },
    });

    console.log(`✅ Test user created: ${userData.email}`);
    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

/**
 * Delete test user
 */
export async function deleteTestUser(email: string): Promise<void> {
  try {
    await prisma.user.deleteMany({
      where: { email },
    });

    console.log(`✅ Test user deleted: ${email}`);
  } catch (error) {
    console.error('❌ Error deleting test user:', error);
    throw error;
  }
}

/**
 * Get test user by email
 */
export async function getTestUser(email: string): Promise<unknown> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        // Solo seleccionar campos que aparecen en la API response
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // NO incluir password ni isVerified en respuestas
      },
    });

    return user;
  } catch (error) {
    console.error('❌ Error getting test user:', error);
    throw error;
  }
}

/**
 * Cypress commands for database operations
 */
Cypress.Commands.add('setupDb', () => {
  return cy.task('dbSetup');
});

Cypress.Commands.add('cleanDb', () => {
  return cy.task('dbClean');
});

Cypress.Commands.add('resetDb', () => {
  return cy.task('dbReset');
});

Cypress.Commands.add('createTestUser', userData => {
  return cy.task('createTestUser', userData);
});

Cypress.Commands.add('deleteTestUser', email => {
  return cy.task('deleteTestUser', email);
});

Cypress.Commands.add('getTestUser', email => {
  return cy.task('getTestUser', email);
});

// TypeScript declarations
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Setup test database
       */
      setupDb(): Chainable<void>;

      /**
       * Clean test database
       */
      cleanDb(): Chainable<void>;

      /**
       * Reset test database
       */
      resetDb(): Chainable<void>;

      /**
       * Create test user
       */
      createTestUser(userData: {
        email: string;
        username: string;
        password: string;
        role?: 'user' | 'manager' | 'admin';
      }): Chainable<unknown>;

      /**
       * Delete test user
       */
      deleteTestUser(email: string): Chainable<void>;

      /**
       * Get test user
       */
      getTestUser(email: string): Chainable<unknown>;
    }
  }
}
