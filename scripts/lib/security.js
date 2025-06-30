/**
 * Bloom Framework - Security Audit
 * @file scripts/lib/security.js
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
 * Run security audit
 */
export async function runSecurity(args) {
  const timer = new Timer();

  console.clear();

  logBox(`${symbols.security} Bloom Security Audit`, [
    `${symbols.target} XSS prevention patterns`,
    `${symbols.lightning} Input validation checks`,
    `${symbols.contracts} Secure storage usage`,
  ]);

  const spinner = new Spinner('Scanning for security patterns...');
  spinner.start();

  try {
    // Find all relevant files
    const files = await findSecurityRelevantFiles();
    spinner.stop(`Scanning ${files.length} files for security issues`);

    const results = {
      filesScanned: files.length,
      vulnerabilities: [],
      warnings: [],
      suggestions: [],
      securityScore: 100,
    };

    // Run security checks
    log(`${symbols.lightning} Checking XSS prevention...`, 'white');
    await checkXSSPrevention(files, results);

    log(`${symbols.target} Validating input handling...`, 'white');
    await checkInputValidation(files, results);

    log(`${symbols.contracts} Auditing storage usage...`, 'white');
    await checkStorageSecurity(files, results);

    log(`${symbols.security} Checking configuration security...`, 'white');
    await checkConfigSecurity(results);

    // Calculate security score
    results.securityScore = calculateSecurityScore(results);

    // Display results
    console.clear();
    timer.endWithMessage(`${symbols.check} Security audit completed!`);

    displaySecurityResults(results);
  } catch (error) {
    spinner.fail('Security audit failed');
    logError(`Security audit failed: ${error.message}`);

    if (process.env.DEBUG) {
      console.error('Full error:', error);
    }

    process.exit(1);
  }
}

/**
 * Find files relevant for security scanning
 */
async function findSecurityRelevantFiles() {
  const files = [];
  const directories = ['src/features', 'src/shared', 'src/platform'];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

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

  directories.forEach((dir) => scanDirectory(dir));

  // Also check config files
  const configFiles = ['vite.config.ts', 'package.json', 'tsconfig.json'];

  configFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      files.push(file);
    }
  });

  return files;
}

/**
 * Check for XSS prevention patterns
 */
async function checkXSSPrevention(files, results) {
  const xssPatterns = [
    {
      pattern: /dangerouslySetInnerHTML/g,
      severity: 'high',
      message: 'dangerouslySetInnerHTML usage without sanitization',
    },
    {
      pattern: /innerHTML\s*=/g,
      severity: 'high',
      message: 'Direct innerHTML assignment detected',
    },
    {
      pattern: /eval\s*\(/g,
      severity: 'critical',
      message: 'eval() usage is dangerous',
    },
    {
      pattern: /new Function\s*\(/g,
      severity: 'high',
      message: 'Dynamic function creation detected',
    },
    {
      pattern: /document\.write/g,
      severity: 'medium',
      message: 'document.write usage detected',
    },
  ];

  for (const filePath of files) {
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) continue;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);

      xssPatterns.forEach(({ pattern, severity, message }) => {
        const matches = content.match(pattern);
        if (matches) {
          results.vulnerabilities.push({
            file: relativePath,
            severity,
            type: 'XSS',
            message,
            count: matches.length,
          });
        }
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }
}

/**
 * Check input validation patterns
 */
async function checkInputValidation(files, results) {
  const validationPatterns = [
    {
      pattern: /onChange.*value.*setState/g,
      check: (content) =>
        !content.includes('sanitize') && !content.includes('validate'),
      severity: 'medium',
      message: 'Input handling without visible validation/sanitization',
    },
    {
      pattern: /localStorage\.setItem|sessionStorage\.setItem/g,
      check: (content) =>
        content.includes('password') ||
        content.includes('token') ||
        content.includes('secret'),
      severity: 'high',
      message: 'Potential sensitive data in browser storage',
    },
    {
      pattern: /console\.(log|info|warn|error)/g,
      check: (content) =>
        content.match(
          /console\.(log|info|warn|error).*(?:password|token|secret|key)/i
        ),
      severity: 'medium',
      message: 'Potential sensitive data in console logs',
    },
  ];

  for (const filePath of files) {
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) continue;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);

      validationPatterns.forEach(({ pattern, check, severity, message }) => {
        const matches = content.match(pattern);
        if (matches && check(content)) {
          results.warnings.push({
            file: relativePath,
            severity,
            type: 'Input Validation',
            message,
          });
        }
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }
}

/**
 * Check storage security patterns
 */
async function checkStorageSecurity(files, results) {
  for (const filePath of files) {
    if (!filePath.includes('useBloomStorage') && !filePath.includes('storage'))
      continue;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);

      // Check for proper key validation
      if (
        content.includes('localStorage') ||
        content.includes('sessionStorage')
      ) {
        if (!content.includes('validateKey') && !content.includes('validate')) {
          results.warnings.push({
            file: relativePath,
            severity: 'medium',
            type: 'Storage Security',
            message: 'Storage usage without key validation',
          });
        }
      }

      // Check for sensitive data patterns
      const sensitivePatterns = [
        'password',
        'token',
        'secret',
        'apiKey',
        'privateKey',
      ];
      sensitivePatterns.forEach((pattern) => {
        const regex = new RegExp(
          `(localStorage|sessionStorage).*${pattern}`,
          'i'
        );
        if (regex.test(content)) {
          results.vulnerabilities.push({
            file: relativePath,
            severity: 'high',
            type: 'Data Exposure',
            message: `Potential ${pattern} stored in browser storage`,
          });
        }
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }
}

/**
 * Check configuration security
 */
async function checkConfigSecurity(results) {
  // Check Vite config for security headers
  const viteConfigPath = 'vite.config.ts';
  if (fs.existsSync(viteConfigPath)) {
    const content = fs.readFileSync(viteConfigPath, 'utf8');

    const securityHeaders = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
    ];

    securityHeaders.forEach((header) => {
      if (!content.includes(header)) {
        results.suggestions.push({
          type: 'Configuration',
          severity: 'medium',
          message: `Consider adding ${header} security header`,
        });
      }
    });

    if (content.includes('Content-Security-Policy')) {
      results.suggestions.push({
        type: 'Configuration',
        severity: 'info',
        message: 'CSP headers configured - excellent!',
      });
    }
  }

  // Check package.json for known vulnerable dependencies
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);

    // Check for common vulnerable patterns
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    Object.keys(dependencies).forEach((dep) => {
      if (dep.includes('eval') || dep.includes('unsafe')) {
        results.warnings.push({
          file: 'package.json',
          severity: 'medium',
          type: 'Dependencies',
          message: `Potentially unsafe dependency: ${dep}`,
        });
      }
    });
  }
}

