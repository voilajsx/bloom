# Bloom Framework: A Comprehensive Guide

## 1. Ideology and Focus

The Bloom Framework is a modern, feature-modular frontend framework designed for building scalable web applications with true feature isolation, predictable patterns, and LLM-accelerated development. Its core philosophy, "The Bloom Way," emphasizes:

- **True Feature Modularity**: Features are independent, composable modules that can be developed, tested, and deployed in isolation while maintaining perfect integration.
- **Contract-First Development**: Every feature explicitly declares what it provides (services, hooks, components) and consumes from the platform or other features. This prevents tight coupling and ensures clear interfaces.
- **Smart State Management**: Features choose one of two state strategies: local state (React hooks + localStorage) or Redux for shared state. Mixing strategies within a single feature is strictly prohibited.
- **Zero Coupling**: Features never directly import from each other. All interactions happen via the contract system.
- **LLM-Optimized**: The framework's predictable patterns and strict conventions enable AI models to generate accurate, working features that integrate seamlessly, accelerating development significantly.
- **Performance by Design**: Bloom incorporates lazy loading, conditional Redux initialization (only if needed), and build-time feature discovery to ensure optimal performance.

## 2. Benefits of Using Bloom

Bloom addresses common challenges in modern web development, offering significant advantages for teams and organizations:

- **True Feature Isolation**: The contract-based architecture ensures that changes in one feature do not inadvertently break others, enabling plug-in/plug-out modularity.
- **LLM-Accelerated Development**: Predictable patterns allow AI to generate accurate, working features that integrate seamlessly, leading to 10x faster development.
- **Smart State Management**: Developers can choose between local state or Redux per feature, eliminating global state chaos and ensuring clarity on shared vs. local data.
- **Enterprise Consistency**: Standardized patterns, file structures, and UIKit integration ensure professional, consistent results across the application and different teams.
- **Scalable Architecture**: Clear separation of concerns makes large applications maintainable and allows them to grow infinitely without becoming unmanageable.
- **Zero Integration Issues**: Contracts prevent breaking changes and ensure smooth integration between features.
- **Perfect Performance**: Lazy loading and conditional Redux initialization minimize overhead, leading to highly performant applications.
- **Team Harmony**: Everyone follows the same patterns, fostering consistency and reducing friction in collaborative development.

## 3. Files and Folder Structure

The Bloom framework enforces a clear and consistent file and folder structure to maintain modularity and predictability.

```
/Users/krishnateja/vc/dev/bloom/
├── .gitignore
├── BLOOM_LLM_GUIDE.md      // Detailed guide for LLM development patterns
├── bloom.md                // This document
├── index.html              // Main HTML entry point
├── package-lock.json
├── package.json            // Project dependencies and scripts
├── README.md               // High-level overview of Bloom
├── tsconfig.json           // TypeScript configuration
├── tsconfig.node.json
├── vite.config.ts          // Vite build configuration
├── .git/                   // Git repository
├── dist/                   // Build output directory
├── node_modules/           // Installed Node.js modules
├── public/
│   ├── bloom_icon.png
│   └── bloom_logo.png
├── scripts/                // Utility scripts for development and build processes
│   ├── add.js
│   ├── bloom.js
│   ├── build-features.js   // Discovers and builds features
│   ├── create-feature.js   // Script to scaffold new features
│   ├── discover-features.js
│   ├── ssg-build.js        // Script for Static Site Generation
│   └── lib/                // Internal libraries for scripts
│       ├── add.js
│       ├── build.js
│       ├── check.js
│       ├── contracts.js
│       ├── create.js
│       ├── dev.js
│       ├── doctor.js
│       ├── format.js
│       ├── help.js
│       ├── preview.js
│       ├── security.js
│       ├── ssg.js
│       └── utils.js
└── src/                    // Source code directory
    ├── app.tsx             // Main React application component
    ├── defaults.ts         // Default configurations
    ├── main.ts             // Main entry point for the application
    ├── assets/
    │   └── styles/
    │       └── globals.css // Global CSS styles
    ├── features/           // Contains all modular features
    │   ├── index.ts        // Entry point for feature discovery/registration
    │   ├── my-dashboard/   // Example feature
    │   │   ├── index.ts        // Feature config with contract
    │   │   ├── components/     // Reusable UI components specific to this feature
    │   │   ├── hooks/          // Business logic and custom hooks for this feature
    │   │   │   └── usePageData.ts
    │   │   └── pages/          // Route components for this feature
    │   │       └── MainPage.tsx
    │   ├── quotes/         // Another example feature
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── QuoteCard.tsx
    │   │   │   └── QuoteList.tsx
    │   │   ├── hooks/
    │   │   │   └── useQuotes.ts
    │   │   └── pages/
    │   │       └── QuotesPage.tsx
    │   └── webpages/       // Example feature for static web pages
    │       ├── index.ts
    │       ├── hooks/
    │       │   └── useWebpages.ts
    │       └── pages/
    │           ├── AboutPage.tsx
    │           ├── ContactPage.tsx
    │           └── HomePage.tsx
    ├── platform/           // Core framework logic and utilities
    │   ├── api.ts          // API integration utilities
    │   ├── bloom.ts        // Main Bloom framework initialization
    │   ├── breadcrumbs.ts
    │   ├── build.ts        // Build-related utilities
    │   ├── contracts.ts    // Contract system implementation
    │   ├── discovery.ts    // Feature discovery logic
    │   ├── layout.tsx      // Application layout components
    │   ├── router.ts       // Routing logic
    │   ├── state.ts        // State management (Redux) utilities
    │   └── types.ts        // TypeScript type definitions for the framework
    └── shared/             // Common utilities and shared resources
        ├── contracts/
        │   └── index.ts    // Shared contract definitions
        └── hooks/
            ├── index.ts
            ├── useBloomApi.ts      // Hook for making API calls
            ├── useBloomState.ts    // Hook for accessing shared (Redux) state
            └── useBloomStorage.ts  // Hook for local storage persistence
```

