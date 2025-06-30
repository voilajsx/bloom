/**
 * Bloom Framework - Enhanced Feature Creation
 * @file scripts/lib/create.js
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
  askYesNo,
  toPascalCase,
  toKebabCase,
  Timer,
} from './utils.js';
import { showCreateHelp } from './help.js';

// 🎯 Feature Types with Enhanced Descriptions
const FEATURE_TYPES = {
  page: {
    name: 'Page',
    description: 'Static content (about, home, landing)',
    icon: '📄',
    needsRedux: false,
    layout: 'page',
    complexity: 'Simple',
  },
  api: {
    name: 'API',
    description: 'Data & backend integration',
    icon: '🔌',
    needsRedux: true,
    layout: 'admin',
    complexity: 'Advanced',
  },
  form: {
    name: 'Form',
    description: 'User input with validation',
    icon: '📝',
    needsRedux: false,
    layout: 'page',
    complexity: 'Medium',
  },
  dashboard: {
    name: 'Dashboard',
    description: 'Admin panels & analytics',
    icon: '📊',
    needsRedux: true,
    layout: 'admin',
    complexity: 'Advanced',
  },
  component: {
    name: 'Component',
    description: 'Reusable UI elements',
    icon: '🧩',
    needsRedux: false,
    layout: null,
    noRoute: true,
    complexity: 'Simple',
  },
  auth: {
    name: 'Authentication',
    description: 'User login & security',
    icon: '🔐',
    needsRedux: true,
    layout: 'auth',
    complexity: 'Advanced',
  },
};

/**
 * Main create command handler
 */
export async function runCreate(args) {
  const timer = new Timer();

  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    showCreateHelp();
    return;
  }

  const featureName = args[0];

  if (!featureName) {
    logError('Please provide a feature name:');
    log(
      `${colors.cyan}npm run bloom:create my-feature${colors.reset}`,
      'white'
    );
    return;
  }

  try {
    console.clear();

    logBox(`${symbols.magic} Creating Feature: ${featureName}`, [
      `${symbols.sparkles} Smart templates with perfect integrations`,
      `${symbols.lightning} LLM-optimized patterns and contracts`,
    ]);

    // Step 1: Select feature type
    const featureType = await selectFeatureType();
    const config = FEATURE_TYPES[featureType];

    // Step 2: Configure state management
    let useRedux = config.needsRedux;
    if (config.needsRedux) {
      console.clear();
      logBox(`${symbols.performance} State Management`, [
        `${config.name} features can use Redux for shared state`,
        'Recommended for complex data and cross-feature communication',
      ]);
      useRedux = await askYesNo('Use Redux for shared state?', true);
    }

    // Step 3: Navigation integration
    let addToNav = false;
    if (!config.noRoute) {
      console.clear();
      logBox(`${symbols.rocket} Navigation Integration`, [
        'Add this feature to the app navigation menu?',
        'Users will be able to navigate to this feature',
      ]);
      addToNav = await askYesNo('Add to navigation?', true);
    }

    // Step 4: Security options
    console.clear();
    logBox(`${symbols.security} Security Configuration`, [
      'Configure security patterns for this feature',
      'Recommended for all production features',
    ]);
    const enableSecurity = await askYesNo('Enable security patterns?', true);

    // Generate the feature
    console.clear();
    logBox(`${symbols.lightning} Generating Feature`, [
      'Creating files with Bloom patterns...',
      'This will take just a moment',
    ]);

    const options = {
      useRedux,
      addToNav,
      enableSecurity,
      layout: config.layout,
    };

    const result = await generateFeatureFiles(
      featureName,
      featureType,
      options
    );

    // Success output
    console.clear();
    timer.endWithMessage(`${symbols.rocket} Feature created successfully!`);

    logBox(
      `${symbols.check} ${featureName} is Ready!`,
      [
        `${symbols.sparkles} ${result.files.length} files generated`,
        `${symbols.fire} Zero configuration needed`,
        `${symbols.lightning} LLM-optimized patterns included`,
      ],
      'green'
    );

    logSuccess(
      `Feature created: ${colors.cyan}${result.featureDir}${colors.reset}`
    );
    console.log();

    log(`${colors.bright}Generated files:${colors.reset}`, 'white');
    result.files.forEach((file) => {
      log(`  ${symbols.check} ${colors.gray}${file}${colors.reset}`, 'white');
    });
    console.log();

    if (addToNav) {
      log(
        `${symbols.info} Remember to add the route to your navigation!`,
        'white'
      );
    }

    logBox(
      'Next Steps',
      [
        '1. Run npm run bloom:dev to see your feature',
        '2. Customize the generated components',
        '3. Add your business logic to hooks',
        '4. Run npm run bloom:check to validate',
      ],
      'blue'
    );

    log(
      `${symbols.bloom} ${colors.bright}Happy coding!${colors.reset}`,
      'white'
    );
  } catch (error) {
    console.clear();
    logError(`Feature creation failed: ${error.message}`);

    if (process.env.DEBUG) {
      console.error('Full error:', error);
    }

    process.exit(1);
  }
}

