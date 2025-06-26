/**
 * Shared Bloom Storage Hook - Unified storage interface with defaults integration
 * @module @voilajsx/bloom/shared
 * @file src/shared/hooks/useBloomStorage.ts
 */

import { useCallback } from 'react';
import defaults from '@/defaults';

interface StorageOptions {
  prefix?: string;
  fallback?: any;
  serialize?: boolean;
}

// Storage event emitter for cross-component updates
class StorageEventEmitter {
  private listeners: Map<string, Array<(value: any) => void>> = new Map();

  emit(key: string, value: any) {
    const callbacks = this.listeners.get(key) || [];
    callbacks.forEach(callback => callback(value));
  }

  subscribe(key: string, callback: (value: any) => void) {
    const callbacks = this.listeners.get(key) || [];
    callbacks.push(callback);
    this.listeners.set(key, callbacks);

    // Return unsubscribe function
    return () => {
      const updatedCallbacks = (this.listeners.get(key) || []).filter(cb => cb !== callback);
      this.listeners.set(key, updatedCallbacks);
    };
  }
}

const storageEmitter = new StorageEventEmitter();

export function useBloomStorage(options: StorageOptions = {}) {
  const { prefix = 'bloom', serialize = true } = options;

  // Get storage key with prefix
  const getStorageKey = useCallback((key: string) => {
    return `${prefix}.${key}`;
  }, [prefix]);

 // Get value from storage with defaults fallback
  const get = useCallback(async <T = any>(key: string, fallback?: T): Promise<T> => {
    try {
      const storageKey = getStorageKey(key);
      const stored = localStorage.getItem(storageKey);

      if (stored !== null) {
        return serialize ? JSON.parse(stored) as T : stored as T;
      }

      // Check defaults if not in storage
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
  }, [getStorageKey, serialize]);

  // Set value in storage
  const set = useCallback(async <T = any>(key: string, value: T): Promise<boolean> => {
    try {
      const storageKey = getStorageKey(key);
      const serializedValue = serialize ? JSON.stringify(value) : String(value);
      
      localStorage.setItem(storageKey, serializedValue);
      
      // Emit storage change event
      storageEmitter.emit(key, value);
      
      return true;
    } catch (error) {
      console.error(`[BloomStorage] Failed to set ${key}:`, error);
      return false;
    }
  }, [getStorageKey, serialize]);

  // Remove value from storage
  const remove = useCallback(async (key: string): Promise<boolean> => {
    try {
      const storageKey = getStorageKey(key);
      localStorage.removeItem(storageKey);
      
      // Emit removal event
      storageEmitter.emit(key, undefined);
      
      return true;
    } catch (error) {
      console.error(`[BloomStorage] Failed to remove ${key}:`, error);
      return false;
    }
  }, [getStorageKey]);

  // Check if key exists in storage
  const has = useCallback(async (key: string): Promise<boolean> => {
    try {
      const storageKey = getStorageKey(key);
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      console.error(`[BloomStorage] Failed to check ${key}:`, error);
      return false;
    }
  }, [getStorageKey]);

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
      await Promise.all(
        Object.entries(data).map(([key, value]) => set(key, value))
      );
      return true;
    } catch (error) {
      console.error('[BloomStorage] Failed to set multiple values:', error);
      return false;
    }
  }, [set]);

  // Clear all storage with prefix
  const clear = useCallback(async (): Promise<boolean> => {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${prefix}.`)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      return true;
    } catch (error) {
      console.error('[BloomStorage] Failed to clear storage:', error);
      return false;
    }
  }, [prefix]);

  // Subscribe to storage changes
  const subscribe = useCallback((key: string, callback: (value: any) => void) => {
    return storageEmitter.subscribe(key, callback);
  }, []);

  // Get all stored data with prefix
  const getAll = useCallback(async (): Promise<Record<string, any>> => {
    try {
      const result: Record<string, any> = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey && storageKey.startsWith(`${prefix}.`)) {
          const key = storageKey.replace(`${prefix}.`, '');
          const value = localStorage.getItem(storageKey);
          
          if (value !== null) {
            result[key] = serialize ? JSON.parse(value) : value;
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('[BloomStorage] Failed to get all data:', error);
      return {};
    }
  }, [prefix, serialize]);

  // Get storage usage info
  const getStorageInfo = useCallback(async () => {
    try {
      let totalSize = 0;
      let itemCount = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${prefix}.`)) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
            itemCount++;
          }
        }
      }
      
      return {
        itemCount,
        totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
        prefix
      };
    } catch (error) {
      console.error('[BloomStorage] Failed to get storage info:', error);
      return { itemCount: 0, totalSize: 0, totalSizeKB: 0, prefix };
    }
  }, [prefix]);

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
    subscribe,
    getStorageInfo,
    
    // Configuration
    prefix
  };
}