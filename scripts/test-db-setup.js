#!/usr/bin/env node

/**
 * Script para configurar y limpiar la base de datos de tests
 * Soporta MySQL y MariaDB únicamente
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Configuración de la base de datos MySQL/MariaDB
const config = {
  host: process.env.REACT_APP_DB_HOST || 'localhost',
  port: process.env.REACT_APP_DB_PORT || 3306,
  database: process.env.REACT_APP_DB_NAME || 'acamae_test',
  username: process.env.REACT_APP_DB_USER || 'acamae_test',
  password: process.env.REACT_APP_DB_PASSWORD || 'acamae_test_password',
  adminUser: process.env.REACT_APP_DB_ADMIN_USER || 'root',
  adminPassword: process.env.REACT_APP_DB_ADMIN_PASSWORD || 'rootpassword',
};

// Lista de bases de datos de producción prohibidas
const PRODUCTION_DATABASES = [
  'acamae',
  'acamae_prod',
  'acamae_production',
  'production',
  'prod',
  'main',
  'live',
  'master',
];

// Lista de usuarios de producción prohibidos
const PRODUCTION_USERS = [
  'acamae',
  'acamae_prod',
  'acamae_production',
  'production',
  'prod',
  'admin',
  'user',
  'main',
  'live',
  'master',
];

// Lista de hosts de producción prohibidos
const PRODUCTION_HOSTS = [
  'acamae.com',
  'www.acamae.com',
  'api.acamae.com',
  'db.acamae.com',
  'mysql.acamae.com',
  'mariadb.acamae.com',
  // Añadir aquí otros hosts de producción
];

/**
 * Verifica que la configuración sea segura para tests
 */
function validateTestEnvironment() {
  console.log('🔒 Verificando medidas de seguridad...');

  // 1. Verificar que estamos en entorno de testing
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== 'testing') {
    console.error('❌ SEGURIDAD: Este script solo puede ejecutarse en NODE_ENV=testing');
    console.error(`   NODE_ENV actual: ${nodeEnv}`);
    process.exit(1);
  }

  // 2. Verificar que el nombre de la BD es claramente de test
  const dbName = config.database.toLowerCase();
  if (!dbName.includes('test')) {
    console.error('❌ SEGURIDAD: El nombre de la base de datos debe contener "test"');
    console.error(`   Base de datos actual: ${config.database}`);
    process.exit(1);
  }

  // 3. Verificar que no es una BD de producción
  if (PRODUCTION_DATABASES.includes(dbName)) {
    console.error('❌ SEGURIDAD: Base de datos de producción detectada');
    console.error(`   Base de datos prohibida: ${config.database}`);
    process.exit(1);
  }

  // 4. Verificar que el usuario es claramente de test
  const userName = config.username.toLowerCase();
  if (!userName.includes('test')) {
    console.error('❌ SEGURIDAD: El usuario debe contener "test" en su nombre');
    console.error(`   Usuario actual: ${config.username}`);
    process.exit(1);
  }

  // 5. Verificar que no es un usuario de producción
  if (PRODUCTION_USERS.includes(userName)) {
    console.error('❌ SEGURIDAD: Usuario de producción detectado');
    console.error(`   Usuario prohibido: ${config.username}`);
    process.exit(1);
  }

  // 6. Verificar que no es un host de producción
  const hostName = config.host.toLowerCase();
  if (PRODUCTION_HOSTS.includes(hostName)) {
    console.error('❌ SEGURIDAD: Host de producción detectado');
    console.error(`   Host prohibido: ${config.host}`);
    process.exit(1);
  }

  // 7. Verificar que el puerto no sea un puerto de producción estándar en hosts remotos
  if (config.host !== 'localhost' && config.host !== '127.0.0.1') {
    if (config.port === 3306 || config.port === 5432) {
      console.error('❌ SEGURIDAD: Puerto de producción detectado en host remoto');
      console.error(`   Host: ${config.host}, Puerto: ${config.port}`);
      process.exit(1);
    }
  }

  console.log('✅ Verificación de seguridad completada');
  console.log(`   • Entorno: ${nodeEnv}`);
  console.log(`   • Base de datos: ${config.database}`);
  console.log(`   • Usuario: ${config.username}`);
  console.log(`   • Host: ${config.host}:${config.port}`);
}

/**
 * Ejecuta un comando y maneja errores
 */
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options,
    });
    return result;
  } catch (error) {
    if (!options.ignoreError) {
      console.error(`❌ Error ejecutando comando: ${command}`);
      console.error(error.message);
      process.exit(1);
    }
    return null;
  }
}

/**
 * Crea la base de datos de tests
 */
function createTestDatabase() {
  validateTestEnvironment();
  console.log('🏗️  Creando base de datos de tests...');

  // MySQL/MariaDB
  const createUserCmd = `mysql -h ${config.host} -P ${config.port} -u ${config.adminUser} -p${config.adminPassword} -e "CREATE USER IF NOT EXISTS '${config.username}'@'%' IDENTIFIED BY '${config.password}';"`;
  const createDbCmd = `mysql -h ${config.host} -P ${config.port} -u ${config.adminUser} -p${config.adminPassword} -e "CREATE DATABASE IF NOT EXISTS ${config.database};"`;
  const grantCmd = `mysql -h ${config.host} -P ${config.port} -u ${config.adminUser} -p${config.adminPassword} -e "GRANT ALL PRIVILEGES ON ${config.database}.* TO '${config.username}'@'%'; FLUSH PRIVILEGES;"`;

  runCommand(createUserCmd, { ignoreError: true, silent: true });
  runCommand(createDbCmd, { ignoreError: true, silent: true });
  runCommand(grantCmd, { ignoreError: true, silent: true });

  console.log('✅ Base de datos de tests creada/configurada');
}