/**
 * Interactive feature type selection
 */
async function selectFeatureType() {
  logBox(`${symbols.target} Choose Feature Type`, [
    'Select the type that best matches your needs',
    'Each type includes optimized templates and patterns',
  ]);

  const options = Object.entries(FEATURE_TYPES).map(([key, config]) => ({
    key,
    text: `${config.icon} ${config.name.padEnd(15)} ${colors.gray}${
      config.description
    } (${config.complexity})${colors.reset}`,
  }));

  const selected = await selectFromOptions(options);
  return selected.key;
}

/**
 * Generate feature files based on type and options
 */
async function generateFeatureFiles(featureName, featureType, options) {
  const kebabName = toKebabCase(featureName);
  const pascalName = toPascalCase(featureName);
  const config = FEATURE_TYPES[featureType];

  const featureDir = path.join(process.cwd(), 'src/features', kebabName);

  if (fs.existsSync(featureDir)) {
    throw new Error(`Feature ${kebabName} already exists`);
  }

  // Create directories
  fs.mkdirSync(featureDir, { recursive: true });
  fs.mkdirSync(path.join(featureDir, 'components'), { recursive: true });
  fs.mkdirSync(path.join(featureDir, 'hooks'), { recursive: true });

  if (!config.noRoute) {
    fs.mkdirSync(path.join(featureDir, 'pages'), { recursive: true });
  }

  // Generate files based on type
  const files = {};

  // Index file (feature configuration)
  files['index.ts'] = generateIndexFile(pascalName, kebabName, config, options);

  // Type-specific files
  switch (featureType) {
    case 'page':
      files['pages/MainPage.tsx'] = generatePageFile(
        pascalName,
        'page',
        options
      );
      files['hooks/usePageData.ts'] = generateSimpleHook(pascalName, options);
      break;

    case 'api':
      files['pages/MainPage.tsx'] = generatePageFile(
        pascalName,
        'admin',
        options
      );
      files['hooks/useApiData.ts'] = generateApiHook(pascalName, options);
      files['components/DataTable.tsx'] = generateDataComponent(
        pascalName,
        options
      );
      break;

    case 'form':
      files['pages/FormPage.tsx'] = generateFormPage(pascalName, options);
      files['hooks/useFormSubmission.ts'] = generateFormHook(
        pascalName,
        options
      );
      files['components/FormFields.tsx'] = generateFormComponent(
        pascalName,
        options
      );
      break;

    case 'dashboard':
      files['pages/DashboardPage.tsx'] = generateDashboardPage(
        pascalName,
        options
      );
      files['hooks/useDashboardData.ts'] = generateDashboardHook(
        pascalName,
        options
      );
      files['components/MetricsCard.tsx'] = generateMetricsComponent(
        pascalName,
        options
      );
      break;

    case 'component':
      files['components/MainComponent.tsx'] = generateReusableComponent(
        pascalName,
        options
      );
      files['hooks/useComponent.ts'] = generateComponentHook(
        pascalName,
        options
      );
      break;

    case 'auth':
      files['pages/LoginPage.tsx'] = generateAuthPage(pascalName, options);
      files['hooks/useAuth.ts'] = generateAuthHook(pascalName, options);
      files['components/AuthForm.tsx'] = generateAuthComponent(
        pascalName,
        options
      );
      break;
  }

  // Write all files
  Object.entries(files).forEach(([filename, content]) => {
    const filePath = path.join(featureDir, filename);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf8');
  });

  return { featureDir, files: Object.keys(files) };
}

/**
 * Template generators
 */
