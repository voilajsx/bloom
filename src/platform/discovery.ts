/**
 * Bloom Framework - Discovery with Contract Validation
 * @module @voilajsx/bloom/platform
 * @file src/platform/discovery.ts
 */

import { useState, useEffect } from 'react';
import type {
  BloomFeatureConfig,
  BloomFeatureRegistry,
  BloomCompiledRoute,
  BloomDiscoveryResult,
  BloomContractRegistry
} from './types';
import { 
  registerContract, 
  validateAllContracts, 
  checkCircularDependencies,
  getAllContracts 
} from './contracts';
import { addSlices } from './state';
import defaults from '@/defaults';

/**
 * Generate unique route ID
 */
function generateRouteId(featureName: string, path: string): string {
  return `${featureName}:${path}`;
}

/**
 * Compile route with feature context
 */
function compileRoute(
  route: any,
  featureName: string,
  featureConfig: BloomFeatureConfig
): BloomCompiledRoute {
  return {
    path: route.path,
    component: route.component,
    id: generateRouteId(featureName, route.path),
    featureName,
    fullPath: route.path,
    layout: route.layout || defaults['default-layout'] || 'default',
    title: route.title || defaults['default-title'],
    meta: {
      description: defaults['default-description'],
      keywords: defaults['default-keywords'],
      ...route.meta,
    },
    ssg: route.ssg !== false,
  };
}

/**
 * Discover features from the features index
 */
