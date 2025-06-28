/**
 * Bloom Framework - Platform Integration with Contracts & Redux
 * @module @voilajsx/bloom/platform
 * @file src/platform/bloom.ts
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { BloomRouter } from './router';
import { useFeatureDiscovery } from './discovery';
import { initializeStore, getStore, addSlice, createSliceFromTemplate } from './state';
import { getContractSummary } from './contracts';
import defaults from '@/defaults';

/**
 * Get React Router basename from defaults
 */
function getReactRouterBasename(): string | undefined {
  // Check if there's a base path in defaults, otherwise use root
  const basePath = (defaults as any)['base-path'] || '/';
  return basePath === '/' ? undefined : basePath.replace(/\/$/, '');
}

/**
 * Error component for discovery failures
 */
function DiscoveryError({ error, features, routes, contracts }: {
  error: string;
  features: any;
  routes: any[];
  contracts: any;
}) {
  return React.createElement('div', {
    className: 'min-h-screen flex items-center justify-center'
  }, React.createElement('div', {
    className: 'text-center max-w-md mx-auto p-6'
  }, [
    React.createElement('h1', {
      key: 'title',
      className: 'text-2xl font-bold mb-4 text-foreground'
    }, 'App Discovery Error'),
    React.createElement('p', {
      key: 'error',
      className: 'text-red-500 mb-4'
    }, error),
    React.createElement('div', {
      key: 'debug',
      className: 'text-xs text-muted-foreground bg-muted p-4 rounded mb-4'
    }, [
      React.createElement('div', { key: 'features' }, `Features: ${Object.keys(features).length}`),
      React.createElement('div', { key: 'routes' }, `Routes: ${routes?.length || 0}`),
      React.createElement('div', { key: 'contracts' }, `Contracts: ${Object.keys(contracts).length}`)
    ]),
    React.createElement('button', {
      key: 'reload',
      className: 'px-4 py-2 bg-primary text-primary-foreground rounded',
      onClick: () => window.location.reload()
    }, 'Reload Page')
  ]));
}

/**
 * Main Bloom application component
 */
export function BloomApp() {
  const basename = getReactRouterBasename();
  const { features, routes, contracts, loading, error } = useFeatureDiscovery();

  // Initialize Redux store and core slices
  React.useEffect(() => {
    try {
      // Initialize store
      initializeStore();
      
      // Add core storage slice for useBloomStorage
      addSlice(createSliceFromTemplate('STORAGE', 'storage'));
      
      console.log('🌸 Bloom: Redux store initialized with core slices');
    } catch (error) {
      console.error('🌸 Bloom: Failed to initialize Redux store:', error);
    }
  }, []);

  // Handle discovery errors
  if (error) {
    console.error('[Bloom] Discovery error:', error);
    return React.createElement(DiscoveryError, { error, features, routes, contracts });
  }

  // Log successful discovery
  if (!loading && routes.length > 0) {
    const contractSummary = getContractSummary();
    console.log(`🌸 Bloom: Discovered ${Object.keys(features).length} features, ${routes.length} routes, ${contractSummary.totalContracts} contracts`);
    
    if (contractSummary.totalContracts > 0) {
      console.log(`🌸 Bloom: Contract summary:`, contractSummary);
    }
  }

  // Get Redux store
  const store = getStore();

  // Main app with Redux Provider, React Router, and Bloom Router
  return React.createElement(ReduxProvider, {
    store: store,
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
 * Initialize Bloom framework
 */
export function initializeBloom() {
  console.log('🌸 Bloom Framework initialized with Contracts & Redux');
  
  // Log configuration info
  console.log('🌸 Bloom Config:', {
    appName: defaults['app-name'],
    theme: defaults['app-theme'],
    ssgEnabled: defaults['ssg-enabled'],
    cachingEnabled: defaults['enable-caching'],
    contractsEnabled: true,
    reduxEnabled: true,
    storageEnabled: true
  });
  
  return BloomApp;
}