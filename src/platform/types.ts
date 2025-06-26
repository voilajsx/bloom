/**
 * Bloom Framework - Core type definitions with Contracts & Redux
 * @module @voilajsx/bloom/platform
 * @file src/platform/types.ts
 */

import React from 'react';

// Feature Contract Types
export interface BloomFeatureContract {
  provides?: {
    services?: string[];
    hooks?: string[];
    components?: string[];
    types?: string[];
  };
  consumes?: {
    services?: string[];
    hooks?: string[];
    state?: string[];
  };
  api?: {
    endpoints?: string[];
    methods?: string[];
  };
}

// Contract Validation Types
export interface BloomContractValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingDependencies: string[];
}

// Redux State Types
export interface BloomStateSlice {
  name: string;
  initialState: any;
  reducers: Record<string, any>;
  extraReducers?: any;
}

export interface BloomSharedState {
  enabled: boolean;
  slices: BloomStateSlice[];
  middleware?: string[];
}

// Feature Configuration Types
export interface BloomFeatureConfig {
  name: string;
  routes: BloomRoute[];
  contract?: BloomFeatureContract;
  sharedState?: boolean;
  stateSlices?: BloomStateSlice[];
  settings?: Record<string, BloomSetting>;
  api?: BloomApiConfig;
  meta?: BloomFeatureMeta;
  init?: () => void | Promise<void>;
  cleanup?: () => void | Promise<void>;
}

// Route Configuration
export interface BloomRoute {
  path: string;
  component: () => Promise<{ default: React.ComponentType<any> }>;
  layout?: string;
  title?: string;
  meta?: BloomRouteMeta;
  ssg?: boolean;
  guard?: string | string[];
  preload?: boolean;
  exact?: boolean;
}

export interface BloomRouteMeta {
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  noIndex?: boolean;
  canonical?: string;
  [key: string]: any;
}

// Settings Schema
export interface BloomSetting {
  key: string;
  default: any;
  type: 'boolean' | 'string' | 'number' | 'select' | 'json';
  label: string;
  description?: string;
  options?: Array<{ value: string | number; label: string }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// API Configuration
export interface BloomApiConfig {
  baseUrl?: string;
  endpoints?: Record<string, string>;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  cache?: boolean;
  cacheTime?: number;
}

// Feature Metadata
export interface BloomFeatureMeta {
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
  dependencies?: string[];
  icon?: string;
}

// Router Types
export interface BloomRouterConfig {
  routes: BloomCompiledRoute[];
  features: BloomFeatureRegistry;
  basePath?: string;
  fallback?: React.ComponentType;
}

export interface BloomCompiledRoute extends BloomRoute {
  id: string;
  featureName: string;
  fullPath: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

// Feature Registry with Contracts
export interface BloomFeatureRegistry {
  [featureName: string]: {
    config: BloomFeatureConfig;
    routes: BloomCompiledRoute[];
    contract?: BloomFeatureContract;
    validation?: BloomContractValidation;
    loaded: boolean;
    error?: string;
  };
}

// Contract Registry
export interface BloomContractRegistry {
  [featureName: string]: BloomFeatureContract;
}

// Discovery Types
export interface BloomDiscoveryResult {
  features: BloomFeatureRegistry;
  routes: BloomCompiledRoute[];
  contracts: BloomContractRegistry;
  loading: boolean;
  error?: string;
}

// Build Types
export interface BloomBuildConfig {
  outDir: string;
  assetsDir: string;
  publicDir: string;
  ssg: {
    enabled: boolean;
    routes: string[];
    fallback: boolean;
  };
  optimization: {
    minify: boolean;
    treeshake: boolean;
    codeSplit: boolean;
  };
}

// Plugin Types
export interface BloomPlugin {
  name: string;
  version?: string;
  setup?: (config: BloomBuildConfig) => void | Promise<void>;
  buildStart?: () => void | Promise<void>;
  transform?: (code: string, id: string) => string | Promise<string>;
  generateBundle?: (bundle: any) => void | Promise<void>;
  buildEnd?: () => void | Promise<void>;
}

// Storage Types
export interface BloomStorageManager {
  get<T = any>(key: string, fallback?: T): Promise<T>;
  set<T = any>(key: string, value: T): Promise<boolean>;
  remove(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  subscribe(key: string, callback: (value: any) => void): () => void;
}

// API Manager Types
export interface BloomApiManager {
  get<T = any>(url: string, options?: BloomRequestOptions): Promise<BloomApiResponse<T>>;
  post<T = any>(url: string, data?: any, options?: BloomRequestOptions): Promise<BloomApiResponse<T>>;
  put<T = any>(url: string, data?: any, options?: BloomRequestOptions): Promise<BloomApiResponse<T>>;
  delete<T = any>(url: string, options?: BloomRequestOptions): Promise<BloomApiResponse<T>>;
  patch<T = any>(url: string, data?: any, options?: BloomRequestOptions): Promise<BloomApiResponse<T>>;
}

export interface BloomRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
  cacheTime?: number;
  retries?: number;
}

export interface BloomApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  cached?: boolean;
  headers?: Record<string, string>;
}

// Theme Types
export interface BloomThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  variants: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

// Error Types
export interface BloomError extends Error {
  code?: string;
  feature?: string;
  route?: string;
  context?: Record<string, any>;
}

// Development Types
export interface BloomDevTools {
  features: BloomFeatureRegistry;
  routes: BloomCompiledRoute[];
  contracts: BloomContractRegistry;
  performance: {
    renderTime: number;
    bundleSize: number;
    routeLoadTime: Record<string, number>;
  };
  errors: BloomError[];
}

// Utility Types
export type BloomComponent<P = {}> = React.ComponentType<P>;
export type BloomAsyncComponent<P = {}> = () => Promise<{ default: BloomComponent<P> }>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type BloomConfigInput = DeepPartial<BloomFeatureConfig>;