#!/usr/bin/env node

/**
 * Script para verificar que la configuración de tests esté funcionando correctamente
 */

import { execSync } from 'child_process';
import https from 'https';
import { dirname } from 'path';
import { URL, fileURLToPath } from 'url';

// Configuración
const config = {
  frontendUrl: 'https://localhost',
  apiUrl: 'https://localhost/api',
  dbHost: process.env.REACT_APP_DB_HOST || 'localhost',
  dbPort: process.env.REACT_APP_DB_PORT || 3306,
  dbUser: process.env.REACT_APP_DB_ADMIN_USER || 'root',
  dbPassword: process.env.REACT_APP_DB_ADMIN_PASSWORD || 'root',
};

const errors = [];
const warnings = [];

/**
 * Ejecuta un comando y devuelve el resultado
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
 * Verifica conectividad HTTPS
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
      rejectUnauthorized: false, // Ignorar errores de certificado SSL
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
 * Verifica la base de datos MySQL
 */
function checkDatabase() {
  console.log('🔍 Verificando conexión a la base de datos...');

  // Primero verificar si mysql está disponible
  const mysqlCheck = runCommand('mysql --version', { timeout: 5000 });

  if (!mysqlCheck.success) {
    console.log('⚠️  Cliente MySQL no encontrado en el sistema');
    warnings.push(
      'Base de datos: Cliente MySQL no disponible en PATH. Esto es normal si usas Docker.'
    );
    return true; // No es un error crítico si usan Docker
  }

  // Si está disponible, intentar conectar
  const testCmd = `mysql -h ${config.dbHost} -P ${config.dbPort} -u ${config.dbUser} -p${config.dbPassword} -e "SELECT 1;" 2>nul`;
  const result = runCommand(testCmd, { timeout: 10000 });

  if (result.success) {
    console.log('✅ Conexión a MySQL exitosa');
    return true;
  } else {
    console.log('❌ Error conectando a MySQL');
    errors.push(
      `Base de datos: No se pudo conectar. Verifica que MySQL esté ejecutándose y las credenciales sean correctas.`
    );
    return false;
  }
}

/**
 * Verifica el frontend
 */
async function checkFrontend() {
  console.log('🔍 Verificando frontend (https://localhost)...');

  const result = await checkHttpsConnectivity(config.frontendUrl);

  if (result.success) {
    console.log(`✅ Frontend accesible (Status: ${result.statusCode})`);
    return true;
  } else {
    console.log('❌ Frontend no accesible');
    errors.push(`Frontend: ${result.error}`);
    return false;
  }
}

/**
 * Verifica la API
 */
async function checkApi() {
  console.log('🔍 Verificando API (https://localhost/api)...');

  // Intentar con diferentes endpoints comunes
  const endpoints = ['/api', '/api/health', '/api/status'];

  for (const endpoint of endpoints) {
    const url = `${config.frontendUrl}${endpoint}`;
    const result = await checkHttpsConnectivity(url);

    if (result.success) {
      console.log(`✅ API accesible en ${endpoint} (Status: ${result.statusCode})`);
      return true;
    }
  }

  console.log('❌ API no accesible en ningún endpoint');
  errors.push('API: No se pudo conectar a ningún endpoint de la API');
  return false;
}

/**
 * Verifica la configuración de Cypress
 */
async function checkCypressConfig() {
  console.log('🔍 Verificando configuración de Cypress...');

  try {
    // Verificar que el archivo de configuración existe usando Node.js
    const fs = await import('fs');

    if (!fs.existsSync('cypress.config.js')) {
      errors.push('Cypress: Archivo cypress.config.js no encontrado');
      return false;
    }

    // Verificar que los archivos de soporte existen
    if (!fs.existsSync('cypress/support/database.ts')) {
      warnings.push('Cypress: Archivo cypress/support/database.ts no encontrado');
    }

    console.log('✅ Configuración de Cypress encontrada');
    return true;
  } catch (error) {
    console.log('❌ Error verificando configuración de Cypress');
    errors.push(`Cypress: ${error.message}`);
    return false;
  }
}

/**
 * Verifica los scripts de base de datos
 */
async function checkDatabaseScripts() {
  console.log('🔍 Verificando scripts de base de datos...');

  try {
    const fs = await import('fs');

    if (!fs.existsSync('scripts/test-db-setup.js')) {
      errors.push('Scripts: Archivo scripts/test-db-setup.js no encontrado');
      return false;
    }

    // Probar el script sin argumentos (debería mostrar ayuda)
    const helpResult = runCommand('node scripts/test-db-setup.js', { timeout: 5000 });
    if (helpResult.output && helpResult.output.includes('Uso: node scripts/test-db-setup.js')) {
      console.log('✅ Script de base de datos funcionando');
      return true;
    } else {
      warnings.push('Scripts: El script de BD no muestra la ayuda esperada');
      return true; // No es un error crítico
    }
  } catch (error) {
    console.log('❌ Error verificando scripts de base de datos');
    errors.push(`Scripts: ${error.message}`);
    return false;
  }
}

/**
 * Verifica las variables de entorno
 */
function checkEnvironmentVariables() {
  console.log('🔍 Verificando variables de entorno...');

  const requiredVars = [
    'REACT_APP_DB_HOST',
    'REACT_APP_DB_PORT',
    'REACT_APP_DB_USER',
    'REACT_APP_DB_PASSWORD',
    'REACT_APP_API_URL',
    'REACT_APP_CYPRESS_BASE_URL',
  ];

  const missing = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    warnings.push(`Variables de entorno faltantes: ${missing.join(', ')}`);
    console.log('⚠️  Algunas variables de entorno no están configuradas');
  } else {
    console.log('✅ Variables de entorno configuradas');
  }

  return missing.length === 0;
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Verificando configuración de tests para acamae-frontend\n');

  // Cargar variables de entorno si existe el archivo
  try {
    const { config } = await import('dotenv');
    config({ path: '.env.testing' });
  } catch {
    warnings.push('Archivo .env.testing no encontrado o no se pudo cargar');
  }

  const checks = [
    () => checkEnvironmentVariables(),
    () => checkDatabase(),
    () => checkFrontend(),
    () => checkApi(),
    () => checkCypressConfig(),
    () => checkDatabaseScripts(),
  ];

  let successCount = 0;

  for (const check of checks) {
    try {
      const result = await check();
      if (result) successCount++;
    } catch (error) {
      errors.push(`Error inesperado: ${error.message}`);
    }
    console.log(''); // Línea en blanco
  }

  // Mostrar resumen
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Verificaciones exitosas: ${successCount}/${checks.length}`);

  if (warnings.length > 0) {
    console.log(`⚠️  Advertencias: ${warnings.length}`);
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (errors.length > 0) {
    console.log(`❌ Errores: ${errors.length}`);
    errors.forEach(error => console.log(`   - ${error}`));
    console.log('\n🔧 RECOMENDACIONES:');
    console.log('1. Asegúrate de que Docker esté ejecutándose');
    console.log('2. Verifica que los contenedores de Nginx estén activos');
    console.log('3. Confirma que MySQL esté ejecutándose');
    console.log('4. Crea el archivo .env.testing basado en env.testing.example');
    console.log('5. Ejecuta: npm run test:e2e:setup');
    process.exit(1);
  } else {
    console.log('\n🎉 ¡Configuración verificada exitosamente!');
    console.log('Puedes ejecutar los tests con: npm run test:e2e');
    process.exit(0);
  }
}

// Ejecutar si se llama directamente

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  main().catch(error => {
    console.error('Error durante la verificación:', error);
    process.exit(1);
  });
}

export { main };
