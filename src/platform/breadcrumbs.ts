/**
 * Bloom Framework - Breadcrumb System
 * @module @voilajsx/bloom/platform
 * @file src/platform/breadcrumbs.ts
 */

import { getBasePath } from '@/defaults';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export interface BreadcrumbConfig {
  // Static breadcrumbs defined by feature
  items?: BreadcrumbItem[];
  // Auto-generate from path
  auto?: boolean;
  // Custom home breadcrumb
  home?: { label: string; href: string };
  // Hide breadcrumbs completely
  hide?: boolean;
}

/**
 * Generate breadcrumbs from current path automatically
 */
function generateAutoBreadcrumbs(currentPath: string, basePath: string): BreadcrumbItem[] {
  // Remove base path to get clean route
  const cleanPath = basePath !== '/' && currentPath.startsWith(basePath) 
    ? currentPath.slice(basePath.length - 1) || '/'
    : currentPath;

  if (cleanPath === '/') {
    return [{ label: 'Home', href: '/', isActive: true }];
  }

  const segments = cleanPath.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  let currentHref = '';
  segments.forEach((segment, index) => {
    currentHref += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label: capitalizeSegment(segment),
      href: isLast ? undefined : currentHref,
      isActive: isLast
    });
  });

  return breadcrumbs;
}

/**
 * Capitalize and format path segment for display
 */
function capitalizeSegment(segment: string): string {
  // Handle common patterns
  const formatted = segment
    .replace(/[-_]/g, ' ')  // Replace dashes/underscores with spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space before capitals
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Handle special cases
  const specialCases: Record<string, string> = {
    'admin': 'Admin',
    'api': 'API',
    'ui': 'UI',
    'id': 'ID',
    'url': 'URL',
    'seo': 'SEO',
    'pwa': 'PWA'
  };

  return specialCases[formatted.toLowerCase()] || formatted;
}

/**
 * Get breadcrumbs for a route with fallback logic
 */
export function getBreadcrumbs(
  currentPath: string,
  breadcrumbConfig?: BreadcrumbConfig
): BreadcrumbItem[] {
  const basePath = getBasePath();

  // If breadcrumbs are hidden, return empty array
  if (breadcrumbConfig?.hide) {
    return [];
  }

  // If custom breadcrumbs are defined, use them
  if (breadcrumbConfig?.items && breadcrumbConfig.items.length > 0) {
    return breadcrumbConfig.items.map((item, index, arr) => ({
      ...item,
      isActive: index === arr.length - 1 // Last item is active
    }));
  }

  // If auto-generation is disabled and no custom items, return empty
  if (breadcrumbConfig?.auto === false) {
    return [];
  }

  // Auto-generate breadcrumbs from path
  const autoBreadcrumbs = generateAutoBreadcrumbs(currentPath, basePath);
  
  // Use custom home if provided
  if (breadcrumbConfig?.home && autoBreadcrumbs.length > 0) {
    autoBreadcrumbs[0] = breadcrumbConfig.home;
  }
  
  return autoBreadcrumbs;
}

/**
 * Update route types to include breadcrumbs
 */
export interface BloomRouteWithBreadcrumbs {
  path: string;
  component: () => Promise<{ default: React.ComponentType<any> }>;
  layout?: string;
  title?: string;
  meta?: any;
  ssg?: boolean;
  breadcrumbs?: BreadcrumbConfig;
}

/**
 * Example breadcrumb configurations
 */
export const BREADCRUMB_EXAMPLES = {
  // Custom static breadcrumbs
  CUSTOM: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Admin', href: '/admin' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Edit User' } // Last item has no href (active)
    ]
  },

  // Auto-generate from path
  AUTO: {
    auto: true
  },

  // Custom home + auto-generate rest
  CUSTOM_HOME: {
    auto: true,
    home: { label: 'Dashboard', href: '/admin' }
  },

  // Hide breadcrumbs
  HIDDEN: {
    hide: true
  }
} as const;