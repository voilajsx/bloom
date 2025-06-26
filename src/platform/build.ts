/**
 * Bloom Framework - Build system and SSG utilities
 * @module @voilajsx/bloom/platform
 * @file src/platform/build.ts
 */

import type { 
  BloomBuildConfig, 
  BloomCompiledRoute, 
  BloomFeatureRegistry 
} from './types';
import defaults from '@/defaults';

/**
 * Default build configuration
 */
export const defaultBuildConfig: BloomBuildConfig = {
  outDir: 'dist',
  assetsDir: 'assets',
  publicDir: 'public',
  ssg: {
    enabled: defaults['ssg-enabled'] ?? true,
    routes: [],
    fallback: true
  },
  optimization: {
    minify: true,
    treeshake: true,
    codeSplit: true
  }
};

/**
 * Build context for runtime information
 */
interface BloomBuildContext {
  isDevelopment: boolean;
  isProduction: boolean;
  buildTime: string;
  version: string;
  features: string[];
  routes: string[];
}

/**
 * Get current build context
 */
export function getBuildContext(): BloomBuildContext {
  const isDev = typeof __BLOOM_DEV__ !== 'undefined' ? __BLOOM_DEV__ : false;
  
  return {
    isDevelopment: isDev,
    isProduction: !isDev,
    buildTime: new Date().toISOString(),
    version: typeof __BLOOM_VERSION__ !== 'undefined' ? __BLOOM_VERSION__ : '1.0.0',
    features: [], // Will be populated by build system
    routes: []   // Will be populated by build system
  };
}

/**
 * Generate static routes for SSG
 */
export function generateStaticRoutes(
  routes: BloomCompiledRoute[],
  features: BloomFeatureRegistry
): string[] {
  const staticRoutes: string[] = [];

  routes.forEach(route => {
    // Only include routes marked for SSG
    if (route.ssg !== false) {
      // Handle dynamic routes
      if (route.path.includes(':')) {
        console.warn(`[Build] Dynamic route ${route.path} requires manual static route generation`);
        // In a real implementation, this would be handled by the build system
        // with data from the feature's SSG configuration
      } else {
        staticRoutes.push(route.path);
      }
    }
  });

  return staticRoutes;
}

/**
 * Generate manifest for PWA support
 */
export function generateManifest(): Record<string, any> {
  return {
    name: defaults['app-name'],
    short_name: defaults['app-name'],
    description: defaults['app-description'],
    version: defaults['app-version'],
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  const baseUrl = defaults['app-website'] || 'https://example.com';
  
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
}

/**
 * Generate sitemap.xml content
 */
export function generateSitemap(routes: BloomCompiledRoute[]): string {
  const baseUrl = defaults['app-website'] || 'https://example.com';
  const staticRoutes = generateStaticRoutes(routes, {});
  
  const urls = staticRoutes.map(route => {
    return `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Generate meta tags for SSG
 */
export function generateMetaTags(route: BloomCompiledRoute): string {
  const meta = route.meta || {};
  const title = route.title || defaults['default-title'];
  const description = meta.description || defaults['default-description'];
  const keywords = meta.keywords || defaults['default-keywords'];
  const author = meta.author || defaults['app-author'];
  const image = meta.image || '/og-image.png';
  const url = `${defaults['app-website']}${route.path}`;

  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="${author}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    
    <!-- Additional -->
    <meta name="generator" content="Bloom Framework">
    <link rel="canonical" href="${url}">
  `.trim();
}

/**
 * Bundle analyzer utilities
 */
export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  features: Array<{
    name: string;
    size: number;
    routes: number;
  }>;
}

/**
 * Performance budget checker
 */
export interface PerformanceBudget {
  maxBundleSize: number;
  maxChunkSize: number;
  maxFeatureSize: number;
}

export function checkPerformanceBudget(
  analysis: BundleAnalysis,
  budget: PerformanceBudget
): Array<{ type: string; message: string; severity: 'warning' | 'error' }> {
  const issues: Array<{ type: string; message: string; severity: 'warning' | 'error' }> = [];

  // Check total bundle size
  if (analysis.totalSize > budget.maxBundleSize) {
    issues.push({
      type: 'bundle-size',
      message: `Total bundle size (${analysis.totalSize}KB) exceeds budget (${budget.maxBundleSize}KB)`,
      severity: 'error'
    });
  }

  // Check individual chunks
  analysis.chunks.forEach(chunk => {
    if (chunk.size > budget.maxChunkSize) {
      issues.push({
        type: 'chunk-size',
        message: `Chunk ${chunk.name} (${chunk.size}KB) exceeds budget (${budget.maxChunkSize}KB)`,
        severity: 'warning'
      });
    }
  });

  // Check feature sizes
  analysis.features.forEach(feature => {
    if (feature.size > budget.maxFeatureSize) {
      issues.push({
        type: 'feature-size',
        message: `Feature ${feature.name} (${feature.size}KB) exceeds budget (${budget.maxFeatureSize}KB)`,
        severity: 'warning'
      });
    }
  });

  return issues;
}

/**
 * Build optimization suggestions
 */
export function generateOptimizationSuggestions(
  analysis: BundleAnalysis
): Array<{ type: string; suggestion: string; impact: 'high' | 'medium' | 'low' }> {
  const suggestions: Array<{ type: string; suggestion: string; impact: 'high' | 'medium' | 'low' }> = [];

  // Large chunks suggestions
  const largeChunks = analysis.chunks.filter(chunk => chunk.size > 100);
  if (largeChunks.length > 0) {
    suggestions.push({
      type: 'code-splitting',
      suggestion: `Consider splitting large chunks: ${largeChunks.map(c => c.name).join(', ')}`,
      impact: 'high'
    });
  }

  // Feature size suggestions
  const largeFeatures = analysis.features.filter(feature => feature.size > 50);
  if (largeFeatures.length > 0) {
    suggestions.push({
      type: 'feature-optimization',
      suggestion: `Optimize large features: ${largeFeatures.map(f => f.name).join(', ')}`,
      impact: 'medium'
    });
  }

  // General suggestions
  if (analysis.totalSize > 500) {
    suggestions.push({
      type: 'tree-shaking',
      suggestion: 'Enable aggressive tree-shaking to remove unused code',
      impact: 'medium'
    });
  }

  return suggestions;
}