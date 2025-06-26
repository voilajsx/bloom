/**
 * Bloom Framework - API utilities and request management
 * @module @voilajsx/bloom/platform
 * @file src/platform/api.ts
 */

import defaults from '@/defaults';
import type { BloomApiResponse, BloomRequestOptions } from './types';

// Simple in-memory cache for API responses
const apiCache = new Map<string, { 
  data: any; 
  timestamp: number; 
  expiry: number; 
}>();

/**
 * Generate cache key for request
 */
function generateCacheKey(url: string, options: BloomRequestOptions = {}): string {
  const method = 'GET'; // Only cache GET requests
  const headers = JSON.stringify(options.headers || {});
  return `${method}:${url}:${headers}`;
}

/**
 * Get cached response if valid
 */
function getCachedResponse<T = any>(cacheKey: string): BloomApiResponse<T> | null {
  const cached = apiCache.get(cacheKey);
  
  if (cached && Date.now() < cached.expiry) {
    return {
      success: true,
      data: cached.data,
      cached: true,
      status: 200
    };
  }
  
  // Remove expired cache entry
  if (cached) {
    apiCache.delete(cacheKey);
  }
  
  return null;
}

/**
 * Set cache entry
 */
function setCacheEntry(cacheKey: string, data: any, cacheTime: number): void {
  apiCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + cacheTime
  });
}

/**
 * Clear all cached responses
 */
export function clearApiCache(): void {
  apiCache.clear();
}

/**
 * Clear expired cache entries
 */
export function cleanupApiCache(): void {
  const now = Date.now();
  
  for (const [key, entry] of apiCache.entries()) {
    if (now >= entry.expiry) {
      apiCache.delete(key);
    }
  }
}

/**
 * Main API request function
 */
async function apiRequest<T = any>(
  url: string, 
  method: string = 'GET',
  data?: any,
  options: BloomRequestOptions = {}
): Promise<BloomApiResponse<T>> {
  const {
    headers = {},
    timeout = defaults['api-timeout'] || 10000,
    cache = defaults['enable-caching'] ?? true,
    cacheTime = 300000, // 5 minutes default
    retries = 3
  } = options;

  // Generate cache key for GET requests
  const cacheKey = method === 'GET' ? generateCacheKey(url, options) : '';
  
  // Check cache for GET requests
  if (method === 'GET' && cache && cacheKey) {
    const cachedResponse = getCachedResponse<T>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  }

  // Retry logic
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Prepare request headers - fix for TypeScript issue
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders, // Use our properly typed headers object
        signal: controller.signal,
      };

      // Add body for non-GET requests
      if (data && method !== 'GET') {
        if (data instanceof FormData) {
          // Don't set Content-Type for FormData - let browser set it
          delete requestHeaders['Content-Type'];
          requestOptions.headers = requestHeaders;
          requestOptions.body = data;
        } else if (typeof data === 'object') {
          requestOptions.body = JSON.stringify(data);
        } else {
          requestOptions.body = String(data);
        }
      }

      // Make the request
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Parse response
      let responseData: any;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType.includes('text/')) {
        responseData = await response.text();
      } else {
        responseData = await response.blob();
      }

      // Handle successful response
      if (response.ok) {
        // Cache successful GET requests
        if (method === 'GET' && cache && cacheKey) {
          setCacheEntry(cacheKey, responseData, cacheTime);
        }

        return {
          success: true,
          data: responseData,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          cached: false
        };
      }

      // Handle error response
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    } catch (error: any) {
      console.error(`[API] Attempt ${attempt} failed for ${method} ${url}:`, error);

      // Don't retry on abort (timeout) or client errors (4xx)
      if (error.name === 'AbortError' || (error.message.includes('HTTP 4'))) {
        break;
      }

      // If this is the last attempt, return error
      if (attempt === retries) {
        const errorMessage = error.name === 'AbortError' 
          ? 'Request timed out' 
          : error.message || 'Network request failed';

        return {
          success: false,
          error: errorMessage,
          status: error.status || 0
        };
      }

      // Wait before retry with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  // This should never be reached
  return {
    success: false,
    error: 'Request failed after all retries'
  };
}

