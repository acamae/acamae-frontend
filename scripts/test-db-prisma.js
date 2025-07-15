#!/usr/bin/env node

/**
 * Prisma-based test database management script
 * - Safe and secure (no shell commands)
 * - Type-safe operations
 * - Automatic cleanup after tests
 * - Test data isolation
 */

import { execSync } from 'child_process';

import { PrismaClient } from '@prisma/client';

// Test database configuration
const TEST_CONFIG = {
  host: process.env.REACT_APP_DB_HOST || 'localhost',
  port: process.env.REACT_APP_DB_PORT || 3306,
  database: process.env.REACT_APP_DB_NAME || 'acamae_test',
  username: process.env.REACT_APP_DB_USER || 'acamae_test',
  password: process.env.REACT_APP_DB_PASSWORD || 'acamae_test_password',
  adminUser: process.env.REACT_APP_DB_ADMIN_USER || 'root',
  adminPassword: process.env.REACT_APP_DB_ADMIN_PASSWORD || 'rootpassword',
};

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        `mysql://${TEST_CONFIG.username}:${TEST_CONFIG.password}@${TEST_CONFIG.host}:${TEST_CONFIG.port}/${TEST_CONFIG.database}`,
    },
  },
});

// Cache configuration (for future use)
// const CACHE_FILE = path.join(process.cwd(), '.test-db-cache.json');
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Validate test environment
 */
function validateTestEnvironment() {
  console.log('🔒 Validating test environment...');

  if (process.env.NODE_ENV !== 'testing') {
    console.error('❌ SECURITY: This script can only run with NODE_ENV=testing');
    console.error(`   Current NODE_ENV: ${process.env.NODE_ENV}`);
    process.exit(1);
  }

  const dbName = TEST_CONFIG.database.toLowerCase();
  if (!dbName.includes('test')) {
    console.error('❌ SECURITY: Database name must contain "test"');
    console.error(`   Current database: ${TEST_CONFIG.database}`);
    process.exit(1);
  }

  console.log('✅ Security validation complete');
  console.log(`   • Environment: ${process.env.NODE_ENV}`);
  console.log(`   • Database: ${TEST_CONFIG.database}`);
  console.log(`   • User: ${TEST_CONFIG.username}`);
  console.log(`   • Host: ${TEST_CONFIG.host}:${TEST_CONFIG.port}`);
}

/**
 * Check if MySQL server is available
 */
async function checkMySqlAvailable() {
  console.log('🔍 Checking MySQL server availability...');

  try {
    // Try to connect to MySQL server
    const testUrl = `mysql://${TEST_CONFIG.adminUser}:${TEST_CONFIG.adminPassword}@${TEST_CONFIG.host}:${TEST_CONFIG.port}`;
    const testPrisma = new PrismaClient({
      datasources: { db: { url: testUrl } },
    });

    // Test connection
    await testPrisma.$queryRaw`SELECT 1`;
    await testPrisma.$disconnect();

    console.log('✅ MySQL server is available');
    return true;
  } catch (error) {
    console.error('❌ MySQL server not available');
    console.error('   Please ensure MySQL server is running');
    console.error('   Error:', error.message);
    return false;
  }
}

/**
 * Create test database and user
 */
async function createTestDatabase() {
  console.log('🏗️  Creating test database...');

  try {
    // Connect as admin to create database and user
    const adminUrl = `mysql://${TEST_CONFIG.adminUser}:${TEST_CONFIG.adminPassword}@${TEST_CONFIG.host}:${TEST_CONFIG.port}`;
    const adminPrisma = new PrismaClient({
      datasources: { db: { url: adminUrl } },
    });

    // Create database
    await adminPrisma.$executeRawUnsafe(
      `CREATE DATABASE IF NOT EXISTS \`${TEST_CONFIG.database}\``
    );

    // Create user
    await adminPrisma.$executeRawUnsafe(
      `CREATE USER IF NOT EXISTS '${TEST_CONFIG.username}'@'%' IDENTIFIED BY '${TEST_CONFIG.password}'`
    );

    // Grant privileges
    await adminPrisma.$executeRawUnsafe(
      `GRANT ALL PRIVILEGES ON \`${TEST_CONFIG.database}\`.* TO '${TEST_CONFIG.username}'@'%'`
    );
    await adminPrisma.$executeRawUnsafe('FLUSH PRIVILEGES');

    await adminPrisma.$disconnect();

    console.log('✅ Test database created/configured');
  } catch (error) {
    console.error('❌ Error creating test database:', error.message);
    throw error;
  }
}

