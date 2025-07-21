#!/usr/bin/env node

/**
 * Script simple para ejecutar tests E2E
 * Usa wait-on para esperar al servidor
 *
 * Uso:
 *   node scripts/test-e2e-simple.js                    # Ejecuta todos los tests
 *   node scripts/test-e2e-simple.js register-form      # Ejecuta tests que contengan "register-form"
 *   node scripts/test-e2e-simple.js comprehensive      # Ejecuta tests que contengan "comprehensive"
 */

import { execSync, spawn } from 'child_process';

const NODE_ENV = 'test';
const SERVER_PORT = 3000;
let serverProcess = null;
let cypressProcess = null;

// Obtener el patrón de test desde los argumentos de línea de comandos
const testPattern = process.argv[2];

console.log('🚀 Iniciando tests E2E...');
if (testPattern) {
  console.log(`🎯 Patrón de test: ${testPattern}`);
}

/**
 * Limpiar recursos
 */
function cleanup() {
  console.log('🧹 Limpiando...');
  try {
    execSync(`npx cross-env NODE_ENV=${NODE_ENV} npm run test:e2e:cleanup`, {
      stdio: 'inherit',
    });
    execSync(`npx kill-port ${SERVER_PORT}`, { stdio: 'ignore' });
  } catch (cleanupError) {
    console.error('⚠️ Error durante limpieza:', cleanupError.message);
  }

  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    console.log('✅ Servidor detenido');
  }

  if (cypressProcess) {
    cypressProcess.kill('SIGTERM');
    console.log('✅ Proceso de Cypress detenido');
  }

  try {
    execSync(`npx kill-port ${SERVER_PORT}`, { stdio: 'ignore' });
  } catch {}
}

try {
  console.log('🔧 Configurando base de datos...');
  execSync(`npx cross-env NODE_ENV=${NODE_ENV} npm run test:e2e:setup`, {
    stdio: 'inherit',
  });

  console.log('🌐 Iniciando servidor de desarrollo...');

  serverProcess = spawn('npm', ['run', 'start:dev'], {
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, NODE_ENV: NODE_ENV },
  });

  console.log('⏳ Esperando a que el servidor esté disponible...');

  // Esperar a que el servidor esté disponible
  execSync(`npx wait-on http://localhost:${SERVER_PORT}`, {
    stdio: 'inherit',
    timeout: 60000,
  });

  // Esperar adicionalmente para que la compilación termine y no haya errores
  console.log('⏳ Esperando a que la compilación termine...');
  execSync(`npx wait-on http://localhost:${SERVER_PORT} --timeout 30000 --interval 1000`, {
    stdio: 'inherit',
    timeout: 30000,
  });

  console.log('✅ Servidor disponible, ejecutando tests...');

  // Construir el comando de Cypress
  const cypressArgs = ['cross-env', `NODE_ENV=${NODE_ENV}`, 'cypress', 'run'];

  // Si se especificó un patrón, agregar el filtro
  if (testPattern) {
    cypressArgs.push('--spec', `cypress/e2e/**/*${testPattern}*.cy.ts`);
  }

  cypressProcess = spawn('npx', cypressArgs, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: NODE_ENV },
  });

  // Esperar a que el proceso de Cypress termine
  await new Promise((resolve, reject) => {
    cypressProcess.on('close', code => {
      if (code === 0) {
        console.log('✅ Tests completados exitosamente');
        resolve();
      } else {
        reject(new Error(`Cypress terminó con código de salida: ${code}`));
      }
    });

    cypressProcess.on('error', error => {
      reject(new Error(`Error en proceso de Cypress: ${error.message}`));
    });
  });
} catch (error) {
  console.error('❌ Error:', error.message);
  cleanup();
  process.exit(1);
} finally {
  cleanup();
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Recibida señal de interrupción, limpiando...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal de terminación, limpiando...');
  cleanup();
  process.exit(0);
});
