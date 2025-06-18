import { execSync } from 'child_process';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const targetDir = path.join(__dirname, '../docker/ssl');

// Create the target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Function to check if OpenSSL is installed
function isOpenSSLInstalled() {
  try {
    execSync('openssl version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Function to generate certificates using OpenSSL
function generateCertificates() {
  try {
    console.log('Generando certificados SSL...');

    // Command compatible with Windows, Linux and macOS
    const command =
      process.platform === 'win32'
        ? 'openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout selfsigned.key -out selfsigned.crt -subj "//CN=localhost"'
        : 'openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout selfsigned.key -out selfsigned.crt -subj "/CN=localhost"';

    // Execute the command in the target directory
    execSync(command, {
      cwd: targetDir,
      stdio: 'inherit',
    });

    console.log('Certificados SSL generados correctamente en:', targetDir);
  } catch {
    console.error('Error al generar los certificados SSL');
    process.exit(1);
  }
}

// Main function
function main() {
  if (!isOpenSSLInstalled()) {
    console.error('OpenSSL no está instalado. Por favor, instala OpenSSL:');
    console.error('- Windows: https://slproweb.com/products/Win32OpenSSL.html');
    console.error('- macOS: brew install openssl');
    console.error('- Linux: sudo apt-get install openssl');
    console.error(
      '\nAlternativa: Si estás en Windows, puedes intentar ejecutar este script desde Git Bash,'
    );
    console.error('ya que viene con OpenSSL preinstalado. Simplemente abre Git Bash y ejecuta:');
    console.error('cd /c/Users/alfon/www/acamae-main && node scripts/generate-ssl.js');
    process.exit(1);
  }

  generateCertificates();
}

main();
