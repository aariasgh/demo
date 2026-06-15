#!/usr/bin/env node
// E6-S3 Accessibility Audit Script
// Runs axe-core against the running app and reports violations

import { chromium } from '@playwright/test';

const TARGET_URL = 'http://localhost:3001';
const TIMEOUT = 30000;

async function runAccessibilityAudit() {
  console.log('🔍 Starting Accessibility Audit (WCAG AA)...\n');
  console.log(`📍 Target URL: ${TARGET_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms\n`);

  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();

    console.log('⏳ Loading application...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    console.log('✅ Application loaded\n');

    console.log('🧪 Running axe accessibility audit...');
    
    // Inject axe-core and run audit
    const results = await page.evaluate(async () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.12.1/axe.min.js';
        script.onload = () => {
          setTimeout(() => {
            window.axe.run({ runOnly: { type: 'wcag2aa' } }, (error, results) => {
              if (error) reject(error);
              resolve(results);
            });
          }, 500);
        };
        script.onerror = () => reject(new Error('Failed to load axe-core'));
        document.head.appendChild(script);
      });
    });

    console.log('✅ Audit completed\n');

    // Display results
    console.log('═══════════════════════════════════════════');
    console.log('ACCESSIBILITY AUDIT RESULTS (WCAG 2 AA)');
    console.log('═══════════════════════════════════════════\n');

    const { violations, passes } = results;

    console.log(`📊 SUMMARY:`);
    console.log(`   Violations: ${violations.length}`);
    console.log(`   Passes:     ${passes.length}\n`);

    if (violations.length === 0) {
      console.log('🎉 ✅ NO VIOLATIONS FOUND (WCAG AA Baseline)');
    } else {
      console.log(`⚠️  VIOLATIONS FOUND (${violations.length}):\n`);

      violations.forEach((violation, idx) => {
        const impactStyle = violation.impact === 'critical' ? '🔴' : 
                           violation.impact === 'serious' ? '🟠' : '🟡';
        console.log(`${idx + 1}. ${impactStyle} ${violation.id.toUpperCase()}`);
        console.log(`   Impact: ${violation.impact.toUpperCase()}`);
        console.log(`   Description: ${violation.description}`);
        console.log(`   Elements affected: ${violation.nodes.length}`);

        violation.nodes.slice(0, 1).forEach((node) => {
          console.log(`   Example: ${node.html.substring(0, 80).replace(/\n/g, ' ')}...`);
        });
        console.log();
      });
    }

    console.log('═══════════════════════════════════════════\n');

    await browser.close();
    process.exit(violations.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Error running audit:');
    console.error(error.message);

    if (browser) {
      await browser.close();
    }

    process.exit(1);
  }
}

runAccessibilityAudit();