/**
 * Limpia todas las tablas de la base de datos
 */
function cleanDatabase() {
  validateTestEnvironment();
  console.log('🧹 Limpiando base de datos de tests...');

  // MySQL/MariaDB: obtener todas las tablas y limpiarlas
  const tablesCmd = `mysql -h ${config.host} -P ${config.port} -u ${config.username} -p${config.password} -D ${config.database} -e "SHOW TABLES;" -s -N`;
  const tables = runCommand(tablesCmd, { silent: true, ignoreError: true });

  if (tables && tables.trim()) {
    const tableList = tables
      .trim()
      .split('\n')
      .filter(t => t.trim());

    if (tableList.length > 0) {
      // Deshabilitar foreign key checks
      const disableFKCmd = `mysql -h ${config.host} -P ${config.port} -u ${config.username} -p${config.password} -D ${config.database} -e "SET FOREIGN_KEY_CHECKS = 0;"`;
      runCommand(disableFKCmd, { ignoreError: true, silent: true });

      // Truncar tablas
      for (const table of tableList) {
        const truncateCmd = `mysql -h ${config.host} -P ${config.port} -u ${config.username} -p${config.password} -D ${config.database} -e "TRUNCATE TABLE ${table};"`;
        runCommand(truncateCmd, { ignoreError: true, silent: true });
      }

      // Rehabilitar foreign key checks
      const enableFKCmd = `mysql -h ${config.host} -P ${config.port} -u ${config.username} -p${config.password} -D ${config.database} -e "SET FOREIGN_KEY_CHECKS = 1;"`;
      runCommand(enableFKCmd, { ignoreError: true, silent: true });
    }
  }

  console.log('✅ Base de datos de tests limpiada');
}

/**
 * Elimina la base de datos de tests
 */
function dropTestDatabase() {
  validateTestEnvironment();
  console.log('🗑️  Eliminando base de datos de tests...');

  const dropDbCmd = `mysql -h ${config.host} -P ${config.port} -u ${config.adminUser} -p${config.adminPassword} -e "DROP DATABASE IF EXISTS ${config.database};"`;
  const dropUserCmd = `mysql -h ${config.host} -P ${config.port} -u ${config.adminUser} -p${config.adminPassword} -e "DROP USER IF EXISTS '${config.username}'@'%';"`;

  runCommand(dropDbCmd, { ignoreError: true, silent: true });
  runCommand(dropUserCmd, { ignoreError: true, silent: true });

  console.log('✅ Base de datos de tests eliminada');
}

/**
 * Función principal
 */
function main() {
  const action = process.argv[2];

  console.log('🚀 Gestión de base de datos de tests (MySQL/MariaDB)');
  console.log(`📊 Base de datos: ${config.database}`);
  console.log(`👤 Usuario: ${config.username}`);
  console.log(`🌐 Host: ${config.host}:${config.port}`);
  console.log('');

  switch (action) {
    case 'create':
      createTestDatabase();
      break;
    case 'clean':
      cleanDatabase();
      break;
    case 'drop':
      dropTestDatabase();
      break;
    case 'reset':
      dropTestDatabase();
      createTestDatabase();
      break;
    case 'setup':
      createTestDatabase();
      cleanDatabase();
      break;
    default:
      console.log('📋 Uso: node scripts/test-db-setup.js <action>');
      console.log('');
      console.log('Acciones disponibles:');
      console.log('  create  - Crear base de datos y usuario de tests');
      console.log('  clean   - Limpiar todas las tablas');
      console.log('  drop    - Eliminar base de datos y usuario de tests');
      console.log('  reset   - Eliminar y volver a crear la base de datos');
      console.log('  setup   - Crear base de datos y limpiar tablas');
      console.log('');
      console.log('Variables de entorno:');
      console.log('  REACT_APP_DB_HOST        - Host de la BD (default: localhost)');
      console.log('  REACT_APP_DB_PORT        - Puerto de la BD (default: 3306)');
      console.log('  REACT_APP_DB_NAME        - Nombre de la BD de tests (default: acamae_test)');
      console.log(
        '  REACT_APP_DB_USER        - Usuario de la BD de tests (default: acamae_test_user)'
      );
      console.log(
        '  REACT_APP_DB_PASSWORD    - Contraseña de la BD de tests (default: acamae_test_password)'
      );
      console.log('  REACT_APP_DB_ADMIN_USER  - Usuario administrador de la BD (default: root)');
      console.log('  REACT_APP_DB_ADMIN_PASSWORD - Contraseña del administrador (default: root)');
      process.exit(1);
  }
}

// Ejecutar si se llama directamente
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main();
}

// Funciones seguras para Cypress
export function setupTestDatabase() {
  validateTestEnvironment();
  return createTestDatabase();
}

export function cleanTestDatabase() {
  validateTestEnvironment();
  return cleanDatabase();
}

export function resetTestDatabase() {
  validateTestEnvironment();
  dropTestDatabase();
  return createTestDatabase();
}

export { createTestDatabase, cleanDatabase, dropTestDatabase, config };
