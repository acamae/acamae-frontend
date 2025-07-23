#!/usr/bin/env node

/**
 * Simple script to run E2E tests
 * Uses wait-on to wait for the server
 *
 * Usage:
 *   node scripts/test-e2e-simple.js                    # Run all tests
 *   node scripts/test-e2e-simple.js register-form      # Run tests containing "register-form"
 *   node scripts/test-e2e-simple.js comprehensive      # Run tests containing "comprehensive"
 */

import { execSync, spawn } from 'child_process';

import { config } from 'dotenv';

// Load environment variables from .env.test
config({ path: '.env.test' });

const NODE_ENV = process.env.NODE_ENV || 'test';
const BASE_URL = process.env.CYPRESS_BASE_URL || 'https://localhost';
let cypressProcess = null;

// Get test pattern from command line arguments
const testPattern = process.argv[2];

console.log('Starting E2E tests...');
console.log(`Base URL: ${BASE_URL}`);
if (testPattern) {
  console.log(`Test pattern: ${testPattern}`);
}

/**
 * Run verification before tests
 */
function runVerification() {
  console.log('🔍 Running pre-test verification...');
  try {
    execSync(`npx cross-env NODE_ENV=${NODE_ENV} node scripts/verify-test-setup.js`, {
      stdio: 'inherit',
      timeout: 60000, // 60 seconds timeout for verification
    });
    console.log('✅ Verification completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('Please fix the issues before running tests');
    return false;
  }
}

/**
 * Clean up resources
 */
function cleanup() {
  console.log('Cleaning up...');
  try {
    execSync(`npx cross-env NODE_ENV=${NODE_ENV} npm run test:e2e:cleanup`, {
      stdio: 'inherit',
    });
  } catch (cleanupError) {
    console.error('⚠️ Error during cleanup:', cleanupError.message);
  }

  if (cypressProcess) {
    cypressProcess.kill('SIGTERM');
    console.log('✅ Cypress process stopped');
  }
}

try {
  // Run verification first
  if (!runVerification()) {
    console.log('❌ Pre-test verification failed. Exiting.');
    process.exit(1);
  }

  console.log('Setting up database...');
  execSync(`npx cross-env NODE_ENV=${NODE_ENV} npm run test:e2e:setup`, {
    stdio: 'inherit',
  });

  console.log('Checking if server is available...');
  execSync(`npx wait-on ${BASE_URL} --timeout 30000 --interval 1000`, {
    stdio: 'inherit',
    timeout: 30000,
  });

  console.log('✅ Server available, running tests...');

  // Build Cypress command
  const cypressArgs = ['cross-env', `NODE_ENV=${NODE_ENV}`, 'cypress', 'run'];

  // If a pattern was specified, add the filter
  if (testPattern) {
    cypressArgs.push('--spec', `cypress/e2e/**/*${testPattern}*.cy.ts`);
  }

  cypressProcess = spawn('npx', cypressArgs, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: NODE_ENV },
  });

  // Wait for Cypress process to finish
  await new Promise((resolve, reject) => {
    cypressProcess.on('close', code => {
      if (code === 0) {
        console.log('✅ Tests completed successfully');
        resolve();
      } else {
        reject(new Error(`Cypress exited with code: ${code}`));
      }
    });

    cypressProcess.on('error', error => {
      reject(new Error(`Error in Cypress process: ${error.message}`));
    });
  });
} catch (error) {
  console.error('❌ Error:', error.message);
  cleanup();
  process.exit(1);
} finally {
  cleanup();
}

// Handle termination signals
process.on('SIGINT', () => {
  console.log('\n🛑 Interrupt signal received, cleaning up...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Termination signal received, cleaning up...');
  cleanup();
  process.exit(0);
});
