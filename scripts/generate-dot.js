import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const output = execSync('npx depcruise --output-type dot src', { encoding: 'utf8' });
writeFileSync('dependency-graph.dot', output, { encoding: 'utf8', flag: 'w' });
console.log('dependency-graph.dot generated (UTF-8 without BOM)');
