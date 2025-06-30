/**
 * Bloom Framework - Code Formatting
 * @file scripts/lib/format.js
 */

import fs from 'fs';
import path from 'path';
import {
  logSuccess,
  logError,
  logWarning,
  logBox,
  log,
  colors,
  symbols,
  Timer,
  Spinner,
} from './utils.js';

/**
 * Format code to Bloom patterns
 */
export async function runFormat(args) {
  const timer = new Timer();

  console.clear();

  logBox(`${symbols.code} Bloom Code Formatter`, [
    `${symbols.sparkles} Enforce LLM-friendly patterns`,
    `${symbols.lightning} Consistent imports and exports`,
    `${symbols.target} Hook and component standards`,
  ]);

  const spinner = new Spinner('Analyzing code patterns...');
  spinner.start();

  try {
    // Find all TypeScript/JavaScript files in features
    const files = await findFeatureFiles();
    spinner.stop(`Found ${files.length} files to analyze`);

    const results = {
      filesChecked: files.length,
      filesFixed: 0,
      patternsFixed: 0,
      warnings: [],
    };

    // Process each file
    log(`${symbols.lightning} Checking Bloom patterns...`, 'white');

    for (const filePath of files) {
      const fixed = await formatFile(filePath, args.includes('--fix'));
      if (fixed.modified) {
        results.filesFixed++;
        results.patternsFixed += fixed.patterns.length;
      }
      results.warnings.push(...fixed.warnings);
    }

    // Display results
    console.clear();
    timer.endWithMessage(`${symbols.check} Formatting check completed!`);

    if (results.filesFixed === 0) {
      logBox(
        `${symbols.check} All Files Follow Bloom Patterns`,
        [
          `${symbols.sparkles} ${results.filesChecked} files checked`,
          `${symbols.lightning} No formatting issues found`,
          `${symbols.target} Code is LLM-ready`,
        ],
        'green'
      );
    } else {
      logBox(
        `${symbols.magic} Formatting Applied`,
        [
          `${symbols.code} ${results.filesFixed} files updated`,
          `${symbols.sparkles} ${results.patternsFixed} patterns fixed`,
          `${symbols.lightning} Code is now LLM-optimized`,
        ],
        'blue'
      );
    }

    if (results.warnings.length > 0) {
      console.log();
      log(`${symbols.warning} Warnings:`, 'yellow');
      results.warnings.slice(0, 10).forEach((warning) => {
        log(`  • ${warning}`, 'yellow');
      });

      if (results.warnings.length > 10) {
        log(`  ... and ${results.warnings.length - 10} more`, 'gray');
      }
    }

    if (!args.includes('--fix') && results.filesFixed > 0) {
      console.log();
      logBox(
        'Auto-Fix Available',
        [
          'Run with --fix to automatically apply Bloom patterns:',
          'npm run bloom:format -- --fix',
        ],
        'blue'
      );
    }
  } catch (error) {
    spinner.fail('Formatting failed');
    logError(`Code formatting failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Find all feature files to format
 */
async function findFeatureFiles() {
  const files = [];
  const featuresDir = path.join(process.cwd(), 'src/features');

  if (!fs.existsSync(featuresDir)) {
    return files;
  }

  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.name.match(/\.(ts|tsx|js|jsx)$/)) {
        files.push(fullPath);
      }
    }
  }

  scanDirectory(featuresDir);
  return files;
}

/**
 * Format a single file according to Bloom patterns
 */
async function formatFile(filePath, shouldFix = false) {
  const result = {
    modified: false,
    patterns: [],
    warnings: [],
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    const relativePath = path.relative(process.cwd(), filePath);

    // Pattern 1: Import organization
    const importFix = fixImportOrder(newContent, relativePath);
    if (importFix.modified) {
      newContent = importFix.content;
      result.patterns.push('Import order');
    }
    result.warnings.push(...importFix.warnings);

    // Pattern 2: Hook patterns
    const hookFix = fixHookPatterns(newContent, relativePath);
    if (hookFix.modified) {
      newContent = hookFix.content;
      result.patterns.push('Hook patterns');
    }
    result.warnings.push(...hookFix.warnings);

    // Pattern 3: Component patterns
    const componentFix = fixComponentPatterns(newContent, relativePath);
    if (componentFix.modified) {
      newContent = componentFix.content;
      result.patterns.push('Component patterns');
    }
    result.warnings.push(...componentFix.warnings);

    // Pattern 4: Export patterns
    const exportFix = fixExportPatterns(newContent, relativePath);
    if (exportFix.modified) {
      newContent = exportFix.content;
      result.patterns.push('Export patterns');
    }
    result.warnings.push(...exportFix.warnings);

    // Write changes if modified and fix is enabled
    if (newContent !== content) {
      result.modified = true;

      if (shouldFix) {
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
    }
  } catch (error) {
    result.warnings.push(`${relativePath}: ${error.message}`);
  }

  return result;
}

/**
 * Fix import order according to Bloom patterns
 */
function fixImportOrder(content, filePath) {
  const result = { modified: false, content, warnings: [] };

  // Extract imports
  const importRegex = /^import\s+.*?from\s+['"`].*?['"`];?\s*$/gm;
  const imports = content.match(importRegex) || [];

  if (imports.length === 0) return result;

  // Categorize imports
  const categories = {
    react: [],
    external: [],
    internal: [],
    relative: [],
  };

  imports.forEach((imp) => {
    if (imp.includes("'react'") || imp.includes('"react"')) {
      categories.react.push(imp);
    } else if (imp.includes('@/')) {
      categories.internal.push(imp);
    } else if (imp.includes('./') || imp.includes('../')) {
      categories.relative.push(imp);
    } else {
      categories.external.push(imp);
    }
  });

  // Sort within categories
  Object.keys(categories).forEach((cat) => {
    categories[cat].sort();
  });

  // Build new import section
  const newImports = [
    ...categories.react,
    ...categories.external,
    ...categories.internal,
    ...categories.relative,
  ].join('\n');

  // Replace imports section
  const firstImport = imports[0];
  const lastImport = imports[imports.length - 1];

  if (firstImport && lastImport) {
    const importSection = content.substring(
      content.indexOf(firstImport),
      content.indexOf(lastImport) + lastImport.length
    );

    if (importSection !== newImports) {
      result.content = content.replace(importSection, newImports);
      result.modified = true;
    }
  }

  return result;
}

/**
 * Fix hook patterns according to Bloom standards
 */
function fixHookPatterns(content, filePath) {
  const result = { modified: false, content, warnings: [] };

  // Check if this is a hook file
  if (!filePath.includes('/hooks/') && !content.includes('function use')) {
    return result;
  }

  let newContent = content;

  // Pattern: Hook return object structure
  const hookReturnRegex = /return\s*{[\s\S]*?};/g;
  const returns = newContent.match(hookReturnRegex) || [];

  returns.forEach((returnStatement) => {
    // Check if return follows Bloom pattern (state, actions, utilities)
    if (!returnStatement.includes('//')) {
      const formatted = returnStatement.replace(
        /return\s*{([\s\S]*?)};/,
        `return {
    // State$1
    // Actions
    
    // Utilities
  };`
      );

      if (formatted !== returnStatement) {
        newContent = newContent.replace(returnStatement, formatted);
        result.modified = true;
      }
    }
  });

  result.content = newContent;
  return result;
}

/**
 * Fix component patterns according to Bloom standards
 */
function fixComponentPatterns(content, filePath) {
  const result = { modified: false, content, warnings: [] };

  // Check if this is a component file
  if (!filePath.includes('/components/') && !filePath.includes('/pages/')) {
    return result;
  }

  let newContent = content;

  // Check for semantic color usage
  const colorRegex = /(bg-white|text-black|border-gray-\d+)/g;
  const hardcodedColors = newContent.match(colorRegex) || [];

  if (hardcodedColors.length > 0) {
    result.warnings.push(
      `${filePath}: Use semantic colors (bg-background, text-foreground) instead of hardcoded colors`
    );
  }

  // Check for proper export pattern
  if (!newContent.includes('export default function')) {
    result.warnings.push(
      `${filePath}: Use 'export default function ComponentName()' pattern`
    );
  }

  result.content = newContent;
  return result;
}

/**
 * Fix export patterns according to Bloom standards
 */
function fixExportPatterns(content, filePath) {
  const result = { modified: false, content, warnings: [] };

  // Ensure proper default export for components
  if (filePath.includes('/components/') || filePath.includes('/pages/')) {
    if (!content.includes('export default')) {
      result.warnings.push(
        `${filePath}: Components should have default export`
      );
    }
  }

  // Ensure named exports for hooks
  if (filePath.includes('/hooks/')) {
    const hookFunctions = content.match(/export function use\w+/g) || [];
    if (hookFunctions.length === 0 && content.includes('function use')) {
      result.warnings.push(
        `${filePath}: Hooks should be exported with 'export function'`
      );
    }
  }

  return result;
}
