    /**
 * Bloom Framework - Feature Contract Registry & Validation
 * @module @voilajsx/bloom/platform
 * @file src/platform/contracts.ts
 */

import type {
  BloomFeatureContract,
  BloomContractRegistry,
  BloomContractValidation,
  BloomFeatureRegistry
} from './types';

// Global contract registry
let contractRegistry: BloomContractRegistry = {};

/**
 * Register a feature contract
 */
export function registerContract(featureName: string, contract: BloomFeatureContract): void {
  contractRegistry[featureName] = contract;
  console.log(`[Contracts] Registered contract for feature: ${featureName}`);
}

/**
 * Get contract by feature name
 */
export function getContract(featureName: string): BloomFeatureContract | null {
  return contractRegistry[featureName] || null;
}

/**
 * Get all registered contracts
 */
export function getAllContracts(): BloomContractRegistry {
  return { ...contractRegistry };
}

/**
 * Clear all contracts (for testing)
 */
export function clearContracts(): void {
  contractRegistry = {};
}

/**
 * Validate a single feature contract
 */
export function validateContract(
  featureName: string,
  contract: BloomFeatureContract,
  allContracts: BloomContractRegistry
): BloomContractValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingDependencies: string[] = [];

  // Validate consumes dependencies
  if (contract.consumes) {
    // Check services
    if (contract.consumes.services) {
      contract.consumes.services.forEach(service => {
        const provider = findServiceProvider(service, allContracts);
        if (!provider) {
          missingDependencies.push(`service:${service}`);
          errors.push(`Service '${service}' is consumed but not provided by any feature`);
        }
      });
    }

    // Check hooks
    if (contract.consumes.hooks) {
      contract.consumes.hooks.forEach(hook => {
        const provider = findHookProvider(hook, allContracts);
        if (!provider) {
          missingDependencies.push(`hook:${hook}`);
          errors.push(`Hook '${hook}' is consumed but not provided by any feature`);
        }
      });
    }

    // Check state dependencies
    if (contract.consumes.state) {
      contract.consumes.state.forEach(stateKey => {
        const provider = findStateProvider(stateKey, allContracts);
        if (!provider) {
          missingDependencies.push(`state:${stateKey}`);
          errors.push(`State '${stateKey}' is consumed but not provided by any feature`);
        }
      });
    }
  }

  // Validate provides uniqueness
  if (contract.provides) {
    // Check for duplicate services
    if (contract.provides.services) {
      contract.provides.services.forEach(service => {
        const otherProviders = findAllServiceProviders(service, allContracts, featureName);
        if (otherProviders.length > 0) {
          warnings.push(`Service '${service}' is also provided by: ${otherProviders.join(', ')}`);
        }
      });
    }

    // Check for duplicate hooks
    if (contract.provides.hooks) {
      contract.provides.hooks.forEach(hook => {
        const otherProviders = findAllHookProviders(hook, allContracts, featureName);
        if (otherProviders.length > 0) {
          warnings.push(`Hook '${hook}' is also provided by: ${otherProviders.join(', ')}`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingDependencies
  };
}

/**
 * Validate all contracts together
 */
export function validateAllContracts(features: BloomFeatureRegistry): Record<string, BloomContractValidation> {
  const results: Record<string, BloomContractValidation> = {};
  const allContracts: BloomContractRegistry = {};

  // Collect all contracts first
  Object.entries(features).forEach(([featureName, feature]) => {
    if (feature.contract) {
      allContracts[featureName] = feature.contract;
    }
  });

  // Validate each contract
  Object.entries(allContracts).forEach(([featureName, contract]) => {
    results[featureName] = validateContract(featureName, contract, allContracts);
  });

  return results;
}

/**
 * Generate dependency graph
 */
export function generateDependencyGraph(contracts: BloomContractRegistry): Record<string, string[]> {
  const graph: Record<string, string[]> = {};

  Object.entries(contracts).forEach(([featureName, contract]) => {
    graph[featureName] = [];

    if (contract.consumes) {
      // Add service dependencies
      if (contract.consumes.services) {
        contract.consumes.services.forEach(service => {
          const provider = findServiceProvider(service, contracts);
          if (provider && provider !== featureName) {
            graph[featureName].push(provider);
          }
        });
      }

      // Add hook dependencies
      if (contract.consumes.hooks) {
        contract.consumes.hooks.forEach(hook => {
          const provider = findHookProvider(hook, contracts);
          if (provider && provider !== featureName) {
            graph[featureName].push(provider);
          }
        });
      }

      // Add state dependencies
      if (contract.consumes.state) {
        contract.consumes.state.forEach(stateKey => {
          const provider = findStateProvider(stateKey, contracts);
          if (provider && provider !== featureName) {
            graph[featureName].push(provider);
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
 * Check for circular dependencies
 */
export function checkCircularDependencies(contracts: BloomContractRegistry): string[] {
  const graph = generateDependencyGraph(contracts);
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[] = [];

  function dfs(node: string, path: string[]): void {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat(node).join(' -> '));
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);

    const dependencies = graph[node] || [];
    dependencies.forEach(dep => {
      dfs(dep, [...path, node]);
    });

    recursionStack.delete(node);
  }

  Object.keys(graph).forEach(feature => {
    if (!visited.has(feature)) {
      dfs(feature, []);
    }
  });

  return cycles;
}

// Helper functions
function findServiceProvider(service: string, contracts: BloomContractRegistry): string | null {
  for (const [featureName, contract] of Object.entries(contracts)) {
    if (contract.provides?.services?.includes(service)) {
      return featureName;
    }
  }
  return null;
}

function findAllServiceProviders(service: string, contracts: BloomContractRegistry, exclude?: string): string[] {
  const providers: string[] = [];
  
  for (const [featureName, contract] of Object.entries(contracts)) {
    if (featureName !== exclude && contract.provides?.services?.includes(service)) {
      providers.push(featureName);
    }
  }
  
  return providers;
}

function findHookProvider(hook: string, contracts: BloomContractRegistry): string | null {
  for (const [featureName, contract] of Object.entries(contracts)) {
    if (contract.provides?.hooks?.includes(hook)) {
      return featureName;
    }
  }
  return null;
}

function findAllHookProviders(hook: string, contracts: BloomContractRegistry, exclude?: string): string[] {
  const providers: string[] = [];
  
  for (const [featureName, contract] of Object.entries(contracts)) {
    if (featureName !== exclude && contract.provides?.hooks?.includes(hook)) {
      providers.push(featureName);
    }
  }
  
  return providers;
}

function findStateProvider(stateKey: string, contracts: BloomContractRegistry): string | null {
  // For state, we assume it's provided by Redux store or feature that defines it
  // This is a simplified check - in practice, you'd check Redux slices
  for (const [featureName, contract] of Object.entries(contracts)) {
    if (contract.provides?.types?.includes(`${stateKey}State`)) {
      return featureName;
    }
  }
  return null;
}

/**
 * Contract summary for debugging
 */
export function getContractSummary(): {
  totalContracts: number;
  totalServices: number;
  totalHooks: number;
  features: string[];
} {
  const contracts = getAllContracts();
  const features = Object.keys(contracts);
  
  let totalServices = 0;
  let totalHooks = 0;

  Object.values(contracts).forEach(contract => {
    totalServices += contract.provides?.services?.length || 0;
    totalHooks += contract.provides?.hooks?.length || 0;
  });

  return {
    totalContracts: features.length,
    totalServices,
    totalHooks,
    features
  };
}