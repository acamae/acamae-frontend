import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
const rootDir = process.cwd();

try {
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const newCoverage = {};

  // Keep the total
  if (coverage.total) {
    newCoverage.total = coverage.total;
  }

  // Process each file
  Object.entries(coverage).forEach(([filePath, data]) => {
    if (filePath === 'total') return;

    // Convert absolute path to relative
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    newCoverage[relativePath] = data;
  });

  // Write the new file
  fs.writeFileSync(coveragePath, JSON.stringify(newCoverage, null, 2));
  console.log('Coverage paths successfully converted to relative paths');
} catch (error) {
  console.error('Error processing coverage file:', error);
  process.exit(1);
}