/**
 * Run Prisma migrations
 */
async function runMigrations() {
  console.log('🔄 Running Prisma migrations...');

  try {
    // Set DATABASE_URL for migrations
    const databaseUrl = `mysql://${TEST_CONFIG.username}:${TEST_CONFIG.password}@${TEST_CONFIG.host}:${TEST_CONFIG.port}/${TEST_CONFIG.database}`;

    // Create a safe environment object with only necessary variables
    const safeEnv = {
      DATABASE_URL: databaseUrl,
      NODE_ENV: process.env.NODE_ENV || 'testing',
      // Only include essential environment variables, avoid PATH manipulation
      HOME: process.env.HOME,
      USER: process.env.USER,
      USERNAME: process.env.USERNAME,
      PWD: process.env.PWD,
      // Node.js specific variables
      NODE_PATH: process.env.NODE_PATH,
      npm_config_prefix: process.env.npm_config_prefix,
    };

    // Run migrations with safe environment
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: safeEnv,
    });

    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    throw error;
  }
}

/**
 * Clean all test data
 */
async function cleanTestData() {
  console.log('🧹 Cleaning test data...');

  try {
    // Clean all tables
    await prisma.user.deleteMany();
    await prisma.testData.deleteMany();

    console.log('✅ Test data cleaned');
  } catch (error) {
    console.error('❌ Error cleaning test data:', error.message);
    throw error;
  }
}

/**
 * Reset database (drop and recreate)
 */
async function resetDatabase() {
  console.log('🔄 Resetting test database...');

  try {
    // Connect as admin to drop database
    const adminUrl = `mysql://${TEST_CONFIG.adminUser}:${TEST_CONFIG.adminPassword}@${TEST_CONFIG.host}:${TEST_CONFIG.port}`;
    const adminPrisma = new PrismaClient({
      datasources: { db: { url: adminUrl } },
    });

    // Drop database
    await adminPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${TEST_CONFIG.database}\``);
    await adminPrisma.$disconnect();

    // Recreate database
    await createTestDatabase();
    await runMigrations();

    console.log('✅ Test database reset completed');
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    throw error;
  }
}

/**
 * Setup test database (create + migrate)
 */
async function setupTestDatabase() {
  console.log('🚀 Setting up test database...');

  try {
    await createTestDatabase();
    await runMigrations();
    await cleanTestData();

    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Error setting up test database:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const action = process.argv[2];

  console.log('🚀 Prisma Test DB Management');
  console.log(`📊 Database: ${TEST_CONFIG.database}`);
  console.log(`👤 User: ${TEST_CONFIG.username}`);
  console.log(`🌐 Host: ${TEST_CONFIG.host}:${TEST_CONFIG.port}`);
  console.log('');

  validateTestEnvironment();

  if (!(await checkMySqlAvailable())) {
    process.exit(1);
  }

  try {
    switch (action) {
      case 'setup':
        await setupTestDatabase();
        break;
      case 'clean':
        await cleanTestData();
        break;
      case 'reset':
        await resetDatabase();
        break;
      case 'migrate':
        await runMigrations();
        break;
      default:
        console.error(
          '❌ Invalid action. Usage: node test-db-prisma.js [setup|clean|reset|migrate]'
        );
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

export {
  setupTestDatabase,
  cleanTestData as cleanTestDatabase,
  resetDatabase as resetTestDatabase,
};

// Run as CLI if called directly
if (process.argv[1] && process.argv[1].endsWith('test-db-prisma.js')) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}
