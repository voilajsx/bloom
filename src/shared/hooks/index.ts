/**
 * Bloom Framework - Shared Hooks Exports
 * @module @voilajsx/bloom/shared/hooks
 * @file src/shared/hooks/index.ts
 */

// Hook exports
export { useBloomApi } from './useBloomApi';
export { useBloomStorage } from './useBloomStorage';
export { 
  useBloomState, 
  useBloomStates, 
  useSlice, 
  useSliceActions, 
  useCounter, 
  useLoading, 
  useUI, 
  useApiCache, 
  useStoreInfo 
} from './useBloomState';

// Type exports for useBloomStorage
export interface BloomStorageOptions {
  prefix?: string;
  fallback?: any;
  autoHydrate?: boolean;
}

export interface BloomStorageHook {
  // Core operations
  get: <T = any>(key: string, fallback?: T) => Promise<T>;
  set: <T = any>(key: string, value: T) => Promise<boolean>;
  remove: (key: string) => Promise<boolean>;
  has: (key: string) => Promise<boolean>;
  
  // Batch operations
  getMultiple: <T = any>(keys: string[]) => Promise<Record<string, T>>;
  setMultiple: (data: Record<string, any>) => Promise<boolean>;
  getAll: () => Promise<Record<string, any>>;
  clear: () => Promise<boolean>;
  
  // Utilities
  getStorageInfo: () => Promise<{
    itemCount: number;
    totalSize: number;
    totalSizeKB: number;
    prefix: string;
    reduxItems: number;
    isHydrated: boolean;
  }>;
  
  // State info
  isReady: boolean;
  prefix: string;
  
  // Direct Redux access (for advanced cases)
  state: any;
  dispatch: any;
}

// Type exports for useBloomApi
export interface BloomApiOptions {
  timeout?: number;
  enableCache?: boolean;
  cacheTime?: number;
  headers?: Record<string, string>;
  retries?: number;
}

export interface BloomApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  cached?: boolean;
}

export interface BloomApiHook {
  // State
  loading: boolean;
  error: string | null;

  // API methods
  apiCall: <T = any>(url: string, options?: RequestInit & BloomApiOptions) => Promise<BloomApiResponse<T>>;
  apiGet: <T = any>(url: string, options?: BloomApiOptions) => Promise<BloomApiResponse<T>>;
  apiPost: <T = any>(url: string, data?: any, options?: BloomApiOptions) => Promise<BloomApiResponse<T>>;
  apiPut: <T = any>(url: string, data?: any, options?: BloomApiOptions) => Promise<BloomApiResponse<T>>;
  apiDelete: <T = any>(url: string, options?: BloomApiOptions) => Promise<BloomApiResponse<T>>;

  // Cache management
  clearCache: () => void;

  // Utilities
  clearError: () => void;
  isOnline: boolean;
}

// Type exports for useBloomState
export interface BloomStateHook<T = any> {
  state: T;
  dispatch: any;
  isReady: boolean;
}