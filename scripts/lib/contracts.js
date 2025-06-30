/**
 * Bloom Framework - Contract Validation
 * @file scripts/lib/contracts.js
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

/**
 * Validate feature contracts
 */
export async function runContracts(args) {
  const timer = new Timer();

  console.clear();

  logBox(`${symbols.contracts} Bloom Contract Validation`, [
    `${symbols.target} Dependency analysis`,
    `${symbols.lightning} Circular dependency check`,
    `${symbols.security} Contract integrity validation`,
  ]);

  const spinner = new Spinner('Discovering features and contracts...');
  spinner.start();

  try {
    // Discover features and their contracts
    const features = await discoverFeatureContracts();
    spinner.stop(
      `Found ${Object.keys(features).length} features with contracts`
    );

    if (Object.keys(features).length === 0) {
      logWarning('No features with contracts found');
      return;
    }

    // Validate contracts
    log(`${symbols.lightning} Validating contracts...`, 'white');
    const validation = await validateAllContracts(features);

    // Check for circular dependencies
    log(`${symbols.target} Checking circular dependencies...`, 'white');
    const circularDeps = await checkCircularDependencies(features);

    // Display results
    console.clear();
    timer.endWithMessage(`${symbols.check} Contract validation completed!`);

    displayValidationResults(validation, circularDeps, features);
  } catch (error) {
    spinner.fail('Contract validation failed');
    logError(`Contract validation failed: ${error.message}`);

    if (process.env.DEBUG) {
      console.error('Full error:', error);
    }

    process.exit(1);
  }
}

/**
 * Discover all features and their contracts
 */
async function discoverFeatureContracts() {
  const features = {};
  const featuresDir = path.join(process.cwd(), 'src/features');

  if (!fs.existsSync(featuresDir)) {
    throw new Error('Features directory not found');
  }

  const entries = fs.readdirSync(featuresDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      const indexPath = path.join(featuresDir, entry.name, 'index.ts');

      if (fs.existsSync(indexPath)) {
        try {
          const content = fs.readFileSync(indexPath, 'utf8');
          const contract = parseContractFromFile(content, entry.name);

          if (contract) {
            features[entry.name] = {
              name: entry.name,
              contract,
              filePath: indexPath,
            };
          }
        } catch (error) {
          console.warn(
            `Failed to parse contract for ${entry.name}:`,
            error.message
          );
        }
      }
    }
  }

  return features;
}

/**
 * Parse contract from feature index file
 */
