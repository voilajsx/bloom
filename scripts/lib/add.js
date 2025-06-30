/**
 * Bloom Framework - Enhanced Add to Feature
 * @file scripts/lib/add.js
 */

import fs from 'fs';
import path from 'path';
import {
  logSuccess,
  logError,
  logBox,
  log,
  colors,
  symbols,
  selectFromOptions,
  toPascalCase,
  Timer,
} from './utils.js';
import { showAddHelp } from './help.js';

// 🎯 Item Types for Adding to Features
const ITEM_TYPES = {
  component: {
    name: 'Component',
    description: 'Reusable UI component',
    icon: '🧩',
    folder: 'components',
    extension: '.tsx',
  },
  page: {
    name: 'Page',
    description: 'Route page component',
    icon: '📄',
    folder: 'pages',
    extension: '.tsx',
  },
  hook: {
    name: 'Hook',
    description: 'Business logic hook',
    icon: '🎣',
    folder: 'hooks',
    extension: '.ts',
  },
  type: {
    name: 'Types',
    description: 'TypeScript type definitions',
    icon: '📝',
    folder: '',
    extension: '.ts',
    filename: 'types.ts',
  },
  util: {
    name: 'Utility',
    description: 'Helper function or utility',
    icon: '🔧',
    folder: 'utils',
    extension: '.ts',
  },
};

/**
 * Main add command handler
 */
export async function runAdd(args) {
  const timer = new Timer();

  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    showAddHelp();
    return;
  }

  const featureName = args[0];
  const itemName = args[1];

  if (!featureName || !itemName) {
    logError('Usage: npm run bloom:add <feature-name> <item-name>');
    log(`${colors.cyan}Examples:${colors.reset}`, 'white');
    log(`  npm run bloom:add quotes QuoteCard`, 'white');
    log(`  npm run bloom:add users UserProfilePage`, 'white');
    log(`  npm run bloom:add auth useLogin`, 'white');
    return;
  }

  try {
    // Check if feature exists
    const featureDir = path.join(process.cwd(), 'src/features', featureName);
    if (!fs.existsSync(featureDir)) {
      logError(`Feature '${featureName}' does not exist`);
      log(
        `Run: ${colors.cyan}npm run bloom:create ${featureName}${colors.reset}`,
        'white'
      );
      return;
    }

    console.clear();

    logBox(`${symbols.code} Adding to ${featureName}`, [
      `${symbols.sparkles} Smart detection and template generation`,
      `${symbols.lightning} Consistent patterns and integrations`,
    ]);

    // Detect or select item type
    let itemType = detectItemType(itemName);

    // If detection is unclear, ask user
    if (!itemType || args.includes('--interactive')) {
      itemType = await selectItemType();
    }

    // Generate the item
    const result = await generateItem(
      featureName,
      itemName,
      itemType,
      featureDir
    );

    // Success output
    console.clear();
    timer.endWithMessage(`${symbols.check} Item added successfully!`);

    logBox(
      `${symbols.magic} ${itemName} is Ready!`,
      [
        `${symbols.sparkles} Added to ${featureName} feature`,
        `${symbols.fire} LLM-optimized patterns included`,
        `${symbols.lightning} Ready for customization`,
      ],
      'green'
    );

    logSuccess(
      `File created: ${colors.cyan}${result.relativePath}${colors.reset}`
    );

    if (result.routePath) {
      console.log();
      log(
        `${symbols.rocket} ${colors.bright}Route added:${colors.reset}`,
        'white'
      );
      log(`  ${colors.cyan}${result.routePath}${colors.reset}`, 'white');
    }

    if (result.updateInstructions) {
      console.log();
      logBox('Next Steps', result.updateInstructions, 'blue');
    }

    console.log();
    log(
      `${symbols.bloom} ${colors.bright}Happy coding!${colors.reset}`,
      'white'
    );
  } catch (error) {
    console.clear();
    logError(`Failed to add item: ${error.message}`);

    if (process.env.DEBUG) {
      console.error('Full error:', error);
    }

    process.exit(1);
  }
}

/**
 * Smart item type detection
 */
function detectItemType(itemName) {
  const lower = itemName.toLowerCase();

  // Hook detection
  if (lower.startsWith('use')) {
    return 'hook';
  }

  // Page detection
  if (lower.includes('page')) {
    return 'page';
  }

  // Type detection
  if (lower.includes('type') || lower.includes('interface')) {
    return 'type';
  }

  // Util detection
  if (lower.includes('util') || lower.includes('helper')) {
    return 'util';
  }

  // Default to component
  return 'component';
}

/**
 * Interactive item type selection
 */
async function selectItemType() {
  logBox(`${symbols.target} Choose Item Type`, [
    'What type of item are you adding?',
    'Each type has optimized templates',
  ]);

  const options = Object.entries(ITEM_TYPES).map(([key, config]) => ({
    key,
    text: `${config.icon} ${config.name.padEnd(12)} ${colors.gray}${
      config.description
    }${colors.reset}`,
  }));

  const selected = await selectFromOptions(options);
  return selected.key;
}

/**
 * Generate item based on type
 */
