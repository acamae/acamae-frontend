import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { load as yamlLoad } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOW_DIR = path.join(process.cwd(), '.github', 'workflows');
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

    // Validar tokens
    Object.entries(jobs).forEach(([jobName, job]) => {
      const steps = job.steps || [];
      steps.forEach((step, index) => {
        if (step.with?.token) {
          const tokenValue = step.with.token;
          if (
            VALIDATION_RULES.security.tokens.patterns.incorrect.some(pattern =>
              pattern.test(tokenValue)
            )
          ) {
            this.errors.push(
              `Job "${jobName}" step ${index + 1}: Incorrect token usage pattern: ${tokenValue}`
            );
          }
        }

        // Validar tokens en los pasos de la acción compuesta
        const compositeSteps = this.getCompositeActionSteps(step);
        compositeSteps.forEach((compositeStep, compositeIndex) => {
          if (compositeStep.with?.token) {
            const tokenValue = compositeStep.with.token;
            if (
              VALIDATION_RULES.security.tokens.patterns.incorrect.some(pattern =>
                pattern.test(tokenValue)
              )
            ) {
              this.errors.push(
                `Job "${jobName}" composite step ${compositeIndex + 1}: Incorrect token usage pattern: ${tokenValue}`
              );
            }
          }
        });
      });

      // Validar permisos
      if (!job.permissions) {
        this.warnings.push(`Job "${jobName}": Missing explicit permissions`);
      } else {
        const missingPermissions = VALIDATION_RULES.security.permissions.required.filter(
          perm => !job.permissions[perm]
        );
        if (missingPermissions.length > 0) {
          this.warnings.push(
            `Job "${jobName}": Missing required permissions: ${missingPermissions.join(', ')}`
          );
        }
      }
    });
  }

  validateConfiguration() {
    const jobs = this.content.jobs || {};

    Object.entries(jobs).forEach(([jobName, job]) => {
      const steps = job.steps || [];
      let allSteps = [];

      // Recolectar todos los pasos, incluyendo los de acciones compuestas
      steps.forEach(step => {
        allSteps.push(step);
        allSteps = allSteps.concat(this.getCompositeActionSteps(step));
      });

      // Validar configuración de Node.js
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

      // Validar secuencia de pasos
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

      // Validar orden de los pasos
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
        if (step.uses?.includes('setup-env')) return; // Ignorar la acción compuesta

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

  validate() {
    this.validateSecurity();
    this.validateConfiguration();
    this.validateLogic();
    this.findDuplicates();

    return {
      file: path.basename(this.workflowPath),
      passed: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions,
    };
  }
}

function validateAllWorkflows() {
  console.log('🔍 Validating GitHub Actions Workflows...\n');

  const workflowFiles = fs
    .readdirSync(WORKFLOW_DIR)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

  const results = workflowFiles.map(file => {
    const workflowPath = path.join(WORKFLOW_DIR, file);
    const validator = new WorkflowValidator(workflowPath);
    return validator.validate();
  });

  // Imprimir resultados
  results.forEach(result => {
    console.log(`\n📄 ${result.file}`);
    console.log('-------------------');

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (result.suggestions.length > 0) {
      console.log('\n💡 Suggestions:');
      result.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log('✅ All checks passed');
    }
  });

  // Salir con error si hay errores en algún workflow
  const hasErrors = results.some(result => !result.passed);
  if (hasErrors) {
    process.exit(1);
  }
}

validateAllWorkflows();
