/**
 * Bloom Framework - Optimized Discovery with Essential Debug
 * ⚡ Performance: Build-time discovery with minimal logging
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
  checkCircularDependencies
} from './contracts';
import { addSlices } from './state';
import defaults from '@/defaults';

/**
 * ⚡ OPTIMIZED: Feature discovery with essential debugging only
 */
async function optimizedFeatureDiscovery(): Promise<{
  features: BloomFeatureRegistry;
  routes: BloomCompiledRoute[];
  contracts: BloomContractRegistry;
  reduxNeeded: boolean;
}> {
  const features: BloomFeatureRegistry = {};
  const routes: BloomCompiledRoute[] = [];
  const contracts: BloomContractRegistry = {};
  let reduxNeeded = false;

  try {
    // Import features index
    const featuresIndex = await import('@/features/index');
    const featureNames = [...(featuresIndex.BLOOM_FEATURES || [])];
    
    console.log(`[Discovery] Processing ${featureNames.length} features: ${featureNames.join(', ')}`);

    if (featureNames.length === 0) {
      console.warn('[Discovery] No features found');
      return { features, routes, contracts, reduxNeeded };
    }

    // Process each feature
    for (const featureName of featureNames) {
      try {
        const featureModule = (featuresIndex as any)[featureName];
        
        if (!featureModule) {
          console.error(`[Discovery] ❌ Feature "${featureName}" not found`);
          continue;
        }
        
        const config: BloomFeatureConfig = featureModule;
        
        if (!config?.name) {
          console.error(`[Discovery] ❌ Invalid config for "${featureName}"`);
          continue;
        }
        
        // Redux setup
        if (config.sharedState) {
          reduxNeeded = true;
          if (config.stateSlices?.length) {
            addSlices(config.stateSlices);
          }
        }

        // Contract registration
        if (config.contract) {
          registerContract(config.name, config.contract);
          contracts[config.name] = config.contract;
        }

        // Route compilation
        if (config.routes?.length) {
          const compiledRoutes = config.routes.map(route => compileRoute(route, config.name, config));
          routes.push(...compiledRoutes);
        }

        // Feature registration
        features[config.name] = {
          config,
          routes: config.routes ? config.routes.map(route => compileRoute(route, config.name, config)) : [],
          contract: config.contract,
          loaded: true
        };

        console.log(`[Discovery] ✅ ${config.name}: ${config.routes?.length || 0} routes${config.sharedState ? ' + Redux' : ''}`);

      } catch (featureError: any) {
        console.error(`[Discovery] ❌ Failed to load "${featureName}":`, featureError?.message);
      }
    }

    // Contract validation (only show errors)
    if (Object.keys(contracts).length > 0) {
      const validationResults = validateAllContracts(features);
      
      Object.entries(validationResults).forEach(([featureName, validation]) => {
        if (features[featureName]) {
          features[featureName].validation = validation;
          
          if (!validation.valid) {
            console.error(`[Discovery] ❌ Contract errors for "${featureName}":`, validation.errors);
          }
        }
      });

      const cycles = checkCircularDependencies(contracts);
      if (cycles.length > 0) {
        console.error('[Discovery] ❌ Circular dependencies:', cycles);
      }
    }

    // Sort routes by specificity
    routes.sort((a, b) => {
      const aSpecificity = (a.path.match(/\//g) || []).length + (a.path.includes(':') ? -1 : 0);
      const bSpecificity = (b.path.match(/\//g) || []).length + (b.path.includes(':') ? -1 : 0);
      return bSpecificity - aSpecificity;
    });

    // Essential summary only
    console.log(`[Discovery] ✅ ${Object.keys(features).length} features, ${routes.length} routes${reduxNeeded ? ', Redux enabled' : ''}`);
    
    return { features, routes, contracts, reduxNeeded };

  } catch (error: any) {
    console.error('[Discovery] ❌ Fatal error:', error?.message);
    return { features: {}, routes: [], contracts: {}, reduxNeeded: false };
  }
}

/**
 * 🔨 Compile route with feature context
 */
function compileRoute(
  route: any,
  featureName: string,
  featureConfig: BloomFeatureConfig
): BloomCompiledRoute {
  return {
    path: route.path,
    component: route.component,
    id: `${featureName}:${route.path}`,
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

// Cache for discovery results
let discoveryCache: {
  features: BloomFeatureRegistry;
  routes: BloomCompiledRoute[];
  contracts: BloomContractRegistry;
  reduxNeeded: boolean;
} | null = null;

let discoveryPromise: Promise<{
  features: BloomFeatureRegistry;
  routes: BloomCompiledRoute[];
  contracts: BloomContractRegistry;
  reduxNeeded: boolean;
}> | null = null;

/**
 * 🎯 Optimized discovery hook with essential logging
 */
export function useOptimizedFeatureDiscovery(): BloomDiscoveryResult & { reduxNeeded: boolean } {
  const [features, setFeatures] = useState<BloomFeatureRegistry>({});
  const [routes, setRoutes] = useState<BloomCompiledRoute[]>([]);
  const [contracts, setContracts] = useState<BloomContractRegistry>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reduxNeeded, setReduxNeeded] = useState(false);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        // Use cached results if available
        if (discoveryCache) {
          setFeatures(discoveryCache.features);
          setRoutes(discoveryCache.routes);
          setContracts(discoveryCache.contracts);
          setReduxNeeded(discoveryCache.reduxNeeded);
          setLoading(false);
          return;
        }

        // Wait for existing discovery if in progress
        if (discoveryPromise) {
          const result = await discoveryPromise;
          setFeatures(result.features);
          setRoutes(result.routes);
          setContracts(result.contracts);
          setReduxNeeded(result.reduxNeeded);
          setLoading(false);
          return;
        }

        setError(undefined);
        
        // Start discovery with timing
        const startTime = performance.now();
        discoveryPromise = optimizedFeatureDiscovery();
        const result = await discoveryPromise;
        const endTime = performance.now();
        
        console.log(`[Discovery] Completed in ${Math.round(endTime - startTime)}ms`);
        
        // Cache results
        discoveryCache = result;
        
        setFeatures(result.features);
        setRoutes(result.routes);
        setContracts(result.contracts);
        setReduxNeeded(result.reduxNeeded);

      } catch (err: any) {
        const errorMessage = err?.message || 'Discovery failed';
        console.error('[Discovery] ❌ Hook error:', errorMessage);
        setError(errorMessage);
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
    error,
    reduxNeeded
  };
}

// Utility functions (unchanged)
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