async function generateItem(featureName, itemName, itemType, featureDir) {
  const config = ITEM_TYPES[itemType];
  const pascalName = toPascalCase(itemName);

  // Determine file path
  let filePath;
  let fileName;

  if (config.filename) {
    // Special case like types.ts
    fileName = config.filename;
    filePath = path.join(featureDir, fileName);
  } else {
    fileName = `${pascalName}${config.extension}`;
    const folder = config.folder;

    if (folder) {
      const folderPath = path.join(featureDir, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      filePath = path.join(folderPath, fileName);
    } else {
      filePath = path.join(featureDir, fileName);
    }
  }

  // Generate content based on type
  let content;
  let routePath = null;
  let updateInstructions = null;

  switch (itemType) {
    case 'component':
      content = generateComponentTemplate(pascalName, featureName);
      updateInstructions = [
        '1. Import and use in your pages',
        '2. Customize props and styling',
        '3. Add to feature exports if needed',
      ];
      break;

    case 'page':
      content = generatePageTemplate(pascalName, featureName);
      routePath = updateFeatureRoutes(featureDir, pascalName, featureName);
      updateInstructions = [
        '1. Route automatically added to feature config',
        '2. Customize page content and layout',
        '3. Add navigation link if needed',
      ];
      break;

    case 'hook':
      content = generateHookTemplate(itemName, featureName);
      updateInstructions = [
        '1. Import in components that need this logic',
        '2. Customize hook implementation',
        '3. Add to feature exports if shared',
      ];
      break;

    case 'type':
      content = generateTypesTemplate(featureName);
      updateInstructions = [
        '1. Add your TypeScript interfaces and types',
        '2. Import in components and hooks',
        '3. Export shared types from feature index',
      ];
      break;

    case 'util':
      content = generateUtilTemplate(pascalName, featureName);
      updateInstructions = [
        '1. Implement utility functions',
        '2. Import where needed',
        '3. Add tests for complex utilities',
      ];
      break;
  }

  // Write the file
  fs.writeFileSync(filePath, content, 'utf8');

  return {
    filePath,
    relativePath: path.relative(process.cwd(), filePath),
    routePath,
    updateInstructions,
  };
}

/**
 * Template generators
 */
function generateComponentTemplate(pascalName, featureName) {
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

function generatePageTemplate(pascalName, featureName) {
  return `/**
 * ${featureName} Feature - ${pascalName}
 * @file pages/${pascalName}.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';

export default function ${pascalName}() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="py-8">
        <Badge variant="secondary" className="mb-4">
          ${featureName}
        </Badge>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          ${pascalName.replace(/Page$/, '')}
        </h1>
        <p className="text-xl text-muted-foreground">
          Welcome to your new ${pascalName
            .toLowerCase()
            .replace(/page$/, '')} page.
        </p>
      </section>

      {/* Page Content */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>${pascalName.replace(/Page$/, '')} Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Start building your ${pascalName
                .toLowerCase()
                .replace(/page$/, '')} functionality here.
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

function generateHookTemplate(hookName, featureName) {
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

function generateTypesTemplate(featureName) {
  return `/**
 * ${featureName} Feature - Type Definitions
 * @file types.ts
 */

// Main data types
export interface ${toPascalCase(featureName)}Item {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// State types
export interface ${toPascalCase(featureName)}State {
  items: ${toPascalCase(featureName)}Item[];
  loading: boolean;
  error: string | null;
}

// Action types
export interface ${toPascalCase(featureName)}Actions {
  loadItems: () => Promise<void>;
  addItem: (item: Omit<${toPascalCase(
    featureName
  )}Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<${toPascalCase(
    featureName
  )}Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

// Component prop types
export interface ${toPascalCase(featureName)}ComponentProps {
  item: ${toPascalCase(featureName)}Item;
  onUpdate?: (item: ${toPascalCase(featureName)}Item) => void;
  onDelete?: (id: string) => void;
}`;
}

function generateUtilTemplate(pascalName, featureName) {
  return `/**
 * ${featureName} Feature - ${pascalName} Utility
 * @file utils/${pascalName}.ts
 */

/**
 * ${pascalName} utility function
 */
export function ${
    pascalName.charAt(0).toLowerCase() + pascalName.slice(1)
  }(input: any): any {
  // Add your utility logic here
  return input;
}

/**
 * Helper function for ${featureName} feature
 */
export function validate${pascalName}(data: any): boolean {
  // Add validation logic here
  return !!data;
}

/**
 * Format ${pascalName} for display
 */
export function format${pascalName}(data: any): string {
  // Add formatting logic here
  return String(data);
}`;
}

/**
 * Update feature routes for new pages
 */
function updateFeatureRoutes(featureDir, pageName, featureName) {
  const indexPath = path.join(featureDir, 'index.ts');

  if (!fs.existsSync(indexPath)) {
    console.warn('Feature index.ts not found, skipping route update');
    return null;
  }

  const content = fs.readFileSync(indexPath, 'utf8');
  const cleanPageName = pageName.replace(/Page$/, '');
  const routePath = `/${featureName}/${cleanPageName.toLowerCase()}`;

  // Find the routes array and add new route
  const routeEntry = `    {
      path: '${routePath}',
      component: () => import('./pages/${pageName}'),
      layout: 'default',
      title: '${cleanPageName}',
      meta: {
        description: '${cleanPageName} page',
        keywords: '${featureName.toLowerCase()}, ${cleanPageName.toLowerCase()}'
      },
      ssg: true
    }`;

  // Simple route insertion (before the closing bracket)
  let updatedContent = content;

  // If routes array exists, add to it
  if (content.includes('routes: [')) {
    updatedContent = content.replace(
      /(routes:\s*\[[\s\S]*?)(\s*\])/,
      `$1,\n${routeEntry}\n$2`
    );
  } else {
    // If no routes array, add it
    updatedContent = content.replace(
      /(contract:[\s\S]*?\.build\(\),)/,
      `$1\n\n  routes: [\n${routeEntry}\n  ],`
    );
  }

  fs.writeFileSync(indexPath, updatedContent, 'utf8');
  return routePath;
}