async function discoverFeatures(): Promise<{
  features: BloomFeatureRegistry;
  routes: BloomCompiledRoute[];
  contracts: BloomContractRegistry;
}> {
  const features: BloomFeatureRegistry = {};
  const routes: BloomCompiledRoute[] = [];
  const contracts: BloomContractRegistry = {};

  try {
    // Import the auto-generated features index
    const featuresIndex = await import('@/features/index');
    
    // Get feature names (exclude metadata)
    const featureNames = Object.keys(featuresIndex).filter(key => 
      key !== 'BLOOM_FEATURES' && 
      key !== 'BLOOM_FEATURE_META' && 
      key !== 'default'
    );

    console.log(`[Discovery] Found ${featureNames.length} features: ${featureNames.join(', ')}`);

    // Load each feature configuration
    for (const featureName of featureNames) {
      try {
        const featureModule = (featuresIndex as any)[featureName];
        
        if (!featureModule) {
          console.warn(`[Discovery] Feature ${featureName} module not found`);
          continue;
        }

        const config: BloomFeatureConfig = featureModule;
        
        // Validate that config has routes
        if (!config.routes || !Array.isArray(config.routes)) {
          console.error(`[Discovery] Feature ${config.name} has no routes`);
          continue;
        }

        // Register contract if provided
        if (config.contract) {
          registerContract(config.name, config.contract);
          contracts[config.name] = config.contract;
          console.log(`[Discovery] Registered contract for feature: ${config.name}`);
        }

        // Register Redux slices if sharedState is enabled
        if (config.sharedState && config.stateSlices) {
          try {
            addSlices(config.stateSlices);
            console.log(`[Discovery] Added ${config.stateSlices.length} Redux slices for feature: ${config.name}`);
          } catch (error) {
            console.error(`[Discovery] Failed to add Redux slices for ${config.name}:`, error);
          }
        }

        // Compile routes
        const compiledRoutes = config.routes.map(route => 
          compileRoute(route, config.name, config)
        );

        // Register feature
        features[config.name] = {
          config,
          routes: compiledRoutes,
          contract: config.contract,
          loaded: true
        };

        // Add routes to global registry
        routes.push(...compiledRoutes);

        console.log(`[Discovery] Loaded feature '${config.name}' with ${compiledRoutes.length} routes`);

      } catch (error) {
        console.error(`[Discovery] Failed to load feature ${featureName}:`, error);
      }
    }

    // Validate all contracts
    if (Object.keys(contracts).length > 0) {
      console.log(`[Discovery] Validating ${Object.keys(contracts).length} contracts...`);
      
      const validationResults = validateAllContracts(features);
      
      // Add validation results to features
      Object.entries(validationResults).forEach(([featureName, validation]) => {
        if (features[featureName]) {
          features[featureName].validation = validation;
          
          if (!validation.valid) {
            console.error(`[Discovery] Contract validation failed for ${featureName}:`, validation.errors);
          } else if (validation.warnings.length > 0) {
            console.warn(`[Discovery] Contract warnings for ${featureName}:`, validation.warnings);
          }
        }
      });

      // Check for circular dependencies
      const cycles = checkCircularDependencies(contracts);
      if (cycles.length > 0) {
        console.error('[Discovery] Circular dependencies detected:', cycles);
      }
    }

    // Sort routes by specificity (more specific paths first)
    routes.sort((a, b) => {
      const aSpecificity = (a.path.match(/\//g) || []).length + (a.path.includes(':') ? -1 : 0);
      const bSpecificity = (b.path.match(/\//g) || []).length + (b.path.includes(':') ? -1 : 0);
      return bSpecificity - aSpecificity;
    });

    console.log(`[Discovery] Discovered ${Object.keys(features).length} features, ${routes.length} routes, ${Object.keys(contracts).length} contracts`);
    
    // Log routes for debugging
    routes.forEach(route => {
      console.log(`[Discovery] Route: ${route.path} (${route.featureName})`);
    });
    
    return { features, routes, contracts };

  } catch (error) {
    console.error('[Discovery] Feature discovery failed:', error);
    return { features: {}, routes: [], contracts: {} };
  }
}

// Cache to avoid re-discovery
let discoveryCache: {
  features: BloomFeatureRegistry;
  routes: BloomCompiledRoute[];
  contracts: BloomContractRegistry;
} | null = null;

let discoveryPromise: Promise<{
  features: BloomFeatureRegistry;
  routes: BloomCompiledRoute[];
  contracts: BloomContractRegistry;
}> | null = null;

/**
 * Hook for feature discovery
 */
export function useFeatureDiscovery(): BloomDiscoveryResult {
  const [features, setFeatures] = useState<BloomFeatureRegistry>({});
  const [routes, setRoutes] = useState<BloomCompiledRoute[]>([]);
  const [contracts, setContracts] = useState<BloomContractRegistry>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        // Use cached results if available
        if (discoveryCache) {
          setFeatures(discoveryCache.features);
          setRoutes(discoveryCache.routes);
          setContracts(discoveryCache.contracts);
          setLoading(false);
          return;
        }

        // Wait for existing discovery if in progress
        if (discoveryPromise) {
          const result = await discoveryPromise;
          setFeatures(result.features);
          setRoutes(result.routes);
          setContracts(result.contracts);
          setLoading(false);
          return;
        }

        // Start new discovery
        setError(undefined);
        
        discoveryPromise = discoverFeatures();
        const { features: discoveredFeatures, routes: discoveredRoutes, contracts: discoveredContracts } = await discoveryPromise;
        
        // Cache the results
        discoveryCache = {
          features: discoveredFeatures,
          routes: discoveredRoutes,
          contracts: discoveredContracts
        };
        
        setFeatures(discoveredFeatures);
        setRoutes(discoveredRoutes);
        setContracts(discoveredContracts);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown discovery error';
        setError(errorMessage);
        console.error('[Discovery] Discovery failed:', err);
      } finally {
        setLoading(false);
        discoveryPromise = null;
      }
    };

    loadFeatures();
  }, []);

  return {
    features,
    routes,
    contracts,
    loading,
    error
  };
}

export function getFeature(features: BloomFeatureRegistry, name: string) {
  return features[name] || null;
}

export function getRouteByPath(routes: BloomCompiledRoute[], path: string) {
  return routes.find(route => {
    if (route.path === path) return true;
    
    if (route.path.includes(':')) {
      const routeParts = route.path.split('/');
      const pathParts = path.split('/');
      
      if (routeParts.length !== pathParts.length) return false;
      
      return routeParts.every((part, index) => {
        return part.startsWith(':') || part === pathParts[index];
      });
    }
    
    return false;
  }) || null;
}

export function extractRouteParams(route: BloomCompiledRoute, path: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  if (!route.path.includes(':')) return params;
  
  const routeParts = route.path.split('/');
  const pathParts = path.split('/');
  
  routeParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1);
      params[paramName] = pathParts[index] || '';
    }
  });
  
  return params;
}