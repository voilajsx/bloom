# Bloom Framework - LLM Code Generation Guide v1.0

## 🎯 Core LLM Rules for Bloom Framework

### Rule 1: Feature Structure (ALWAYS follow this pattern)

```typescript
// Every feature MUST have this structure
src/features/[feature-name]/
├── index.ts          // Feature configuration with contract
├── pages/            // React components for routes
├── components/       // Reusable UI components
├── hooks/            // Business logic hooks
└── types.ts          // (optional) TypeScript definitions
```

### Rule 2: Feature Configuration Template (REQUIRED)

```typescript
import type { BloomFeatureConfig } from '@/platform/types';
import { createContract, STANDARD_HOOKS } from '@/shared/contracts';

const config: BloomFeatureConfig = {
  name: 'featureName',

  // Contract: What this feature provides/consumes
  contract: createContract()
    .providesComponent('ComponentName')
    .providesHook('useFeatureName')
    .consumesHook(STANDARD_HOOKS.USE_ROUTER)
    .build(),

  // State management choice
  sharedState: false, // OR true for Redux

  // Redux slices (only if sharedState: true)
  stateSlices: [...],

  routes: [...],
  settings: {...},
  meta: {...}
};

export default config;
```

### Rule 3: Contract Patterns (CHOOSE ONE)

```typescript
// Pattern A: Simple Page Feature (local state)
contract: createContract()
  .providesComponent('PageName')
  .consumesHook(STANDARD_HOOKS.USE_ROUTER)
  .build(),
sharedState: false

// Pattern B: Service Feature (with Redux)
contract: createContract()
  .providesService('serviceName')
  .providesHook('useServiceName')
  .consumesHook(STANDARD_HOOKS.USE_SHARED_STATE)
  .consumesState('serviceName')
  .build(),
sharedState: true

// Pattern C: UI Feature (components + hooks)
contract: createContract()
  .providesComponent('ComponentName')
  .providesHook('useComponentName')
  .consumesHook(STANDARD_HOOKS.USE_THEME)
  .build(),
sharedState: false
```

### Rule 4: Redux Integration (IF sharedState: true)

```typescript
// Custom slice template
stateSlices: [
  {
    name: 'featureName',
    initialState: {
      data: [],
      loading: false,
      error: null,
      settings: {},
    },
    reducers: {
      setData: (state: any, action: any) => {
        state.data = action.payload;
        state.loading = false;
      },
      setLoading: (state: any, action: any) => {
        state.loading = action.payload;
      },
      setError: (state: any, action: any) => {
        state.error = action.payload;
        state.loading = false;
      },
    },
  },
];

// OR use templates
import { createSliceFromTemplate } from '@/platform/state';

stateSlices: [
  createSliceFromTemplate('LOADING', 'featureName'),
  createSliceFromTemplate('API_CACHE', 'featureNameCache'),
];
```

### Rule 5: Hook Patterns (STANDARD structures)

```typescript
// Pattern A: Local State Hook
export function useFeatureName() {
  const [state, setState] = useState(initialState);
  const { get, set } = useBloomStorage();

  // Actions
  const updateData = useCallback(
    async (data) => {
      setState((prev) => ({ ...prev, data }));
      await set('featureName.data', data);
    },
    [set]
  );

  return {
    // State
    state,
    loading: state.loading,

    // Actions
    updateData,

    // Utilities
    isReady: !state.loading,
  };
}

// Pattern B: Redux Hook
export function useFeatureName() {
  const { state, dispatch } = useSharedState('featureName');

  const updateData = useCallback(
    (data) => {
      dispatch({ type: 'featureName/setData', payload: data });
    },
    [dispatch]
  );

  return {
    // State
    data: state.data || [],
    loading: state.loading || false,

    // Actions
    updateData,

    // Utilities
    isReady: !!state,
  };
}
```

---

## 📋 Standard Contract Definitions

### Services (what features provide to others)

```typescript
STANDARD_SERVICES = {
  STORAGE: 'storage',
  API_CLIENT: 'apiClient',
  AUTH: 'auth',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
};
```

