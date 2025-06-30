/**
 * Bloom Framework - SSG using existing ssg-build.js implementation
 * @file scripts/lib/ssg.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  logSuccess,
  logError,
  logBox,
  log,
  colors,
  symbols,
  Timer,
} from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate static site using the full ssg-build.js implementation
 */
export async function runSSG(args) {
  const timer = new Timer();

  console.clear();

  logBox(`${symbols.sparkles} Bloom SEO SSG Generation`, [
    `${symbols.fire} SEO-optimized static pages`,
    `${symbols.performance} Enhanced meta tags`,
    `${symbols.security} Security headers included`,
    `${symbols.target} Sitemap & robots.txt`,
  ]);

  try {
    // Step 1: Run vite build first
    log(`${symbols.lightning} Building production bundle...`, 'white');

    const buildArgs = [...args.filter((arg) => !arg.startsWith('--bloom'))];

    const env = {
      ...process.env,
      NODE_ENV: 'production',
      BLOOM_BUILD: 'true',
    };

    execSync(`vite build ${buildArgs.join(' ')}`, {
      stdio: 'inherit',
      env,
    });

    logSuccess('Production build completed');

    // Step 2: Run the full SSG implementation
    log(
      `${symbols.sparkles} Generating SEO-optimized static pages...`,
      'white'
    );

    // Import the existing implementation from the actual ssg-build.js
    await generateStaticSiteFromBuild();

    logSuccess('Static site generation completed');

    // Step 3: Analyze the output
    log(`${symbols.target} Analyzing static site output...`, 'white');
    const analysis = await analyzeSSGOutput();

    // Success output
    console.clear();
    timer.endWithMessage(`${symbols.check} SSG completed successfully!`);

    logBox(
      `${symbols.rocket} Static Site Ready for Deploy`,
      [
        `${symbols.sparkles} ${analysis.pagesGenerated} HTML pages created`,
        `${symbols.performance} ${analysis.seoFiles.length} SEO files generated`,
        `${symbols.security} Security headers configured`,
        `${symbols.fire} Production-ready output`,
      ],
      'green'
    );

    logSuccess(`Static site output: ${colors.cyan}dist/${colors.reset}`);

    // Show generated files summary
    console.log();
    log(`${colors.bright}Generated SEO files:${colors.reset}`, 'white');
    analysis.seoFiles.forEach((file) => {
      log(`  ${symbols.check} ${colors.gray}${file}${colors.reset}`, 'white');
    });

    if (analysis.routes.length > 0) {
      console.log();
      log(`${colors.bright}Static routes:${colors.reset}`, 'white');
      analysis.routes.slice(0, 5).forEach((route) => {
        log(
          `  ${symbols.sparkles} ${colors.cyan}${route}${colors.reset}`,
          'white'
        );
      });

      if (analysis.routes.length > 5) {
        log(
          `  ${colors.gray}... and ${analysis.routes.length - 5} more${
            colors.reset
          }`,
          'white'
        );
      }
    }

    console.log();
    logBox(
      'Deployment Ready',
      [
        '1. Upload dist/ folder to your hosting provider',
        '2. Configure server for SPA fallback (if needed)',
        '3. Set up CDN for optimal performance',
        '4. Monitor SEO performance with Google Search Console',
      ],
      'blue'
    );
  } catch (error) {
    console.clear();
    logError(`SSG generation failed: ${error.message}`);

    // Helpful error messages
    if (error.message.includes('build')) {
      log(
        'Build failed. Check for TypeScript errors or missing dependencies.',
        'white'
      );
    } else if (error.message.includes('ENOENT')) {
      log(
        'Missing files. Ensure all features have valid configurations.',
        'white'
      );
    }

    if (process.env.DEBUG) {
      console.error('Full error:', error);
    }

    process.exit(1);
  }
}

/**
 * Full SSG implementation using the existing ssg-build.js code
 */
