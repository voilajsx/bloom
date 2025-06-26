#!/usr/bin/env node

/**
 * Advice Slip API CORS Tester
 * Tests the Advice Slip API specifically for CORS compatibility
 *
 * Run: node advice-test.js
 */

import https from 'https';
import http from 'http';

// Advice APIs to test
const ADVICE_APIS = [
  {
    name: 'Advice Slip API - Random',
    url: 'https://api.adviceslip.com/advice',
    description: 'Random advice (most reliable)',
  },
  {
    name: 'Advice Slip API - Search',
    url: 'https://api.adviceslip.com/advice/search/success',
    description: 'Search for advice about success',
  },
  {
    name: 'Bored API',
    url: 'https://www.boredapi.com/api/activity',
    description: 'Random activity suggestions',
  },
  {
    name: 'Cat Facts API',
    url: 'https://catfact.ninja/fact',
    description: 'Random cat facts (for testing)',
  },
  {
    name: 'Dog API',
    url: 'https://dog.ceo/api/breeds/image/random',
    description: 'Random dog images API',
  },
  {
    name: 'JSONPlaceholder',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    description: 'Known working API for comparison',
  },
];

// Test function with detailed CORS checking
async function testAdviceAPI(api) {
  return new Promise((resolve) => {
    const url = new URL(api.url);
    const client = url.protocol === 'https:' ? https : http;

    console.log(`\n🔍 Testing: ${api.name}`);
    console.log(`📡 URL: ${api.url}`);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        Origin: 'http://localhost:3000',
        Referer: 'http://localhost:3000/',
      },
      timeout: 8000,
    };

    const startTime = Date.now();

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;

        // Extract CORS headers
        const corsOrigin = res.headers['access-control-allow-origin'];
        const corsMethods = res.headers['access-control-allow-methods'];
        const corsHeaders = res.headers['access-control-allow-headers'];
        const corsCredentials = res.headers['access-control-allow-credentials'];

        // Parse response data
        let parsedData = null;
        let dataPreview = '';
        try {
          parsedData = JSON.parse(data);
          dataPreview = JSON.stringify(parsedData, null, 2);
        } catch (e) {
          dataPreview = data;
        }

        // Determine CORS compatibility
        const hasCORS = !!corsOrigin;
        const allowsAnyOrigin = corsOrigin === '*';
        const allowsLocalhost =
          corsOrigin === 'http://localhost:3000' ||
          corsOrigin === 'http://localhost' ||
          allowsAnyOrigin;

        // Display results
        console.log(`⏱️  Response Time: ${responseTime}ms`);
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`🌐 CORS Origin: ${corsOrigin || 'NOT SET'}`);
        console.log(`🔧 CORS Methods: ${corsMethods || 'NOT SET'}`);
        console.log(`📋 CORS Headers: ${corsHeaders || 'NOT SET'}`);
        console.log(`🔐 CORS Credentials: ${corsCredentials || 'NOT SET'}`);
        console.log(`📦 Data Length: ${data.length} bytes`);

        // Show sample data (truncated)
        if (dataPreview.length > 300) {
          console.log(`📄 Sample Data: ${dataPreview.substring(0, 300)}...`);
        } else {
          console.log(`📄 Sample Data: ${dataPreview}`);
        }

        // Verdict
        if (res.statusCode === 200 && allowsLocalhost) {
          console.log(`✅ VERDICT: SHOULD WORK in frontend!`);
        } else if (res.statusCode === 200 && hasCORS) {
          console.log(`⚠️  VERDICT: Might work (check browser console)`);
        } else if (res.statusCode === 200) {
          console.log(`❌ VERDICT: Will fail due to CORS`);
        } else {
          console.log(`❌ VERDICT: API error (status ${res.statusCode})`);
        }

        resolve({
          ...api,
          success: true,
          status: res.statusCode,
          responseTime,
          hasCORS,
          allowsLocalhost,
          corsOrigin,
          dataLength: data.length,
          sampleData: parsedData,
          verdict:
            res.statusCode === 200 && allowsLocalhost
              ? 'WORKS'
              : res.statusCode === 200 && hasCORS
              ? 'MIGHT_WORK'
              : 'FAILS',
        });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Connection Error: ${error.message}`);
      resolve({
        ...api,
        success: false,
        error: error.message,
        verdict: 'ERROR',
      });
    });

    req.on('timeout', () => {
      console.log(`⏰ Request Timeout (8s)`);
      req.destroy();
      resolve({
        ...api,
        success: false,
        error: 'Request timeout',
        verdict: 'TIMEOUT',
      });
    });

    req.end();
  });
}

// Test OPTIONS preflight request
async function testPreflight(api) {
  return new Promise((resolve) => {
    const url = new URL(api.url);
    const client = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Accept',
      },
      timeout: 5000,
    };

    const req = client.request(options, (res) => {
      console.log(`🚀 OPTIONS Preflight: ${res.statusCode}`);
      const corsOrigin = res.headers['access-control-allow-origin'];
      const corsAllowed =
        corsOrigin === '*' || corsOrigin === 'http://localhost:3000';

      resolve({
        preflightStatus: res.statusCode,
        preflightAllowed: corsAllowed,
        corsOrigin,
      });
    });

    req.on('error', () => {
      console.log(`❌ OPTIONS Failed`);
      resolve({
        preflightStatus: 0,
        preflightAllowed: false,
      });
    });

    req.on('timeout', () => {
      console.log(`⏰ OPTIONS Timeout`);
      req.destroy();
      resolve({
        preflightStatus: 0,
        preflightAllowed: false,
      });
    });

    req.end();
  });
}

// Browser simulation test
async function simulateBrowserRequest(api) {
  console.log(`\n🌐 Simulating browser request...`);

  const result = await testAdviceAPI(api);
  const preflight = await testPreflight(api);

  return {
    ...result,
    ...preflight,
  };
}

// Main test runner
async function runAdviceTests() {
  console.log('🧪 ADVICE API CORS COMPATIBILITY TEST');
  console.log('='.repeat(80));
  console.log('Testing APIs that might work for inspirational content...\n');

  const results = [];

  for (const api of ADVICE_APIS) {
    console.log('─'.repeat(60));

    const result = await simulateBrowserRequest(api);
    results.push(result);

    console.log(''); // Extra spacing
  }

  // Final summary
  console.log('\n📋 FINAL SUMMARY');
  console.log('='.repeat(80));

  const working = results.filter((r) => r.verdict === 'WORKS');
  const maybe = results.filter((r) => r.verdict === 'MIGHT_WORK');
  const failing = results.filter(
    (r) =>
      r.verdict === 'FAILS' || r.verdict === 'ERROR' || r.verdict === 'TIMEOUT'
  );

  console.log(`\n✅ DEFINITELY WORKING (${working.length}):`);
  working.forEach((api) => {
    console.log(`   🎯 ${api.name}`);
    console.log(`      URL: ${api.url}`);
    console.log(`      Response: ${api.responseTime}ms`);
  });

  console.log(`\n⚠️  MIGHT WORK (${maybe.length}):`);
  maybe.forEach((api) => {
    console.log(`   🤔 ${api.name}`);
    console.log(`      URL: ${api.url}`);
  });

  console.log(`\n❌ NOT WORKING (${failing.length}):`);
  failing.forEach((api) => {
    console.log(`   💥 ${api.name}: ${api.error || 'CORS blocked'}`);
  });

  // Recommendation
  if (working.length > 0) {
    const best = working[0];
    console.log(`\n🏆 RECOMMENDED API: ${best.name}`);
    console.log(`📡 URL: ${best.url}`);
    console.log(`⚡ Response Time: ${best.responseTime}ms`);
    console.log(`🎯 This API should work perfectly in your React app!`);

    // Show implementation example
    console.log(`\n📝 Implementation Example:`);
    console.log(`const response = await apiGet('${best.url}');`);
    console.log(`if (response.success) {`);
    if (best.sampleData?.slip) {
      console.log(`  const advice = response.data.slip.advice;`);
    } else if (best.sampleData?.activity) {
      console.log(`  const activity = response.data.activity;`);
    } else {
      console.log(`  const data = response.data;`);
    }
    console.log(`}`);
  } else {
    console.log(`\n😞 No fully compatible APIs found.`);
    console.log(`💡 Recommendation: Use the local quotes database we created.`);
  }

  console.log(
    '\n🔍 Test completed! Use the recommended API in your quotes feature.'
  );
}

// Run the tests
runAdviceTests().catch(console.error);
