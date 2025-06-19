import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { load as yamlLoad } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CRITICAL_FILES = {
  ci: '.github/workflows/ci.yml',
  setupEnv: '.github/actions/setup-env/action.yml',
  npmrc: '.npmrc',
  packageJson: 'package.json',
  lernaJson: 'lerna.json',
};

const CRITICAL_PATTERNS = {
  npmRegistry: /@acamae:registry=https:\/\/npm\.pkg\.github\.com/,
  npmAuth: /\/\/npm\.pkg\.github\.com\/:_authToken=\${(?:NODE_AUTH_TOKEN|GITHUB_TOKEN)}/,
  ciNpmrcStep: /Create \.npmrc file/,
  ciNpmToken:
    /NPM_TOKEN: \${{ (?:inputs\.npm-token|secrets\.NODE_AUTH_TOKEN \|\| secrets\.GITHUB_TOKEN) }}/,
  ciNodeSetup: /Setup Node\.js/,
  ciRegistry: /registry-url: 'https:\/\/npm\.pkg\.github\.com'/,
  ciScope: /scope: '@acamae'/,
};

function validateFile(filePath, patterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      results[key] = pattern.test(content);
    }

    return results;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function validateSetupEnv() {
  const setupEnvPath = path.join(process.cwd(), CRITICAL_FILES.setupEnv);
  const patterns = {
    npmrcStep: CRITICAL_PATTERNS.ciNpmrcStep,
    npmToken: CRITICAL_PATTERNS.ciNpmToken,
    nodeSetup: CRITICAL_PATTERNS.ciNodeSetup,
    registry: CRITICAL_PATTERNS.ciRegistry,
    scope: CRITICAL_PATTERNS.ciScope,
  };

  console.log('\nValidating Setup Environment Action...');
  const results = validateFile(setupEnvPath, patterns);

  if (!results) {
    console.error('❌ Setup environment action file not found');
    return false;
  }

  let valid = true;
  for (const [check, passed] of Object.entries(results)) {
    console.log(`${passed ? '✅' : '❌'} ${check}`);
    valid = valid && passed;
  }

  return valid;
}

const COVERAGE_STEPS = ['npm run test:coverage', 'npm run check:coverage'];

const usesSetupEnv = job =>
  (job.steps || []).some(s => s.uses?.includes('./.github/actions/setup-env'));

const hasInvalidCoverage = (name, job) =>
  (job.steps || []).some(
    s => COVERAGE_STEPS.includes(s.run) && !['sonarqube', 'ci-all'].includes(name)
  );

function validateCIConfig() {
  const ciPath = path.join(process.cwd(), CRITICAL_FILES.ci);

  try {
    const { jobs = {} } = yamlLoad(fs.readFileSync(ciPath, 'utf8'));
    console.log('\nValidating CI Configuration...');

    const setupEnvOk = Object.entries(jobs).some(([name, job]) => {
      const ok = usesSetupEnv(job);
      console.log(`${ok ? '✅' : '❌'} ${name}: Uses setup-env action`);
      return ok;
    });

    const coverageErrors = Object.entries(jobs).filter(([name, job]) =>
      hasInvalidCoverage(name, job)
    );

    coverageErrors.forEach(([name]) =>
      console.error(`❌ ${name}: Coverage step sólo en 'sonarqube' o 'ci-all'`)
    );

    return setupEnvOk && coverageErrors.length === 0;
  } catch (e) {
    console.error('❌ Error reading CI configuration:', e.message);
    return false;
  }
}

function validateNpmConfig() {
  const packagePath = path.join(process.cwd(), CRITICAL_FILES.packageJson);
  const lernaPath = path.join(process.cwd(), CRITICAL_FILES.lernaJson);

  console.log('\nValidating NPM Configuration...');

  // Verify package.json
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const hasCorrectRegistry = packageJson.publishConfig?.registry === 'https://npm.pkg.github.com/';
  console.log(`${hasCorrectRegistry ? '✅' : '❌'} Package.json registry configuration`);
  if (!hasCorrectRegistry) {
    console.error('❌ Package.json registry configuration is incorrect.');
  }

  // Verify lerna.json
  const lernaJson = JSON.parse(fs.readFileSync(lernaPath, 'utf8'));
  const hasCorrectNpmClient = lernaJson.npmClient === 'npm';
  console.log(`${hasCorrectNpmClient ? '✅' : '❌'} Lerna npm client configuration`);
  if (!hasCorrectNpmClient) {
    console.error('❌ Lerna npm client configuration is incorrect.');
  }

  // Verify that lerna.json only allows versioning/publishing in the 'release' branch
  const hasCorrectAllowBranch = lernaJson.command?.version?.allowBranch.includes('release');
  console.log(`${hasCorrectAllowBranch ? '✅' : '❌'} Lerna allowBranch configuration`);
  if (!hasCorrectAllowBranch) {
    console.error('❌ Lerna allowBranch configuration is incorrect.');
  }

  return hasCorrectRegistry && hasCorrectNpmClient && hasCorrectAllowBranch;
}

function main() {
  console.log('🔍 Validating Critical Configurations...\n');

  const results = {
    setupEnv: validateSetupEnv(),
    ci: validateCIConfig(),
    npm: validateNpmConfig(),
  };

  console.log('\nValidation Summary:');
  console.log('------------------');
  for (const [check, passed] of Object.entries(results)) {
    console.log(`${passed ? '✅' : '❌'} ${check} configuration`);
  }

  const allValid = Object.values(results).every(Boolean);
  if (!allValid) {
    console.error('\n❌ Critical configuration validation failed');
    console.error(
      'Please review the errors above and ensure all critical configurations are present'
    );
    process.exit(1);
  }

  console.log('\n✅ All critical configurations validated successfully');
}

main();