### Hooks (what features provide/consume)

```typescript
STANDARD_HOOKS = {
  USE_SHARED_STATE: 'useSharedState',
  USE_API: 'useApi',
  USE_ROUTER: 'useRouter',
  USE_AUTH: 'useAuth',
  USE_THEME: 'useTheme',
};
```

### State (Redux slices features consume)

```typescript
STANDARD_STATE = {
  APP: 'app',
  USER: 'user',
  AUTH: 'auth',
  UI: 'ui',
  CACHE: 'cache',
};
```

---

## 🎯 LLM Decision Trees

### 1. State Management Choice

```
Does the feature need to share data with other features?
├── YES → sharedState: true (use Redux)
│   ├── Complex state → Custom slice
│   └── Simple state → Use template (LOADING, UI, etc.)
└── NO → sharedState: false (local state only)
```

### 2. Contract Pattern Selection

```
What does your feature do?
├── Displays pages → providesComponent + consumesHook(USE_ROUTER)
├── Provides data service → providesService + providesHook + consumesState
├── UI utilities → providesComponent + providesHook
└── Authentication → providesService(AUTH) + consumesState(AUTH)
```

### 3. Redux Slice Templates

```
What kind of state do you need?
├── Loading/Error/Data → createSliceFromTemplate('LOADING', name)
├── UI state (modals, theme) → createSliceFromTemplate('UI', name)
├── API responses → createSliceFromTemplate('API_CACHE', name)
├── Simple counter → createSliceFromTemplate('COUNTER', name)
└── Custom logic → Write custom slice
```

---

## 🔧 Complete Feature Templates

### 1. Simple Page Feature (Local State)

```typescript
/**
 * [FeatureName] Feature - Simple page with local state
 */
import type { BloomFeatureConfig } from '@/platform/types';
import { createContract, STANDARD_HOOKS } from '@/shared/contracts';

const config: BloomFeatureConfig = {
  name: 'featureName',

  contract: createContract()
    .providesComponent('FeatureNamePage')
    .consumesHook(STANDARD_HOOKS.USE_ROUTER)
    .build(),

  sharedState: false,

  routes: [
    {
      path: '/feature-name',
      component: () => import('./pages/FeatureNamePage'),
      layout: 'default',
      title: 'Feature Name',
      meta: {
        description: 'Feature description',
        keywords: 'feature, keywords',
      },
      ssg: true,
    },
  ],

  settings: {
    enabled: {
      key: 'featureName.enabled',
      default: true,
      type: 'boolean',
      label: 'Enable Feature',
    },
  },

  meta: {
    name: 'Feature Name',
    description: 'Feature description',
    version: '1.0.0',
    author: 'Developer',
  },
};

export default config;
```

### 2. Redux Service Feature

```typescript
/**
 * [FeatureName] Feature - Service with Redux state
 */
import type { BloomFeatureConfig } from '@/platform/types';
import {
  createContract,
  STANDARD_HOOKS,
  STANDARD_STATE,
} from '@/shared/contracts';

const config: BloomFeatureConfig = {
  name: 'featureName',

  contract: createContract()
    .providesService('featureNameService')
    .providesHook('useFeatureName')
    .providesComponent('FeatureNamePage')
    .consumesHook(STANDARD_HOOKS.USE_SHARED_STATE)
    .consumesHook(STANDARD_HOOKS.USE_API)
    .consumesState('featureName')
    .build(),

  sharedState: true,

  stateSlices: [
    {
      name: 'featureName',
      initialState: {
        items: [],
        loading: false,
        error: null,
        settings: {
          enabled: true,
          limit: 10,
        },
      },
      reducers: {
        setItems: (state: any, action: any) => {
          state.items = action.payload;
          state.loading = false;
          state.error = null;
        },
        setLoading: (state: any, action: any) => {
          state.loading = action.payload;
        },
        setError: (state: any, action: any) => {
          state.error = action.payload;
          state.loading = false;
        },
        updateSetting: (state: any, action: any) => {
          state.settings[action.payload.key] = action.payload.value;
        },
      },
    },
  ],

  routes: [
    {
      path: '/feature-name',
      component: () => import('./pages/FeatureNamePage'),
      layout: 'default',
      title: 'Feature Name',
      ssg: false,
    },
  ],

  api: {
    baseUrl: 'https://api.example.com',
    endpoints: {
      list: '/items',
      get: '/items/:id',
    },
    timeout: 10000,
  },

  meta: {
    name: 'Feature Name Service',
    description: 'Feature with Redux state management',
    version: '1.0.0',
    author: 'Developer',
  },
};

export default config;
```