/**
 * Calculate security score based on findings
 */
function calculateSecurityScore(results) {
  let score = 100;

  results.vulnerabilities.forEach((vuln) => {
    switch (vuln.severity) {
      case 'critical':
        score -= 20;
        break;
      case 'high':
        score -= 10;
        break;
      case 'medium':
        score -= 5;
        break;
      default:
        score -= 2;
    }
  });

  results.warnings.forEach((warning) => {
    switch (warning.severity) {
      case 'high':
        score -= 5;
        break;
      case 'medium':
        score -= 3;
        break;
      default:
        score -= 1;
    }
  });

  return Math.max(0, score);
}

/**
 * Display security audit results
 */
function displaySecurityResults(results) {
  const hasVulnerabilities = results.vulnerabilities.length > 0;
  const hasWarnings = results.warnings.length > 0;

  // Determine overall status
  let status = 'excellent';
  let statusColor = 'green';
  let statusIcon = symbols.check;

  if (results.securityScore < 70) {
    status = 'needs attention';
    statusColor = 'red';
    statusIcon = symbols.error;
  } else if (results.securityScore < 85 || hasVulnerabilities) {
    status = 'good with warnings';
    statusColor = 'yellow';
    statusIcon = symbols.warning;
  }

  logBox(
    `${statusIcon} Security Score: ${results.securityScore}/100`,
    [
      `${symbols.target} ${results.filesScanned} files scanned`,
      `${symbols.security} Status: ${status}`,
      `${hasVulnerabilities ? symbols.error : symbols.check} ${
        results.vulnerabilities.length
      } vulnerabilities`,
      `${hasWarnings ? symbols.warning : symbols.check} ${
        results.warnings.length
      } warnings`,
    ],
    statusColor
  );

  // Show vulnerabilities
  if (results.vulnerabilities.length > 0) {
    console.log();
    log(
      `${colors.bright}${symbols.error} Security Vulnerabilities:${colors.reset}`,
      'white'
    );

    results.vulnerabilities.forEach((vuln) => {
      const severityColor =
        vuln.severity === 'critical'
          ? 'red'
          : vuln.severity === 'high'
          ? 'red'
          : vuln.severity === 'medium'
          ? 'yellow'
          : 'gray';

      log(
        `  ${symbols.error} ${
          colors[severityColor]
        }[${vuln.severity.toUpperCase()}]${colors.reset} ${vuln.file}`,
        'white'
      );
      log(
        `    ${vuln.message}${
          vuln.count ? ` (${vuln.count} occurrences)` : ''
        }`,
        'gray'
      );
    });
  }

  // Show warnings
  if (results.warnings.length > 0) {
    console.log();
    log(
      `${colors.bright}${symbols.warning} Security Warnings:${colors.reset}`,
      'white'
    );

    results.warnings.forEach((warning) => {
      log(
        `  ${symbols.warning} ${
          colors.yellow
        }[${warning.severity.toUpperCase()}]${colors.reset} ${warning.file}`,
        'white'
      );
      log(`    ${warning.message}`, 'gray');
    });
  }

  // Show suggestions
  if (results.suggestions.length > 0) {
    console.log();
    log(
      `${colors.bright}${symbols.sparkles} Security Suggestions:${colors.reset}`,
      'white'
    );

    results.suggestions.forEach((suggestion) => {
      const icon =
        suggestion.severity === 'info' ? symbols.check : symbols.lightning;
      log(`  ${icon} ${suggestion.message}`, 'cyan');
    });
  }

  console.log();

  if (results.securityScore >= 85 && !hasVulnerabilities) {
    logSuccess('Security posture is strong! 🔒');
  } else {
    logWarning(
      'Security improvements recommended before production deployment'
    );

    if (hasVulnerabilities) {
      console.log();
      logBox(
        'Security Action Items',
        [
          '1. Fix critical and high severity vulnerabilities',
          '2. Review and sanitize user input handling',
          '3. Implement CSP headers in production',
          '4. Audit storage of sensitive data',
        ],
        'blue'
      );
    }
  }
}