function parseContractFromFile(content, featureName) {
  try {
    // Extract contract creation section
    const contractMatch = content.match(
      /contract:\s*(createContract\(\)[\s\S]*?\.build\(\))/
    );

    if (!contractMatch) {
      return null;
    }

    const contractCode = contractMatch[1];

    // Parse provides/consumes from the contract builder chain
    const contract = {
      provides: {
        services: [],
        hooks: [],
        components: [],
        types: [],
      },
      consumes: {
        services: [],
        hooks: [],
        state: [],
      },
    };

    // Extract provides
    const providesMatches =
      contractCode.match(
        /\.provides(Service|Hook|Component|Type)\(['"`]([^'"`]+)['"`]\)/g
      ) || [];
    providesMatches.forEach((match) => {
      const typeMatch = match.match(
        /\.provides(Service|Hook|Component|Type)\(['"`]([^'"`]+)['"`]\)/
      );
      if (typeMatch) {
        const type = typeMatch[1].toLowerCase() + 's'; // service -> services
        const value = typeMatch[2];
        contract.provides[type].push(value);
      }
    });

    // Extract consumes
    const consumesMatches =
      contractCode.match(
        /\.consumes(Service|Hook|State)\(['"`]([^'"`]+)['"`]\)/g
      ) || [];
    consumesMatches.forEach((match) => {
      const typeMatch = match.match(
        /\.consumes(Service|Hook|State)\(['"`]([^'"`]+)['"`]\)/
      );
      if (typeMatch) {
        const type =
          typeMatch[1].toLowerCase() + (typeMatch[1] === 'State' ? '' : 's'); // hook -> hooks, state -> state
        const value = typeMatch[2];
        contract.consumes[type].push(value);
      }
    });

    return contract;
  } catch (error) {
    throw new Error(`Failed to parse contract: ${error.message}`);
  }
}

/**
 * Validate all contracts
 */
async function validateAllContracts(features) {
  const validation = {};

  for (const [featureName, feature] of Object.entries(features)) {
    validation[featureName] = await validateFeatureContract(feature, features);
  }

  return validation;
}

/**
 * Validate a single feature's contract
 */
async function validateFeatureContract(feature, allFeatures) {
  const validation = {
    valid: true,
    errors: [],
    warnings: [],
    missingDependencies: [],
  };

  const { contract } = feature;

  // Check consumes dependencies
  if (contract.consumes) {
    // Check services
    if (contract.consumes.services) {
      for (const service of contract.consumes.services) {
        const provider = findServiceProvider(service, allFeatures);
        if (!provider) {
          validation.errors.push(
            `Service '${service}' is consumed but not provided by any feature`
          );
          validation.missingDependencies.push(`service:${service}`);
          validation.valid = false;
        }
      }
    }

    // Check hooks
    if (contract.consumes.hooks) {
      for (const hook of contract.consumes.hooks) {
        // Skip standard Bloom hooks (these are provided by platform)
        if (isStandardBloomHook(hook)) {
          continue;
        }

        const provider = findHookProvider(hook, allFeatures);
        if (!provider) {
          validation.errors.push(
            `Hook '${hook}' is consumed but not provided by any feature`
          );
          validation.missingDependencies.push(`hook:${hook}`);
          validation.valid = false;
        }
      }
    }

    // Check state dependencies
    if (contract.consumes.state) {
      for (const state of contract.consumes.state) {
        const provider = findStateProvider(state, allFeatures);
        if (!provider) {
          validation.warnings.push(
            `State '${state}' is consumed but provider not explicitly defined`
          );
        }
      }
    }
  }

  // Check for duplicate provides
  if (contract.provides) {
    // Check for duplicate services
    if (contract.provides.services) {
      for (const service of contract.provides.services) {
        const otherProviders = findAllServiceProviders(
          service,
          allFeatures,
          feature.name
        );
        if (otherProviders.length > 0) {
          validation.warnings.push(
            `Service '${service}' is also provided by: ${otherProviders.join(
              ', '
            )}`
          );
        }
      }
    }

    // Check for duplicate hooks
    if (contract.provides.hooks) {
      for (const hook of contract.provides.hooks) {
        const otherProviders = findAllHookProviders(
          hook,
          allFeatures,
          feature.name
        );
        if (otherProviders.length > 0) {
          validation.warnings.push(
            `Hook '${hook}' is also provided by: ${otherProviders.join(', ')}`
          );
        }
      }
    }
  }

  return validation;
}

/**
 * Check for circular dependencies
 */
async function checkCircularDependencies(features) {
  const graph = generateDependencyGraph(features);
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];

  function dfs(node, path) {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat(node).join(' → '));
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);

    const dependencies = graph[node] || [];
    dependencies.forEach((dep) => {
      dfs(dep, [...path, node]);
    });

    recursionStack.delete(node);
  }

  Object.keys(graph).forEach((feature) => {
    if (!visited.has(feature)) {
      dfs(feature, []);
    }
  });

  return cycles;
}

/**
 * Generate dependency graph
 */
function generateDependencyGraph(features) {
  const graph = {};

  Object.entries(features).forEach(([featureName, feature]) => {
    graph[featureName] = [];

    const { contract } = feature;

    if (contract.consumes) {
      // Add service dependencies
      if (contract.consumes.services) {
        contract.consumes.services.forEach((service) => {
          const provider = findServiceProvider(service, features);
          if (provider && provider !== featureName) {
            graph[featureName].push(provider);
          }
        });
      }

      // Add hook dependencies
      if (contract.consumes.hooks) {
        contract.consumes.hooks.forEach((hook) => {
          if (!isStandardBloomHook(hook)) {
            const provider = findHookProvider(hook, features);
            if (provider && provider !== featureName) {
              graph[featureName].push(provider);
            }
          }
        });
      }
    }

    // Remove duplicates
    graph[featureName] = [...new Set(graph[featureName])];
  });

  return graph;
}

/**
 * Helper functions
 */
function findServiceProvider(service, features) {
  for (const [featureName, feature] of Object.entries(features)) {
    if (feature.contract.provides?.services?.includes(service)) {
      return featureName;
    }
  }
  return null;
}

function findHookProvider(hook, features) {
  for (const [featureName, feature] of Object.entries(features)) {
    if (feature.contract.provides?.hooks?.includes(hook)) {
      return featureName;
    }
  }
  return null;
}

function findStateProvider(state, features) {
  // For state, we assume it's provided by features that have Redux slices
  // This is a simplified check
  for (const [featureName, feature] of Object.entries(features)) {
    if (feature.contract.provides?.types?.includes(`${state}State`)) {
      return featureName;
    }
  }
  return null;
}

