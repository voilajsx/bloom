/**
 * Bloom Framework - Shared State Hook (Redux Wrapper)
 * @module @voilajsx/bloom/shared/hooks
 * @file src/shared/hooks/useBloomState.ts
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { getStore, addSlice, hasSlice, type BloomRootState } from '@/platform/state';
import type { BloomStateSlice } from '@/platform/types';

/**
 * Hook for accessing shared Redux state
 */
export function useBloomState<T = any>(sliceName: string): {
  state: T;
  dispatch: ReturnType<typeof useDispatch>;
  isReady: boolean;
} {
  const dispatch = useDispatch();
  
  const state = useSelector((rootState: BloomRootState) => {
    return rootState[sliceName] as T;
  });

  const isReady = hasSlice(sliceName);

  return {
    state: state || ({} as T),
    dispatch,
    isReady
  };
}

/**
 * Hook for accessing multiple slices at once
 */
export function useBloomStates<T extends Record<string, any>>(
  sliceNames: (keyof T)[]
): {
  states: T;
  dispatch: ReturnType<typeof useDispatch>;
  isReady: boolean;
} {
  const dispatch = useDispatch();
  
  const states = useSelector((rootState: BloomRootState) => {
    const result = {} as T;
    sliceNames.forEach(sliceName => {
      result[sliceName] = rootState[sliceName as string] || {};
    });
    return result;
  });

  const isReady = sliceNames.every(sliceName => hasSlice(sliceName as string));

  return {
    states,
    dispatch,
    isReady
  };
}

/**
 * Hook for managing a specific slice with actions
 */
export function useSlice<TState = any, TActions extends Record<string, any> = any>(
  sliceName: string,
  sliceConfig?: BloomStateSlice
) {
  const dispatch = useDispatch();
  
  // Auto-register slice if provided and not exists
  if (sliceConfig && !hasSlice(sliceName)) {
    const { actions } = addSlice(sliceConfig);
    console.log(`[useSlice] Auto-registered slice: ${sliceName}`);
  }

  const state = useSelector((rootState: BloomRootState) => {
    return rootState[sliceName] as TState;
  });

  const isReady = hasSlice(sliceName);

  return {
    state: state || ({} as TState),
    dispatch,
    isReady,
    sliceName
  };
}

/**
 * Hook for typed slice actions
 */
export function useSliceActions<TActions extends Record<string, any>>(
  sliceName: string,
  actions: TActions
) {
  const dispatch = useDispatch();

  const boundActions = useCallback(() => {
    const bound = {} as { [K in keyof TActions]: (...args: any[]) => void };
    
    Object.entries(actions).forEach(([actionName, actionCreator]) => {
      bound[actionName as keyof TActions] = (...args: any[]) => {
        dispatch((actionCreator as any)(...args));
      };
    });

    return bound;
  }, [dispatch, actions]);

  return boundActions();
}

/**
 * Hook for counter slice (common pattern)
 */
export function useCounter(sliceName: string = 'counter') {
  const { state, dispatch, isReady } = useBloomState<{ value: number }>(sliceName);

  const increment = useCallback(() => {
    dispatch({ type: `${sliceName}/increment` });
  }, [dispatch, sliceName]);

  const decrement = useCallback(() => {
    dispatch({ type: `${sliceName}/decrement` });
  }, [dispatch, sliceName]);

  const incrementByAmount = useCallback((amount: number) => {
    dispatch({ type: `${sliceName}/incrementByAmount`, payload: amount });
  }, [dispatch, sliceName]);

  const reset = useCallback(() => {
    dispatch({ type: `${sliceName}/reset` });
  }, [dispatch, sliceName]);

  return {
    value: state?.value || 0,
    increment,
    decrement,
    incrementByAmount,
    reset,
    isReady
  };
}

/**
 * Hook for loading slice (common pattern)
 */
