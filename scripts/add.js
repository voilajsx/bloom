/**
 * Bloom Framework - Beautiful Add Files to Feature CLI
 * 🌸 Add components, pages, hooks to existing features
 * @file scripts/add.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎨 Beautiful CLI Colors & Symbols (same as create-feature)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const symbols = {
  success: '✅',
  error: '❌',
  question: '❓',
  bloom: '🌸',
  sparkles: '✨',
  lightning: '⚡',
};

/**
 * 🎨 Beautiful console helpers
 */
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`${symbols.success} ${colors.green}${message}${colors.reset}`, 'white');
}

function logError(message) {
  log(`${symbols.error} ${colors.red}${message}${colors.reset}`, 'white');
}

/**
 * 🧠 Smart file type detection
 */
function detectFileType(fileName) {
  const lower = fileName.toLowerCase();

  // Hook detection
  if (lower.startsWith('use')) {
    return 'hook';
  }

  // Page detection
  if (lower.includes('page')) {
    return 'page';
  }

  // Component detection (default)
  return 'component';
}

/**
 * 🎨 Interactive file type selection
 */
async function askFileType() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(
      `${colors.yellow}${symbols.question} What type of file is this?${colors.reset}`
    );
    console.log(
      `  1. ${colors.cyan}Component${colors.reset} ${colors.gray}(UI element)${colors.reset}`
    );
    console.log(
      `  2. ${colors.cyan}Page${colors.reset} ${colors.gray}(route page)${colors.reset}`
    );
    console.log(
      `  3. ${colors.cyan}Hook${colors.reset} ${colors.gray}(business logic)${colors.reset}`
    );
    console.log();

    rl.question(`${colors.yellow}Choose (1-3): ${colors.reset}`, (answer) => {
      rl.close();

      switch (answer.trim()) {
        case '1':
          resolve('component');
        case '2':
          resolve('page');
        case '3':
          resolve('hook');
        default:
          resolve('component');
      }
    });
  });
}

/**
 * 📝 Generate component file
 */
function generateComponent(componentName, featureName) {
  const pascalName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);

  return `/**
 * ${featureName} Feature - ${pascalName} Component
 * @file components/${pascalName}.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';

interface ${pascalName}Props {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function ${pascalName}({ 
  title,
  children,
  className = ''
}: ${pascalName}Props) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {children || (
          <p className="text-muted-foreground">
            ${pascalName} component ready to customize.
          </p>
        )}
      </CardContent>
    </Card>
  );
}`;
}

/**
 * 📝 Generate page file
 */
function generatePage(pageName, featureName) {
  const pascalName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return `/**
 * ${featureName} Feature - ${pascalName}
 * @file pages/${pascalName}.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';

export default function ${pascalName}() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="py-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          ${pascalName}
        </h1>
        <p className="text-xl text-muted-foreground">
          Welcome to your new ${pageName.toLowerCase()} page.
        </p>
      </section>

      {/* Page Content */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>${pascalName} Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Start building your ${pageName.toLowerCase()} functionality here.
            </p>
            <div className="flex gap-3">
              <Button>Primary Action</Button>
              <Button variant="outline">Secondary Action</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}`;
}

/**
 * 📝 Generate hook file
 */
function generateHook(hookName, featureName) {
  const camelName = hookName.charAt(0).toLowerCase() + hookName.slice(1);

  return `/**
 * ${featureName} Feature - ${hookName} Hook
 * @file hooks/${hookName}.ts
 */

import { useState, useCallback } from 'react';

export function ${hookName}() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add your logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData({ message: '${hookName} executed successfully!' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}`;
}

/**
 * 🔄 Update feature routes (for pages only)
 */
function updateFeatureRoutes(featureDir, pageName, featureName) {
  const indexPath = path.join(featureDir, 'index.ts');

  if (!fs.existsSync(indexPath)) {
    console.warn('Feature index.ts not found, skipping route update');
    return;
  }

  const content = fs.readFileSync(indexPath, 'utf8');
  const pascalName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  const kebabName = featureName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const routePath = `/${kebabName}/${pageName
    .toLowerCase()
    .replace(/page$/, '')}`;

  // Find the routes array and add new route
  const routeEntry = `    {
      path: '${routePath}',
      component: () => import('./pages/${pascalName}'),
      layout: 'default',
      title: '${pascalName.replace(/Page$/, '')}',
      meta: {
        description: '${pascalName} page',
        keywords: '${featureName.toLowerCase()}, ${pageName.toLowerCase()}'
      },
      ssg: true
    }`;

  // Simple route insertion (before the closing bracket)
  const updatedContent = content.replace(/(\s*)\]/, `,\n${routeEntry}\n$1]`);

  fs.writeFileSync(indexPath, updatedContent, 'utf8');

  return routePath;
}

/**
 * 🚀 Main add function
 */
async function addFile() {
  try {
    const featureName = process.argv[2];
    const fileName = process.argv[3];

    if (!featureName || !fileName) {
      logError('Usage: npm run add <feature-name> <file-name>');
      log(`${colors.cyan}Examples:${colors.reset}`, 'white');
      log(`  npm run add products ProductCard`, 'white');
      log(`  npm run add users UserProfilePage`, 'white');
      log(`  npm run add auth useLogin`, 'white');
      process.exit(1);
    }

    // Check if feature exists
    const featureDir = path.join(process.cwd(), 'src/features', featureName);
    if (!fs.existsSync(featureDir)) {
      logError(`Feature '${featureName}' does not exist`);
      process.exit(1);
    }

    // Detect or ask for file type
    let fileType = detectFileType(fileName);

    // If detection is unclear, ask user
    if (
      !fileName.startsWith('use') &&
      !fileName.toLowerCase().includes('page')
    ) {
      fileType = await askFileType();
    }

    // Generate file content
    let content, filePath, routePath;
    const pascalName = fileName.charAt(0).toUpperCase() + fileName.slice(1);

    switch (fileType) {
      case 'component':
        content = generateComponent(fileName, featureName);
        filePath = path.join(featureDir, 'components', `${pascalName}.tsx`);
        break;

      case 'page':
        content = generatePage(fileName, featureName);
        filePath = path.join(featureDir, 'pages', `${pascalName}.tsx`);
        // Update routes
        routePath = updateFeatureRoutes(featureDir, fileName, featureName);
        break;

      case 'hook':
        content = generateHook(fileName, featureName);
        filePath = path.join(featureDir, 'hooks', `${fileName}.ts`);
        break;
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, content, 'utf8');

    // Beautiful success message
    console.clear();
    logSuccess(
      `${
        fileType.charAt(0).toUpperCase() + fileType.slice(1)
      } added successfully!`
    );
    console.log();

    log(
      `${symbols.bloom} ${colors.bright}File created:${colors.reset}`,
      'white'
    );
    log(
      `  ${colors.cyan}${path.relative(process.cwd(), filePath)}${
        colors.reset
      }`,
      'white'
    );

    if (routePath) {
      console.log();
      log(
        `${symbols.lightning} ${colors.bright}Route added:${colors.reset}`,
        'white'
      );
      log(`  ${colors.cyan}${routePath}${colors.reset}`, 'white');
    }

    console.log();
    log(
      `${symbols.sparkles} ${colors.gray}Ready to customize!${colors.reset}`,
      'white'
    );
  } catch (error) {
    logError(`Failed to add file: ${error.message}`);
    process.exit(1);
  }
}

// Run the add command
if (import.meta.url === `file://${process.argv[1]}`) {
  addFile();
}