### 3. Page Component Template

```typescript
/**
 * [FeatureName] Page Component
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';
import { useFeatureName } from '../hooks/useFeatureName';

export default function FeatureNamePage() {
  const { state, loading, updateData, isReady } = useFeatureName();

  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="py-16 px-8 text-center">
        <Badge variant="secondary" className="mb-6">
          Feature Name
        </Badge>
        <h1 className="text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Page Title
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Page description and purpose.
        </p>
      </section>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Feature Content</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div>
                  <p>Feature is ready: {isReady ? 'Yes' : 'No'}</p>
                  <Button onClick={() => updateData('new data')}>
                    Update Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
```

### 4. Hook Template (Local State)

```typescript
/**
 * [FeatureName] Hook - Local state management
 */
import { useState, useEffect, useCallback } from 'react';
import { useBloomStorage } from '@/shared/hooks/useBloomStorage';
import { useApi } from '@/shared/hooks/useApi';

interface FeatureNameState {
  items: any[];
  loading: boolean;
  error: string | null;
  settings: {
    enabled: boolean;
    limit: number;
  };
}

export function useFeatureName() {
  const { get, set } = useBloomStorage();
  const { apiGet } = useApi();

  const [state, setState] = useState<FeatureNameState>({
    items: [],
    loading: false,
    error: null,
    settings: {
      enabled: true,
      limit: 10,
    },
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiGet('/api/items');
      if (response.success) {
        setState((prev) => ({
          ...prev,
          items: response.data,
          loading: false,
        }));
      } else {
        throw new Error(response.error || 'Failed to load data');
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  }, [apiGet]);

  const updateData = useCallback(
    async (newData: any) => {
      setState((prev) => ({ ...prev, items: [...prev.items, newData] }));
      await set('featureName.items', state.items);
    },
    [set, state.items]
  );

  return {
    // State
    items: state.items,
    loading: state.loading,
    error: state.error,
    settings: state.settings,

    // Actions
    loadData,
    updateData,

    // Utilities
    isReady: !state.loading && !state.error,
    hasItems: state.items.length > 0,
  };
}
```

### 5. Hook Template (Redux State)

```typescript
/**
 * [FeatureName] Hook - Redux state management
 */
import { useCallback } from 'react';
import { useSharedState } from '@/shared/hooks/useSharedState';
import { useApi } from '@/shared/hooks/useApi';

export function useFeatureName() {
  const { state, dispatch, isReady } = useSharedState('featureName');
  const { apiGet } = useApi();

  const loadData = useCallback(async () => {
    dispatch({ type: 'featureName/setLoading', payload: true });

    try {
      const response = await apiGet('/api/items');
      if (response.success) {
        dispatch({ type: 'featureName/setItems', payload: response.data });
      } else {
        throw new Error(response.error || 'Failed to load data');
      }
    } catch (error) {
      dispatch({ type: 'featureName/setError', payload: error.message });
    }
  }, [dispatch, apiGet]);

  const updateSetting = useCallback(
    (key: string, value: any) => {
      dispatch({
        type: 'featureName/updateSetting',
        payload: { key, value },
      });
    },
    [dispatch]
  );

  return {
    // State
    items: state?.items || [],
    loading: state?.loading || false,
    error: state?.error || null,
    settings: state?.settings || {},

    // Actions
    loadData,
    updateSetting,

    // Utilities
    isReady: isReady && !state?.loading,
    hasItems: (state?.items || []).length > 0,
  };
}
```

