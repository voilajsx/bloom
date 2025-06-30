/**
 * Quotes Feature - Display latest inspirational quotes with Redux
 * @module @voilajsx/bloom/features/quotes
 * @file src/features/quotes/index.ts
 */

import type { BloomFeatureConfig } from '@/platform/types';
import { createContract } from '@/shared/contracts';
import { createSliceFromTemplate } from '@/platform/state';

const config: BloomFeatureConfig = {
  name: 'quotes',
  
  // ✅ FIXED: Feature contract - only what this feature provides (no platform dependencies)
  contract: createContract()
    .providesService('quotesApi')
    .providesHook('useQuotes')
    .providesComponent('QuotesPage')
    .providesComponent('QuoteCard')
    .providesComponent('QuoteList')
    // ✅ Removed platform dependencies:
    // - STANDARD_HOOKS.USE_SHARED_STATE (provided by Bloom platform)
    // - STANDARD_HOOKS.USE_API (provided by Bloom platform)  
    // - consumesState('quotes') (this feature provides its own quotes state)
    .build(),
  
  // Use Redux shared state
  sharedState: true,
  
  // Define Redux slices for this feature
  stateSlices: [
    // Custom quotes slice
    {
      name: 'quotes',
      initialState: {
        quotes: [],
        featuredQuote: null,
        favorites: [],
        loading: false,
        error: null,
        settings: {
          autoRefresh: true,
          refreshInterval: 30000,
          showAuthor: true,
          quotesPerPage: 6
        }
      },
      reducers: {
        setQuotes: (state: any, action: any) => {
          state.quotes = action.payload;
          state.loading = false;
          state.error = null;
        },
        setFeaturedQuote: (state: any, action: any) => {
          state.featuredQuote = action.payload;
        },
        setLoading: (state: any, action: any) => {
          state.loading = action.payload;
        },
        setError: (state: any, action: any) => {
          state.error = action.payload;
          state.loading = false;
        },
        addFavorite: (state: any, action: any) => {
          if (!state.favorites.includes(action.payload)) {
            state.favorites.push(action.payload);
          }
        },
        removeFavorite: (state: any, action: any) => {
          state.favorites = state.favorites.filter((id: string) => id !== action.payload);
        },
        updateSetting: (state: any, action: any) => {
          const { key, value } = action.payload;
          state.settings[key] = value;
        },
        clearError: (state: any) => {
          state.error = null;
        }
      }
    },
    // Use template for API cache
    createSliceFromTemplate('API_CACHE', 'quotesCache')
  ],
  
  routes: [
    {
      path: '/quotes',
      component: () => import('./pages/QuotesPage'),
      layout: 'default',
      title: 'Inspirational Quotes',
      meta: {
        description: 'Discover inspiring quotes to motivate your day',
        keywords: 'quotes, inspiration, motivation, wisdom'
      },
      ssg: false // Dynamic content - no static generation
    }
  ],

  settings: {
    autoRefresh: {
      key: 'quotes.autoRefresh',
      default: true,
      type: 'boolean',
      label: 'Auto Refresh Quotes'
    },
    refreshInterval: {
      key: 'quotes.refreshInterval',
      default: 30000,
      type: 'number',
      label: 'Refresh Interval (ms)'
    },
    showAuthor: {
      key: 'quotes.showAuthor',
      default: true,
      type: 'boolean',
      label: 'Show Quote Authors'
    },
    quotesPerPage: {
      key: 'quotes.quotesPerPage',
      default: 6,
      type: 'number',
      label: 'Quotes Per Page'
    }
  },

  api: {
    baseUrl: 'https://api.adviceslip.com',
    endpoints: {
      random: '/advice',
      search: '/advice/search'
    },
    timeout: 10000
  },

  meta: {
    name: 'Quotes',
    description: 'Inspirational quotes with Redux state management and API integration',
    version: '1.0.0',
    author: 'Bloom Team'
  }
};

export default config;