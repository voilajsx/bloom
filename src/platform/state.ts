/**
 * Bloom Framework - ENHANCED Lazy Redux Store Management
 * ⚡ Performance: Redux only loads when actually needed, with memory cleanup
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

// Global store instance (lazy-initialized)
let store: ReturnType<typeof configureStore> | null = null;
let dynamicReducers: Record<string, Reducer<any, AnyAction>> = {};
let storeInitialized = false;

// Root state type
export interface BloomRootState {
  [key: string]: any;
}

/**
 * ⚡ ENHANCED LAZY: Check if Redux is actually needed before initializing
 */
export function isReduxNeeded(): boolean {
  return Object.keys(dynamicReducers).length > 0 || storeInitialized;
}

/**
 * ⚡ ENHANCED LAZY: Only create reducer when slices exist
 */
function createDynamicReducer(): Reducer<BloomRootState, AnyAction> {
  if (Object.keys(dynamicReducers).length === 0) {
    // Return minimal identity reducer when no slices exist
    return (state: BloomRootState = {}, action: AnyAction) => {
      // Only log in development
      if (process.env.NODE_ENV === 'development' && action.type !== '@@redux/INIT') {
        console.warn('[State] Redux action dispatched but no slices registered:', action.type);
      }
      return state;
    };
  }
  return combineReducers(dynamicReducers);
}

/**
 * ⚡ ENHANCED LAZY: Initialize Redux store only when first slice is added
 */
export function initializeStore() {
  if (store) {
    console.log('[State] Redux store already initialized, reusing existing instance');
    return store;
  }

  const startTime = performance.now();
  
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

  storeInitialized = true;
  const endTime = performance.now();

  console.log(`[State] ⚡ Redux store initialized in ${Math.round(endTime - startTime)}ms`);
  console.log(`[State] Store created with ${Object.keys(dynamicReducers).length} slices`);
  
  return store;
}

/**
 * ⚡ ENHANCED LAZY: Get store with automatic lazy initialization
 */
export function getStore() {
  if (!store) {
    console.log('[State] ⚡ Lazy-initializing Redux store on first access');
    return initializeStore();
  }
  return store;
}

/**
 * ⚡ ENHANCED LAZY: Add slice with automatic store initialization
 */
export function addSlice(sliceConfig: BloomStateSlice) {
  const { name, initialState, reducers, extraReducers } = sliceConfig;

  // ⚡ PERFORMANCE: Track slice addition
  const startTime = performance.now();

  // Create the slice
  const slice = createSlice({
    name,
    initialState,
    reducers,
    extraReducers,
  });

  // Add to dynamic reducers BEFORE initializing store
  dynamicReducers[name] = slice.reducer;

  // ⚡ LAZY: Initialize store only when first slice is added
  if (!store) {
    console.log(`[State] ⚡ First slice added (${name}), initializing Redux store`);
    initializeStore();
  } else {
    // Replace reducer in existing store
    store.replaceReducer(createDynamicReducer() as any);
  }

  const endTime = performance.now();
  console.log(`[State] ✅ Added slice '${name}' in ${Math.round(endTime - startTime)}ms`);

  return {
    slice,
    actions: slice.actions,
    reducer: slice.reducer,
  };
}

/**
 * ⚡ ENHANCED: Remove slice with memory cleanup
 */
export function removeSlice(sliceName: string) {
  if (dynamicReducers[sliceName]) {
    delete dynamicReducers[sliceName];
    
    if (store) {
      store.replaceReducer(createDynamicReducer() as any);
      console.log(`[State] ⚡ Removed slice: ${sliceName}`);
      
      // ⚡ PERFORMANCE: Cleanup empty store
      if (Object.keys(dynamicReducers).length === 0) {
        console.log('[State] ⚡ All slices removed, store is now minimal');
      }
    }
  }
}

/**
 * ⚡ ENHANCED: Add multiple slices efficiently
 */
export function addSlices(slices: BloomStateSlice[]) {
  if (slices.length === 0) return {};

  console.log(`[State] ⚡ Adding ${slices.length} slices in batch`);
  const startTime = performance.now();
  
  const results: Record<string, ReturnType<typeof addSlice>> = {};

  // Add all reducers first (before store operations)
  const sliceInstances = slices.map(sliceConfig => {
    const slice = createSlice({
      name: sliceConfig.name,
      initialState: sliceConfig.initialState,
      reducers: sliceConfig.reducers,
      extraReducers: sliceConfig.extraReducers,
    });
    
    dynamicReducers[sliceConfig.name] = slice.reducer;
    
    return {
      config: sliceConfig,
      slice,
      actions: slice.actions,
      reducer: slice.reducer,
    };
  });

  // ⚡ LAZY: Initialize store only if not exists
  if (!store) {
    console.log(`[State] ⚡ Batch slice addition triggered store initialization`);
    initializeStore();
  } else {
    // Single reducer replacement for all slices
    store.replaceReducer(createDynamicReducer() as any);
  }

  // Build results
  sliceInstances.forEach(({ config, slice, actions, reducer }) => {
    results[config.name] = { slice, actions, reducer };
  });

  const endTime = performance.now();
  console.log(`[State] ✅ Added ${slices.length} slices in ${Math.round(endTime - startTime)}ms`);

  return results;
}

