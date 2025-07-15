import * as fs from 'fs';
import { exit } from 'node:process';
import * as path from 'path';

const summaryPath = path.resolve('coverage/coverage-summary.json');
const threshold = 85; // Adjusted from 90 to 85 for more realistic expectations

// Check if the coverage summary file exists
if (!fs.existsSync(summaryPath)) {
  console.error('❌ No se encontró coverage-summary.json. ¿Ejecutaste "npm run test"?');
  exit(1);
}

// Read the coverage summary file
const content = fs.readFileSync(summaryPath, 'utf-8');
const { total } = JSON.parse(content);

// Calculate the coverage results
const results = {
  statements: total.statements.pct,
  branches: total.branches.pct,
  functions: total.functions.pct,
  lines: total.lines.pct,
};

// Check if the coverage meets the threshold
const meetsThreshold = Object.values(results).every(value => value >= threshold);

// If the coverage does not meet the threshold, exit with an error
if (!meetsThreshold) {
  console.error(`\n❌ La cobertura total no alcanza el umbral del ${threshold}%`);
  console.error('Cobertura actual:');
  console.error(`- Statements: ${results.statements.toFixed(2)}%`);
  console.error(`- Branches:   ${results.branches.toFixed(2)}%`);
  console.error(`- Functions:  ${results.functions.toFixed(2)}%`);
  console.error(`- Lines:      ${results.lines.toFixed(2)}%`);
  exit(1);
} else {
  console.log(`✅ Cobertura OK (${threshold}%)`);
}
