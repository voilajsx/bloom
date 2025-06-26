/**
 * Bloom Framework - Create new feature script
 * @file scripts/create-feature.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createFeature(featureName) {
  if (!featureName) {
    console.error(
      '❌ Please provide a feature name: npm run create-feature my-feature'
    );
    process.exit(1);
  }

  const kebabName = featureName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const camelName = kebabName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1);

  const featureDir = path.join(__dirname, '../src/features', kebabName);

  if (fs.existsSync(featureDir)) {
    console.error(`❌ Feature ${kebabName} already exists`);
    process.exit(1);
  }

  // Create directories
  fs.mkdirSync(featureDir, { recursive: true });
  fs.mkdirSync(path.join(featureDir, 'pages'), { recursive: true });
  fs.mkdirSync(path.join(featureDir, 'components'), { recursive: true });
  fs.mkdirSync(path.join(featureDir, 'hooks'), { recursive: true });

  // Create files
  const files = {
    'index.ts': generateIndexFile(camelName, pascalName),
    'pages/MainPage.tsx': generatePageFile(pascalName),
    'hooks/useFeature.ts': generateHookFile(camelName, pascalName),
    'components/FeatureCard.tsx': generateComponentFile(pascalName),
  };

  Object.entries(files).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(featureDir, filename), content, 'utf8');
  });

  console.log(`✅ Created feature: ${kebabName}`);
  console.log(`   📁 ${featureDir}`);
  console.log(`   🔧 Run 'npm run discover' to register the feature`);
}

function generateIndexFile(camelName, pascalName) {
  return `/**
 * ${pascalName} Feature - Generated feature
 * @module @voilajsx/bloom/features/${camelName}
 * @file src/features/${camelName}/index.ts
 */

import type { BloomFeatureConfig } from '@/platform/types';

const config: BloomFeatureConfig = {
  name: '${camelName}',
  
  routes: [
    {
      path: '/${camelName}',
      component: () => import('./pages/MainPage'),
      layout: 'default',
      title: '${pascalName}',
      meta: {
        description: '${pascalName} feature description',
        keywords: '${camelName}, feature'
      },
      ssg: true
    }
  ],

  settings: {
    enabled: {
      key: '${camelName}.enabled',
      default: true,
      type: 'boolean',
      label: 'Enable ${pascalName}'
    }
  },

  meta: {
    name: '${pascalName}',
    description: 'Generated ${pascalName} feature',
    version: '1.0.0',
    author: 'Bloom Developer'
  }
};

export default config;
`;
}

function generatePageFile(pascalName) {
  return `/**
 * ${pascalName} Feature - Main Page
 * @module @voilajsx/bloom/features
 * @file pages/MainPage.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';
import { use${pascalName} } from '../hooks/useFeature';

export default function ${pascalName}Page() {
  const { settings, updateSetting } = use${pascalName}();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            New Feature
          </Badge>
          <h1 className="text-4xl font-bold mb-4">${pascalName}</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to your new Bloom feature! Start building amazing functionality.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Feature enabled:</span>
                <Badge variant={settings.enabled ? 'default' : 'secondary'}>
                  {settings.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <Button 
                className="mt-4 w-full"
                onClick={() => updateSetting('enabled', !settings.enabled)}
              >
                {settings.enabled ? 'Disable' : 'Enable'} Feature
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
`;
}

function generateHookFile(camelName, pascalName) {
  return `/**
 * ${pascalName} Feature - Business logic hook
 * @module @voilajsx/bloom/features
 * @file hooks/useFeature.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { useBloomStorage } from '@/shared/hooks/useBloomStorage';

interface ${pascalName}Settings {
  enabled: boolean;
}

export function use${pascalName}() {
  const { get, set } = useBloomStorage();
  const [settings, setSettings] = useState<${pascalName}Settings>({
    enabled: true
  });
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const enabled = await get('${camelName}.enabled', true);
        setSettings({ enabled });
      } catch (error) {
        console.error('[${pascalName}] Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [get]);

  // Update setting
  const updateSetting = useCallback(async <K extends keyof ${pascalName}Settings>(
    key: K,
    value: ${pascalName}Settings[K]
  ) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      await set(\`${camelName}.\${key}\`, value);
    } catch (error) {
      console.error(\`[${pascalName}] Failed to update \${key}:\`, error);
      // Revert on failure
      setSettings(prev => ({ ...prev, [key]: settings[key] }));
    }
  }, [set, settings]);

  return {
    // State
    settings,
    loading,

    // Actions
    updateSetting,

    // Utilities
    isReady: !loading
  };
}
`;
}

function generateComponentFile(pascalName) {
  return `/**
 * ${pascalName} Feature - Feature Card Component
 * @module @voilajsx/bloom/features
 * @file components/FeatureCard.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Badge } from '@voilajsx/uikit/badge';

interface FeatureCardProps {
  title: string;
  description: string;
  status?: 'active' | 'inactive';
  className?: string;
}

export default function FeatureCard({
  title,
  description,
  status = 'active',
  className = ''
}: FeatureCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
`;
}

// Run if called directly
const featureName = process.argv[2];
if (import.meta.url === `file://${process.argv[1]}`) {
  createFeature(featureName);
}