### Core Intent of Each File/Folder:

- **`src/features/`**: This is the heart of Bloom's modularity. Each subdirectory within `features/` represents an independent feature.
  - **`src/features/<feature-name>/index.ts`**: This file is crucial. It defines the `BloomFeatureConfig` for the feature, including its name, contract (what it provides and consumes), state strategy (`sharedState`), routes, settings, and metadata.
  - **`src/features/<feature-name>/pages/`**: Contains React components that serve as route entry points for the feature. These are typically full-page views.
  - **`src/features/<feature-name>/hooks/`**: Houses custom React hooks that encapsulate the business logic and data fetching for the feature.
  - **`src/features/<feature-name>/components/`**: Contains smaller, reusable UI components that are specific to this feature and are used within its pages or other components.
- **`src/platform/`**: This directory contains the core framework logic that orchestrates features, routing, state management, and other foundational aspects of the application. Files here provide the "glue" that allows features to integrate seamlessly.
- **`src/shared/`**: This directory holds common utilities, hooks, and contract definitions that can be safely used across different features without violating the zero-coupling rule. These are generic, reusable pieces of code.
- **`scripts/`**: Contains Node.js scripts for various development and build tasks, such as creating new features, discovering existing ones, and building the application (including Static Site Generation).

## 4. Overall Workflow

The Bloom development workflow is designed to be efficient, predictable, and LLM-friendly:

1.  **Feature Creation**: Use `npm run create-feature <feature-name>` to scaffold a new feature with the correct directory structure.
2.  **Contract Definition**: The first step in developing a new feature is to define its `contract` in `src/features/<feature-name>/index.ts`. This explicitly states what the feature provides (e.g., components, services, hooks) and what it consumes from the platform or other features.
3.  **State Strategy Decision**: Decide whether the feature requires shared (Redux) state or can operate with local state. This decision is made early and explicitly set in `sharedState` within `index.ts`.
4.  **Build in Isolation**: Develop the feature's pages, hooks, and components within its dedicated directory. Features should not directly import from other features.
5.  **Utilize Platform/Shared Resources**: Leverage the hooks and utilities provided by `src/platform/` and `src/shared/` for common tasks like API calls (`useBloomApi`), local storage (`useBloomStorage`), and shared state access (`useBloomState`).
6.  **Automatic Integration**: Bloom's platform handles the automatic discovery, routing, and state integration of features based on their configurations.
7.  **Testing and Validation**: Bloom provides mechanisms for contract validation and state strategy validation to ensure proper integration and adherence to architectural principles.
8.  **Build and Deploy**: Use `npm run build` for production builds or `npm run build:ssg` for static site generation.

## 5. Conventions and Guidelines for LLMs

To generate accurate, scalable, minimal, consistent, and unambiguous code within the Bloom Framework, LLMs must strictly adhere to the following critical rules and patterns:

### 5.1. Framework Philosophy & Mental Model

- **Think in Features, Not Components**: The primary unit of organization is the "feature." Each feature is a self-contained module.
- **Contract-First Development**: Always start by defining the feature's contract.
- **Two-Strategy Rule for State**: A feature uses either local state (`sharedState: false`) or Redux state (`sharedState: true`). NEVER mix them within a single feature.
- **Zero Coupling**: Never generate code that directly imports from one feature into another.
- **Performance**: Prioritize lazy loading and efficient state management.

### 5.2. LLM Decision Framework

When generating a new feature, follow this decision tree:

1.  **Feature Type Detection**:

    - **PAGE FEATURE**: Displays content. `sharedState: false`. Contract provides `Component` and consumes `useRouter`. (e.g., About page, Contact form)
    - **SERVICE FEATURE**: Manages data/state. `sharedState: true`. Contract provides `Service`, `Hook`, and consumes `State`. (e.g., User authentication, Shopping cart)
    - **UI FEATURE**: Reusable components. `sharedState: false`. Contract provides `Component` and `Hook`. (e.g., Modal system, Toast notifications)
    - **INTEGRATION FEATURE**: Connects external systems. `sharedState: true` (usually). Contract provides `Service` and consumes `useApi`. (e.g., Payment processor, Analytics tracker)

2.  **State Strategy Decision Tree**:

    - **Does my feature need to share data with OTHER features?**
      - **NO**: `sharedState: false`. Use `useState`, `useEffect`, `useBloomStorage`. Perfect for isolated features, simpler, faster.
      - **YES**: `sharedState: true`. Use Redux slices, `useSharedState`. Perfect for user auth, global settings, cross-feature sharing.

3.  **Contract Pattern Selection**:
    - **Displays Pages**: `createContract().providesComponent('PageName').consumesHook('useRouter').build()`
    - **Manages Data/Service**: `createContract().providesService('serviceName').providesHook('useServiceName').consumesHook('useSharedState').consumesState('serviceName').build()`
    - **Provides UI Components**: `createContract().providesComponent('ComponentName').providesHook('useComponentName').consumesHook('useTheme').build()`
    - **Integrates External System**: `createContract().providesService('integrationName').providesHook('useIntegrationName').consumesHook('useApi').build()`

### 5.3. Critical LLM Rules (ALWAYS Follow)

1.  **ALWAYS Use Semantic Colors**: When generating UI code (e.g., Tailwind CSS classes), always use Bloom's semantic color classes (e.g., `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-muted`, `text-muted-foreground`, `bg-destructive`, `text-destructive-foreground`). NEVER use hardcoded color values (e.g., `bg-white`, `text-black`, `bg-blue-500`).
2.  **ALWAYS Include Feature Contract**: Every feature's `index.ts` file MUST include a `contract` definition using `createContract()`.
3.  **ALWAYS Choose ONE State Strategy**: Explicitly set `sharedState: false` or `sharedState: true` in the feature config. Do not leave it undefined or attempt to mix strategies.
4.  **ALWAYS Import from Correct Paths**:
    - Bloom Framework imports: Use `@/shared/contracts`, `@/shared/hooks/useSharedState`, `@/shared/hooks/useBloomStorage`, `@/shared/hooks/useBloomApi`.
    - UIKit imports: Use `@voilajsx/uikit/<component-name>`.
    - NEVER import directly between features (e.g., `import { useOtherFeature } from '@/features/other-feature/hooks';`).
5.  **ALWAYS Follow File Structure**: Adhere strictly to the `src/features/<feature-name>/index.ts`, `pages/`, `hooks/`, `components/` structure.

### 5.4. Hook Patterns (The Bloom Way)

- **Local State Hook**: For `sharedState: false` features. Use `useState`, `useEffect`, `useBloomStorage` (for persistence), and `useBloomApi` (for API calls). Encapsulate data, loading, error states, and actions.
- **Redux State Hook**: For `sharedState: true` features. Use `useSharedState('sliceName')` to interact with the Redux store. Dispatch actions to update state and select data from the store.

### 5.5. Page Component Patterns

- **Standard Page Structure**: All page components should follow a consistent structure:
  1.  **Header Section**: Always include a clear title and description.
  2.  **Error Handling**: Implement robust error display, especially for API-driven pages.
  3.  **Main Content**: Display loading states, empty states, and the actual content.
  4.  **Actions Section**: (Optional) For primary actions related to the page.
- **Imports**: Use `React` and components from `@voilajsx/uikit`. Import feature-specific hooks from `../hooks/useMyFeature`.

### 5.6. LLM Success Patterns

- **Start with Contract**: Begin every feature creation by designing its contract.
- **State Strategy First**: Decide on the state strategy before writing any implementation code.
- **Follow File Structure**: Always create the exact prescribed file structure for new features.
- **Use Platform Hooks**: Always use Bloom's provided platform hooks (`useBloomStorage`, `useBloomApi`, `useSharedState`) instead of creating custom ones for common functionalities.

### 5.7. Redux Slice Patterns

- When `sharedState: true`, define `stateSlices` in `index.ts`.
- Each slice needs a `name`, `initialState`, and `reducers`.
- Reducers should be pure functions that update the state immutably.
- Consider using `createSliceFromTemplate` from `@/platform/state` for common slice patterns (e.g., `LOADING`, `UI`, `API_CACHE`, `COUNTER`).

By strictly adhering to these guidelines, LLMs can generate high-quality, maintainable, and perfectly integrated code within the Bloom Framework, significantly accelerating development while ensuring architectural integrity.
