/**
 * Bloom Framework - Standard Contract Definitions & Templates
 * @module @voilajsx/bloom/shared/contracts
 * @file src/shared/contracts/index.ts
 */

import type { BloomFeatureContract } from '@/platform/types';

// Standard Service Contracts
export const STANDARD_SERVICES = {
  // Storage services
  STORAGE: 'storage',
  CACHE: 'cache',
  
  // API services
  API_CLIENT: 'apiClient',
  HTTP_CLIENT: 'httpClient',
  
  // Notification services
  NOTIFICATIONS: 'notifications',
  TOAST: 'toast',
  
  // Analytics services
  ANALYTICS: 'analytics',
  TRACKING: 'tracking',
  
  // Authentication services
  AUTH: 'auth',
  SESSION: 'session',
  
  // Navigation services
  ROUTER: 'router',
  NAVIGATION: 'navigation'
} as const;

// Standard Hook Contracts
export const STANDARD_HOOKS = {
  // State hooks
  USE_SHARED_STATE: 'useSharedState',
  USE_LOCAL_STORAGE: 'useLocalStorage',
  USE_SESSION_STORAGE: 'useSessionStorage',
  
  // API hooks
  USE_API: 'useApi',
  USE_FETCH: 'useFetch',
  
  // UI hooks
  USE_THEME: 'useTheme',
  USE_MODAL: 'useModal',
  USE_TOAST: 'useToast',
  
  // Router hooks
  USE_ROUTER: 'useRouter',
  USE_NAVIGATION: 'useNavigation',
  
  // Auth hooks
  USE_AUTH: 'useAuth',
  USE_USER: 'useUser'
} as const;

// Standard Component Contracts
export const STANDARD_COMPONENTS = {
  // Layout components
  HEADER: 'Header',
  FOOTER: 'Footer',
  SIDEBAR: 'Sidebar',
  
  // UI components
  MODAL: 'Modal',
  TOAST: 'Toast',
  LOADING: 'Loading',
  ERROR_BOUNDARY: 'ErrorBoundary',
  
  // Form components
  FORM: 'Form',
  INPUT: 'Input',
  BUTTON: 'Button'
} as const;

// Standard State Contracts
export const STANDARD_STATE = {
  // App state
  APP: 'app',
  USER: 'user',
  AUTH: 'auth',
  
  // UI state
  UI: 'ui',
  THEME: 'theme',
  MODAL: 'modal',
  TOAST: 'toast',
  
  // Data state
  CACHE: 'cache',
  API: 'api'
} as const;

// Standard Type Contracts
export const STANDARD_TYPES = {
  // Data types
  USER_TYPE: 'User',
  API_RESPONSE_TYPE: 'ApiResponse',
  
  // State types
  APP_STATE_TYPE: 'AppState',
  USER_STATE_TYPE: 'UserState',
  
  // Config types
  FEATURE_CONFIG_TYPE: 'FeatureConfig',
  ROUTE_CONFIG_TYPE: 'RouteConfig'
} as const;

// Contract Templates
export const CONTRACT_TEMPLATES = {
  // Empty contract
  EMPTY: (): BloomFeatureContract => ({}),
  
  // Basic page feature
  PAGE: (): BloomFeatureContract => ({
    provides: {
      components: ['Page']
    },
    consumes: {
      hooks: [STANDARD_HOOKS.USE_ROUTER]
    }
  }),
  
  // API feature
  API_FEATURE: (): BloomFeatureContract => ({
    provides: {
      services: [STANDARD_SERVICES.API_CLIENT],
      hooks: [STANDARD_HOOKS.USE_API]
    },
    consumes: {
      hooks: [STANDARD_HOOKS.USE_SHARED_STATE]
    }
  }),
  
  // Auth feature
  AUTH_FEATURE: (): BloomFeatureContract => ({
    provides: {
      services: [STANDARD_SERVICES.AUTH, STANDARD_SERVICES.SESSION],
      hooks: [STANDARD_HOOKS.USE_AUTH, STANDARD_HOOKS.USE_USER],
      types: [STANDARD_TYPES.USER_TYPE, STANDARD_TYPES.USER_STATE_TYPE]
    },
    consumes: {
      hooks: [STANDARD_HOOKS.USE_SHARED_STATE, STANDARD_HOOKS.USE_API],
      state: [STANDARD_STATE.AUTH, STANDARD_STATE.USER]
    }
  }),
  
  // UI feature
  UI_FEATURE: (): BloomFeatureContract => ({
    provides: {
      components: [STANDARD_COMPONENTS.MODAL, STANDARD_COMPONENTS.TOAST],
      hooks: [STANDARD_HOOKS.USE_MODAL, STANDARD_HOOKS.USE_TOAST]
    },
    consumes: {
      hooks: [STANDARD_HOOKS.USE_THEME],
      state: [STANDARD_STATE.UI]
    }
  }),
  
  // Data feature
  DATA_FEATURE: (): BloomFeatureContract => ({
    provides: {
      services: [STANDARD_SERVICES.STORAGE, STANDARD_SERVICES.CACHE],
      hooks: [STANDARD_HOOKS.USE_LOCAL_STORAGE, STANDARD_HOOKS.USE_SESSION_STORAGE]
    },
    consumes: {
      hooks: [STANDARD_HOOKS.USE_SHARED_STATE],
      state: [STANDARD_STATE.CACHE]
    }
  })
} as const;

