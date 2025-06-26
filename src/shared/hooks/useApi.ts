/**
 * Shared API Hook - Unified API interface with caching and error handling
 * @module @voilajsx/bloom/shared
 * @file src/shared/hooks/useApi.ts
 */

import { useState, useCallback } from 'react';
import defaults from '@/defaults';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  cached?: boolean;
}

interface ApiOptions {
  timeout?: number;
  enableCache?: boolean;  // Renamed from 'cache' to avoid conflict
  cacheTime?: number;
  headers?: Record<string, string>;
  retries?: number;
}

// Simple in-memory cache
const apiCache = new Map<string, { data: any; timestamp: number; expiry: number }>();

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear cache helper
  const clearCache = useCallback(() => {
    apiCache.clear();
  }, []);

  // Get from cache
  const getCachedResponse = useCallback((cacheKey: string): ApiResponse | null => {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return {
        success: true,
        data: cached.data,
        cached: true
      };
    }
    // Clean expired cache
    if (cached) {
      apiCache.delete(cacheKey);
    }
    return null;
  }, []);

  // Set cache
  const setCachedResponse = useCallback((cacheKey: string, data: any, cacheTime: number) => {
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + cacheTime
    });
  }, []);

  // Base API call function
  const apiCall = useCallback(async <T = any>(
    url: string,
    options: RequestInit & ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      timeout = defaults['api-timeout'] || 10000,
      enableCache = defaults['enable-caching'] !== false,  // Updated property name
      cacheTime = 300000, // 5 minutes default
      headers = {},
      retries = 3,
      ...fetchOptions
    } = options;

    // Generate cache key for GET requests only
    const cacheKey = (!fetchOptions.method || fetchOptions.method === 'GET') 
      ? `${url}_${JSON.stringify({ headers, ...fetchOptions })}` 
      : '';

    // Check cache for GET requests
    if (enableCache && cacheKey) {  // Updated property name
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    setLoading(true);
    setError(null);

    // Retry logic
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Prepare headers
        const requestHeaders: HeadersInit = {
          'Content-Type': 'application/json',
          ...headers,
        };

        // Make the request
        const response = await fetch(url, {
          ...fetchOptions,
          headers: requestHeaders,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        let data;
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else if (contentType.includes('text/')) {
          data = await response.text();
        } else {
          data = await response.blob();
        }

        if (response.ok) {
          // Cache successful GET requests
          if (enableCache && cacheKey) {  // Updated property name
            setCachedResponse(cacheKey, data, cacheTime);
          }

          setLoading(false);
          return {
            success: true,
            data,
            status: response.status,
            cached: false
          };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (error: any) {
        console.error(`[API] Attempt ${attempt} failed:`, error);

        // Don't retry on abort (timeout) or client errors
        if (error.name === 'AbortError' || (error.message?.includes('HTTP 4'))) {
          break;
        }

        // If this is the last attempt, return error
        if (attempt === retries) {
          const errorMessage = error.name === 'AbortError' 
            ? 'Request timed out' 
            : error.message || 'Network request failed';

          setError(errorMessage);
          setLoading(false);
          return {
            success: false,
            error: errorMessage,
            status: 0
          };
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Fallback (should never reach here)
    setLoading(false);
    return {
      success: false,
      error: 'Request failed after all retries'
    };

  }, [getCachedResponse, setCachedResponse]);

  // Convenience methods
  const apiGet = useCallback(<T = any>(url: string, options: ApiOptions = {}) => {
    return apiCall<T>(url, { ...options, method: 'GET' });
  }, [apiCall]);

  const apiPost = useCallback(<T = any>(url: string, data?: any, options: ApiOptions = {}) => {
    return apiCall<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [apiCall]);

  const apiPut = useCallback(<T = any>(url: string, data?: any, options: ApiOptions = {}) => {
    return apiCall<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [apiCall]);

  const apiDelete = useCallback(<T = any>(url: string, options: ApiOptions = {}) => {
    return apiCall<T>(url, { ...options, method: 'DELETE' });
  }, [apiCall]);

  return {
    // State
    loading,
    error,

    // API methods
    apiCall,
    apiGet,
    apiPost,
    apiPut,
    apiDelete,

    // Cache management
    clearCache,

    // Utilities
    clearError: () => setError(null),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
  };
}