---

## ⚠️ Critical Rules for LLMs

### 1. ALWAYS Use Semantic Colors

```typescript
// ✅ CORRECT - Works with all themes
className = 'bg-background text-foreground border-border';
className = 'bg-card text-card-foreground';
className = 'bg-primary text-primary-foreground';

// ❌ WRONG - Breaks with themes
className = 'bg-white text-black border-gray-200';
className = 'bg-blue-500 text-white';
```

### 2. ALWAYS Include Contract

```typescript
// ✅ CORRECT - Every feature needs a contract
contract: createContract()
  .providesComponent('ComponentName')
  .consumesHook(STANDARD_HOOKS.USE_ROUTER)
  .build(),

// ❌ WRONG - Missing contract
// contract: undefined
```

### 3. ALWAYS Choose State Management Pattern

```typescript
// ✅ CORRECT - Explicit choice
sharedState: false,  // Local state
// OR
sharedState: true,   // Redux state
stateSlices: [...]

// ❌ WRONG - Undefined state management
// sharedState: undefined
```

### 4. ALWAYS Import from Correct Paths

```typescript
// ✅ CORRECT - Bloom Framework imports
import { createContract } from '@/shared/contracts';
import { useSharedState } from '@/shared/hooks/useSharedState';
import { useBloomStorage } from '@/shared/hooks/useBloomStorage';

// UIKit imports
import { Button } from '@voilajsx/uikit/button';
import { Card } from '@voilajsx/uikit/card';
```

### 5. ALWAYS Follow File Structure

```
src/features/feature-name/
├── index.ts              // ✅ Feature config with contract
├── pages/FeaturePage.tsx // ✅ Page components
├── hooks/useFeature.ts   // ✅ Business logic
└── components/           // ✅ Reusable components
```

---

## 🚀 Quick Start Checklist

### ✅ For Every New Feature:

1. **Choose pattern**: Page, Service, or UI feature
2. **Define contract**: What you provide/consume
3. **Choose state**: Local (`sharedState: false`) or Redux (`sharedState: true`)
4. **Write config**: Use templates above
5. **Create hook**: Follow hook patterns
6. **Build pages**: Use semantic colors
7. **Test contract**: Ensure dependencies exist

### ✅ For Redux Features:

1. **Define slices**: Custom or template-based
2. **Use useSharedState**: For accessing Redux state
3. **Dispatch actions**: `dispatch({ type: 'slice/action', payload: data })`
4. **Handle loading**: Use loading/error patterns

### ✅ For Local State Features:

1. **Use useBloomStorage**: For persistence
2. **Use useState**: For component state
3. **Use useApi**: For API calls
4. **Handle errors**: Try/catch with state updates

---

## 🎯 LLM Success Patterns

### Pattern 1: Always Start with Contract

```typescript
// 1. Define what feature provides/consumes
// 2. Choose state management approach
// 3. Write routes and components
// 4. Implement business logic

contract: createContract()
  .providesComponent('ComponentName')
  .consumesHook(STANDARD_HOOKS.USE_ROUTER)
  .build(),
```

### Pattern 2: Always Use Templates

```typescript
// 1. Use slice templates when possible
// 2. Use contract builder methods
// 3. Use hook patterns from guide
// 4. Use page component structure

stateSlices: [createSliceFromTemplate('LOADING', 'featureName')];
```

### Pattern 3: Always Handle State Correctly

```typescript
// 1. Choose local OR Redux (never both)
// 2. Use appropriate hooks
// 3. Handle loading/error states
// 4. Persist settings when needed

// Local state
const { state, loading } = useFeatureName();

// Redux state
const { state, dispatch } = useSharedState('featureName');
```

---

This guide ensures LLMs generate consistent, contract-based features that integrate seamlessly with Bloom Framework's architecture. Following these patterns guarantees 100% compatibility and scalability.
