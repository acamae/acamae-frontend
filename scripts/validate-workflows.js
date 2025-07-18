import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import glob from 'glob';
import { load as yamlLoad } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACTIONS_DIR = path.join(process.cwd(), '.github', 'actions');

const VALIDATION_RULES = {
  security: {
    tokens: {
      patterns: {
        correct: [
          /\${{ secrets\.GITHUB_TOKEN }}/,
          /\${{ secrets\.NODE_AUTH_TOKEN \|\| secrets\.GITHUB_TOKEN }}/,
        ],
        incorrect: [/\${{ secrets\.NODE_AUTH_TOKEN }}(?!\s*\|\|\s*secrets\.GITHUB_TOKEN)/],
      },
    },
    permissions: {
      required: ['contents', 'packages', 'pull-requests'],
    },
  },
  configuration: {
    nodeSetup: {
      required: ['node-version', 'registry-url', 'scope'],
      values: {
        'registry-url': 'https://npm.pkg.github.com',
        scope: '@acamae',
      },
    },
    npmConfig: {
      requiredSteps: ['Create .npmrc', 'Install dependencies'],
      sequence: ['Setup Node.js', 'Create .npmrc', 'Install dependencies'],
    },
  },
  logic: {
    jobDependencies: {
      requireExplicit: true,
      validateConditions: true,
    },
  },
};

class WorkflowValidator {
  constructor(workflowPath) {
    this.workflowPath = workflowPath;
    this.content = yamlLoad(fs.readFileSync(workflowPath, 'utf8'));
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
    this.compositeActions = new Map();
  }

  loadCompositeAction(actionPath) {
    try {
      const actionContent = yamlLoad(fs.readFileSync(actionPath, 'utf8'));
      return actionContent;
    } catch (err) {
      this.warnings.push(`Could not load composite action at ${actionPath}: ${err.message}`);
      return null;
    }
  }

  getCompositeActionSteps(step) {
    if (!step.uses?.startsWith('./.github/actions/')) {
      return [];
    }

    const actionName = step.uses.split('/')[3];
    if (!this.compositeActions.has(actionName)) {
      const actionPath = path.join(ACTIONS_DIR, actionName, 'action.yml');
      const actionContent = this.loadCompositeAction(actionPath);
      this.compositeActions.set(actionName, actionContent);
    }

    const actionContent = this.compositeActions.get(actionName);
    return actionContent?.runs?.steps || [];
  }

  validateSecurity() {
    const jobs = this.content.jobs || {};
    for (const [jobName, job] of Object.entries(jobs)) {
      this.validateJobSecurity(jobName, job);
    }
  }

  validateConfiguration() {
    const jobs = this.content.jobs || {};

    Object.entries(jobs).forEach(([jobName, job]) => {
      const steps = job.steps || [];
      let allSteps = [];

      // Collect all steps, including composite actions
      steps.forEach(step => {
        allSteps.push(step);
        allSteps = allSteps.concat(this.getCompositeActionSteps(step));
      });

      // Validate Node.js configuration
      const nodeSetup = allSteps.find(step => step.name?.includes('Setup Node.js'));
      if (nodeSetup) {
        VALIDATION_RULES.configuration.nodeSetup.required.forEach(prop => {
          if (!nodeSetup.with?.[prop]) {
            this.errors.push(`Job "${jobName}": Missing required Node.js setup property: ${prop}`);
          }
        });

        Object.entries(VALIDATION_RULES.configuration.nodeSetup.values).forEach(
          ([prop, expectedValue]) => {
            if (nodeSetup.with?.[prop] !== expectedValue) {
              this.errors.push(
                `Job "${jobName}": Incorrect ${prop} value. Expected: ${expectedValue}, Got: ${nodeSetup.with?.[prop]}`
              );
            }
          }
        );
      }

      // Validate step sequence
      const stepNames = allSteps.map(step => step.name);
      const requiredSteps = VALIDATION_RULES.configuration.npmConfig.requiredSteps;
      const missingSteps = requiredSteps.filter(
        requiredStep => !stepNames.some(name => name?.includes(requiredStep))
      );

      if (missingSteps.length > 0 && !steps.some(step => step.uses?.includes('setup-env'))) {
        missingSteps.forEach(step => {
          this.errors.push(`Job "${jobName}": Missing required step: ${step}`);
        });
      }

      // Validate step order
      const sequence = VALIDATION_RULES.configuration.npmConfig.sequence;
      let lastFoundIndex = -1;
      sequence.forEach(stepName => {
        const currentIndex = stepNames.findIndex(name => name?.includes(stepName));
        if (currentIndex !== -1) {
          if (currentIndex < lastFoundIndex) {
            this.errors.push(
              `Job "${jobName}": Incorrect step order. ${stepName} should come after ${sequence[sequence.indexOf(stepName) - 1]}`
            );
          }
          lastFoundIndex = currentIndex;
        }
      });
    });
  }

  validateLogic() {
    const jobs = this.content.jobs || {};

    Object.entries(jobs).forEach(([jobName, job]) => {
      if (job.needs) {
        const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
        needs.forEach(neededJob => {
          if (!jobs[neededJob]) {
            this.errors.push(
              `Job "${jobName}": References non-existent job in needs: ${neededJob}`
            );
          }
        });
      }

      if (job.if) {
        try {
          const condition = job.if.toString();
          if (condition.includes('||') && !condition.includes('${{')) {
            this.warnings.push(
              `Job "${jobName}": Condition might need expression syntax: ${condition}`
            );
          }
        } catch (err) {
          this.errors.push(`Job "${jobName}": Invalid condition syntax: ${err.message}`);
        }
      }
    });
  }

