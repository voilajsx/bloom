/**
 * Bloom Framework - OPTIMIZED Platform Integration
 * ⚡ Performance: Conditional Redux, build-time discovery, smart loading
 * @module @voilajsx/bloom/platform
 * @file src/platform/bloom.ts
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { BloomRouter } from './router';
import { useOptimizedFeatureDiscovery } from './discovery';
import { 
  initializeStore, 
  getStore, 
  addSlice, 
  createSliceFromTemplate,
} from './state';
import { getContractSummary } from './contracts';
import defaults from '@/defaults';

/**
 * Get React Router basename from defaults
 */
function getReactRouterBasename(): string | undefined {
  const basePath = (defaults as any)['base-path'] || '/';
  return basePath === '/' ? undefined : basePath.replace(/\/$/, '');
}

/**
 * ⚡ OPTIMIZED: Smart Redux Provider (only loads if features need it)
 */
function ConditionalReduxProvider({ 
  children, 
  needsRedux 
}: { 
  children: React.ReactNode; 
  needsRedux: boolean; 
}) {
  // Only initialize Redux if features actually need it
  if (!needsRedux) {
    console.log('🌸 Bloom: Skipping Redux (no features need shared state)');
    return children as React.ReactElement;
  }

  const store = React.useMemo(() => {
    console.log('🌸 Bloom: Initializing Redux for shared state features');
    return getStore();
  }, []);

  return React.createElement(ReduxProvider, {
    store: store,
    children: children
  });
}

/**
 * ⚡ OPTIMIZED: Error component for discovery failures  
 */
function DiscoveryError({ error, features, routes }: {
  error: string;
  features: any;
  routes: any[];
}) {
  return React.createElement('div', {
    className: 'min-h-screen flex items-center justify-center bg-background'
  }, React.createElement('div', {
    className: 'text-center max-w-md mx-auto p-6'
  }, [
    React.createElement('div', {
      key: 'icon',
      className: 'text-6xl mb-4'
    }, '🌸'),
    React.createElement('h1', {
      key: 'title',
      className: 'text-2xl font-bold mb-4 text-foreground'
    }, 'Bloom Discovery Error'),
    React.createElement('p', {
      key: 'error',
      className: 'text-destructive mb-4'
    }, error),
    React.createElement('div', {
      key: 'debug',
      className: 'text-xs text-muted-foreground bg-muted p-4 rounded mb-4'
    }, [
      React.createElement('div', { key: 'features' }, `Features: ${Object.keys(features).length}`),
      React.createElement('div', { key: 'routes' }, `Routes: ${routes?.length || 0}`)
    ]),
    React.createElement('button', {
      key: 'reload',
      className: 'px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90',
      onClick: () => window.location.reload()
    }, 'Reload Page')
  ]));
}

/**
 * ⚡ OPTIMIZED: Main Bloom application component
 */
export function BloomApp() {
  const basename = getReactRouterBasename();
  const { features, routes, contracts, loading, error, reduxNeeded } = useOptimizedFeatureDiscovery();

  // ⚡ PERFORMANCE: Only initialize Redux if features need it
  React.useEffect(() => {
    if (!reduxNeeded) return;

    try {
      // Initialize store only when needed
      initializeStore();
      
      // Add core storage slice for useBloomStorage
      addSlice(createSliceFromTemplate('STORAGE', 'storage'));
      
      console.log('🌸 Bloom: Redux initialized for shared state features');
    } catch (error) {
      console.error('🌸 Bloom: Failed to initialize Redux store:', error);
    }
  }, [reduxNeeded]);

  // Handle discovery errors with better UX
  if (error) {
    console.error('[Bloom] Discovery error:', error);
    return React.createElement(DiscoveryError, { error, features, routes });
  }

  // ⚡ PERFORMANCE: Log successful discovery with metrics
  if (!loading && routes.length > 0) {
    const contractSummary = getContractSummary();
    const reduxStatus = reduxNeeded ? 'enabled' : 'disabled';
    
    console.log(`🌸 Bloom: Discovery complete!`);
    console.log(`   📦 Features: ${Object.keys(features).length}`);
    console.log(`   🛣️  Routes: ${routes.length}`);
    console.log(`   📋 Contracts: ${contractSummary.totalContracts}`);
    console.log(`   🏪 Redux: ${reduxStatus}`);
    
    if (contractSummary.totalContracts > 0) {
      console.log(`🌸 Bloom: Contract summary:`, contractSummary);
    }
  }

  // ⚡ OPTIMIZED: App structure with conditional Redux
  return React.createElement(ConditionalReduxProvider, {
    needsRedux: reduxNeeded,
    children: React.createElement(BrowserRouter, {
      basename: basename,
      children: React.createElement(BloomRouter, {
        routes,
        features
      })
    })
  });
}

/**
 * ⚡ OPTIMIZED: Initialize Bloom framework
 */
export function initializeBloom() {
  console.log('🌸 Bloom Framework: OPTIMIZED initialization');
  
  // ⚡ PERFORMANCE: Log build-time vs runtime info
  const buildTimeOptimized = typeof window !== 'undefined' && 
    (window as any).__BLOOM_BUILD_OPTIMIZED__;
  
  // Log configuration with performance info
  console.log('🌸 Bloom Config:', {
    appName: defaults['app-name'],
    theme: defaults['app-theme'],
    ssgEnabled: defaults['ssg-enabled'],
    cachingEnabled: defaults['enable-caching'],
    contractsEnabled: true,
    reduxConditional: true, // ⚡ NEW: Only loads when needed
    storageEnabled: true,
    buildOptimized: buildTimeOptimized,
    performanceMode: 'optimized'
  });
  
  return BloomApp;
}