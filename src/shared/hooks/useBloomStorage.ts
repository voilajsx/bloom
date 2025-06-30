/**
 * Bloom Framework - Secure Storage Hook (Redux Wrapper with Auto-Persistence)
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

// 🔒 SECURITY: Input sanitization
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Prevent XSS by escaping dangerous characters
    return value
      .replace(/<script/gi, '&lt;script')
      .replace(/<\/script>/gi, '&lt;/script&gt;')
      .replace(/javascript:/gi, 'javascript_blocked:')
      .replace(/on\w+=/gi, 'blocked_event=');
  }
  
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(item => sanitizeValue(item));
    }
    
    const sanitized: Record<string, any> = {};
    Object.entries(value).forEach(([key, val]) => {
      sanitized[key] = sanitizeValue(val);
    });
    return sanitized;
  }
  
  return value;
}

// 🔒 SECURITY: Validate storage key to prevent injection
function validateKey(key: string): boolean {
  // Only allow alphanumeric, dots, dashes, underscores
  return /^[a-zA-Z0-9._-]+$/.test(key);
}

// 🔒 SECURITY: Check for sensitive data patterns
function containsSensitiveData(value: any): boolean {
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /api[_-]?key/i,
    /private[_-]?key/i,
    /credit[_-]?card/i,
    /ssn/i,
    /social[_-]?security/i
  ];
  
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  return sensitivePatterns.some(pattern => pattern.test(valueStr));
}

/**
 * Bloom Storage Hook - Secure API with Redux + localStorage persistence
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
            
            // 🔒 SECURITY: Validate key format
            if (!validateKey(storageKey)) {
              console.warn(`[BloomStorage] Invalid key format skipped: ${storageKey}`);
              return;
            }
            
            const value = localStorage.getItem(key);
            if (value !== null) {
              try {
                const parsed = JSON.parse(value);
                storedData[storageKey] = sanitizeValue(parsed);
              } catch (error) {
                console.warn(`[BloomStorage] Failed to parse stored value for ${storageKey}`);
              }
            }
          }
        });

        // Hydrate Redux if we have data
        if (Object.keys(storedData).length > 0) {
          dispatch({ type: 'storage/hydrate', payload: storedData });
          console.log(`[BloomStorage] 🔒 Securely hydrated ${Object.keys(storedData).length} items from localStorage`);
        }
      } catch (error) {
        console.error('[BloomStorage] Failed to hydrate from localStorage:', error);
      }
    };

    hydrateFromStorage();
  }, [isReady, autoHydrate, prefix, dispatch]);

  // Get value from Redux state with defaults fallback
  const get = useCallback(async <T = any>(key: string, fallback?: T): Promise<T> => {
    // 🔒 SECURITY: Validate key
    if (!validateKey(key)) {
      console.warn(`[BloomStorage] Invalid key format: ${key}`);
      return (fallback ?? null) as T;
    }

    try {
      // First check Redux state
      if (state && state[key] !== undefined) {
        return state[key] as T;
      }

      // Then check localStorage directly (in case Redux not hydrated yet)
      const stored = localStorage.getItem(`${prefix}.${key}`);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        return sanitizeValue(parsed) as T;
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
    // 🔒 SECURITY: Validate key
    if (!validateKey(key)) {
      console.warn(`[BloomStorage] Invalid key format: ${key}`);
      return false;
    }

    // 🔒 SECURITY: Check for sensitive data
    if (containsSensitiveData(value)) {
      console.warn(`[BloomStorage] 🔒 Potential sensitive data detected in key: ${key}. Consider using secure storage.`);
      // Don't block, but warn - let developer decide
    }

    try {
      const sanitizedValue = sanitizeValue(value);
      dispatch({ 
        type: 'storage/setValue', 
        payload: { key, value: sanitizedValue } 
      });
      return true;
    } catch (error) {
      console.error(`[BloomStorage] Failed to set ${key}:`, error);
      return false;
    }
  }, [dispatch]);

  // Remove value from Redux and localStorage
  const remove = useCallback(async (key: string): Promise<boolean> => {
    // 🔒 SECURITY: Validate key
    if (!validateKey(key)) {
      console.warn(`[BloomStorage] Invalid key format: ${key}`);
      return false;
    }

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
    // 🔒 SECURITY: Validate key
    if (!validateKey(key)) {
      return false;
    }

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
        if (validateKey(key)) {
          result[key] = await get<T>(key);
        } else {
          console.warn(`[BloomStorage] Invalid key skipped: ${key}`);
        }
      })
    );
    
    return result;
  }, [get]);

  // Set multiple values at once
  const setMultiple = useCallback(async (data: Record<string, any>): Promise<boolean> => {
    try {
      // 🔒 SECURITY: Validate all keys first
      const invalidKeys = Object.keys(data).filter(key => !validateKey(key));
      if (invalidKeys.length > 0) {
        console.warn(`[BloomStorage] Invalid keys skipped: ${invalidKeys.join(', ')}`);
        // Filter out invalid keys
        const validData: Record<string, any> = {};
        Object.entries(data).forEach(([key, value]) => {
          if (validateKey(key)) {
            validData[key] = value;
          }
        });
        data = validData;
      }

      // 🔒 SECURITY: Sanitize all values
      const sanitizedData: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (containsSensitiveData(value)) {
          console.warn(`[BloomStorage] 🔒 Potential sensitive data detected in key: ${key}`);
        }
        sanitizedData[key] = sanitizeValue(value);
      });

      dispatch({ 
        type: 'storage/setMultiple', 
        payload: sanitizedData 
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
      console.log('[BloomStorage] 🔒 All storage cleared securely');
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

  // Get storage usage info with security metrics
  const getStorageInfo = useCallback(async () => {
    try {
      let totalSize = 0;
      let itemCount = 0;
      let securityWarnings = 0;
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`${prefix}.`)) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
            itemCount++;
            
            // Check for potential security issues
            try {
              const parsed = JSON.parse(value);
              if (containsSensitiveData(parsed)) {
                securityWarnings++;
              }
            } catch (error) {
              // Ignore parse errors for size calculation
            }
          }
        }
      });
      
      return {
        itemCount,
        totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
        prefix,
        reduxItems: Object.keys(state || {}).length,
        isHydrated: isReady,
        securityWarnings,
        isSecure: securityWarnings === 0
      };
    } catch (error) {
      console.error('[BloomStorage] Failed to get storage info:', error);
      return { 
        itemCount: 0, 
        totalSize: 0, 
        totalSizeKB: 0, 
        prefix,
        reduxItems: 0,
        isHydrated: false,
        securityWarnings: 0,
        isSecure: true
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