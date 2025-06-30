/**
 * MyDashboard Feature - Static content (about, home, landing)
 * @module @voilajsx/bloom/features/myDashboard
 * @file src/features/myDashboard/index.ts
 */

import type { BloomFeatureConfig } from '@/platform/types';

const config: BloomFeatureConfig = {
  name: 'myDashboard',
  
  // ✅ Uses local state only
  sharedState: false,
  
  routes: [
    {
      path: '/myDashboard',
      component: () => import('./pages/MainPage'),
      layout: 'page',
      title: 'MyDashboard',
      meta: {
        description: 'Static content (about, home, landing)',
        keywords: 'myDashboard, page'
      },
      ssg: true
    }
  ],

  meta: {
    name: 'MyDashboard',
    description: 'Static content (about, home, landing)',
    version: '1.0.0',
    author: 'Bloom Developer'
  }
};

export default config;