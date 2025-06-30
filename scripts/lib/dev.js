/**
 * Bloom Framework - Development Server
 * @file scripts/lib/dev.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
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
 * Start development server
 */
export async function runDev(args) {
  const timer = new Timer();

  console.clear();

  logBox(`${symbols.rocket} Starting Bloom Development`, [
    `${symbols.lightning} Hot reload enabled`,
    `${symbols.bloom} Feature auto-discovery`,
    `${symbols.security} Security headers included`,
  ]);

  try {
    // Pre-flight checks
    log(`${symbols.bloom} Running pre-flight checks...`, 'white');

    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      logError('Dependencies not installed. Run: npm install');
      return;
    }

    // Check if src/features exists
    if (!fs.existsSync('src/features')) {
      logError(
        'Features directory not found. Run: npm run bloom:create your-first-feature'
      );
      return;
    }

    logSuccess('Pre-flight checks passed');

    // Start Vite development server
    log(`${symbols.lightning} Starting Vite development server...`, 'white');

    const viteArgs = [
      '--host',
      '--open',
      ...args.filter((arg) => !arg.startsWith('--bloom')),
    ];

    // Add bloom-specific development flags
    const env = {
      ...process.env,
      BLOOM_DEV: 'true',
      BLOOM_HOT_RELOAD: 'true',
    };

    if (args.includes('--debug')) {
      env.DEBUG = 'bloom:*';
    }

    timer.endWithMessage('Development server starting...');

    // Execute Vite with bloom environment
    execSync(`vite ${viteArgs.join(' ')}`, {
      stdio: 'inherit',
      env,
    });
  } catch (error) {
    if (error.status === 130) {
      // Ctrl+C - normal exit
      console.log();
      logSuccess('Development server stopped');
    } else {
      logError(`Development server failed: ${error.message}`);

      // Helpful error messages
      if (error.message.includes('EADDRINUSE')) {
        log('Port is already in use. Try:', 'white');
        log('  npm run bloom:dev -- --port 3001', 'cyan');
      } else if (error.message.includes('ENOENT')) {
        log('Vite not found. Try:', 'white');
        log('  npm install', 'cyan');
      }
    }
  }
}
