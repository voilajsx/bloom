/**
 * Bloom Framework - Default Configuration with Layout Routing
 * @module @voilajsx/bloom
 * @file src/defaults.ts
 */

// Global type declarations for Vite build variables
declare global {
  const __BLOOM_VERSION__: string;
  const __BLOOM_DEV__: boolean;
  const __BLOOM_BASE_PATH__: string;
}

const defaults = {
  // App Identity
  'app-name': 'Bloom App',
  'app-version': '1.0.0',
  'app-description': 'Built with Bloom Framework',
  'app-author': 'Your Name',
  'app-website': 'https://github.com/voilajsx/bloom',

  // Server Configuration
  'host': 'localhost',
  'port': 3000,
  'base-path': '/',

  // Build Configuration
  'build-out-dir': 'dist',
  'build-assets-dir': 'assets',

  // UIKit Theme
  'app-theme': 'studio',
  'app-mode': 'light',

  // Layout Configuration
  'default-layout': 'page',
  'layout-size': 'xl',

  // Layout Routing - which routes use which layouts
  'layout-routes': {
    'auth': ['/login', '/register', '/signup', '/forgot-password', '/reset-password'],
    'admin': ['/admin*', '/about'],
    'blank': ['/404', '/error', '/maintenance', '/coming-soon'],
    'popup': ['/popup*'],
    'page': ['/*'], // Wildcard fallback for everything else
  },

  // Navigation
  'navigation-items': [
    { key: 'home', label: 'Home', href: '/', icon: 'Home' },
    { key: 'about', label: 'About', href: '/about', icon: 'Info' },
    { key: 'contact', label: 'Contact', href: '/contact', icon: 'Mail' },
    { key: 'quotes', label: 'Quotes', href: '/quotes', icon: 'Quote' },
  ],

  // SEO
  'default-title': 'Bloom App',
  'default-description': 'Built with Bloom Framework',
  'default-keywords': 'bloom, framework, react, ssg',

  // Features
  'ssg-enabled': true as boolean,
  'enable-caching': true as boolean,
  'api-timeout': 10000,

} as const;

/**
 * Get base path for the application
 */
export function getBasePath(): string {
  return (defaults as any)['base-path'] || '/';
}

/**
 * Get navigation items with base path applied
 */
export function getNavigationWithBasePath() {
  const basePath = getBasePath();
  return defaults['navigation-items'].map(item => ({
    ...item,
    href: basePath !== '/' ? `${basePath.replace(/\/$/, '')}${item.href}` : item.href
  }));
}

/**
 * Get server URL for development
 */
export function getServerUrl(): string {
  const host = defaults['host'] || 'localhost';
  const port = defaults['port'] || 3000;
  const basePath = getBasePath();
  return `http://${host}:${port}${basePath !== '/' ? basePath : ''}`;
}

export default defaults;