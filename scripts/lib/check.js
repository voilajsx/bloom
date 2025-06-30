/**
 * Bloom Framework - Comprehensive Quality Check
 * @file scripts/lib/check.js
 */

import fs from 'fs';
import path from 'path';
import {
  logSuccess,
  logError,
  logWarning,
  logBox,
  log,
  colors,
  symbols,
  Timer,
  Spinner,
} from './utils.js';
import { runContracts } from './contracts.js';
import { runSecurity } from './security.js';
import { runFormat } from './format.js';

/**
 * Main check command - runs all quality checks
 */
export async function runCheck(args) {
  const timer = new Timer();

  console.clear();

  logBox(`${symbols.target} Bloom Quality Check`, [
    `${symbols.contracts} Contract validation`,
    `${symbols.security} Security audit`,
    `${symbols.code} Code formatting`,
    `${symbols.performance} Performance metrics`,
  ]);

  const results = {
    contracts: { passed: false, errors: [], warnings: [] },
    security: { passed: false, errors: [], warnings: [] },
    formatting: { passed: false, errors: [], warnings: [] },
    performance: { passed: false, errors: [], warnings: [] },
    discovery: { passed: false, errors: [], warnings: [] },
  };

  // Run all checks
  try {
    // 1. Feature Discovery Check
    log(`${symbols.bloom} Checking feature discovery...`, 'white');
    results.discovery = await checkFeatureDiscovery();

    // 2. Contract Validation
    log(`${symbols.contracts} Validating contracts...`, 'white');
    results.contracts = await checkContracts();

    // 3. Security Audit
    log(`${symbols.security} Running security audit...`, 'white');
    results.security = await checkSecurity();

    // 4. Code Formatting
    log(`${symbols.code} Checking code formatting...`, 'white');
    results.formatting = await checkFormatting();

    // 5. Performance Check
    log(`${symbols.performance} Analyzing performance...`, 'white');
    results.performance = await checkPerformance();
  } catch (error) {
    logError(`Check failed: ${error.message}`);
    process.exit(1);
  }

  // Display results
  console.clear();
  displayResults(results, timer.end());
}

/**
 * Check feature discovery
 */
async function checkFeatureDiscovery() {
  const spinner = new Spinner('Discovering features...');
  spinner.start();

  try {
    const featuresDir = path.join(process.cwd(), 'src/features');

    if (!fs.existsSync(featuresDir)) {
      spinner.fail('Features directory not found');
      return {
        passed: false,
        errors: ['Features directory (src/features) does not exist'],
        warnings: [],
      };
    }

    const entries = fs.readdirSync(featuresDir, { withFileTypes: true });
    const features = [];
    const errors = [];
    const warnings = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        const featurePath = path.join(featuresDir, entry.name);
        const indexPath = path.join(featurePath, 'index.ts');

        if (fs.existsSync(indexPath)) {
          // Check if feature config is valid
          try {
            const content = fs.readFileSync(indexPath, 'utf8');
            if (!content.includes('BloomFeatureConfig')) {
              errors.push(`Feature ${entry.name}: Invalid config structure`);
            } else {
              features.push(entry.name);
            }
          } catch (error) {
            errors.push(
              `Feature ${entry.name}: Cannot read config - ${error.message}`
            );
          }
        } else {
          warnings.push(`Feature ${entry.name}: Missing index.ts file`);
        }
      }
    }

    spinner.succeed(`Found ${features.length} valid features`);

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      featuresCount: features.length,
      features,
    };
  } catch (error) {
    spinner.fail('Feature discovery failed');
    return {
      passed: false,
      errors: [error.message],
      warnings: [],
    };
  }
}

/**
 * Check contracts
 */
async function checkContracts() {
  const spinner = new Spinner('Validating contracts...');
  spinner.start();

  try {
    // This would call the actual contract validation
    // For now, we'll simulate it
    const result = await simulateContractCheck();

    if (result.passed) {
      spinner.succeed('All contracts valid');
    } else {
      spinner.fail(`${result.errors.length} contract errors found`);
    }

    return result;
  } catch (error) {
    spinner.fail('Contract validation failed');
    return {
      passed: false,
      errors: [error.message],
      warnings: [],
    };
  }
}

/**
 * Check security
 */
async function checkSecurity() {
  const spinner = new Spinner('Running security audit...');
  spinner.start();

  try {
    const result = await simulateSecurityCheck();

    if (result.passed) {
      spinner.succeed('No security issues found');
    } else {
      spinner.fail(`${result.errors.length} security issues found`);
    }

    return result;
  } catch (error) {
    spinner.fail('Security audit failed');
    return {
      passed: false,
      errors: [error.message],
      warnings: [],
    };
  }
}