/**
 * GET request
 */
export async function apiGet<T = any>(
  url: string, 
  options: BloomRequestOptions = {}
): Promise<BloomApiResponse<T>> {
  return apiRequest<T>(url, 'GET', undefined, options);
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  url: string, 
  data?: any, 
  options: BloomRequestOptions = {}
): Promise<BloomApiResponse<T>> {
  return apiRequest<T>(url, 'POST', data, options);
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  url: string, 
  data?: any, 
  options: BloomRequestOptions = {}
): Promise<BloomApiResponse<T>> {
  return apiRequest<T>(url, 'PUT', data, options);
}

/**
 * PATCH request
 */
export async function apiPatch<T = any>(
  url: string, 
  data?: any, 
  options: BloomRequestOptions = {}
): Promise<BloomApiResponse<T>> {
  return apiRequest<T>(url, 'PATCH', data, options);
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(
  url: string, 
  options: BloomRequestOptions = {}
): Promise<BloomApiResponse<T>> {
  return apiRequest<T>(url, 'DELETE', undefined, options);
}

/**
 * Upload file with progress tracking
 */
export async function uploadFile<T = any>(
  url: string,
  file: File,
  options: BloomRequestOptions & {
    onProgress?: (progress: number) => void;
    fieldName?: string;
    additionalData?: Record<string, any>;
  } = {}
): Promise<BloomApiResponse<T>> {
  const {
    onProgress,
    fieldName = 'file',
    additionalData = {},
    headers = {},
    ...requestOptions
  } = options;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // Add file to form data
    formData.append(fieldName, file);

    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    });

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      let responseData: any;

      try {
        responseData = JSON.parse(xhr.responseText);
      } catch {
        responseData = xhr.responseText;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          success: true,
          data: responseData,
          status: xhr.status,
          cached: false
        });
      } else {
        resolve({
          success: false,
          error: `Upload failed: ${xhr.status} ${xhr.statusText}`,
          status: xhr.status
        });
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      resolve({
        success: false,
        error: 'Upload failed due to network error'
      });
    });

    // Handle timeout
    xhr.addEventListener('timeout', () => {
      resolve({
        success: false,
        error: 'Upload timed out'
      });
    });

    // Set headers - proper TypeScript handling
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // Set timeout
    if (requestOptions.timeout) {
      xhr.timeout = requestOptions.timeout;
    }

    // Start upload
    xhr.open('POST', url);
    xhr.send(formData);
  });
}

/**
 * Download file
 */
export async function downloadFile(
  url: string,
  filename?: string,
  options: BloomRequestOptions = {}
): Promise<BloomApiResponse<Blob>> {
  const response = await apiRequest<Blob>(url, 'GET', undefined, {
    ...options,
    cache: false // Don't cache file downloads
  });

  if (response.success && response.data instanceof Blob) {
    // Auto-download if filename provided
    if (filename) {
      const downloadUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }
  }

  return response;
}

/**
 * Batch API requests
 */
export async function batchRequests<T = any>(
  requests: Array<{
    url: string;
    method?: string;
    data?: any;
    options?: BloomRequestOptions;
  }>
): Promise<BloomApiResponse<T>[]> {
  const promises = requests.map(({ url, method = 'GET', data, options }) =>
    apiRequest<T>(url, method, data, options)
  );

  return Promise.all(promises);
}

/**
 * API health check
 */
export async function healthCheck(baseUrl: string = ''): Promise<boolean> {
  try {
    const url = baseUrl ? `${baseUrl}/health` : '/health';
    const response = await apiGet(url, { timeout: 5000, cache: false });
    return response.success;
  } catch {
    return false;
  }
}

// Cleanup cache periodically
if (typeof window !== 'undefined') {
  setInterval(cleanupApiCache, 300000); // Clean every 5 minutes
}