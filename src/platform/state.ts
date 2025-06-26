/**
 * Bloom Framework - Redux Store with Dynamic Slice Management
 * @module @voilajsx/bloom/platform
 * @file src/platform/state.ts
 */

import { 
  configureStore, 
  createSlice, 
  combineReducers,
  type Reducer,
  type AnyAction,
  type PayloadAction
} from '@reduxjs/toolkit';
import type { BloomStateSlice } from './types';

// Global store instance
let store: ReturnType<typeof configureStore> | null = null;
let dynamicReducers: Record<string, Reducer<any, AnyAction>> = {};

// Root state type
export interface BloomRootState {
  [key: string]: any;
}

/**
 * Create a dynamic reducer that can be updated at runtime
 */
function createDynamicReducer(): Reducer<BloomRootState, AnyAction> {
  if (Object.keys(dynamicReducers).length === 0) {
    // Return identity reducer when no slices are registered
    return (state: BloomRootState = {}, action: AnyAction) => state;
  }
  return combineReducers(dynamicReducers);
}

/**
 * Initialize Redux store
 */
export function initializeStore() {
  if (store) {
    console.warn('[State] Store already initialized');
    return store;
  }

  store = configureStore({
    reducer: createDynamicReducer() as any,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });

  console.log('[State] Redux store initialized');
  return store;
}

/**
 * Get the current store instance
 */
export function getStore() {
  if (!store) {
    return initializeStore();
  }
  return store;
}

/**
 * Add a new slice to the store dynamically
 */
export function addSlice(sliceConfig: BloomStateSlice) {
  const { name, initialState, reducers, extraReducers } = sliceConfig;

  // Create the slice
  const slice = createSlice({
    name,
    initialState,
    reducers,
    extraReducers,
  });

  // Add to dynamic reducers
  dynamicReducers[name] = slice.reducer;

  // Replace the root reducer
  if (store) {
    store.replaceReducer(createDynamicReducer() as any);
    console.log(`[State] Added slice: ${name}`);
  }

  return {
    slice,
    actions: slice.actions,
    reducer: slice.reducer,
  };
}

/**
 * Remove a slice from the store
 */
export function removeSlice(sliceName: string) {
  if (dynamicReducers[sliceName]) {
    delete dynamicReducers[sliceName];
    
    if (store) {
      store.replaceReducer(createDynamicReducer() as any);
      console.log(`[State] Removed slice: ${sliceName}`);
    }
  }
}

/**
 * Check if a slice exists
 */
export function hasSlice(sliceName: string): boolean {
  return sliceName in dynamicReducers;
}

/**
 * Get all registered slice names
 */
export function getSliceNames(): string[] {
  return Object.keys(dynamicReducers);
}

/**
 * Add multiple slices at once
 */
export function addSlices(slices: BloomStateSlice[]) {
  const results: Record<string, ReturnType<typeof addSlice>> = {};

  slices.forEach(sliceConfig => {
    results[sliceConfig.name] = addSlice(sliceConfig);
  });

  return results;
}

/**
 * Clear all slices (for testing)
 */
export function clearAllSlices() {
  dynamicReducers = {};
  
  if (store) {
    store.replaceReducer(createDynamicReducer() as any);
    console.log('[State] Cleared all slices');
  }
}

/**
 * Get current state
 */
export function getCurrentState(): BloomRootState {
  return store?.getState() || {};
}

/**
 * Subscribe to store changes
 */
export function subscribeToStore(listener: () => void) {
  return store?.subscribe(listener) || (() => {});
}

/**
 * Dispatch an action
 */
export function dispatch(action: any) {
  return store?.dispatch(action);
}

// Common slice templates
export const SLICE_TEMPLATES = {
  /**
   * Basic counter slice template
   */
  COUNTER: (name: string): BloomStateSlice => ({
    name,
    initialState: { value: 0 },
    reducers: {
      increment: (state: { value: number }) => {
        state.value += 1;
      },
      decrement: (state: { value: number }) => {
        state.value -= 1;
      },
      incrementByAmount: (state: { value: number }, action: PayloadAction<number>) => {
        state.value += action.payload;
      },
      reset: (state: { value: number }) => {
        state.value = 0;
      },
    },
  }),

  /**
   * Loading state slice template
   */
  LOADING: (name: string): BloomStateSlice => ({
    name,
    initialState: { 
      isLoading: false,
      error: null as string | null,
      data: null as any
    },
    reducers: {
      setLoading: (state: any, action: PayloadAction<boolean>) => {
        state.isLoading = action.payload;
      },
      setError: (state: any, action: PayloadAction<string | null>) => {
        state.error = action.payload;
        state.isLoading = false;
      },
      setData: (state: any, action: PayloadAction<any>) => {
        state.data = action.payload;
        state.isLoading = false;
        state.error = null;
      },
      clearError: (state: any) => {
        state.error = null;
      },
      reset: (state: any) => {
        state.isLoading = false;
        state.error = null;
        state.data = null;
      },
    },
  }),

  /**
   * UI state slice template
   */
  UI: (name: string): BloomStateSlice => ({
    name,
    initialState: {
      modals: {} as Record<string, boolean>,
      sidebar: false,
      theme: 'light' as 'light' | 'dark',
    },
    reducers: {
      openModal: (state: any, action: PayloadAction<string>) => {
        state.modals[action.payload] = true;
      },
      closeModal: (state: any, action: PayloadAction<string>) => {
        state.modals[action.payload] = false;
      },
      closeAllModals: (state: any) => {
        state.modals = {};
      },
      toggleSidebar: (state: any) => {
        state.sidebar = !state.sidebar;
      },
      setSidebar: (state: any, action: PayloadAction<boolean>) => {
        state.sidebar = action.payload;
      },
      setTheme: (state: any, action: PayloadAction<'light' | 'dark'>) => {
        state.theme = action.payload;
      },
    },
  }),

  /**
   * API cache slice template
   */
  API_CACHE: (name: string): BloomStateSlice => ({
    name,
    initialState: {
      cache: {} as Record<string, { data: any; timestamp: number; expiry: number }>,
    },
    reducers: {
      setCacheEntry: (state: any, action: PayloadAction<{ key: string; data: any; expiry: number }>) => {
        const { key, data, expiry } = action.payload;
        state.cache[key] = {
          data,
          timestamp: Date.now(),
          expiry: Date.now() + expiry,
        };
      },
      removeCacheEntry: (state: any, action: PayloadAction<string>) => {
        delete state.cache[action.payload];
      },
      clearCache: (state: any) => {
        state.cache = {};
      },
      cleanExpiredCache: (state: any) => {
        const now = Date.now();
        Object.keys(state.cache).forEach(key => {
          if (state.cache[key].expiry < now) {
            delete state.cache[key];
          }
        });
      },
    },
  }),
};

/**
 * Create a slice from template
 */
export function createSliceFromTemplate(
  template: keyof typeof SLICE_TEMPLATES,
  name: string
): BloomStateSlice {
  return SLICE_TEMPLATES[template](name);
}

/**
 * Store debugging utilities
 */
export function getStoreDebugInfo() {
  return {
    hasStore: !!store,
    sliceCount: Object.keys(dynamicReducers).length,
    sliceNames: Object.keys(dynamicReducers),
    currentState: store?.getState() || null,
  };
}

/**
 * Reset store (for testing)
 */
export function resetStore() {
  store = null;
  dynamicReducers = {};
  console.log('[State] Store reset');
}