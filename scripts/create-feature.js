/**
 * Bloom Framework - Beautiful Interactive Feature Creation CLI
 * 🌸 Beautiful, smart, and fast feature generation
 * @file scripts/create-feature.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎨 Beautiful CLI Colors & Symbols
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

const symbols = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  question: '❓',
  arrow: '→',
  bloom: '🌸',
  rocket: '🚀',
  sparkles: '✨',
  fire: '🔥',
  lightning: '⚡',
};

// 🎯 Feature Types with Beautiful Descriptions
const FEATURE_TYPES = {
  page: {
    name: 'Page',
    description: 'Static content (about, home, landing)',
    icon: '📄',
    needsRedux: false,
    layout: 'page',
  },
  api: {
    name: 'API',
    description: 'Data & backend integration',
    icon: '🔌',
    needsRedux: true,
    layout: 'admin',
  },
  form: {
    name: 'Form',
    description: 'User input with validation',
    icon: '📝',
    needsRedux: false,
    layout: 'page',
  },
  dashboard: {
    name: 'Dashboard',
    description: 'Admin panels & analytics',
    icon: '📊',
    needsRedux: true,
    layout: 'admin',
  },
  component: {
    name: 'Component',
    description: 'Reusable UI elements',
    icon: '🧩',
    needsRedux: false,
    layout: null,
    noRoute: true,
  },
};

/**
 * 🎨 Beautiful console output helpers
 */
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBox(title, content, color = 'cyan') {
  const width = 60;
  const border = '═'.repeat(width - 2);

  console.log(`${colors[color]}╔${border}╗${colors.reset}`);
  console.log(`${colors[color]}║${' '.repeat(width - 2)}║${colors.reset}`);
  console.log(
    `${colors[color]}║${colors.bright}${title
      .padStart((width + title.length) / 2)
      .padEnd(width - 2)}${colors.reset}${colors[color]}║${colors.reset}`
  );
  console.log(`${colors[color]}║${' '.repeat(width - 2)}║${colors.reset}`);

  if (Array.isArray(content)) {
    content.forEach((line) => {
      console.log(
        `${colors[color]}║  ${colors.reset}${line.padEnd(width - 4)}${
          colors[color]
        }║${colors.reset}`
      );
    });
  } else {
    console.log(
      `${colors[color]}║  ${colors.reset}${content.padEnd(width - 4)}${
        colors[color]
      }║${colors.reset}`
    );
  }

  console.log(`${colors[color]}║${' '.repeat(width - 2)}║${colors.reset}`);
  console.log(`${colors[color]}╚${border}╝${colors.reset}`);
  console.log();
}

function logStep(step, title, description) {
  log(
    `${symbols.bloom} ${colors.bright}Step ${step}:${colors.reset} ${colors.cyan}${title}${colors.reset}`,
    'white'
  );
  if (description) {
    log(`   ${colors.gray}${description}${colors.reset}`, 'white');
  }
  console.log();
}

function logSuccess(message) {
  log(`${symbols.success} ${colors.green}${message}${colors.reset}`, 'white');
}

function logError(message) {
  log(`${symbols.error} ${colors.red}${message}${colors.reset}`, 'white');
}

function logInfo(message) {
  log(`${colors.blue}${symbols.info} ${message}${colors.reset}`, 'white');
}

/**
 * 🎨 Beautiful interactive prompts
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(question, rl) {
  return new Promise((resolve) => {
    rl.question(
      `${colors.yellow}${symbols.question} ${question}${colors.reset} `,
      resolve
    );
  });
}

function showOptions(options, current = 0) {
  console.log();
  options.forEach((option, index) => {
    const isSelected = index === current;
    const prefix = isSelected
      ? `${colors.green}${symbols.arrow}${colors.reset}`
      : ' ';
    const text = isSelected
      ? `${colors.bright}${option.text}${colors.reset}`
      : `${colors.gray}${option.text}${colors.reset}`;
    console.log(`  ${prefix} ${text}`);
  });
  console.log();
}

/**
 * 🚀 Interactive Feature Type Selection
 */
async function selectFeatureType() {
  console.clear();

  logBox(`${symbols.bloom} Bloom Feature Creator`, [
    `${symbols.sparkles} Create beautiful, working features in seconds`,
    `${symbols.lightning} Smart templates with perfect integrations`,
  ]);

  logStep(1, 'Feature Type', 'What type of feature are you creating?');

  const options = Object.entries(FEATURE_TYPES).map(([key, config]) => ({
    key,
    text: `${config.icon} ${config.name.padEnd(12)} ${colors.gray}${
      config.description
    }${colors.reset}`,
  }));

  let current = 0;
  showOptions(options, current);

  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const onKeypress = (key) => {
      if (key === '\u0003') {
        // Ctrl+C
        process.exit();
      } else if (key === '\u001b[A') {
        // Up arrow
        current = Math.max(0, current - 1);
        process.stdout.moveCursor(0, -(options.length + 1));
        process.stdout.clearScreenDown();
        showOptions(options, current);
      } else if (key === '\u001b[B') {
        // Down arrow
        current = Math.min(options.length - 1, current + 1);
        process.stdout.moveCursor(0, -(options.length + 1));
        process.stdout.clearScreenDown();
        showOptions(options, current);
      } else if (key === '\r') {
        // Enter
        process.stdin.removeListener('data', onKeypress);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve(options[current].key);
      }
    };

    process.stdin.on('data', onKeypress);
  });
}

