/**
 * Bloom Framework - Complete Health Diagnosis
 * @file scripts/lib/doctor.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import {
  logSuccess,
  logError,
  logWarning,
  logBox,
  log,
  colors,
  symbols,
  Timer,
} from './utils.js';

/**
 * Run complete health diagnosis
 */
export async function runDoctor(args) {
  const timer = new Timer();

  console.clear();

  logBox(`${symbols.target} Bloom Framework Doctor`, [
    `${symbols.bloom} Complete health diagnosis`,
    `${symbols.lightning} Environment validation`,
    `${symbols.performance} Performance analysis`,
    `${symbols.security} Security assessment`,
  ]);

  const diagnosis = {
    environment: { status: 'unknown', issues: [], score: 0 },
    dependencies: { status: 'unknown', issues: [], score: 0 },
    features: { status: 'unknown', issues: [], score: 0 },
    configuration: { status: 'unknown', issues: [], score: 0 },
    performance: { status: 'unknown', issues: [], score: 0 },
    security: { status: 'unknown', issues: [], score: 0 },
  };

  try {
    // Run all health checks
    log(`${symbols.bloom} Checking environment...`, 'white');
    await checkEnvironment(diagnosis.environment);

    log(`${symbols.code} Validating dependencies...`, 'white');
    await checkDependencies(diagnosis.dependencies);

    log(`${symbols.sparkles} Analyzing features...`, 'white');
    await checkFeatures(diagnosis.features);

    log(`${symbols.contracts} Validating configuration...`, 'white');
    await checkConfiguration(diagnosis.configuration);

    log(`${symbols.performance} Measuring performance...`, 'white');
    await checkPerformance(diagnosis.performance);

    log(`${symbols.security} Assessing security...`, 'white');
    await checkSecurityHealth(diagnosis.security);

    // Calculate overall health
    const overallHealth = calculateOverallHealth(diagnosis);

    // Display results
    console.clear();
    timer.endWithMessage(`${symbols.check} Health diagnosis completed!`);

    displayHealthResults(diagnosis, overallHealth);
  } catch (error) {
    logError(`Health diagnosis failed: ${error.message}`);

    if (process.env.DEBUG) {
      console.error('Full error:', error);
    }

    process.exit(1);
  }
}

/**
 * Check environment health
 */
async function checkEnvironment(env) {
  const issues = [];
  let score = 100;

  try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion < 18) {
      issues.push(
        `Node.js ${nodeVersion} is outdated. Recommended: 18+ for optimal performance`
      );
      score -= 20;
    } else if (majorVersion < 20) {
      issues.push(
        `Node.js ${nodeVersion} works but consider upgrading to 20+ for better performance`
      );
      score -= 5;
    }

    // Check npm version
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      const npmMajor = parseInt(npmVersion.split('.')[0]);

      if (npmMajor < 8) {
        issues.push(
          `npm ${npmVersion} is outdated. Run: npm install -g npm@latest`
        );
        score -= 10;
      }
    } catch (error) {
      issues.push('npm not found or not working properly');
      score -= 15;
    }

    // Check Git
    try {
      execSync('git --version', { encoding: 'utf8' });
    } catch (error) {
      issues.push('Git not found. Install Git for version control');
      score -= 5;
    }

    // Check available memory
    const totalMem = process.memoryUsage();
    if (totalMem.heapUsed / totalMem.heapTotal > 0.8) {
      issues.push(
        'High memory usage detected. Consider restarting the process'
      );
      score -= 10;
    }

    env.status = score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';
    env.issues = issues;
    env.score = score;
  } catch (error) {
    env.status = 'error';
    env.issues = [`Environment check failed: ${error.message}`];
    env.score = 0;
  }
}

/**
 * Check dependencies health
 */
