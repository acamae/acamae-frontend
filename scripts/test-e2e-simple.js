#!/usr/bin/env node

/**
 * Script simple para ejecutar tests E2E
 * Usa wait-on para esperar al servidor
 */

import { execSync, spawn } from 'child_process';

const NODE_ENV = 'testing';
const SERVER_PORT = 3000;
let serverProcess = null;
const cypressProcess = null;

console.log('🚀 Iniciando tests E2E...');

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

  execSync(`npx wait-on http://localhost:${SERVER_PORT}`, {
    stdio: 'inherit',
    timeout: 60000,
  });

  console.log('✅ Servidor disponible, ejecutando tests...');

  execSync(`npx cross-env NODE_ENV=${NODE_ENV} cypress run`, {
    stdio: 'inherit',
    shell: true,
  });

  console.log('✅ Tests completados exitosamente');
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