function generateIndexFile(pascalName, kebabName, config, options) {
  const needsRedux = config.needsRedux && options.useRedux;
  const layout = options.layout || config.layout || 'default';
  const securityComment = options.enableSecurity
    ? '// 🔒 Security patterns enabled'
    : '';

  return `/**
 * ${pascalName} Feature - ${config.description}
 * @module @voilajsx/bloom/features/${kebabName}
 * @file src/features/${kebabName}/index.ts
 */

import type { BloomFeatureConfig } from '@/platform/types';
import { createContract${
    options.enableSecurity ? ', createSecureContract' : ''
  } } from '@/shared/contracts';
${
  needsRedux
    ? "import { createSliceFromTemplate } from '@/platform/state';"
    : ''
}

${securityComment}
const config: BloomFeatureConfig = {
  name: '${kebabName}',
  
  ${
    needsRedux
      ? `// ✅ Uses Redux for shared state
  sharedState: true,
  
  stateSlices: [
    {
      name: '${kebabName}',
      initialState: {
        data: [],
        loading: false,
        error: null,
        settings: {}
      },
      reducers: {
        setData: (state, action) => {
          state.data = action.payload;
          state.loading = false;
        },
        setLoading: (state, action) => {
          state.loading = action.payload;
        },
        setError: (state, action) => {
          state.error = action.payload;
          state.loading = false;
        },
        updateSetting: (state, action) => {
          const { key, value } = action.payload;
          state.settings[key] = value;
        }
      }
    }
  ],`
      : `// ✅ Uses local state only
  sharedState: false,`
  }
  
  contract: ${
    options.enableSecurity ? 'createSecureContract()' : 'createContract()'
  }
    .providesComponent('${pascalName}${config.noRoute ? '' : 'Page'}')
    .providesHook('use${pascalName}')
    ${needsRedux ? `.consumesHook('useSharedState')` : ''}
    ${options.enableSecurity ? `.requiresSecurity('SANITIZE_INPUTS')` : ''}
    .build(),
  
  ${
    config.noRoute
      ? `// ✅ Component-only feature (no routes)`
      : `routes: [
    {
      path: '/${kebabName}',
      component: () => import('./pages/${pascalName}${
          config.noRoute ? 'Component' : 'Page'
        }'),
      layout: '${layout}',
      title: '${pascalName}',
      meta: {
        description: '${config.description}',
        keywords: '${kebabName}, ${config.name.toLowerCase()}'
      },
      ssg: ${needsRedux ? 'false' : 'true'}
    }
  ],`
  }

  ${
    options.enableSecurity
      ? `// 🔒 Security settings
  settings: {
    enableSecurity: {
      key: '${kebabName}.enableSecurity',
      default: true,
      type: 'boolean',
      label: 'Enable Security Patterns'
    }
  },`
      : ''
  }

  meta: {
    name: '${pascalName}',
    description: '${config.description}',
    version: '1.0.0',
    author: 'Bloom Developer',
    complexity: '${config.complexity}'
  }
};

export default config;`;
}

// Additional template generators
function generatePageFile(pascalName, layout = 'page', options) {
  const securityComment = options.enableSecurity
    ? '// 🔒 Security: All inputs sanitized'
    : '';

  return `/**
 * ${pascalName} Feature - Main Page
 * @file pages/${pascalName}Page.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';

${securityComment}
export default function ${pascalName}Page() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="py-8">
        <Badge variant="secondary" className="mb-4">
          ✨ ${pascalName}
        </Badge>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Welcome to ${pascalName}
        </h1>
        <p className="text-xl text-muted-foreground">
          Your new ${pascalName.toLowerCase()} feature is ready to customize.
        </p>
      </section>

      {/* Content Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>${pascalName} Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Start building your ${pascalName.toLowerCase()} functionality here.
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

function generateSimpleHook(pascalName, options) {
  const securityComment = options.enableSecurity
    ? '// 🔒 Security: Input validation enabled'
    : '';

  return `/**
 * ${pascalName} Feature - Data Hook
 * @file hooks/use${pascalName}Data.ts
 */

import { useState, useEffect } from 'react';
import { useBloomStorage } from '@/shared/hooks/useBloomStorage';

${securityComment}
export function use${pascalName}Data() {
  const { get, set } = useBloomStorage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // Add your data loading logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData({ message: '${pascalName} data loaded!' });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    reload: loadData
  };
}`;
}
