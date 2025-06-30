import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import defaults, { getBasePath } from './src/defaults'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// PRE-COMPILE FEATURES AT BUILD TIME (No runtime discovery)
function bloomBuildTimeDiscovery() {
  return {
    name: 'bloom-build-discovery',
    buildStart() {
      console.log('🌸 Bloom: Pre-compiling features...')
      
      try {
        const featuresDir = path.resolve(process.cwd(), 'src/features')
        
        if (!fs.existsSync(featuresDir)) {
          console.log('⚠️ Bloom: Features directory not found, skipping discovery')
          return
        }
        
        const entries = fs.readdirSync(featuresDir, { withFileTypes: true })
        
        // Discover features (same logic, but at build time)
        const features = entries
          .filter(entry => 
            entry.isDirectory() && 
            !entry.name.startsWith('_') && 
            fs.existsSync(path.join(featuresDir, entry.name, 'index.ts'))
          )
          .map(entry => entry.name)

        // Generate optimized features index with metadata
        const indexContent = generateOptimizedFeaturesIndex(features)
        const indexPath = path.join(featuresDir, 'index.ts')
        fs.writeFileSync(indexPath, indexContent, 'utf8')
        
        console.log(`🌸 Bloom: Pre-compiled ${features.length} features: ${features.join(', ')}`)
        
      } catch (error) {
        console.error('❌ Bloom: Build-time discovery failed:', error)
      }
    }
  }
}

// Generate features index with build-time metadata
function generateOptimizedFeaturesIndex(features: string[]): string {
  const imports = features.map(feature => 
    `export { default as ${toCamelCase(feature)} } from './${feature}/index';`
  ).join('\n')
  
  const featuresList = features.map(feature => `'${toCamelCase(feature)}'`).join(',\n  ')
  
  return `/**
 * Bloom Framework - OPTIMIZED Auto-generated feature exports
 * 🤖 This file is pre-compiled at BUILD TIME (no runtime overhead)
 * @module @voilajsx/bloom/features
 * @file src/features/index.ts
 */

// Auto-discovered features
${imports}

// Feature registry for runtime discovery
export const BLOOM_FEATURES = [
  ${featuresList}
] as const;

// Build-time feature metadata
export const BLOOM_FEATURE_META = {
  version: '1.0.0',
  buildTime: '${new Date().toISOString()}',
  featuresCount: ${features.length}
};

// Export feature configs for static access
export const BLOOM_FEATURE_CONFIGS = {
${features.map(feature => `  ${toCamelCase(feature)}: () => import('./${feature}/index').then(m => m.default)`).join(',\n')}
} as const;
`
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

// ENHANCED BUILD CONFIG WITH SECURITY AND TYPESCRIPT SAFETY
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve'
  const isProd = mode === 'production'
  const basePath = getBasePath()
  
  console.log(`🌸 Bloom: ${isDev ? 'Development' : 'Production'} mode, Base path: ${basePath}`)
  
  return {
    base: basePath,
    
    plugins: [
      react({
        // React optimizations (fastRefresh is enabled by default in dev)
        jsxRuntime: 'automatic'
      }),
      tailwindcss(),
      bloomBuildTimeDiscovery(), // ⚡ BUILD-TIME DISCOVERY
    ],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/features': path.resolve(__dirname, './src/features'),
        '@/shared': path.resolve(__dirname, './src/shared'),
        '@/platform': path.resolve(__dirname, './src/platform'),
      }
    },
    
    // 🔧 TypeScript configuration
    esbuild: {
      target: 'es2020',
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    
    build: {
      outDir: defaults['build-out-dir'] || 'dist',
      assetsDir: defaults['build-assets-dir'] || 'assets',
      
      // ⚡ OPTIMIZED BUNDLE SPLITTING
      rollupOptions: {
        output: {
          // 🔧 Proper chunk naming for better caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = path.extname(assetInfo.name || '').slice(1)
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return 'assets/img/[name]-[hash][extname]'
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
          
          manualChunks: {
            // Core framework
            'vendor': ['react', 'react-dom'],
            'router': ['react-router-dom'],
            'uikit': ['@voilajsx/uikit'],
            
            // ⚡ FEATURE-LEVEL SPLITTING
            'bloom-platform': [
              './src/platform/bloom.ts',
              './src/platform/router.ts',
              './src/platform/layout.tsx'
            ],
            
            // ⚡ CONDITIONAL REDUX CHUNK (only loads if needed)
            'bloom-redux': [
              '@reduxjs/toolkit',
              'react-redux',
              './src/platform/state.ts'
            ]
          }
        }
      },
      
      // ⚡ BUILD PERFORMANCE & SECURITY
      sourcemap: isDev,
      minify: isProd,
      target: 'es2020',
      
      // 🔧 Asset handling
      assetsInlineLimit: 4096, // 4KB inline limit
      cssCodeSplit: true,
      
      // 🔧 TypeScript build safety
      emptyOutDir: true,
      reportCompressedSize: isProd,
    },
    
    // ⚡ OPTIMIZED DEV SERVER WITH SECURITY
    server: {
      port: defaults['port'] || 3000,
      host: defaults['host'] || 'localhost',
      open: basePath !== '/' ? basePath : true,
      hmr: {
        overlay: true
      },
      // 🔒 SECURITY: Development headers
      headers: isDev ? {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      } : {}
    },
    
    // ⚡ PERFORMANCE OPTIMIZATIONS
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@voilajsx/uikit',
        'react-redux',
        '@reduxjs/toolkit'
      ],
      esbuildOptions: {
        target: 'es2020'
      }
    },
    
    // 🔧 CSS handling
    css: {
      devSourcemap: isDev,
      postcss: {
        plugins: []
      }
    },
    
    define: {
      __BLOOM_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BLOOM_DEV__: JSON.stringify(isDev),
      __BLOOM_BASE_PATH__: JSON.stringify(basePath),
      
      // UIKit environment
      'import.meta.env.VITE__LAYOUT__THEME': JSON.stringify(defaults['app-theme']),
      'import.meta.env.VITE__LAYOUT__TYPE': JSON.stringify('page'),
      'import.meta.env.VITE__LAYOUT__TITLE': JSON.stringify(defaults['app-name']),
      'import.meta.env.VITE__LAYOUT__BASE_PATH': JSON.stringify(basePath),
      'import.meta.env.VITE__LAYOUT__PAGE__SIZE': JSON.stringify(defaults['layout-size']),
    },

    // 🔒 SECURITY: Production preview with proper MIME types
    preview: {
      port: 4173,
      host: true,
      cors: true,
      headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        // 🔧 Explicit MIME type headers
        //'Content-Type': 'text/html; charset=utf-8'
      }
    },

    // 🔧 Asset handling for different file types
    assetsInclude: [
      '**/*.woff',
      '**/*.woff2', 
      '**/*.ttf',
      '**/*.eot',
      '**/*.svg',
      '**/*.png',
      '**/*.jpg',
      '**/*.jpeg',
      '**/*.gif',
      '**/*.webp'
    ],

    // 🔧 TypeScript type checking (in development)
    ...(isDev && {
      // Additional dev-only configuration can go here
    })
  }
})