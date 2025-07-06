/**
 * Utilidades para manejo de base de datos en tests de Cypress
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuración de la base de datos de tests MySQL/MariaDB
export const DB_CONFIG = {
  host: Cypress.env('DB_HOST') || 'localhost',
  port: Cypress.env('DB_PORT') || 3306,
  database: Cypress.env('DB_NAME') || 'acamae_test',
  username: Cypress.env('DB_USER') || 'acamae_test_user',
  password: Cypress.env('DB_PASSWORD') || 'acamae_test_password',
  adminUser: Cypress.env('DB_ADMIN_USER') || 'root',
  adminPassword: Cypress.env('DB_ADMIN_PASSWORD') || 'root',
};

/**
 * Ejecuta un script de base de datos
 */
export async function runDbScript(action: string): Promise<void> {
  const env = {
    ...process.env,
    REACT_APP_DB_HOST: DB_CONFIG.host,
    REACT_APP_DB_PORT: DB_CONFIG.port.toString(),
    REACT_APP_DB_NAME: DB_CONFIG.database,
    REACT_APP_DB_USER: DB_CONFIG.username,
    REACT_APP_DB_PASSWORD: DB_CONFIG.password,
    REACT_APP_DB_ADMIN_USER: DB_CONFIG.adminUser,
    REACT_APP_DB_ADMIN_PASSWORD: DB_CONFIG.adminPassword,
  };

  try {
    const { stdout, stderr } = await execAsync(`node scripts/test-db-setup.js ${action}`, {
      env,
      cwd: process.cwd(),
    });

    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }
  } catch (error) {
    console.error(`Error ejecutando script de BD (${action}):`, error);
    // No fallar los tests por errores de BD en casos específicos
    if (action === 'clean' || action === 'setup') {
      console.warn('Continuando con los tests...');
    } else {
      throw error;
    }
  }
}

/**
 * Configura la base de datos para los tests
 */
export async function setupTestDatabase(): Promise<void> {
  console.log('🏗️  Configurando base de datos de tests...');
  await runDbScript('setup');
}

/**
 * Limpia la base de datos después de los tests
 */
export async function cleanTestDatabase(): Promise<void> {
  console.log('🧹 Limpiando base de datos de tests...');
  await runDbScript('clean');
}

/**
 * Reinicia la base de datos (elimina y crea nuevamente)
 */
export async function resetTestDatabase(): Promise<void> {
  console.log('🔄 Reiniciando base de datos de tests...');
  await runDbScript('reset');
}

/**
 * Comandos de Cypress para manejo de base de datos
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

// Declaraciones de tipos para TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Configura la base de datos de tests
       */
      setupDb(): Chainable<void>;

      /**
       * Limpia la base de datos de tests
       */
      cleanDb(): Chainable<void>;

      /**
       * Reinicia la base de datos de tests
       */
      resetDb(): Chainable<void>;
    }
  }
}