/**
 * ⚡ PERFORMANCE: Check if a slice exists
 */
export function hasSlice(sliceName: string): boolean {
  return sliceName in dynamicReducers;
}

/**
 * ⚡ PERFORMANCE: Get all registered slice names
 */
export function getSliceNames(): string[] {
  return Object.keys(dynamicReducers);
}

/**
 * ⚡ ENHANCED: Get current state (safe for when store doesn't exist)
 */
export function getCurrentState(): BloomRootState {
  if (!store) {
    console.warn('[State] ⚠️ Attempted to get state before store initialization');
    return {};
  }
  return store.getState() as BloomRootState;
}

/**
 * ⚡ ENHANCED: Safe dispatch (initializes store if needed)
 */
export function dispatch(action: any) {
  if (!store) {
    console.warn('[State] ⚠️ Dispatch called before store initialization, auto-initializing');
    initializeStore();
  }
  return store?.dispatch(action);
}

/**
 * ⚡ ENHANCED: Subscribe with lazy initialization
 */
export function subscribeToStore(listener: () => void) {
  if (!store) {
    console.warn('[State] ⚠️ Subscribe called before store initialization');
    return () => {}; // Return no-op unsubscribe
  }
  return store.subscribe(listener);
}

/**
 * ⚡ ENHANCED: Clear all slices with memory cleanup
 */
export function clearAllSlices() {
  const sliceCount = Object.keys(dynamicReducers).length;
  dynamicReducers = {};
  
  if (store) {
    store.replaceReducer(createDynamicReducer() as any);
    console.log(`[State] ⚡ Cleared ${sliceCount} slices, store reset to minimal state`);
  }
}

/**
 * ⚡ ENHANCED: Store debugging with performance info
 */
export function getStoreDebugInfo() {
  return {
    hasStore: !!store,
    storeInitialized,
    sliceCount: Object.keys(dynamicReducers).length,
    sliceNames: Object.keys(dynamicReducers),
    currentState: store?.getState() || null,
    memoryUsage: {
      sliceCount: Object.keys(dynamicReducers).length,
      reduxNeeded: isReduxNeeded()
    }
  };
}

/**
 * ⚡ ENHANCED: Complete store reset (for testing/cleanup)
 */
export function resetStore() {
  store = null;
  dynamicReducers = {};
  storeInitialized = false;
  console.log('[State] ⚡ Complete store reset - memory cleaned');
}

// SLICE TEMPLATES (unchanged but with performance optimizations)
export const SLICE_TEMPLATES = {
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

  STORAGE: (name: string): BloomStateSlice => ({
    name,
    initialState: {},
    reducers: {
      setValue: (state: any, action: PayloadAction<{ key: string; value: any }>) => {
        state[action.payload.key] = action.payload.value;
        try {
          localStorage.setItem(`bloom.${action.payload.key}`, JSON.stringify(action.payload.value));
        } catch (error) {
          console.warn('[Storage] Failed to persist to localStorage:', error);
        }
      },
      removeValue: (state: any, action: PayloadAction<string>) => {
        delete state[action.payload];
        try {
          localStorage.removeItem(`bloom.${action.payload}`);
        } catch (error) {
          console.warn('[Storage] Failed to remove from localStorage:', error);
        }
      },
      clearAll: (state: any) => {
        Object.keys(state).forEach(key => delete state[key]);
        try {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('bloom.')) {
              localStorage.removeItem(key);
            }
          });
        } catch (error) {
          console.warn('[Storage] Failed to clear localStorage:', error);
        }
      },
      hydrate: (state: any, action: PayloadAction<Record<string, any>>) => {
        Object.assign(state, action.payload);
      },
      setMultiple: (state: any, action: PayloadAction<Record<string, any>>) => {
        Object.entries(action.payload).forEach(([key, value]) => {
          state[key] = value;
          try {
            localStorage.setItem(`bloom.${key}`, JSON.stringify(value));
          } catch (error) {
            console.warn(`[Storage] Failed to persist ${key} to localStorage:`, error);
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