/**
 * 🎨 Beautiful Yes/No prompt
 */
async function askYesNo(question, defaultValue = true) {
  const rl = createReadlineInterface();
  const defaultText = defaultValue ? 'Y/n' : 'y/N';

  const answer = await askQuestion(
    `${question} ${colors.gray}(${defaultText})${colors.reset}`,
    rl
  );
  rl.close();

  if (!answer.trim()) return defaultValue;
  return answer.toLowerCase().startsWith('y');
}

/**
 * 🎯 Generate feature files based on type
 */
function generateFeatureFiles(featureName, featureType, options) {
  const kebabName = featureName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const camelName = kebabName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1);

  const featureDir = path.join(process.cwd(), 'src/features', kebabName);
  const config = FEATURE_TYPES[featureType];

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
  files['index.ts'] = generateIndexFile(camelName, pascalName, config, options);

  // Type-specific files
  switch (featureType) {
    case 'page':
      files['pages/MainPage.tsx'] = generatePageFile(pascalName, 'page');
      files['hooks/usePageData.ts'] = generateSimpleHook(pascalName);
      break;

    case 'api':
      files['pages/MainPage.tsx'] = generatePageFile(pascalName, 'admin');
      files['hooks/useApiData.ts'] = generateApiHook(pascalName);
      files['components/DataTable.tsx'] = generateDataComponent(pascalName);
      break;

    case 'form':
      files['pages/FormPage.tsx'] = generateFormPage(pascalName);
      files['hooks/useFormSubmission.ts'] = generateFormHook(pascalName);
      files['components/FormFields.tsx'] = generateFormComponent(pascalName);
      break;

    case 'dashboard':
      files['pages/DashboardPage.tsx'] = generateDashboardPage(pascalName);
      files['hooks/useDashboardData.ts'] = generateDashboardHook(pascalName);
      files['components/MetricsCard.tsx'] =
        generateMetricsComponent(pascalName);
      break;

    case 'component':
      files['components/MainComponent.tsx'] =
        generateReusableComponent(pascalName);
      files['hooks/useComponent.ts'] = generateComponentHook(pascalName);
      break;
  }

  // Write all files
  Object.entries(files).forEach(([filename, content]) => {
    const filePath = path.join(featureDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
  });

  return { featureDir, files: Object.keys(files) };
}

/**
 * 📝 Template Generators
 */
function generateIndexFile(camelName, pascalName, config, options) {
  const needsRedux = config.needsRedux && options.useRedux;
  const layout = options.layout || config.layout || 'default';

  return `/**
 * ${pascalName} Feature - ${config.description}
 * @module @voilajsx/bloom/features/${camelName}
 * @file src/features/${camelName}/index.ts
 */

import type { BloomFeatureConfig } from '@/platform/types';

const config: BloomFeatureConfig = {
  name: '${camelName}',
  
  ${
    needsRedux
      ? `// ✅ Uses Redux for shared state
  sharedState: true,
  
  stateSlices: [
    {
      name: '${camelName}',
      initialState: {
        data: [],
        loading: false,
        error: null
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
        }
      }
    }
  ],`
      : `// ✅ Uses local state only
  sharedState: false,`
  }
  
  ${
    config.noRoute
      ? `// ✅ Component-only feature (no routes)`
      : `routes: [
    {
      path: '/${camelName}',
      component: () => import('./pages/${
        config.name === 'Component' ? 'MainComponent' : 'MainPage'
      }'),
      layout: '${layout}',
      title: '${pascalName}',
      meta: {
        description: '${config.description}',
        keywords: '${camelName}, ${config.name.toLowerCase()}'
      },
      ssg: ${config.needsRedux ? 'false' : 'true'}
    }
  ],`
  }

  meta: {
    name: '${pascalName}',
    description: '${config.description}',
    version: '1.0.0',
    author: 'Bloom Developer'
  }
};

