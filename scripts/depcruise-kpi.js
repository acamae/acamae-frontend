import { execSync } from 'child_process';

const SRC = 'src';

const depcruiseJson = execSync(`npx depcruise --output-type json ${SRC}`, { encoding: 'utf8' });
const report = JSON.parse(depcruiseJson);

// Número de ciclos
const cycles =
  (report.summary && report.summary.cycleCount) || (report.cycles ? report.cycles.length : 0);

// Profundidad máxima de dependencias
const maxDepth = (report.summary && report.summary.maxDepth) || 0;

// Módulos huérfanos
const orphanModules = (report.orphanModules && report.orphanModules.length) || 0;
const totalModules = (report.modules && report.modules.length) || 1;
const orphanPercent = ((orphanModules / totalModules) * 100).toFixed(2);

// Fan-in y fan-out
let maxFanIn = 0,
  maxFanOut = 0;
let maxFanInModules = [];
let maxFanOutModules = [];

report.modules.forEach(mod => {
  const fanOut = mod.dependencies ? mod.dependencies.length : 0;
  const fanIn = mod.dependents ? mod.dependents.length : 0;

  if (fanOut > maxFanOut) {
    maxFanOut = fanOut;
    maxFanOutModules = [mod.source];
  } else if (fanOut === maxFanOut && fanOut > 0) {
    maxFanOutModules.push(mod.source);
  }

  if (fanIn > maxFanIn) {
    maxFanIn = fanIn;
    maxFanInModules = [mod.source];
  } else if (fanIn === maxFanIn && fanIn > 0) {
    maxFanInModules.push(mod.source);
  }
});

// Violaciones de reglas de arquitectura (detalladas)
let ruleViolations = [];
if (report.modules) {
  report.modules.forEach(mod => {
    if (mod.dependencies) {
      mod.dependencies.forEach(dep => {
        if (dep.valid === false && dep.rules) {
          dep.rules.forEach(rule => {
            ruleViolations.push({
              from: mod.source,
              to: dep.resolved,
              rule: rule.name,
              severity: rule.severity,
              comment: rule.comment,
              explanation: rule.explanation,
            });
          });
        }
      });
    }
  });
}

// Nombres de módulos huérfanos
const orphanModuleNames = report.orphanModules || [];

// Ciclos detectados
const cyclesList = (report.cycles || []).map(cycle => (cycle.cyclePath ? cycle.cyclePath : cycle));

console.log('--- Dependency KPIs ---');
console.log(`Cycles: ${cycles}`);
if (cyclesList.length > 0) {
  console.log('Cycle details:');
  cyclesList.forEach((cycle, idx) => {
    console.log(`  Cycle ${idx + 1}: ${cycle.join(' -> ')} -> ${cycle[0]}`);
  });
}
console.log(`Max dependency depth: ${maxDepth}`);
console.log(`Orphan modules: ${orphanModules} (${orphanPercent}%)`);
if (orphanModuleNames.length > 0) {
  console.log('Orphan module names:');
  orphanModuleNames.forEach(name => console.log(`  - ${name}`));
}
console.log(`Max fan-in: ${maxFanIn}`);
if (maxFanInModules.length > 0) {
  console.log('Modules with max fan-in:');
  maxFanInModules.forEach(name => console.log(`  - ${name}`));
}
console.log(`Max fan-out: ${maxFanOut}`);
if (maxFanOutModules.length > 0) {
  console.log('Modules with max fan-out:');
  maxFanOutModules.forEach(name => console.log(`  - ${name}`));
}
console.log(`Architecture rule violations: ${ruleViolations.length}`);
if (ruleViolations.length > 0) {
  console.log('Rule violation details:');
  ruleViolations.forEach((v, idx) => {
    console.log(`  ${idx + 1}. [${v.severity}] Rule: "${v.rule}"`);
    console.log(`     From: ${v.from}`);
    console.log(`     To:   ${v.to}`);
    if (v.comment) console.log(`     Comment: ${v.comment}`);
    if (v.explanation) console.log(`     Explanation: ${v.explanation}`);
  });
}
console.log('-----------------------');
