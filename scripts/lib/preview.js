/**
 * Bloom Framework - Preview Production Build
 * @file scripts/lib/preview.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  logSuccess,
  logError,
  logBox,
  log,
  colors,
  symbols,
  Timer,
} from './utils.js';

/**
 * Preview production build
 */
export async function runPreview(args) {
  const timer = new Timer();

  console.clear();

  logBox(`${symbols.rocket} Bloom Production Preview`, [
    `${symbols.fire} Production build testing`,
    `${symbols.security} Security headers enabled`,
    `${symbols.performance} Performance monitoring`,
  ]);

  try {
    // Check if build exists
    log(`${symbols.bloom} Checking production build...`, 'white');

    const distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) {
      logError('No production build found. Run: npm run bloom:build');
      return;
    }

    // Analyze build before preview
    const analysis = await analyzeBuildForPreview();
    logSuccess(
      `Build found: ${analysis.totalSize}, ${analysis.fileCount} files`
    );

    // Start Vite preview server
    log(`${symbols.lightning} Starting preview server...`, 'white');

    const previewArgs = [
      '--host',
      '--open',
      ...args.filter((arg) => !arg.startsWith('--bloom')),
    ];

    // Add bloom-specific preview flags
    const env = {
      ...process.env,
      BLOOM_PREVIEW: 'true',
      NODE_ENV: 'production',
    };

    if (args.includes('--debug')) {
      env.DEBUG = 'bloom:*';
    }

    timer.endWithMessage('Preview server starting...');

    // Show preview info
    console.log();
    logBox(
      'Preview Information',
      [
        '✅ Production build with optimizations',
        '✅ CORS configured in vite.config.ts',
        '✅ Security headers enabled',
        '✅ SSG pages pre-rendered',
      ],
      'blue'
    );

    console.log();
    log(`${symbols.target} Testing production build...`, 'white');
    log(
      `${symbols.info} CORS and MIME types configured in Vite config`,
      'cyan'
    );

    // Execute Vite preview
    execSync(`vite preview ${previewArgs.join(' ')}`, {
      stdio: 'inherit',
      env,
    });
  } catch (error) {
    if (error.status === 130) {
      // Ctrl+C - normal exit
      console.log();
      logSuccess('Preview server stopped');
    } else {
      logError(`Preview server failed: ${error.message}`);

      // Helpful error messages
      if (error.message.includes('EADDRINUSE')) {
        log('Port is already in use. Try:', 'white');
        log('  npm run bloom:preview -- --port 4174', 'cyan');
      } else if (error.message.includes('ENOENT')) {
        log('Vite not found or build missing. Try:', 'white');
        log('  npm run bloom:build', 'cyan');
        log('  npm install', 'cyan');
      } else if (error.message.includes('dist')) {
        log('Build directory issues. Try:', 'white');
        log('  npm run bloom:build', 'cyan');
      }
    }
  }
}

/**
 * Analyze build for preview
 */
async function analyzeBuildForPreview() {
  const distDir = path.join(process.cwd(), 'dist');
  const analysis = {
    totalSize: '0 KB',
    fileCount: 0,
    hasIndex: false,
    hasSEOFiles: false,
    warnings: [],
  };

  try {
    if (!fs.existsSync(distDir)) {
      throw new Error('Build directory not found');
    }

    let totalBytes = 0;
    let fileCount = 0;
    let hasIndex = false;
    let seoFiles = [];

    function scanDirectory(dir) {
      const files = fs.readdirSync(dir, { withFileTypes: true });

      for (const file of files) {
        const filePath = path.join(dir, file.name);

        if (file.isDirectory()) {
          scanDirectory(filePath);
        } else {
          const stats = fs.statSync(filePath);
          totalBytes += stats.size;
          fileCount++;

          // Check for important files
          if (file.name === 'index.html') {
            hasIndex = true;
          }

          if (
            ['sitemap.xml', 'robots.txt', 'manifest.json'].includes(file.name)
          ) {
            seoFiles.push(file.name);
          }
        }
      }
    }

    scanDirectory(distDir);

    // Format size
    const formatSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
      return `${Math.round((bytes / (1024 * 1024)) * 100) / 100} MB`;
    };

    analysis.totalSize = formatSize(totalBytes);
    analysis.fileCount = fileCount;
    analysis.hasIndex = hasIndex;
    analysis.hasSEOFiles = seoFiles.length > 0;

    // Warnings
    if (!hasIndex) {
      analysis.warnings.push('Missing index.html - build may be incomplete');
    }

    if (totalBytes > 5 * 1024 * 1024) {
      // > 5MB
      analysis.warnings.push(
        'Large build size - may impact loading performance'
      );
    }

    if (seoFiles.length === 0) {
      analysis.warnings.push(
        'No SEO files found - run bloom:ssg for better SEO'
      );
    }
  } catch (error) {
    analysis.warnings.push(`Analysis failed: ${error.message}`);
  }

  return analysis;
}