async function generateStaticSiteFromBuild() {
  // 1. Get the actual built assets from dist
  const assets = await getBuiltAssets();

  // 2. Load app configuration with base path
  const appConfig = await loadAppConfig();

  // 3. Discover features and routes
  const ssgRoutes = await getSSGRoutes();

  // 4. Generate HTML for each route with SEO optimization
  for (const route of ssgRoutes) {
    await generateSEOOptimizedHTML(route, assets, appConfig);
  }

  // 5. Generate SEO files
  await generateSEOFiles(ssgRoutes, appConfig);

  console.log(
    `✅ Bloom SEO SSG: Generated ${ssgRoutes.length} SEO-optimized pages with base path: ${appConfig.basePath}`
  );
}

async function loadAppConfig() {
  const defaultsPath = path.join(__dirname, '../../src/defaults.ts');
  const defaultsContent = fs.readFileSync(defaultsPath, 'utf8');

  // Extract base path from defaults
  const basePath = extractDefaultValue(defaultsContent, 'base-path') || '/';
  const cleanBasePath = basePath === '/' ? '' : basePath.replace(/\/$/, '');

  return {
    name: extractDefaultValue(defaultsContent, 'app-name') || 'Bloom App',
    description:
      extractDefaultValue(defaultsContent, 'app-description') ||
      'Built with Bloom Framework',
    website:
      extractDefaultValue(defaultsContent, 'app-website') ||
      'https://bloom-framework.dev',
    author:
      extractDefaultValue(defaultsContent, 'app-author') || 'Bloom Developer',
    version: extractDefaultValue(defaultsContent, 'app-version') || '1.0.0',
    keywords:
      extractDefaultValue(defaultsContent, 'default-keywords') ||
      'bloom, framework, react, ssg',
    language: 'en',
    region: 'US',
    type: 'website',
    basePath: cleanBasePath, // Clean base path without trailing slash
    fullBasePath: basePath, // Original base path with trailing slash
  };
}

async function getBuiltAssets() {
  const distDir = path.join(process.cwd(), 'dist');
  const assetsDir = path.join(distDir, 'assets');

  const assets = { css: [], js: [] };

  try {
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);

      files.forEach((file) => {
        if (file.endsWith('.css')) assets.css.push(`./assets/${file}`);
        else if (file.endsWith('.js')) assets.js.push(`./assets/${file}`);
      });
    }

    const mainCSS =
      assets.css.find((file) => file.includes('index-')) || assets.css[0];
    const mainJS =
      assets.js.find((file) => file.includes('index-')) || assets.js[0];

    console.log(
      `🌸 Bloom SEO SSG: Found assets - CSS: ${mainCSS}, JS: ${mainJS}`
    );

    return { mainCSS, mainJS, allCSS: assets.css, allJS: assets.js };
  } catch (error) {
    console.warn('⚠️ Could not read built assets, using fallback');
    return {
      mainCSS: './assets/index.css',
      mainJS: './assets/index.js',
      allCSS: [],
      allJS: [],
    };
  }
}

async function getSSGRoutes() {
  const routes = [];
  const featuresDir = path.join(__dirname, '../../src/features');

  try {
    const entries = fs.readdirSync(featuresDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        const indexPath = path.join(featuresDir, entry.name, 'index.ts');

        if (fs.existsSync(indexPath)) {
          const configContent = fs.readFileSync(indexPath, 'utf8');
          const routeMatches = extractRoutesFromConfig(configContent);

          routeMatches.forEach((route) => {
            if (route.ssg !== false) {
              routes.push({
                path: route.path,
                feature: entry.name,
                title: route.title || 'Bloom App',
                meta: route.meta || {},
                ssg: route.ssg,
              });
            }
          });
        }
      }
    }

    console.log(`🌸 Bloom SEO SSG: Found ${routes.length} SSG routes`);
    return routes;
  } catch (error) {
    console.error('❌ Failed to discover SEO routes:', error);
    return [];
  }
}