async function checkDependencies(deps) {
  const issues = [];
  let score = 100;

  try {
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      issues.push('Dependencies not installed. Run: npm install');
      score = 0;
      deps.status = 'critical';
      deps.issues = issues;
      deps.score = score;
      return;
    }

    // Check package.json
    if (!fs.existsSync('package.json')) {
      issues.push('package.json not found');
      score -= 30;
    } else {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      // Check for required Bloom dependencies
      const requiredDeps = [
        'react',
        'react-dom',
        'react-router-dom',
        '@voilajsx/uikit',
        'vite',
      ];

      const missing = requiredDeps.filter(
        (dep) =>
          !packageJson.dependencies?.[dep] &&
          !packageJson.devDependencies?.[dep]
      );

      if (missing.length > 0) {
        issues.push(`Missing required dependencies: ${missing.join(', ')}`);
        score -= missing.length * 10;
      }

      // Check for version conflicts
      if (packageJson.dependencies?.react) {
        const reactVersion = packageJson.dependencies.react;
        if (!reactVersion.includes('19')) {
          issues.push(
            'React version should be 19+ for optimal Bloom compatibility'
          );
          score -= 5;
        }
      }
    }

    // Check for security vulnerabilities
    try {
      execSync('npm audit --audit-level moderate', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (error) {
      if (error.stdout && error.stdout.includes('vulnerabilities')) {
        issues.push('Security vulnerabilities found. Run: npm audit fix');
        score -= 15;
      }
    }

    deps.status =
      score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';
    deps.issues = issues;
    deps.score = score;
  } catch (error) {
    deps.status = 'error';
    deps.issues = [`Dependency check failed: ${error.message}`];
    deps.score = 0;
  }
}

/**
 * Check features health
 */
async function checkFeatures(features) {
  const issues = [];
  let score = 100;

  try {
    const featuresDir = path.join(process.cwd(), 'src/features');

    if (!fs.existsSync(featuresDir)) {
      issues.push(
        'Features directory not found. Create your first feature with: npm run bloom:create'
      );
      score = 20;
    } else {
      const entries = fs.readdirSync(featuresDir, { withFileTypes: true });
      const featureCount = entries.filter(
        (entry) =>
          entry.isDirectory() &&
          !entry.name.startsWith('_') &&
          fs.existsSync(path.join(featuresDir, entry.name, 'index.ts'))
      ).length;

      if (featureCount === 0) {
        issues.push(
          'No valid features found. Create your first feature with: npm run bloom:create'
        );
        score = 30;
      } else if (featureCount === 1) {
        issues.push(
          'Only one feature found. Consider creating more features for better modularity'
        );
        score -= 10;
      }

      // Check feature structure
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('_')) {
          const featurePath = path.join(featuresDir, entry.name);
          const indexPath = path.join(featurePath, 'index.ts');

          if (fs.existsSync(indexPath)) {
            const content = fs.readFileSync(indexPath, 'utf8');

            // Check for proper feature structure
            if (!content.includes('BloomFeatureConfig')) {
              issues.push(
                `Feature ${entry.name}: Invalid configuration structure`
              );
              score -= 5;
            }

            if (!content.includes('contract:')) {
              issues.push(`Feature ${entry.name}: Missing contract definition`);
              score -= 3;
            }

            // Check for required folders
            const requiredFolders = ['components', 'hooks'];
            requiredFolders.forEach((folder) => {
              if (!fs.existsSync(path.join(featurePath, folder))) {
                issues.push(
                  `Feature ${entry.name}: Missing ${folder} directory`
                );
                score -= 2;
              }
            });
          }
        }
      }
    }

    features.status =
      score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';
    features.issues = issues;
    features.score = score;
  } catch (error) {
    features.status = 'error';
    features.issues = [`Features check failed: ${error.message}`];
    features.score = 0;
  }
}

/**
 * Check configuration health
 */