  findDuplicates() {
    const jobs = this.content.jobs || {};
    const stepSignatures = new Map();

    Object.entries(jobs).forEach(([jobName, job]) => {
      const steps = job.steps || [];
      steps.forEach((step, index) => {
        if (step.uses?.includes('setup-env')) return; // Ignore composite action

        const signature = JSON.stringify({
          name: step.name,
          uses: step.uses,
          run: step.run,
        });

        if (!stepSignatures.has(signature)) {
          stepSignatures.set(signature, []);
        }
        stepSignatures.get(signature).push({ job: jobName, index });
      });
    });

    stepSignatures.forEach((occurrences, signature) => {
      if (occurrences.length > 1) {
        const step = JSON.parse(signature);
        const locations = occurrences.map(o => `${o.job}[${o.index}]`).join(', ');
        this.suggestions.push(
          `Potential duplicate step "${step.name || step.uses || step.run}" in: ${locations}`
        );
      }
    });
  }

  validateCoverageSteps() {
    const jobs = this.content.jobs || {};
    const coverageSteps = ['npm run test:coverage', 'npm run check:coverage'];
    Object.entries(jobs).forEach(([jobName, job]) => {
      const steps = job.steps || [];
      steps.forEach(step => {
        if (coverageSteps.includes(step.run)) {
          if (jobName !== 'sonarqube' && jobName !== 'ci-all') {
            this.errors.push(
              `Coverage step '${step.run}' debe estar solo en el job 'sonarqube' o 'ci-all' (actual: ${jobName})`
            );
          }
        }
      });
    });
  }

  validate() {
    this.validateSecurity();
    this.validateConfiguration();
    this.validateLogic();
    this.findDuplicates();
    this.validateCoverageSteps();
    return {
      file: path.basename(this.workflowPath),
      passed: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions,
    };
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  // ---------- Helper methods to keep validateSecurity simple ----------

  isIncorrectToken(tokenValue) {
    return VALIDATION_RULES.security.tokens.patterns.incorrect.some(pattern =>
      pattern.test(tokenValue)
    );
  }

  validateTokens(jobName, steps) {
    steps.forEach((step, i) => {
      if (step.with?.token && this.isIncorrectToken(step.with.token)) {
        this.errors.push(
          `Job "${jobName}" step ${i + 1}: Incorrect token usage pattern: ${step.with.token}`
        );
      }

      // Composite actions
      this.getCompositeActionSteps(step).forEach((cStep, j) => {
        if (cStep.with?.token && this.isIncorrectToken(cStep.with.token)) {
          this.errors.push(
            `Job "${jobName}" composite step ${j + 1}: Incorrect token usage pattern: ${cStep.with.token}`
          );
        }
      });
    });
  }

  validatePermissions(jobName, permissions) {
    if (!permissions) {
      this.warnings.push(`Job "${jobName}": Missing explicit permissions`);
      return;
    }

    const missing = VALIDATION_RULES.security.permissions.required.filter(p => !permissions[p]);
    if (missing.length) {
      this.warnings.push(`Job "${jobName}": Missing required permissions: ${missing.join(', ')}`);
    }
  }

  validateJobSecurity(jobName, job) {
    const steps = job.steps || [];
    this.validateTokens(jobName, steps);
    this.validatePermissions(jobName, job.permissions);
  }
}

function validateWorkflow(file) {
  const validator = new WorkflowValidator(file);
  validator.validate();
  return validator;
}

// Custom checks for versioning and SonarCloud
function checkVersioning(workflowFile, jobs) {
  const versioningPatterns = [/lerna version/, /lerna publish/, /git push --follow-tags/];
  let foundVersioning = false;

  Object.entries(jobs).forEach(([_jobName, job]) => {
    const steps = job.steps || [];
    steps.forEach(step => {
      const runCmd = step.run || '';
      versioningPatterns.forEach(pattern => {
        if (pattern.test(runCmd)) {
          foundVersioning = true;
          if (workflowFile !== 'release.yml') {
            console.error(`❌ Versioning/publishing command found in ${workflowFile}: ${runCmd}`);
          }
        }
      });
    });
  });

  if (workflowFile === 'release.yml' && !foundVersioning) {
    console.warn('⚠️  No versioning/publishing steps found in release.yml');
  }
}

function checkSonarCloud(workflowFile, jobs) {
  if (workflowFile === 'ci.yml') {
    let foundSonar = false;
    Object.entries(jobs).forEach(([_jobName, job]) => {
      const steps = job.steps || [];
      steps.forEach(step => {
        if (step.uses && step.uses.includes('SonarSource/sonarqube-scan-action')) {
          foundSonar = true;
        }
      });
    });
    if (!foundSonar) {
      console.warn('💡 Suggestion: SonarQube scan step not found in ci.yml');
    }
  }
}

// Main validation
const workflows = glob.sync('.github/workflows/*.yml');
let hasErrors = false;

workflows.forEach(file => {
  console.log(`\nValidating ${file}...`);
  const validator = validateWorkflow(file);

  if (validator.hasErrors()) {
    hasErrors = true;
    console.error(`\n❌ ${file} has validation errors:`);
    validator.errors.forEach(error => console.error(`  - ${error}`));
  } else {
    console.log(`\n✅ ${file} passed all validations`);
  }

  // Custom checks
  if (path.basename(file) !== 'release.yml') {
    checkVersioning(file, validator.content.jobs || {});
  }
  checkSonarCloud(file, validator.content.jobs || {});
});

if (hasErrors) {
  process.exit(1);
}