export default config;`;
}

function generatePageFile(pascalName, layout = 'page') {
  return `/**
 * ${pascalName} Feature - Main Page
 * @file pages/MainPage.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';

export default function ${pascalName}Page() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <Badge variant="secondary" className="mb-4">
          ${symbols.sparkles} ${pascalName}
        </Badge>
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Welcome to ${pascalName}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your new ${pascalName.toLowerCase()} feature is ready to customize.
        </p>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This is your new ${pascalName.toLowerCase()} feature. Start customizing:
            </p>
            <div className="flex gap-3">
              <Button className="bg-primary text-primary-foreground">
                Primary Action
              </Button>
              <Button variant="outline">
                Secondary Action
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}`;
}

function generateSimpleHook(pascalName) {
  return `/**
 * ${pascalName} Feature - Data Hook
 * @file hooks/usePageData.ts
 */

import { useState, useEffect } from 'react';

export function usePageData() {
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

// Additional template generators would go here...
function generateApiHook(pascalName) {
  return `/**
 * ${pascalName} Feature - API Hook with Redux
 * @file hooks/useApiData.ts
 */

import { useState, useEffect } from 'react';
import { useBloomApi } from '@/shared/hooks/useBloomApi';

export function useApiData() {
  const { apiGet, loading, error } = useBloomApi();
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await apiGet('/api/${pascalName.toLowerCase()}');
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}`;
}

function generateFormPage(pascalName) {
  return `/**
 * ${pascalName} Feature - Form Page
 * @file pages/FormPage.tsx
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { ValidatedInput, FormActions } from '@voilajsx/uikit/form';

export default function ${pascalName}Page() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Add your form submission logic here
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', formData);
      
      // Reset form
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>${pascalName} Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ValidatedInput
              required
              label="Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            />
            
            <ValidatedInput
              type="email"
              required
              label="Email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            />
            
            <ValidatedInput
              required
              label="Message"
              value={formData.message}
              onChange={(value) => setFormData(prev => ({ ...prev, message: value }))}
            />

            <FormActions
              submitText="Submit ${pascalName}"
              loading={isSubmitting}
              showCancel={false}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}`;
}

function generateFormHook(pascalName) {
  return `/**
 * ${pascalName} Feature - Form Submission Hook
 * @file hooks/useFormSubmission.ts
 */

import { useState } from 'react';
import { useBloomApi } from '@/shared/hooks/useBloomApi';

export function useFormSubmission() {
  const { apiPost } = useBloomApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitForm = async (formData) => {
    setIsSubmitting(true);
    setSuccess(false);

    try {
      const response = await apiPost('/api/${pascalName.toLowerCase()}', formData);
      
      if (response.success) {
        setSuccess(true);
        return { success: true, data: response.data };
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitForm,
    isSubmitting,
    success
  };
}`;
}

function generateFormComponent(pascalName) {
  return `/**
 * ${pascalName} Feature - Form Fields Component
 * @file components/FormFields.tsx
 */

import React from 'react';
import { ValidatedInput } from '@voilajsx/uikit/form';

interface FormFieldsProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export default function FormFields({ formData, onChange, errors = {} }: FormFieldsProps) {
  return (
    <div className="space-y-4">
      <ValidatedInput
        required
        label="Name"
        value={formData.name || ''}
        onChange={(value) => onChange('name', value)}
        error={errors.name}
      />
      
      <ValidatedInput
        type="email"
        required
        label="Email Address"
        value={formData.email || ''}
        onChange={(value) => onChange('email', value)}
        error={errors.email}
      />
    </div>
  );
}`;
}

function generateDashboardPage(pascalName) {
  return `/**
 * ${pascalName} Feature - Dashboard Page
 * @file pages/DashboardPage.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Badge } from '@voilajsx/uikit/badge';
import MetricsCard from '../components/MetricsCard';

export default function ${pascalName}Page() {
  const metrics = [
    { title: 'Total Users', value: '1,234', change: '+12%' },
    { title: 'Revenue', value: '$45,678', change: '+8%' },
    { title: 'Orders', value: '892', change: '+15%' },
    { title: 'Conversion', value: '3.2%', change: '+2%' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">${pascalName}</h1>
          <p className="text-muted-foreground">Monitor your key metrics</p>
        </div>
        <Badge variant="secondary">Live Data</Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
          />
        ))}
      </div>

      {/* Content Area */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Add your dashboard components and charts here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}`;
}

function generateDashboardHook(pascalName) {
  return `/**
 * ${pascalName} Feature - Dashboard Data Hook
 * @file hooks/useDashboardData.ts
 */

import { useState, useEffect } from 'react';
import { useBloomApi } from '@/shared/hooks/useBloomApi';

export function useDashboardData() {
  const { apiGet, loading, error } = useBloomApi();
  const [metrics, setMetrics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMetrics = async () => {
    try {
      const response = await apiGet('/api/${pascalName.toLowerCase()}/metrics');
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  };

  useEffect(() => {
    loadMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    loading,
    error,
    refreshing,
    refresh
  };
}`;
}

function generateMetricsComponent(pascalName) {
  return `/**
 * ${pascalName} Feature - Metrics Card Component
 * @file components/MetricsCard.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Badge } from '@voilajsx/uikit/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: React.ComponentType<any>;
}

export default function MetricsCard({ 
  title, 
  value, 
  change,
  icon: Icon 
}: MetricsCardProps) {
  const isPositive = change?.startsWith('+');
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <div className="flex items-center mt-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <Badge 
              variant="secondary"
              className={isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}
            >
              {change}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}`;
}

function generateReusableComponent(pascalName) {
  return `/**
 * ${pascalName} Feature - Reusable Component
 * @file components/MainComponent.tsx
 */

import React from 'react';
import { Card, CardContent } from '@voilajsx/uikit/card';

interface ${pascalName}Props {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function ${pascalName}({ 
  title = 'Default Title',
  children,
  className = ''
}: ${pascalName}Props) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          {title}
        </h3>
        {children || (
          <p className="text-muted-foreground">
            Your reusable ${pascalName.toLowerCase()} component is ready to customize.
          </p>
        )}
      </CardContent>
    </Card>
  );
}`;
}

function generateComponentHook(pascalName) {
  return `/**
 * ${pascalName} Feature - Component Logic Hook
 * @file hooks/useComponent.ts
 */

import { useState, useCallback } from 'react';

export function useComponent() {
  const [isVisible, setIsVisible] = useState(true);
  const [data, setData] = useState(null);

  const toggle = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const updateData = useCallback((newData: any) => {
    setData(newData);
  }, []);

  return {
    isVisible,
    data,
    toggle,
    updateData
  };
}`;
}

function generateDataComponent(pascalName) {
  return `/**
 * ${pascalName} Feature - Data Table Component
 * @file components/DataTable.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Badge } from '@voilajsx/uikit/badge';

interface DataTableProps {
  data: any[];
  loading?: boolean;
}

export default function DataTable({ data, loading = false }: DataTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Data Table
          <Badge variant="secondary">{data.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No data available
          </p>
        ) : (
          <div className="space-y-2">
            {data.slice(0, 5).map((item, index) => (
              <div key={index} className="p-3 bg-muted/20 rounded-lg">
                <p className="text-sm text-foreground">
                  Item {index + 1}: {JSON.stringify(item)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}`;
}

/**
 * 🚀 Main Feature Creation Function
 */
async function createFeature() {
  try {
    // Get feature name from command line
    const featureName = process.argv[2];

    if (!featureName) {
      logError('Please provide a feature name:');
      log(
        `${colors.cyan}npm run create-feature my-feature${colors.reset}`,
        'white'
      );
      process.exit(1);
    }

    // Step 1: Select feature type
    const featureType = await selectFeatureType();
    const config = FEATURE_TYPES[featureType];

    // Step 2: Redux question (only if feature supports it)
    let useRedux = config.needsRedux;
    if (config.needsRedux) {
      console.clear();
      logStep(
        2,
        'State Management',
        'This feature can use Redux for shared state'
      );
      useRedux = await askYesNo('Use Redux for shared state?', true);
    }

    // Step 3: Navigation question (only if feature has routes)
    let addToNav = false;
    if (!config.noRoute) {
      console.clear();
      logStep(3, 'Navigation', 'Add this feature to the app navigation?');
      addToNav = await askYesNo('Add to navigation?', true);
    }

    // Generate the feature
    console.clear();
    logInfo('Creating your beautiful feature...');
    console.log();

    const options = {
      useRedux,
      addToNav,
      layout: config.layout,
    };

    const result = generateFeatureFiles(featureName, featureType, options);

    // Beautiful success output
    console.clear();
    logBox(
      `${symbols.rocket} Feature Created Successfully!`,
      [
        `${symbols.sparkles} ${featureName} is ready to use`,
        `${symbols.fire} ${result.files.length} files generated`,
        `${symbols.lightning} Zero configuration needed`,
      ],
      'green'
    );

    logSuccess(
      `Feature created: ${colors.cyan}${result.featureDir}${colors.reset}`
    );
    console.log();

    log(`${colors.bright}Generated files:${colors.reset}`, 'white');
    result.files.forEach((file) => {
      log(`  ${symbols.success} ${colors.gray}${file}${colors.reset}`, 'white');
    });
    console.log();

    if (addToNav) {
      logInfo('Remember to add the route to your navigation configuration!');
    }

    logBox(
      'Next Steps',
      [
        '1. Run npm run dev to see your feature',
        '2. Customize the generated components',
        '3. Add your business logic to hooks',
        '4. Style with UIKit components',
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
    process.exit(1);
  }
}

// Run the feature creator
if (import.meta.url === `file://${process.argv[1]}`) {
  createFeature();
}
