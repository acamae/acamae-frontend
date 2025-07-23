#!/usr/bin/env node

/**
 * Unified script to verify complete E2E test configuration
 * Combines .env.test validation with connectivity verification
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import https from 'https';
import { dirname } from 'path';
import { URL, fileURLToPath } from 'url';

import { config as dotenvConfig } from 'dotenv';

// Try to load .env.test
const envPath = '.env.test';
const envExists = existsSync(envPath);

if (!envExists) {
  console.error('❌ Error: .env.test file not found');
  console.log('\nTo create the .env.test file:');
  console.log('1. Copy env.testing.example to .env.test');
  console.log('2. Adjust variables according to your local configuration');
  console.log('3. Run this script again to validate');
  process.exit(1);
}

// Load environment variables from .env.test
dotenvConfig({ path: envPath });

// Required variables for E2E tests
const requiredVars = {
  // Basic environment variables
  NODE_ENV: { required: true, default: 'test' },
  REACT_APP_NODE_ENV: { required: true, default: 'test' },

  // Cypress variables
  CYPRESS_BASE_URL: { required: true, default: 'https://localhost' },
  CYPRESS_API_URL: { required: true, default: 'https://localhost/api' },
  CYPRESS_SERVER_PORT: { required: true, default: '80', type: 'number' },

  // API variables
  REACT_APP_API_URL: { required: true, default: 'https://localhost/api' },
  REACT_APP_RECAPTCHA_SITE_KEY: { required: false, default: 'tu_clave_publica_recaptcha' },

  // Database variables
  REACT_APP_DB_HOST: { required: true, default: 'localhost' },
  REACT_APP_DB_PORT: { required: true, default: '3306', type: 'number' },
  REACT_APP_DB_NAME: { required: true, default: 'acamae_test' },
  REACT_APP_DB_USER: { required: true, default: 'acamae_test' },
  REACT_APP_DB_PASSWORD: { required: true, default: 'acamae_test_password' },
  REACT_APP_DB_ADMIN_USER: { required: true, default: 'root' },
  REACT_APP_DB_ADMIN_PASSWORD: { required: true, default: 'rootpassword' },

  // Jest variables
  JEST_COVERAGE_THRESHOLD: { required: false, default: '85', type: 'number' },
};

// Configuration from environment variables
const testConfig = {
  frontendUrl: process.env.CYPRESS_BASE_URL || 'https://localhost',
  apiUrl: process.env.CYPRESS_API_URL || 'https://localhost/api',
  dbHost: process.env.REACT_APP_DB_HOST || 'localhost',
  dbPort: parseInt(process.env.REACT_APP_DB_PORT) || 3306,
  dbUser: process.env.REACT_APP_DB_ADMIN_USER || 'root',
  dbPassword: process.env.REACT_APP_DB_ADMIN_PASSWORD || 'root',
};

const errors = [];
const warnings = [];

/**
 * Execute a command and return the result
 */
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf8',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
}

/**
 * Check HTTPS connectivity
 */
function checkHttpsConnectivity(url, timeout = 5000) {
  return new Promise(resolve => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'GET',
      timeout,
      rejectUnauthorized: process.env.NODE_ENV === 'production', // Ignore SSL certificate errors
    };

    const req = https.request(options, res => {
      resolve({
        success: true,
        statusCode: res.statusCode,
        headers: res.headers,
      });
    });

    req.on('error', error => {
      resolve({
        success: false,
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout',
      });
    });

    req.end();
  });
}

/**
 * Validate an environment variable
 */
function validateEnvVar(varName, config) {
  const value = process.env[varName];

  if (!value && config.required) {
    errors.push(`Missing required variable: ${varName}`);
    return false;
  }

  if (value && config.type === 'number') {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      errors.push(`Variable ${varName} must be a valid number, current value: ${value}`);
      return false;
    }
  }

  if (value && config.type === 'url') {
    try {
      new URL(value);
    } catch {
      errors.push(`Variable ${varName} must be a valid URL, current value: ${value}`);
      return false;
    }
  }

  // Specific validations
  if (varName === 'NODE_ENV' && value !== 'test') {
    warnings.push(`NODE_ENV should be 'test', current value: ${value}`);
  }

  if (varName.includes('DB_NAME') && !value.includes('test')) {
    warnings.push(`Variable ${varName} should contain 'test' for security`);
  }

  if (varName.includes('DB_USER') && !value.includes('test')) {
    warnings.push(`Variable ${varName} should contain 'test' for security`);
  }

  return true;
}

/**
 * Check MySQL database
 */
function checkDatabase() {
  console.log('🔍 Checking database connection...');

  // First check if mysql is available
  const mysqlCheck = runCommand('mysql --version', { timeout: 5000 });

  if (!mysqlCheck.success) {
    console.log('⚠️  MySQL client not found on system');
    warnings.push('Database: MySQL client not available in PATH. This is normal if using Docker.');
    return true; // Not a critical error if using Docker
  }

  // If available, try to connect
  const testCmd = `mysql -h ${testConfig.dbHost} -P ${testConfig.dbPort} -u ${testConfig.dbUser} -p${testConfig.dbPassword} -e "SELECT 1;" 2>nul`;
  const result = runCommand(testCmd, { timeout: 10000 });

  if (result.success) {
    console.log('✅ MySQL connection successful');
    return true;
  } else {
    console.log('❌ Error connecting to MySQL');
    errors.push(
      `Database: Could not connect. Verify that MySQL is running and credentials are correct.`
    );
    return false;
  }
}

