/**
 * Webpages Feature - Static content pages with contract
 * @module @voilajsx/bloom/features/webpages
 * @file src/features/webpages/index.ts
 */

import type { BloomFeatureConfig } from '@/platform/types';
import { createContract, STANDARD_HOOKS, STANDARD_COMPONENTS } from '@/shared/contracts';

const config: BloomFeatureConfig = {
  name: 'webpages',
  
  // Feature contract - what this feature provides/consumes
  contract: createContract()
    .providesComponent('HomePage')
    .providesComponent('AboutPage')
    .providesComponent('ContactPage')
    .consumesHook(STANDARD_HOOKS.USE_ROUTER)
    .build(),
  
  // Use local state management (not Redux)
  sharedState: false,
  
  routes: [
    {
      path: '/',
      component: () => import('./pages/HomePage'),
      layout: 'default',
      title: 'Home',
      meta: {
        description: 'Welcome to our homepage built with Bloom Framework',
        keywords: 'home, welcome, bloom framework'
      },
      ssg: true // Static generation
    },
    {
      path: '/about',
      component: () => import('./pages/AboutPage'),
      layout: 'default',
      title: 'About Us',
      meta: {
        description: 'Learn more about our company and mission',
        keywords: 'about, company, mission'
      },
      ssg: true
    },
    {
      path: '/contact',
      component: () => import('./pages/ContactPage'),
      layout: 'default',
      title: 'Contact Us',
      meta: {
        description: 'Get in touch with our team',
        keywords: 'contact, support, help'
      },
      ssg: true
    }
  ],

  settings: {
    companyName: {
      key: 'webpages.companyName',
      default: 'Bloom Company',
      type: 'string',
      label: 'Company Name'
    },
    showHero: {
      key: 'webpages.showHero',
      default: true,
      type: 'boolean',
      label: 'Show Hero Section'
    }
  },

  meta: {
    name: 'Website Pages',
    description: 'Static content pages with local state management',
    version: '1.0.0',
    author: 'Bloom Team'
  }
};

export default config;