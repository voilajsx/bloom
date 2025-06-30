/**
 * Bloom Framework - Default Configuration with Layout Config
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
  'base-path': '/new',

  // Build Configuration
  'build-out-dir': 'dist',
  'build-assets-dir': 'assets',

  // UIKit Theme
  'app-theme': 'aurora',
  'app-mode': 'light',

  // Layout Configuration
  'default-layout': 'page',
  'layout-size': 'xl',

  // Layout-specific Configuration
  'layout-config': {
    admin: {
      scheme: 'sidebar',
      tone: 'brand',
      size: 'lg',
      logo: {
        type: 'text', // 'text' | 'image'
        value: 'B',   // Text content or image path
        showTitle: true
      },
      header: {
        showIndicator: false,
        indicator: 'Admin Panel'
      }
    },
    page: {
      scheme: 'default',
      tone: 'brand',
      size: 'xl',
      header: {
        showIndicator: false,
        indicator: 'Website'
      },
      footer: {
        tone:'subtle',
        navigation: [
          { key: 'privacy', label: 'Privacy Policy', href: '/privacy' },
          { key: 'terms', label: 'Terms of Service', href: '/terms' }
        ],
        copyright: '© 2024 {title}. All rights reserved.'
      }
    },
    auth: {
      scheme: 'card',
      tone: 'clean',
      size: 'md'
    },
    blank: {
      scheme: 'simple',
      tone: 'clean',
      size: 'lg'
    },
    popup: {
      scheme: 'modal',
      tone: 'clean',
      size: 'md'
    }
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
 * Get layout configuration for a specific layout type
 */
export function getLayoutConfig(layoutType: keyof typeof defaults['layout-config']) {
  return (defaults as any)['layout-config'][layoutType] || {};
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