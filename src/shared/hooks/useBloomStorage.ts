/**
 * Bloom Framework - Storage Hook (Redux Wrapper with Auto-Persistence)
 * @module @voilajsx/bloom/shared
 * @file src/shared/hooks/useBloomStorage.ts
 */

import { useCallback, useEffect } from 'react';
import { useBloomState } from './useBloomState';
import { addSlice, hasSlice } from '@/platform/state';
import { createSliceFromTemplate } from '@/platform/state';
import defaults from '@/defaults';

interface StorageOptions {
  prefix?: string;
  fallback?: any;
  autoHydrate?: boolean;
}

/**
 * Bloom Storage Hook - Simple API with Redux + localStorage persistence
 */
export function useBloomStorage(options: StorageOptions = {}) {
  const { 
    prefix = 'bloom', 
    autoHydrate = true 
  } = options;

  // Ensure storage slice exists
  if (!hasSlice('storage')) {
    addSlice(createSliceFromTemplate('STORAGE', 'storage'));
  }

  const { state, dispatch, isReady } = useBloomState('storage');

  // Hydrate from localStorage on first load
  useEffect(() => {
    if (!autoHydrate || !isReady) return;

    const hydrateFromStorage = () => {
      const storedData: Record<string, any> = {};

      try {
        // Load all bloom.* keys from localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`${prefix}.`)) {
            const storageKey = key.replace(`${prefix}.`, '');
            const value = localStorage.getItem(key);
            if (value !== null) {
              storedData[storageKey] = JSON.parse(value);
            }
          }
        });

        // Hydrate Redux if we have data
        if (Object.keys(storedData).length > 0) {
          dispatch({ type: 'storage/hydrate', payload: storedData });
          console.log(`[BloomStorage] Hydrated ${Object.keys(storedData).length} items from localStorage`);
        }
      } catch (error) {
        console.error('[BloomStorage] Failed to hydrate from localStorage:', error);
      }
    };

    hydrateFromStorage();
  }, [isReady, autoHydrate, prefix, dispatch]);

  // Get value from Redux state with defaults fallback
  const get = useCallback(async <T = any>(key: string, fallback?: T): Promise<T> => {
    try {
      // First check Redux state
      if (state && state[key] !== undefined) {
        return state[key] as T;
      }

      // Then check localStorage directly (in case Redux not hydrated yet)
      const stored = localStorage.getItem(`${prefix}.${key}`);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }

      // Check defaults configuration
      const defaultValue = (defaults as any)[key];
      if (defaultValue !== undefined) {
        return defaultValue as T;
      }

      // Return provided fallback
      if (fallback !== undefined) {
        return fallback;
      }

      return null as T;
    } catch (error) {
      console.error(`[BloomStorage] Failed to get ${key}:`, error);
      
      // Try defaults fallback
      const defaultValue = (defaults as any)[key];
      if (defaultValue !== undefined) {
        return defaultValue as T;
      }

      return (fallback ?? null) as T;
    }
  }, [state, prefix]);

  // Set value in Redux (auto-persists to localStorage via reducer)
  const set = useCallback(async <T = any>(key: string, value: T): Promise<boolean> => {
    try {
      dispatch({ 
        type: 'storage/setValue', 
        payload: { key, value } 
      });
      return true;
    } catch (error) {
      console.error(`[BloomStorage] Failed to set ${key}:`, error);
      return false;
    }
  }, [dispatch]);

  // Remove value from Redux and localStorage
  const remove = useCallback(async (key: string): Promise<boolean> => {
    try {
      dispatch({ 
        type: 'storage/removeValue', 
        payload: key 
      });
      return true;
    } catch (error) {
      console.error(`[BloomStorage] Failed to remove ${key}:`, error);
      return false;
    }
  }, [dispatch]);

  // Check if key exists in Redux state
  const has = useCallback(async (key: string): Promise<boolean> => {
    try {
      if (state && state[key] !== undefined) {
        return true;
      }
      
      // Check localStorage as fallback
      return localStorage.getItem(`${prefix}.${key}`) !== null;
    } catch (error) {
      console.error(`[BloomStorage] Failed to check ${key}:`, error);
      return false;
    }
  }, [state, prefix]);

  // Get multiple values at once
  const getMultiple = useCallback(async <T = any>(keys: string[]): Promise<Record<string, T>> => {
    const result: Record<string, T> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        result[key] = await get<T>(key);
      })
    );
    
    return result;
  }, [get]);

  // Set multiple values at once
  const setMultiple = useCallback(async (data: Record<string, any>): Promise<boolean> => {
    try {
      dispatch({ 
        type: 'storage/setMultiple', 
        payload: data 
      });
      return true;
    } catch (error) {
      console.error('[BloomStorage] Failed to set multiple values:', error);
      return false;
    }
  }, [dispatch]);

  // Clear all storage
  const clear = useCallback(async (): Promise<boolean> => {
    try {
      dispatch({ type: 'storage/clearAll' });
      return true;
    } catch (error) {
      console.error('[BloomStorage] Failed to clear storage:', error);
      return false;
    }
  }, [dispatch]);

  // Get all stored data
  const getAll = useCallback(async (): Promise<Record<string, any>> => {
    try {
      return state || {};
    } catch (error) {
      console.error('[BloomStorage] Failed to get all data:', error);
      return {};
    }
  }, [state]);

  // Get storage usage info
  const getStorageInfo = useCallback(async () => {
    try {
      let totalSize = 0;
      let itemCount = 0;
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`${prefix}.`)) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
            itemCount++;
          }
        }
      });
      
      return {
        itemCount,
        totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
        prefix,
        reduxItems: Object.keys(state || {}).length,
        isHydrated: isReady
      };
    } catch (error) {
      console.error('[BloomStorage] Failed to get storage info:', error);
      return { 
        itemCount: 0, 
        totalSize: 0, 
        totalSizeKB: 0, 
        prefix,
        reduxItems: 0,
        isHydrated: false
      };
    }
  }, [prefix, state, isReady]);

  return {
    // Core operations
    get,
    set,
    remove,
    has,
    
    // Batch operations
    getMultiple,
    setMultiple,
    getAll,
    clear,
    
    // Utilities
    getStorageInfo,
    
    // State info
    isReady,
    prefix,
    
    // Direct Redux access (for advanced cases)
    state,
    dispatch
  };
}