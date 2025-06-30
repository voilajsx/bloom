#!/usr/bin/env node

/**
 * Bloom Framework - Unified CLI Entry Point
 * 🌸 One command to rule them all
 * @file scripts/bloom.js
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { showHelp } from './lib/help.js';
import { runDev } from './lib/dev.js';
import { runBuild } from './lib/build.js';
import { runPreview } from './lib/preview.js';
import { runSSG } from './lib/ssg.js';
import { runCheck } from './lib/check.js';
import { runCreate } from './lib/create.js';
import { runAdd } from './lib/add.js';
import { runFormat } from './lib/format.js';
import { runContracts } from './lib/contracts.js';
import { runSecurity } from './lib/security.js';
import { runDoctor } from './lib/doctor.js';
import { logError, logBox } from './lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Command mapping
const commands = {
  dev: runDev,
  build: runBuild,
  preview: runPreview,
  ssg: runSSG,
  check: runCheck,
  create: runCreate,
  add: runAdd,
  format: runFormat,
  contracts: runContracts,
  security: runSecurity,
  doctor: runDoctor,
  help: showHelp,
};

/**
 * Main CLI entry point
 */
async function main() {
  const [, , command, ...args] = process.argv;

  // Show help if no command or help requested
  if (
    !command ||
    command === 'help' ||
    command === '--help' ||
    command === '-h'
  ) {
    showHelp();
    return;
  }

  // Check if command exists
  if (!commands[command]) {
    console.clear();
    logBox(
      '🌸 Unknown Command',
      [
        `Command "${command}" not recognized`,
        '',
        'Run "npm run bloom" to see available commands',
      ],
      'red'
    );
    process.exit(1);
  }

  try {
    // Run the command
    await commands[command](args);
  } catch (error) {
    logError(`Command failed: ${error.message}`);

    if (process.env.DEBUG) {
      console.error('Full error:', error);
    }

    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