function findAllServiceProviders(service, features, excludeFeature) {
  const providers = [];

  for (const [featureName, feature] of Object.entries(features)) {
    if (
      featureName !== excludeFeature &&
      feature.contract.provides?.services?.includes(service)
    ) {
      providers.push(featureName);
    }
  }

  return providers;
}

function findAllHookProviders(hook, features, excludeFeature) {
  const providers = [];

  for (const [featureName, feature] of Object.entries(features)) {
    if (
      featureName !== excludeFeature &&
      feature.contract.provides?.hooks?.includes(hook)
    ) {
      providers.push(featureName);
    }
  }

  return providers;
}

function isStandardBloomHook(hook) {
  const standardHooks = [
    'useSharedState',
    'useLocalStorage',
    'useSessionStorage',
    'useApi',
    'useFetch',
    'useTheme',
    'useModal',
    'useToast',
    'useRouter',
    'useNavigation',
    'useAuth',
    'useUser',
  ];

  return standardHooks.includes(hook);
}

/**
 * Display validation results
 */
function displayValidationResults(validation, circularDeps, features) {
  const allValid = Object.values(validation).every((v) => v.valid);
  const totalErrors = Object.values(validation).reduce(
    (sum, v) => sum + v.errors.length,
    0
  );
  const totalWarnings = Object.values(validation).reduce(
    (sum, v) => sum + v.warnings.length,
    0
  );
  const hasCircularDeps = circularDeps.length > 0;

  if (allValid && !hasCircularDeps) {
    logBox(
      `${symbols.check} All Contracts Valid`,
      [
        `${symbols.contracts} ${
          Object.keys(features).length
        } features validated`,
        `${symbols.lightning} No dependency issues found`,
        `${symbols.target} Architecture is sound`,
      ],
      'green'
    );
  } else {
    logBox(
      `${symbols.warning} Contract Issues Found`,
      [
        `${symbols.error} ${totalErrors} errors need attention`,
        `${symbols.warning} ${totalWarnings} warnings to review`,
        `${symbols.target} ${circularDeps.length} circular dependencies`,
      ],
      'yellow'
    );
  }

  // Show detailed validation results
  console.log();
  log(`${colors.bright}Feature Validation Results:${colors.reset}`, 'white');

  Object.entries(validation).forEach(([featureName, result]) => {
    const icon = result.valid ? symbols.check : symbols.error;
    const color = result.valid ? 'green' : 'red';

    log(`  ${icon} ${colors[color]}${featureName}${colors.reset}`, 'white');

    if (result.errors.length > 0) {
      result.errors.forEach((error) => {
        log(
          `    ${symbols.error} ${colors.red}${error}${colors.reset}`,
          'white'
        );
      });
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach((warning) => {
        log(
          `    ${symbols.warning} ${colors.yellow}${warning}${colors.reset}`,
          'white'
        );
      });
    }
  });

  // Show circular dependencies
  if (circularDeps.length > 0) {
    console.log();
    log(`${colors.bright}Circular Dependencies:${colors.reset}`, 'white');
    circularDeps.forEach((cycle) => {
      log(`  ${symbols.error} ${colors.red}${cycle}${colors.reset}`, 'white');
    });
  }

  // Show dependency summary
  console.log();
  log(`${colors.bright}Dependency Summary:${colors.reset}`, 'white');
  const graph = generateDependencyGraph(features);

  Object.entries(graph).forEach(([feature, deps]) => {
    if (deps.length > 0) {
      log(
        `  ${symbols.target} ${colors.cyan}${feature}${colors.reset} ${
          colors.gray
        }depends on${colors.reset} ${deps.join(', ')}`,
        'white'
      );
    } else {
      log(
        `  ${symbols.sparkles} ${colors.cyan}${feature}${colors.reset} ${colors.gray}has no dependencies${colors.reset}`,
        'white'
      );
    }
  });

  console.log();

  if (allValid && !hasCircularDeps) {
    logSuccess('Contract architecture is healthy! 🎯');
  } else {
    logError('Contract issues need resolution before deployment');

    if (totalErrors > 0) {
      console.log();
      logBox(
        'Resolution Steps',
        [
          '1. Fix missing service/hook providers',
          '2. Resolve circular dependencies',
          '3. Update feature contracts',
          '4. Run bloom:contracts again to verify',
        ],
        'blue'
      );
    }
  }
}