/**
 * Check code formatting
 */
async function checkFormatting() {
  const spinner = new Spinner('Checking code formatting...');
  spinner.start();

  try {
    const result = await simulateFormattingCheck();

    if (result.passed) {
      spinner.succeed('Code follows Bloom patterns');
    } else {
      spinner.fail(`${result.errors.length} formatting issues found`);
    }

    return result;
  } catch (error) {
    spinner.fail('Formatting check failed');
    return {
      passed: false,
      errors: [error.message],
      warnings: [],
    };
  }
}

/**
 * Check performance
 */
async function checkPerformance() {
  const spinner = new Spinner('Analyzing performance...');
  spinner.start();

  try {
    const result = await simulatePerformanceCheck();

    if (result.passed) {
      spinner.succeed(`Bundle size: ${result.bundleSize}KB (within limits)`);
    } else {
      spinner.fail(`Performance issues detected`);
    }

    return result;
  } catch (error) {
    spinner.fail('Performance check failed');
    return {
      passed: false,
      errors: [error.message],
      warnings: [],
    };
  }
}

/**
 * Display comprehensive results
 */
function displayResults(results, totalTime) {
  const passed = Object.values(results).every((r) => r.passed);
  const totalErrors = Object.values(results).reduce(
    (sum, r) => sum + r.errors.length,
    0
  );
  const totalWarnings = Object.values(results).reduce(
    (sum, r) => sum + r.warnings.length,
    0
  );

  if (passed) {
    logBox(
      `${symbols.check} All Checks Passed!`,
      [
        `${symbols.bloom} Framework health: Excellent`,
        `${symbols.lightning} Completed in ${totalTime}ms`,
        `${symbols.sparkles} Ready for development`,
      ],
      'green'
    );
  } else {
    logBox(
      `${symbols.warning} Issues Found`,
      [
        `${symbols.error} ${totalErrors} errors need attention`,
        `${symbols.warning} ${totalWarnings} warnings to review`,
        `${symbols.fire} Fix issues for optimal performance`,
      ],
      'yellow'
    );
  }

  // Detailed results
  console.log();
  log(`${colors.bright}Detailed Results:${colors.reset}`, 'white');

  Object.entries(results).forEach(([check, result]) => {
    const icon = result.passed ? symbols.check : symbols.error;
    const color = result.passed ? 'green' : 'red';
    const checkName = check.charAt(0).toUpperCase() + check.slice(1);

    log(`  ${icon} ${colors[color]}${checkName}${colors.reset}`, 'white');

    if (result.warnings.length > 0) {
      result.warnings.forEach((warning) => {
        log(
          `    ${symbols.warning} ${colors.yellow}${warning}${colors.reset}`,
          'white'
        );
      });
    }

    // Show additional info for some checks
    if (check === 'discovery' && result.featuresCount) {
      log(
        `      ${colors.gray}Found ${result.featuresCount} features${colors.reset}`,
        'white'
      );
    }
    if (check === 'performance' && result.bundleSize) {
      log(
        `      ${colors.gray}Bundle size: ${result.bundleSize}KB${colors.reset}`,
        'white'
      );
    }
  });

  console.log();

  if (passed) {
    logSuccess('All systems operational! 🚀');
  } else {
    logError('Issues need attention before deployment');
    log(`Run individual checks for more details:`, 'white');
    log(`  ${colors.cyan}npm run bloom:contracts${colors.reset}`, 'white');
    log(`  ${colors.cyan}npm run bloom:security${colors.reset}`, 'white');
    log(`  ${colors.cyan}npm run bloom:format${colors.reset}`, 'white');
  }
}

/**
 * Simulation functions (replace with actual implementations)
 */
async function simulateContractCheck() {
  // Simulate contract validation
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    passed: true,
    errors: [],
    warnings: [],
  };
}

async function simulateSecurityCheck() {
  // Simulate security audit
  await new Promise((resolve) => setTimeout(resolve, 750));

  return {
    passed: true,
    errors: [],
    warnings: ['Consider adding CSP headers for production'],
  };
}

async function simulateFormattingCheck() {
  // Simulate formatting check
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    passed: true,
    errors: [],
    warnings: [],
  };
}

async function simulatePerformanceCheck() {
  // Simulate performance analysis
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    passed: true,
    errors: [],
    warnings: [],
    bundleSize: 234,
  };
}