export function useLoading(sliceName: string = 'loading') {
  const { state, dispatch, isReady } = useBloomState<{
    isLoading: boolean;
    error: string | null;
    data: any;
  }>(sliceName);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: `${sliceName}/setLoading`, payload: loading });
  }, [dispatch, sliceName]);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: `${sliceName}/setError`, payload: error });
  }, [dispatch, sliceName]);

  const setData = useCallback((data: any) => {
    dispatch({ type: `${sliceName}/setData`, payload: data });
  }, [dispatch, sliceName]);

  const clearError = useCallback(() => {
    dispatch({ type: `${sliceName}/clearError` });
  }, [dispatch, sliceName]);

  const reset = useCallback(() => {
    dispatch({ type: `${sliceName}/reset` });
  }, [dispatch, sliceName]);

  return {
    isLoading: state?.isLoading || false,
    error: state?.error || null,
    data: state?.data || null,
    setLoading,
    setError,
    setData,
    clearError,
    reset,
    isReady
  };
}

/**
 * Hook for UI slice (common pattern)
 */
export function useUI(sliceName: string = 'ui') {
  const { state, dispatch, isReady } = useBloomState<{
    modals: Record<string, boolean>;
    sidebar: boolean;
    theme: 'light' | 'dark';
  }>(sliceName);

  const openModal = useCallback((modalName: string) => {
    dispatch({ type: `${sliceName}/openModal`, payload: modalName });
  }, [dispatch, sliceName]);

  const closeModal = useCallback((modalName: string) => {
    dispatch({ type: `${sliceName}/closeModal`, payload: modalName });
  }, [dispatch, sliceName]);

  const closeAllModals = useCallback(() => {
    dispatch({ type: `${sliceName}/closeAllModals` });
  }, [dispatch, sliceName]);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: `${sliceName}/toggleSidebar` });
  }, [dispatch, sliceName]);

  const setSidebar = useCallback((open: boolean) => {
    dispatch({ type: `${sliceName}/setSidebar`, payload: open });
  }, [dispatch, sliceName]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch({ type: `${sliceName}/setTheme`, payload: theme });
  }, [dispatch, sliceName]);

  return {
    modals: state?.modals || {},
    sidebar: state?.sidebar || false,
    theme: state?.theme || 'light',
    openModal,
    closeModal,
    closeAllModals,
    toggleSidebar,
    setSidebar,
    setTheme,
    isModalOpen: (modalName: string) => !!(state?.modals?.[modalName]),
    isReady
  };
}

/**
 * Hook for API cache slice (common pattern)
 */
export function useApiCache(sliceName: string = 'apiCache') {
  const { state, dispatch, isReady } = useBloomState<{
    cache: Record<string, { data: any; timestamp: number; expiry: number }>;
  }>(sliceName);

  const setCacheEntry = useCallback((key: string, data: any, expiry: number = 300000) => {
    dispatch({ 
      type: `${sliceName}/setCacheEntry`, 
      payload: { key, data, expiry } 
    });
  }, [dispatch, sliceName]);

  const getCacheEntry = useCallback((key: string) => {
    const entry = state?.cache?.[key];
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      // Auto-remove expired entry
      dispatch({ type: `${sliceName}/removeCacheEntry`, payload: key });
      return null;
    }
    
    return entry.data;
  }, [state?.cache, dispatch, sliceName]);

  const removeCacheEntry = useCallback((key: string) => {
    dispatch({ type: `${sliceName}/removeCacheEntry`, payload: key });
  }, [dispatch, sliceName]);

  const clearCache = useCallback(() => {
    dispatch({ type: `${sliceName}/clearCache` });
  }, [dispatch, sliceName]);

  const cleanExpiredCache = useCallback(() => {
    dispatch({ type: `${sliceName}/cleanExpiredCache` });
  }, [dispatch, sliceName]);

  return {
    cache: state?.cache || {},
    setCacheEntry,
    getCacheEntry,
    removeCacheEntry,
    clearCache,
    cleanExpiredCache,
    isReady
  };
}

/**
 * Hook for getting store info (debugging)
 */
export function useStoreInfo() {
  const store = getStore();
  
  return {
    hasStore: !!store,
    currentState: store.getState(),
    dispatch: useDispatch()
  };
}