async function checkConfiguration(config) {
  const issues = [];
  let score = 100;

  try {
    // Check essential files
    const requiredFiles = [
      { file: 'vite.config.ts', message: 'Vite configuration missing' },
      { file: 'tsconfig.json', message: 'TypeScript configuration missing' },
      { file: 'src/main.ts', message: 'Main entry point missing' },
      { file: 'src/app.tsx', message: 'App component missing' },
      { file: 'index.html', message: 'HTML template missing' },
    ];

    requiredFiles.forEach(({ file, message }) => {
      if (!fs.existsSync(file)) {
        issues.push(message);
        score -= 15;
      }
    });

    // Check Vite config for Bloom optimizations
    if (fs.existsSync('vite.config.ts')) {
      const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');

      if (!viteConfig.includes('@tailwindcss/vite')) {
        issues.push('Tailwind CSS plugin not configured in Vite');
        score -= 5;
      }

      if (!viteConfig.includes('bloomBuildTimeDiscovery')) {
        issues.push('Bloom build-time discovery not configured');
        score -= 10;
      }

      if (!viteConfig.includes('security')) {
        issues.push('Security headers not configured');
        score -= 5;
      }
    }

    // Check TypeScript config
    if (fs.existsSync('tsconfig.json')) {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

      if (!tsConfig.compilerOptions?.paths?.['@/*']) {
        issues.push('Path mapping (@/*) not configured');
        score -= 5;
      }

      if (!tsConfig.compilerOptions?.strict) {
        issues.push('TypeScript strict mode not enabled');
        score -= 3;
      }
    }

    config.status =
      score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';
    config.issues = issues;
    config.score = score;
  } catch (error) {
    config.status = 'error';
    config.issues = [`Configuration check failed: ${error.message}`];
    config.score = 0;
  }
}

/**
 * Check performance health
 */
async function checkPerformance(perf) {
  const issues = [];
  let score = 100;

  try {
    // Check if dist folder exists (built project)
    const distDir = path.join(process.cwd(), 'dist');

    if (fs.existsSync(distDir)) {
      // Analyze bundle size
      let totalSize = 0;
      let jsFiles = 0;
      let cssFiles = 0;

      function calculateSize(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
          const filePath = path.join(dir, file.name);

          if (file.isDirectory()) {
            calculateSize(filePath);
          } else {
            const stats = fs.statSync(filePath);
            totalSize += stats.size;

            if (file.name.endsWith('.js')) jsFiles++;
            if (file.name.endsWith('.css')) cssFiles++;
          }
        }
      }

      calculateSize(distDir);

      const totalMB = totalSize / (1024 * 1024);

      if (totalMB > 2) {
        issues.push(
          `Bundle size is large (${totalMB.toFixed(
            1
          )}MB). Consider code splitting`
        );
        score -= 15;
      } else if (totalMB > 1) {
        issues.push(
          `Bundle size is moderate (${totalMB.toFixed(
            1
          )}MB). Monitor performance`
        );
        score -= 5;
      }

      if (jsFiles > 20) {
        issues.push(
          `Many JS chunks (${jsFiles}). Check bundle splitting strategy`
        );
        score -= 10;
      }
    } else {
      issues.push('No build output found. Run: npm run bloom:build');
      score -= 20;
    }

    // Check for performance optimizations in code
    const mainFile = 'src/main.ts';
    if (fs.existsSync(mainFile)) {
      const content = fs.readFileSync(mainFile, 'utf8');

      if (!content.includes('React.lazy') && fs.existsSync('src/features')) {
        issues.push('Consider using React.lazy for code splitting');
        score -= 5;
      }
    }

    perf.status =
      score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';
    perf.issues = issues;
    perf.score = score;
  } catch (error) {
    perf.status = 'error';
    perf.issues = [`Performance check failed: ${error.message}`];
    perf.score = 0;
  }
}

/**
 * Check security health
 */
