import * as fs from 'fs';
import { exit } from 'node:process';
import * as path from 'path';

const summaryPath = path.resolve('coverage/coverage-summary.json');
const threshold = 90;

if (!fs.existsSync(summaryPath)) {
  console.error('❌ No se encontró coverage-summary.json. ¿Ejecutaste "npm run test"?');
  exit(1);
}

const content = fs.readFileSync(summaryPath, 'utf-8');
const { total } = JSON.parse(content);

const results = {
  statements: total.statements.pct,
  branches: total.branches.pct,
  functions: total.functions.pct,
  lines: total.lines.pct,
};

const meetsThreshold = Object.values(results).every(value => value >= threshold);

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