// Contract validation helpers
export function isValidService(service: string): boolean {
  return Object.values(STANDARD_SERVICES).includes(service as any);
}

export function isValidHook(hook: string): boolean {
  return Object.values(STANDARD_HOOKS).includes(hook as any);
}

export function isValidComponent(component: string): boolean {
  return Object.values(STANDARD_COMPONENTS).includes(component as any);
}

export function isValidState(state: string): boolean {
  return Object.values(STANDARD_STATE).includes(state as any);
}

export function isValidType(type: string): boolean {
  return Object.values(STANDARD_TYPES).includes(type as any);
}

// Contract builder utility
export class ContractBuilder {
  private contract: BloomFeatureContract = {};

  providesService(service: string): ContractBuilder {
    if (!this.contract.provides) this.contract.provides = {};
    if (!this.contract.provides.services) this.contract.provides.services = [];
    this.contract.provides.services.push(service);
    return this;
  }

  providesHook(hook: string): ContractBuilder {
    if (!this.contract.provides) this.contract.provides = {};
    if (!this.contract.provides.hooks) this.contract.provides.hooks = [];
    this.contract.provides.hooks.push(hook);
    return this;
  }

  providesComponent(component: string): ContractBuilder {
    if (!this.contract.provides) this.contract.provides = {};
    if (!this.contract.provides.components) this.contract.provides.components = [];
    this.contract.provides.components.push(component);
    return this;
  }

  providesType(type: string): ContractBuilder {
    if (!this.contract.provides) this.contract.provides = {};
    if (!this.contract.provides.types) this.contract.provides.types = [];
    this.contract.provides.types.push(type);
    return this;
  }

  consumesService(service: string): ContractBuilder {
    if (!this.contract.consumes) this.contract.consumes = {};
    if (!this.contract.consumes.services) this.contract.consumes.services = [];
    this.contract.consumes.services.push(service);
    return this;
  }

  consumesHook(hook: string): ContractBuilder {
    if (!this.contract.consumes) this.contract.consumes = {};
    if (!this.contract.consumes.hooks) this.contract.consumes.hooks = [];
    this.contract.consumes.hooks.push(hook);
    return this;
  }

  consumesState(state: string): ContractBuilder {
    if (!this.contract.consumes) this.contract.consumes = {};
    if (!this.contract.consumes.state) this.contract.consumes.state = [];
    this.contract.consumes.state.push(state);
    return this;
  }

  build(): BloomFeatureContract {
    return { ...this.contract };
  }
}

// Quick contract creation
export function createContract(): ContractBuilder {
  return new ContractBuilder();
}

// Merge contracts utility
export function mergeContracts(...contracts: BloomFeatureContract[]): BloomFeatureContract {
  const merged: BloomFeatureContract = {};

  contracts.forEach(contract => {
    // Merge provides
    if (contract.provides) {
      if (!merged.provides) merged.provides = {};
      
      if (contract.provides.services) {
        merged.provides.services = [...(merged.provides.services || []), ...contract.provides.services];
      }
      if (contract.provides.hooks) {
        merged.provides.hooks = [...(merged.provides.hooks || []), ...contract.provides.hooks];
      }
      if (contract.provides.components) {
        merged.provides.components = [...(merged.provides.components || []), ...contract.provides.components];
      }
      if (contract.provides.types) {
        merged.provides.types = [...(merged.provides.types || []), ...contract.provides.types];
      }
    }

    // Merge consumes
    if (contract.consumes) {
      if (!merged.consumes) merged.consumes = {};
      
      if (contract.consumes.services) {
        merged.consumes.services = [...(merged.consumes.services || []), ...contract.consumes.services];
      }
      if (contract.consumes.hooks) {
        merged.consumes.hooks = [...(merged.consumes.hooks || []), ...contract.consumes.hooks];
      }
      if (contract.consumes.state) {
        merged.consumes.state = [...(merged.consumes.state || []), ...contract.consumes.state];
      }
    }

    // Merge API
    if (contract.api) {
      if (!merged.api) merged.api = {};
      
      if (contract.api.endpoints) {
        merged.api.endpoints = [...(merged.api.endpoints || []), ...contract.api.endpoints];
      }
      if (contract.api.methods) {
        merged.api.methods = [...(merged.api.methods || []), ...contract.api.methods];
      }
    }
  });

  // Remove duplicates
  if (merged.provides) {
    if (merged.provides.services) merged.provides.services = [...new Set(merged.provides.services)];
    if (merged.provides.hooks) merged.provides.hooks = [...new Set(merged.provides.hooks)];
    if (merged.provides.components) merged.provides.components = [...new Set(merged.provides.components)];
    if (merged.provides.types) merged.provides.types = [...new Set(merged.provides.types)];
  }

  if (merged.consumes) {
    if (merged.consumes.services) merged.consumes.services = [...new Set(merged.consumes.services)];
    if (merged.consumes.hooks) merged.consumes.hooks = [...new Set(merged.consumes.hooks)];
    if (merged.consumes.state) merged.consumes.state = [...new Set(merged.consumes.state)];
  }

  if (merged.api) {
    if (merged.api.endpoints) merged.api.endpoints = [...new Set(merged.api.endpoints)];
    if (merged.api.methods) merged.api.methods = [...new Set(merged.api.methods)];
  }

  return merged;
}