async function checkSecurityHealth(security) {
  const issues = [];
  let score = 100;

  try {
    // Check for security headers in Vite config
    if (fs.existsSync('vite.config.ts')) {
      const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');

      const securityHeaders = [
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
      ];

      securityHeaders.forEach((header) => {
        if (!viteConfig.includes(header)) {
          issues.push(`Missing security header: ${header}`);
          score -= 5;
        }
      });
    }

    // Check for sensitive data in environment
    const envFiles = ['.env', '.env.local', '.env.development'];
    envFiles.forEach((envFile) => {
      if (fs.existsSync(envFile)) {
        const content = fs.readFileSync(envFile, 'utf8');

        // Look for potentially exposed secrets
        const sensitivePatterns = [
          'password',
          'secret',
          'private_key',
          'api_key',
        ];
        sensitivePatterns.forEach((pattern) => {
          if (
            content.toLowerCase().includes(pattern) &&
            !content.includes('VITE_')
          ) {
            issues.push(
              `Potential sensitive data in ${envFile}. Use VITE_ prefix for client-side vars`
            );
            score -= 10;
          }
        });
      }
    });

    // Quick scan for common security issues
    const srcFiles = [];
    if (fs.existsSync('src')) {
      function findFiles(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach((file) => {
          const filePath = path.join(dir, file.name);
          if (file.isDirectory()) {
            findFiles(filePath);
          } else if (file.name.match(/\.(ts|tsx)$/)) {
            srcFiles.push(filePath);
          }
        });
      }
      findFiles('src');
    }

    // Check for dangerous patterns in first 10 files
    srcFiles.slice(0, 10).forEach((filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');

        if (content.includes('dangerouslySetInnerHTML')) {
          issues.push(
            `Potentially unsafe HTML in ${path.relative(
              process.cwd(),
              filePath
            )}`
          );
          score -= 10;
        }

        if (content.includes('eval(')) {
          issues.push(
            `eval() usage detected in ${path.relative(process.cwd(), filePath)}`
          );
          score -= 15;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });

    security.status =
      score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';
    security.issues = issues;
    security.score = score;
  } catch (error) {
    security.status = 'error';
    security.issues = [`Security check failed: ${error.message}`];
    security.score = 0;
  }
}

/**
 * Calculate overall health score
 */
function calculateOverallHealth(diagnosis) {
  const categories = Object.values(diagnosis);
  const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
  const avgScore = totalScore / categories.length;

  let status = 'excellent';
  let color = 'green';

  if (avgScore < 60) {
    status = 'critical';
    color = 'red';
  } else if (avgScore < 75) {
    status = 'needs attention';
    color = 'yellow';
  } else if (avgScore < 90) {
    status = 'good';
    color = 'blue';
  }

  return {
    score: Math.round(avgScore),
    status,
    color,
  };
}

/**
 * Display health diagnosis results
 */
function displayHealthResults(diagnosis, overall) {
  logBox(
    `${symbols.target} Overall Health: ${overall.score}/100`,
    [
      `${symbols.bloom} Status: ${overall.status}`,
      `${symbols.lightning} Framework health assessment`,
      `${symbols.sparkles} Ready for ${
        overall.score >= 80 ? 'production' : 'development'
      }`,
    ],
    overall.color
  );

  console.log();
  log(`${colors.bright}Detailed Health Report:${colors.reset}`, 'white');

  Object.entries(diagnosis).forEach(([category, result]) => {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    let icon = symbols.check;
    let color = 'green';

    if (result.status === 'critical' || result.status === 'error') {
      icon = symbols.error;
      color = 'red';
    } else if (result.status === 'warning') {
      icon = symbols.warning;
      color = 'yellow';
    }

    log(
      `  ${icon} ${colors[color]}${categoryName}${colors.reset} ${colors.gray}(${result.score}/100)${colors.reset}`,
      'white'
    );

    if (result.issues.length > 0) {
      result.issues.slice(0, 3).forEach((issue) => {
        log(`    • ${issue}`, 'gray');
      });

      if (result.issues.length > 3) {
        log(`    ... and ${result.issues.length - 3} more issues`, 'gray');
      }
    }
  });

  console.log();

  if (overall.score >= 85) {
    logSuccess('Your Bloom application is healthy and ready! 🎯');
  } else if (overall.score >= 70) {
    logWarning('Some improvements recommended for optimal performance');

    console.log();
    logBox(
      'Quick Fixes',
      [
        '1. Run npm run bloom:check for detailed analysis',
        '2. Update outdated dependencies',
        '3. Add missing configuration files',
        '4. Run npm run bloom:security for security audit',
      ],
      'blue'
    );
  } else {
    logError('Critical issues found - immediate attention required');

    console.log();
    logBox(
      'Priority Actions',
      [
        '1. Install missing dependencies: npm install',
        '2. Fix configuration issues',
        '3. Create at least one feature: npm run bloom:create',
        '4. Run bloom:doctor again to verify fixes',
      ],
      'red'
    );
  }
}
