<p>
   <img src="public/bloom_logo.png" alt="Bloom Framework Logo" width="200" />
</p>

# 🌸 Bloom Framework

**Feature-modular frontend framework with contracts, Redux, and LLM-accelerated development.**

Build scalable web applications with true feature isolation, predictable patterns, and AI-powered code generation.

## Why Bloom?

**Modern Web Development Needs:** Modularity, consistency, and maintainability across complex applications and large teams.

**Current Problems:**

- Features tightly coupled - changes break unrelated functionality
- Inconsistent patterns make AI code generation unreliable
- State management chaos - unclear what's shared vs local
- Team members build features differently, creating maintenance nightmares
- No clear contracts between features leads to integration issues

**Bloom's Solution:** True feature modularity with contracts, optional Redux, and LLM-optimized patterns that ensure consistency.

## Key Benefits

- **True Feature Isolation:** Contract-based architecture prevents features from breaking each other - plug-in/plug-out modularity
- **LLM-Accelerated Development:** Predictable patterns let AI generate accurate, working features that integrate seamlessly
- **Smart State Management:** Choose local state or Redux per feature - no global state chaos
- **Enterprise Consistency:** Standardized patterns and UIKit integration ensure professional, consistent results
- **Scalable Architecture:** Clear separation of concerns makes large applications maintainable

## Perfect For

Teams building complex web applications, organizations needing consistent quality across projects, and developers who want AI to accelerate development 10x while maintaining architectural integrity.

## Features

- **True Feature Modularity** - Isolated features with contracts
- **Contract System** - Define what features provide/consume
- **Optional Redux** - Shared state when needed, local state otherwise
- **Static Site Generation** - SEO-optimized builds
- **LLM Optimized** - Predictable patterns for AI code generation
- **UIKit Integration** - Beautiful, consistent UI components

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Generate static site
npm run build:ssg
```

## Create a Feature

```bash
# Generate new feature
npm run create-feature my-feature

# Discover features
npm run discover
```

## Feature Structure

```
src/features/my-feature/
├── index.ts          # Feature config with contract
├── pages/            # Route components
├── hooks/            # Business logic
└── components/       # UI components
```

## Basic Feature Example

```typescript
// src/features/my-feature/index.ts
import { createContract } from '@/shared/contracts';

const config = {
  name: 'myFeature',

  contract: createContract()
    .providesComponent('MyFeaturePage')
    .consumesHook('useRouter')
    .build(),

  sharedState: false, // Local state only

  routes: [
    {
      path: '/my-feature',
      component: () => import('./pages/MyFeaturePage'),
      title: 'My Feature',
    },
  ],
};

export default config;
```

## State Management

### Local State (Default)

```typescript
sharedState: false;
// Uses React hooks + localStorage
```

### Redux State (Optional)

```typescript
sharedState: true,
stateSlices: [
  {
    name: 'myFeature',
    initialState: { data: [] },
    reducers: {
      setData: (state, action) => {
        state.data = action.payload;
      }
    }
  }
]
```

## Contracts

Define what your feature provides and consumes:

```typescript
contract: createContract()
  .providesService('apiService')
  .providesHook('useMyFeature')
  .providesComponent('MyComponent')
  .consumesHook('useSharedState')
  .consumesState('globalData')
  .build();
```

## Documentation

- **Development**: See `BLOOM_LLM_GUIDE.md` for patterns
- **UI Components**: Uses `@voilajsx/uikit`
- **Examples**: Check `src/features/` folder

## Architecture

- **Platform**: Core framework (`src/platform/`)
- **Features**: Modular features (`src/features/`)
- **Shared**: Common utilities (`src/shared/`)
- **Contracts**: Feature integration system
- **State**: Optional Redux with dynamic slices

## Built With

- React 19
- TypeScript
- Vite
- Redux Toolkit (optional)
- React Router
- Tailwind CSS
- @voilajsx/uikit

---

**Bloom Framework** - Build modular, scalable applications with true feature isolation and LLM-optimized patterns.