/**
 * Check frontend
 */
async function checkFrontend() {
  console.log(`🔍 Checking frontend (${testConfig.frontendUrl})...`);

  const result = await checkHttpsConnectivity(testConfig.frontendUrl);

  if (result.success) {
    console.log(`✅ Frontend accessible (Status: ${result.statusCode})`);
    return true;
  } else {
    console.log('❌ Frontend not accessible');
    errors.push(`Frontend: ${result.error}`);
    return false;
  }
}

/**
 * Check API
 */
async function checkApi() {
  console.log(`🔍 Checking API (${testConfig.apiUrl})...`);

  // Try different common endpoints
  const endpoints = ['/api', '/api/health', '/api/status'];

  for (const endpoint of endpoints) {
    const url = `${testConfig.frontendUrl}${endpoint}`;
    const result = await checkHttpsConnectivity(url);

    if (result.success) {
      console.log(`✅ API accessible at ${endpoint} (Status: ${result.statusCode})`);
      return true;
    }
  }

  console.log('❌ API not accessible at any endpoint');
  errors.push('API: Could not connect to any API endpoint');
  return false;
}

/**
 * Check Cypress configuration
 */
async function checkCypressConfig() {
  console.log('🔍 Checking Cypress configuration...');

  try {
    // Check if configuration file exists using Node.js
    const fs = await import('fs');

    if (!fs.existsSync('cypress.config.js')) {
      errors.push('Cypress: cypress.config.js file not found');
      return false;
    }

    // Check if support files exist
    if (!fs.existsSync('cypress/support/database.ts')) {
      warnings.push('Cypress: cypress/support/database.ts file not found');
    }

    console.log('✅ Cypress configuration found');
    return true;
  } catch (error) {
    console.log('❌ Error checking Cypress configuration');
    errors.push(`Cypress: ${error.message}`);
    return false;
  }
}

/**
 * Check database scripts
 */
async function checkDatabaseScripts() {
  console.log('🔍 Checking database scripts...');

  try {
    const fs = await import('fs');

    if (!fs.existsSync('scripts/test-db-prisma.js')) {
      errors.push('Scripts: scripts/test-db-prisma.js file not found');
      return false;
    }

    // Test script without arguments (should show help)
    const helpResult = runCommand('node scripts/test-db-prisma.js', { timeout: 5000 });
    if (helpResult.output && helpResult.output.includes('Usage: node scripts/test-db-prisma.js')) {
      console.log('✅ Database script working');
      return true;
    } else {
      warnings.push('Scripts: Database script does not show expected help');
      return true; // Not a critical error
    }
  } catch (error) {
    console.log('❌ Error checking database scripts');
    errors.push(`Scripts: ${error.message}`);
    return false;
  }
}

/**
 * Validate environment variables in .env.test file
 */
function validateEnvironmentVariables() {
  console.log('🔍 Validating environment variables in .env.test...');

  let validCount = 0;
  const totalVars = Object.keys(requiredVars).length;

  for (const [varName, config] of Object.entries(requiredVars)) {
    if (validateEnvVar(varName, config)) {
      validCount++;
    }
  }

  console.log(`✅ Valid variables: ${validCount}/${totalVars}`);
  return validCount === totalVars;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Verifying complete test configuration for acamae-frontend\n');

  // Show current configuration
  console.log('📋 Current configuration:');
  console.log(`   Frontend URL: ${testConfig.frontendUrl}`);
  console.log(`   API URL: ${testConfig.apiUrl}`);
  console.log(`   DB Host: ${testConfig.dbHost}:${testConfig.dbPort}`);
  console.log('');

  // First validate environment variables
  const envValid = validateEnvironmentVariables();

  if (!envValid) {
    console.log('\n❌ Environment variable errors detected');
    console.log('Fix the errors before continuing with connectivity checks');
    process.exit(1);
  }

  console.log('✅ Environment variables valid\n');

  // Then check connectivity
  const connectivityChecks = [
    () => checkDatabase(),
    () => checkFrontend(),
    () => checkApi(),
    () => checkCypressConfig(),
    () => checkDatabaseScripts(),
  ];

  let successCount = 0;

  for (const check of connectivityChecks) {
    try {
      const result = await check();
      if (result) successCount++;
    } catch (error) {
      errors.push(`Unexpected error: ${error.message}`);
    }
    console.log(''); // Empty line
  }

  // Show final summary
  console.log('📊 COMPLETE VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successful checks: ${successCount}/${connectivityChecks.length}`);

  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${warnings.length}`);
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (errors.length > 0) {
    console.log(`\n❌ Errors: ${errors.length}`);
    errors.forEach(error => console.log(`   - ${error}`));
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('1. Make sure Docker is running');
    console.log('2. Verify that Nginx containers are active');
    console.log('3. Confirm that MySQL is running');
    console.log('4. Review the .env.test file and fix errors');
    console.log('5. Run: npm run test:e2e:setup');
    process.exit(1);
  } else {
    console.log('\n🎉 Configuration verified successfully!');
    console.log('You can run tests with: npm run test:e2e');
    process.exit(0);
  }
}

// Execute if called directly

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  main().catch(error => {
    console.error('Error during verification:', error);
    process.exit(1);
  });
}

export { main };