function extractRoutesFromConfig(configContent) {
  const routes = [];

  try {
    const routesMatch = configContent.match(/routes:\s*\[([\s\S]*?)\]/);
    if (!routesMatch) return routes;

    const routesContent = routesMatch[1];
    const routeMatches = routesContent.match(/\{[\s\S]*?\}/g) || [];

    routeMatches.forEach((routeStr) => {
      const route = {};

      const pathMatch = routeStr.match(/path:\s*['"`](.*?)['"`]/);
      if (pathMatch) route.path = pathMatch[1];

      const titleMatch = routeStr.match(/title:\s*['"`](.*?)['"`]/);
      if (titleMatch) route.title = titleMatch[1];

      const ssgMatch = routeStr.match(/ssg:\s*(true|false)/);
      if (ssgMatch) route.ssg = ssgMatch[1] === 'true';

      const metaMatch = routeStr.match(/meta:\s*\{[\s\S]*?\}/);
      if (metaMatch) {
        const metaStr = metaMatch[0];
        const descMatch = metaStr.match(/description:\s*['"`](.*?)['"`]/);
        const keywordsMatch = metaStr.match(/keywords:\s*['"`](.*?)['"`]/);

        route.meta = {};
        if (descMatch) route.meta.description = descMatch[1];
        if (keywordsMatch) route.meta.keywords = keywordsMatch[1];
      }

      if (route.path) routes.push(route);
    });
  } catch (error) {
    console.warn('Failed to parse route config:', error);
  }

  return routes;
}

async function generateSEOOptimizedHTML(route, assets, appConfig) {
  try {
    const pageTitle = route.title || appConfig.name;
    const pageDescription = route.meta?.description || appConfig.description;
    const pageKeywords = route.meta?.keywords || appConfig.keywords;

    // Handle base path in URLs
    const pageUrl = `${appConfig.website}${appConfig.basePath}${route.path}`;
    const canonicalUrl = pageUrl;
    const ogImage = `${appConfig.website}${appConfig.basePath}/og-image.png`;

    const publishedTime = new Date().toISOString();
    const modifiedTime = publishedTime;

    // 🔧 CRITICAL FIX: Handle asset paths with base path
    const getAssetPath = (assetPath) => {
      if (!assetPath) return '';
      // If we have a base path, prepend it to asset paths
      if (appConfig.basePath) {
        // Remove leading './' and add base path
        return `${appConfig.basePath}/${assetPath.replace(/^\.\//, '')}`;
      }
      return assetPath;
    };

    const html = `<!DOCTYPE html>
<html lang="${appConfig.language}" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 🔧 REMOVED: Base tag causes asset path issues with sub-paths -->
  
  <!-- Primary Meta Tags -->
  <title>${pageTitle}</title>
  <meta name="title" content="${pageTitle}">
  <meta name="description" content="${pageDescription}">
  <meta name="keywords" content="${pageKeywords}">
  <meta name="author" content="${appConfig.author}">
  <meta name="robots" content="index, follow">
  <meta name="language" content="${appConfig.language}">
  <meta name="revisit-after" content="7 days">
  <meta name="generator" content="Bloom Framework v${appConfig.version}">
  
  <!-- Geographic Tags -->
  <meta name="geo.region" content="${appConfig.region}">
  <meta name="geo.placename" content="${appConfig.region}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${appConfig.type}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDescription}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:alt" content="${pageTitle} - ${appConfig.name}">
  <meta property="og:site_name" content="${appConfig.name}">
  <meta property="og:locale" content="${appConfig.language}_${
      appConfig.region
    }">
  <meta property="article:author" content="${appConfig.author}">
  <meta property="article:published_time" content="${publishedTime}">
  <meta property="article:modified_time" content="${modifiedTime}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${pageUrl}">
  <meta property="twitter:title" content="${pageTitle}">
  <meta property="twitter:description" content="${pageDescription}">
  <meta property="twitter:image" content="${ogImage}">
  <meta property="twitter:image:alt" content="${pageTitle}">
  
  <!-- Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${pageTitle}",
    "description": "${pageDescription}",
    "url": "${pageUrl}",
    "author": {
      "@type": "Person",
      "name": "${appConfig.author}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "${appConfig.name}",
      "url": "${appConfig.website}"
    },
    "datePublished": "${publishedTime}",
    "dateModified": "${modifiedTime}",
    "inLanguage": "${appConfig.language}",
    "isPartOf": {
      "@type": "WebSite",
      "@id": "${appConfig.website}",
      "name": "${appConfig.name}",
      "url": "${appConfig.website}"
    }
  }
  </script>
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- DNS Prefetch -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="dns-prefetch" href="//fonts.gstatic.com">
  
  <!-- Favicon with base path -->
  <link rel="icon" type="image/svg+xml" href="${getAssetPath(
    './bloom-icon.svg'
  )}">
  <link rel="icon" type="image/x-icon" href="${getAssetPath('./favicon.ico')}">
  <link rel="apple-touch-icon" href="${getAssetPath('./apple-touch-icon.png')}">
  
  <!-- PWA Manifest with base path -->
  <link rel="manifest" href="${getAssetPath('./manifest.json')}">
  <meta name="theme-color" content="#0ea5e9">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="${appConfig.name}">
  
  <!-- Performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Styles with base path -->
  ${
    assets.mainCSS
      ? `<link rel="stylesheet" crossorigin href="${getAssetPath(
          assets.mainCSS
        )}">`
      : ''
  }
  
  <!-- Preload Critical Resources with base path -->
  ${
    assets.mainJS
      ? `<link rel="modulepreload" href="${getAssetPath(assets.mainJS)}">`
      : ''
  }
</head>
<body>
  <!-- Skip Navigation for Accessibility -->
  <a href="#main-content" class="bloom-skip-link">Skip to main content</a>
  
  <!-- Main App Container -->
  <div id="root">
    <!-- SEO-Friendly Loading State -->
    <main id="main-content" class="min-h-screen flex items-center justify-center bg-background">
      <div class="text-center max-w-md mx-auto p-6">
        <div class="text-6xl mb-6" role="img" aria-label="Bloom Framework">🌸</div>
        <h1 class="text-2xl font-bold mb-4 text-foreground">${pageTitle}</h1>
        <p class="text-muted-foreground mb-6">${pageDescription}</p>
        <div class="text-sm text-muted-foreground">Loading interactive content...</div>
      </div>
    </main>
  </div>
  
  <!-- Scripts with base path -->
  ${
    assets.mainJS
      ? `<script type="module" crossorigin src="${getAssetPath(
          assets.mainJS
        )}"></script>`
      : ''
  }
  
  <!-- No-JS Fallback -->
  <noscript>
    <div style="text-align: center; padding: 2rem; font-family: system-ui;">
      <h1>${pageTitle}</h1>
      <p>${pageDescription}</p>
      <p><strong>This site requires JavaScript to be enabled for full functionality.</strong></p>
    </div>
  </noscript>
</body>
</html>`;

    const outputPath = getOutputPath(route.path, appConfig.basePath);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html, 'utf8');

    console.log(
      `  ✅ SEO Generated: ${route.path} -> ${path.relative(
        process.cwd(),
        outputPath
      )}`
    );
  } catch (error) {
    console.error(`❌ Failed to generate SEO page ${route.path}:`, error);
  }
}

async function generateSEOFiles(routes, appConfig) {
  const distDir = path.join(process.cwd(), 'dist');

  // Enhanced sitemap.xml with base path support
  const sitemap = generateEnhancedSitemap(routes, appConfig);
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');

  // SEO-optimized robots.txt with base path
  const robots = generateSEORobotsTxt(appConfig);
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robots, 'utf8');

  // Enhanced PWA manifest
  const manifest = generateEnhancedManifest(appConfig);
  fs.writeFileSync(
    path.join(distDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  // Generate humans.txt
  const humans = generateHumansTxt(appConfig);
  fs.writeFileSync(path.join(distDir, 'humans.txt'), humans, 'utf8');

  // Generate security.txt
  const security = generateSecurityTxt(appConfig);
  fs.writeFileSync(path.join(distDir, 'security.txt'), security, 'utf8');

  console.log(
    '  ✅ SEO Files: sitemap.xml, robots.txt, manifest.json, humans.txt, security.txt'
  );
}

function generateEnhancedSitemap(routes, appConfig) {
  const now = new Date().toISOString().split('T')[0];

  const urls = routes
    .map((route) => {
      const priority = route.path === '/' ? '1.0' : '0.8';
      const changefreq = route.path === '/' ? 'weekly' : 'monthly';
      const fullUrl = `${appConfig.website}${appConfig.basePath}${route.path}`;

      return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

function generateSEORobotsTxt(appConfig) {
  const sitemapUrl = `${appConfig.website}${appConfig.basePath}/sitemap.xml`;
  const hostUrl =
    appConfig.website.replace('https://', '').replace('http://', '') +
    appConfig.basePath;

  return `# Bloom Framework - SEO Optimized Robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$

# Sitemap
Sitemap: ${sitemapUrl}

# Crawl-delay for specific bots
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 1

# Host
Host: ${hostUrl}
`;
}

function generateEnhancedManifest(appConfig) {
  return {
    name: appConfig.name,
    short_name: appConfig.name.split(' ')[0],
    description: appConfig.description,
    start_url: appConfig.basePath || '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0ea5e9',
    orientation: 'portrait-primary',
    scope: appConfig.basePath || '/',
    lang: appConfig.language,
    dir: 'ltr',
    categories: ['productivity', 'developer', 'business'],
    screenshots: [
      {
        src: './screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Homescreen of Bloom Framework',
      },
      {
        src: './screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Homescreen of Bloom Framework',
      },
    ],
    icons: [
      {
        src: './icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: './icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}

function generateHumansTxt(appConfig) {
  return `/* TEAM */
Developer: ${appConfig.author}
Contact: hello [at] bloom-framework.dev
From: Earth

/* THANKS */
Framework: Bloom Framework
UI Library: @voilajsx/uikit
Build Tool: Vite
CSS: Tailwind CSS

/* SITE */
Last update: ${new Date().toLocaleDateString()}
Language: English
Doctype: HTML5
IDE: Your favorite editor
Base Path: ${appConfig.basePath || 'Root'}
`;
}

function generateSecurityTxt(appConfig) {
  return `Contact: mailto:security@bloom-framework.dev
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Preferred-Languages: en
Canonical: ${appConfig.website}${appConfig.basePath}/security.txt
Policy: ${appConfig.website}${appConfig.basePath}/security-policy
`;
}

function extractDefaultValue(content, key) {
  const match = content.match(
    new RegExp(`['"\`]${key}['"\`]:\\s*['"\`](.*?)['"\`]`)
  );
  return match ? match[1] : null;
}

function getOutputPath(routePath, basePath) {
  const distDir = path.join(process.cwd(), 'dist');

  if (routePath === '/') {
    return path.join(distDir, 'index.html');
  }

  const cleanPath = routePath.replace(/^\//, '').replace(/\/$/, '');
  return path.join(distDir, cleanPath, 'index.html');
}

/**
 * Analyze SSG output to provide insights
 */
async function analyzeSSGOutput() {
  const distDir = path.join(process.cwd(), 'dist');
  const analysis = {
    pagesGenerated: 0,
    seoFiles: [],
    routes: [],
    totalSize: 0,
  };

  try {
    if (!fs.existsSync(distDir)) {
      throw new Error('Build output directory not found');
    }

    // Count HTML pages
    function countHTMLFiles(dir, basePath = '') {
      const files = fs.readdirSync(dir, { withFileTypes: true });

      for (const file of files) {
        const filePath = path.join(dir, file.name);
        const relativePath = path.join(basePath, file.name);

        if (file.isDirectory()) {
          countHTMLFiles(filePath, relativePath);
        } else if (file.name.endsWith('.html')) {
          analysis.pagesGenerated++;

          // Convert file path to route
          if (file.name === 'index.html') {
            const route = basePath === '' ? '/' : `/${basePath}`;
            analysis.routes.push(route);
          } else {
            const route = `/${relativePath.replace('.html', '')}`;
            analysis.routes.push(route);
          }
        }

        // Track SEO files
        if (
          [
            'sitemap.xml',
            'robots.txt',
            'manifest.json',
            'humans.txt',
            'security.txt',
          ].includes(file.name)
        ) {
          analysis.seoFiles.push(file.name);
        }

        // Calculate total size
        if (file.isFile()) {
          const stats = fs.statSync(filePath);
          analysis.totalSize += stats.size;
        }
      }
    }

    countHTMLFiles(distDir);

    // Format total size
    const formatSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
      return `${Math.round((bytes / (1024 * 1024)) * 100) / 100} MB`;
    };

    analysis.formattedSize = formatSize(analysis.totalSize);
  } catch (error) {
    console.warn('Analysis failed:', error.message);
  }

  return analysis;
}
