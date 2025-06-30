/**
 * Bloom Framework - CLI Help System
 * @file scripts/lib/help.js
 */

import { colors, symbols, logBox, log } from './utils.js';

export function showHelp() {
  console.clear();

  logBox(`${symbols.bloom} Bloom Framework CLI`, [
    `${symbols.sparkles} Feature-modular frontend framework`,
    `${symbols.lightning} LLM-accelerated development`,
    `${symbols.rocket} Build amazing applications faster`,
  ]);

  log(
    `${colors.bright}${colors.blue}Development Commands:${colors.reset}`,
    'white'
  );
  console.log(
    `  ${colors.cyan}bloom:dev${colors.reset}      ${colors.gray}Start development server with hot reload${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}bloom:build${colors.reset}    ${colors.gray}Build optimized production bundle${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}bloom:preview${colors.reset}  ${colors.gray}Preview production build locally${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}bloom:ssg${colors.reset}      ${colors.gray}Generate static site with SEO optimization${colors.reset}`
  );
  console.log();

  log(
    `${colors.bright}${colors.green}Feature Commands:${colors.reset}`,
    'white'
  );
  console.log(
    `  ${colors.cyan}bloom:create${colors.reset}   ${colors.gray}Create new feature with templates${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}bloom:add${colors.reset}      ${colors.gray}Add component/page/hook to existing feature${colors.reset}`
  );
  console.log();

  log(
    `${colors.bright}${colors.yellow}Quality Commands:${colors.reset}`,
    'white'
  );
  console.log(
    `  ${colors.cyan}bloom:check${colors.reset}    ${colors.gray}Run all checks (contracts, security, format)${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}bloom:format${colors.reset}   ${colors.gray}Format code to Bloom patterns${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}bloom:doctor${colors.reset}   ${colors.gray}Complete health diagnosis${colors.reset}`
  );
  console.log();

  log(
    `${colors.bright}${colors.magenta}Advanced Commands:${colors.reset}`,
    'white'
  );
  console.log(
    `  ${colors.cyan}bloom:contracts${colors.reset} ${colors.gray}Validate feature contracts${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}bloom:security${colors.reset}  ${colors.gray}Security audit and validation${colors.reset}`
  );
  console.log();

  log(`${colors.bright}Examples:${colors.reset}`, 'white');
  console.log(`  ${colors.gray}npm run bloom:create my-feature${colors.reset}`);
  console.log(
    `  ${colors.gray}npm run bloom:add my-feature MyComponent${colors.reset}`
  );
  console.log(
    `  ${colors.gray}npm run bloom:build && npm run bloom:preview${colors.reset}`
  );
  console.log(`  ${colors.gray}npm run bloom:check${colors.reset}`);
  console.log();

  log(`${colors.bright}Options:${colors.reset}`, 'white');
  console.log(
    `  ${colors.cyan}--help, -h${colors.reset}     ${colors.gray}Show this help message${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}--version, -v${colors.reset}  ${colors.gray}Show version information${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}--debug${colors.reset}        ${colors.gray}Show detailed debug information${colors.reset}`
  );
  console.log();

  log(
    `${symbols.bloom} ${colors.bright}Happy coding with Bloom!${colors.reset}`,
    'white'
  );
}

export function showCreateHelp() {
  console.clear();

  logBox(`${symbols.magic} bloom:create - Feature Creation`, [
    'Create new features with smart templates',
    'Choose from page, API, form, dashboard, or component types',
  ]);

  log(`${colors.bright}Usage:${colors.reset}`, 'white');
  console.log(
    `  ${colors.cyan}npm run bloom:create <feature-name>${colors.reset}`
  );
  console.log();

  log(`${colors.bright}Interactive Mode:${colors.reset}`, 'white');
  console.log(
    `  ${colors.gray}• Choose feature type (page, API, form, dashboard, component)${colors.reset}`
  );
  console.log(
    `  ${colors.gray}• Select state management (local vs Redux)${colors.reset}`
  );
  console.log(
    `  ${colors.gray}• Configure navigation integration${colors.reset}`
  );
  console.log(
    `  ${colors.gray}• Auto-generate contracts and structure${colors.reset}`
  );
  console.log();

  log(`${colors.bright}Examples:${colors.reset}`, 'white');
  console.log(
    `  ${colors.cyan}npm run bloom:create user-dashboard${colors.reset}`
  );
  console.log(`  ${colors.cyan}npm run bloom:create blog-posts${colors.reset}`);
  console.log(
    `  ${colors.cyan}npm run bloom:create auth-system${colors.reset}`
  );
}

export function showAddHelp() {
  console.clear();

  logBox(`${symbols.code} bloom:add - Add to Features`, [
    'Add components, pages, or hooks to existing features',
    'Smart detection and template generation',
  ]);

  log(`${colors.bright}Usage:${colors.reset}`, 'white');
  console.log(
    `  ${colors.cyan}npm run bloom:add <feature-name> <item-name>${colors.reset}`
  );
  console.log();

  log(`${colors.bright}Auto-Detection:${colors.reset}`, 'white');
  console.log(
    `  ${colors.gray}• Names starting with 'use' → Hook${colors.reset}`
  );
  console.log(
    `  ${colors.gray}• Names containing 'Page' → Page component${colors.reset}`
  );
  console.log(`  ${colors.gray}• Everything else → Component${colors.reset}`);
  console.log();

  log(`${colors.bright}Examples:${colors.reset}`, 'white');
  console.log(
    `  ${colors.cyan}npm run bloom:add quotes useQuoteFilters${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}npm run bloom:add quotes QuoteCard${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}npm run bloom:add quotes SettingsPage${colors.reset}`
  );
}

export function showCheckHelp() {
  console.clear();

  logBox(`${symbols.target} bloom:check - Quality Assurance`, [
    'Run comprehensive checks on your Bloom application',
    'Contracts, security, formatting, and performance',
  ]);

  log(`${colors.bright}What it checks:${colors.reset}`, 'white');
  console.log(
    `  ${symbols.contracts} ${colors.gray}Contract validation and dependencies${colors.reset}`
  );
  console.log(
    `  ${symbols.security} ${colors.gray}Security patterns and vulnerabilities${colors.reset}`
  );
  console.log(
    `  ${symbols.code} ${colors.gray}Code formatting and LLM patterns${colors.reset}`
  );
  console.log(
    `  ${symbols.performance} ${colors.gray}Bundle size and performance metrics${colors.reset}`
  );
  console.log();

  log(`${colors.bright}Usage:${colors.reset}`, 'white');
  console.log(`  ${colors.cyan}npm run bloom:check${colors.reset}`);
  console.log();

  log(`${colors.bright}Individual Checks:${colors.reset}`, 'white');
  console.log(
    `  ${colors.cyan}npm run bloom:contracts${colors.reset} ${colors.gray}(contracts only)${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}npm run bloom:security${colors.reset}  ${colors.gray}(security only)${colors.reset}`
  );
  console.log(
    `  ${colors.cyan}npm run bloom:format${colors.reset}    ${colors.gray}(formatting only)${colors.reset}`
  );
}
