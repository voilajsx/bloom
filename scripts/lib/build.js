/**
 * Bloom Framework - Production Build
 * @file scripts/lib/build.js
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
 * Build for production
 */
export async function runBuild(args) {
  const timer = new Timer();

  console.clear();

  logBox(`${symbols.fire} Building for Production`, [
    `${symbols.lightning} Optimized bundle splitting`,
    `${symbols.performance} Performance optimizations`,
    `${symbols.security} Security headers included`,
  ]);

  try {
    // Pre-build checks
    log(`${symbols.bloom} Running pre-build checks...`, 'white');

    await runPreBuildChecks();
    logSuccess('Pre-build checks passed');

    // Clean previous build
    log(`${symbols.code} Cleaning previous build...`, 'white');
    const distDir = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    logSuccess('Previous build cleaned');

    // Run Vite build
    log(`${symbols.fire} Building optimized bundle...`, 'white');

    const buildArgs = [...args.filter((arg) => !arg.startsWith('--bloom'))];

    const env = {
      ...process.env,
      NODE_ENV: 'production',
      BLOOM_BUILD: 'true',
    };

    if (args.includes('--analyze')) {
      env.ANALYZE = 'true';
    }

    const buildCommand = `vite build ${buildArgs.join(' ')}`;
    execSync(buildCommand, {
      stdio: 'inherit',
      env,
    });

    // Post-build analysis
    log(`${symbols.performance} Analyzing build...`, 'white');
    const analysis = await analyzeBuild();

    // Success output
    console.clear();
    timer.endWithMessage(`${symbols.check} Build completed successfully!`);

    logBox(
      `${symbols.rocket} Production Build Ready`,
      [
        `${symbols.fire} Bundle size: ${analysis.totalSize}`,
        `${symbols.lightning} Gzipped: ${analysis.gzippedSize}`,
        `${symbols.sparkles} ${analysis.chunkCount} optimized chunks`,
      ],
      'green'
    );

    logSuccess(`Build output: ${colors.cyan}dist/${colors.reset}`);

    if (analysis.warnings.length > 0) {
      console.log();
      log(`${symbols.warning} Build warnings:`, 'yellow');
      analysis.warnings.forEach((warning) => {
        log(`  • ${warning}`, 'yellow');
      });
    }

    console.log();
    logBox(
      'Next Steps',
      [
        '1. Run npm run bloom:ssg for static generation',
        '2. Test with npm run preview',
        '3. Deploy the dist/ folder',
        '4. Monitor performance in production',
      ],
      'blue'
    );
  } catch (error) {
    logError(`Build failed: ${error.message}`);

    // Helpful error messages
    if (error.message.includes('out of memory')) {
      log('Build ran out of memory. Try:', 'white');
      log('  export NODE_OPTIONS="--max-old-space-size=4096"', 'cyan');
    } else if (error.message.includes('TypeScript')) {
      log('TypeScript errors found. Fix them or use:', 'white');
      log('  npm run bloom:build -- --skip-type-check', 'cyan');
    }

    process.exit(1);
  }
}

/**
 * Pre-build validation checks
 */
async function runPreBuildChecks() {
  // Check if dependencies are installed
  if (!fs.existsSync('node_modules')) {
    throw new Error('Dependencies not installed. Run: npm install');
  }

  // Check if features exist
  if (!fs.existsSync('src/features')) {
    throw new Error('No features found. Create at least one feature first.');
  }

  // Check if main files exist
  const requiredFiles = ['src/main.ts', 'src/app.tsx', 'index.html'];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file missing: ${file}`);
    }
  }

  // Validate feature configs
  const featuresDir = path.join(process.cwd(), 'src/features');
  const entries = fs.readdirSync(featuresDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      const indexPath = path.join(featuresDir, entry.name, 'index.ts');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        if (!content.includes('BloomFeatureConfig')) {
          throw new Error(`Invalid feature config: ${entry.name}/index.ts`);
        }
      }
    }
  }
}

/**
 * Analyze build output
 */
async function analyzeBuild() {
  const distDir = path.join(process.cwd(), 'dist');
  const analysis = {
    totalSize: '0 KB',
    gzippedSize: '0 KB',
    chunkCount: 0,
    warnings: [],
  };

  try {
    if (!fs.existsSync(distDir)) {
      throw new Error('Build output not found');
    }

    // Calculate total size
    let totalBytes = 0;
    let chunkCount = 0;

    function calculateDirSize(dir) {
      const files = fs.readdirSync(dir, { withFileTypes: true });

      for (const file of files) {
        const filePath = path.join(dir, file.name);

        if (file.isDirectory()) {
          calculateDirSize(filePath);
        } else {
          const stats = fs.statSync(filePath);
          totalBytes += stats.size;

          if (file.name.endsWith('.js') || file.name.endsWith('.css')) {
            chunkCount++;
          }
        }
      }
    }

    calculateDirSize(distDir);

    // Format sizes
    const formatSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
      return `${Math.round((bytes / (1024 * 1024)) * 100) / 100} MB`;
    };

    analysis.totalSize = formatSize(totalBytes);
    analysis.gzippedSize = formatSize(Math.round(totalBytes * 0.3)); // Estimate
    analysis.chunkCount = chunkCount;

    // Check for potential issues
    if (totalBytes > 1024 * 1024) {
      // > 1MB
      analysis.warnings.push('Bundle size is large. Consider code splitting.');
    }

    if (chunkCount > 20) {
      analysis.warnings.push(
        'Many chunks generated. Check bundle splitting strategy.'
      );
    }

    // Check for common files
    const requiredFiles = ['index.html'];
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(distDir, file))) {
        analysis.warnings.push(`Missing file: ${file}`);
      }
    }
  } catch (error) {
    analysis.warnings.push(`Analysis failed: ${error.message}`);
  }

  return analysis;
}
