/**
 * Bloom Framework - OPTIMIZED Auto-generated feature exports
 * 🤖 This file is pre-compiled at BUILD TIME (no runtime overhead)
 * @module @voilajsx/bloom/features
 * @file src/features/index.ts
 */

// Auto-discovered features
export { default as myDashboard } from './my-dashboard/index';
export { default as quotes } from './quotes/index';
export { default as webpages } from './webpages/index';

// Feature registry for runtime discovery
export const BLOOM_FEATURES = [
  'myDashboard',
  'quotes',
  'webpages'
] as const;

// Build-time feature metadata
export const BLOOM_FEATURE_META = {
  version: '1.0.0',
  buildTime: '2025-07-03T14:58:24.047Z',
  featuresCount: 3
};

// Export feature configs for static access
export const BLOOM_FEATURE_CONFIGS = {
  myDashboard: () => import('./my-dashboard/index').then(m => m.default),
  quotes: () => import('./quotes/index').then(m => m.default),
  webpages: () => import('./webpages/index').then(m => m.default)
} as const;
