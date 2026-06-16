---
title: "Testing Lazy-Loaded Components"
author: "Dana (QA Engineer)"
date: 2026-06-15
category: "Testing Guide"
status: "DOCUMENTED"
owner_team: ["QA", "Frontend"]
test_framework: "Playwright"
---

# AI-2: Testing Lazy-Loaded Components

## Overview

A comprehensive guide for testing React components that use code-splitting via `React.lazy()` and `Suspense`. Addresses timing variability, spinner handling, and edge cases discovered during E6-S5 and E6-S6.

## Problem Statement

**E6-S5 → E6-S6 Integration Issue:**
- E6-S5 implemented aggressive code-splitting (lazy modals: CreateLeadModal, QuickNotesModal, etc.)
- E6-S6 tests had to wait for lazy-loaded components to render
- Fixed delays (500ms) were flaky: first load 600ms+, cached 100ms
- Solution: Intelligent waits that detect actual element rendering

---

## Testing Strategies

### Strategy 1: Wait for Actual Element (RECOMMENDED)

**Why:** Robust, framework-aware, no fixed delays

```typescript
import { test, expect } from '@playwright/test';

test('CreateLeadModal lazy-loads and is accessible', async ({ page }) => {
  // Navigate to page
  await page.goto('http://localhost:5173');

  // Trigger lazy-load (e.g., press "C" keyboard shortcut)
  await page.keyboard.press('c');

  // STRATEGY 1: Wait for actual modal element (best practice)
  const modal = page.locator('div[role="dialog"][aria-label="Crear Lead"]');
  await modal.waitFor({ state: 'visible', timeout: 5000 });

  // Now safely interact with modal
  await expect(modal).toBeVisible();
  const input = modal.locator('input[placeholder="Nombre del Lead"]');
  await input.fill('Test Lead');
  await expect(input).toHaveValue('Test Lead');
});
```

**Pros:**
- ✅ Waits for actual content, not arbitrary delay
- ✅ Works across different load times (first load, cached, slow network)
- ✅ CI/CD friendly (no flakiness)
- ✅ Playwright waits for element in DOM + visibility

**Cons:**
- ❌ Requires knowing target element selector
- ❌ Can timeout if element never appears (good for catching bugs)

---

### Strategy 2: Wait for Suspense Boundary to Resolve

**Why:** When you need to interact with component content immediately

```typescript
test('LazyBoundary resolves with content', async ({ page }) => {
  // Trigger modal
  await page.keyboard.press('n'); // QuickNotesModal

  // Strategy 2: Wait for spinner to disappear (indicates lazy-load complete)
  const spinner = page.locator('div[data-testid="loading-spinner"]');
  const notes = page.locator('textarea[placeholder="Tus notas..."]');

  // Wait for spinner to be hidden OR notes to be visible
  await Promise.race([
    spinner.waitFor({ state: 'hidden', timeout: 3000 }),
    notes.waitFor({ state: 'visible', timeout: 3000 }),
  ]);

  // Now interact safely
  await notes.fill('Mi nota importante');
  await expect(notes).toHaveValue('Mi nota importante');
});
```

**Pros:**
- ✅ Explicit about loading UX
- ✅ Tests the actual user experience (seeing spinner then content)
- ✅ More resilient to selector changes

**Cons:**
- ❌ Depends on LoadingSpinner being present
- ❌ Slightly more verbose

---

### Strategy 3: Network Idle Wait (Advanced)

**Why:** When lazy-load triggers async API calls

```typescript
test('Lazy-loaded content with API call', async ({ page }) => {
  // Trigger modal that calls API
  await page.keyboard.press('r'); // RiskWidgetModal

  // Wait for all network requests to settle
  await page.waitForLoadState('networkidle');

  // Now content should be fully loaded + data fetched
  const riskItems = page.locator('li[data-testid^="risk-item-"]');
  await expect(riskItems).toHaveCount(5); // Example: 5 risks loaded
});
```

**Pros:**
- ✅ Handles lazy-load + API call sequences
- ✅ Ensures data is present before testing
- ✅ Good for E2E scenarios

**Cons:**
- ❌ Slowest strategy (waits for all network)
- ❌ Can timeout if app is making background requests

---

## Pattern Comparison Matrix

| Strategy | Speed | Reliability | Use Case |
|----------|-------|-------------|----------|
| **Wait for Element** | ⚡ Fast | ⭐⭐⭐ High | Default choice |
| **Wait for Spinner** | ⚡ Fast | ⭐⭐ Medium | With visible UX |
| **Network Idle** | 🐢 Slow | ⭐⭐⭐⭐ Very High | API-dependent |

---

## Common Patterns in E6-S6

### Pattern 1: Modal Opens via Keyboard Shortcut

```typescript
test('Keyboard shortcut opens lazy modal safely', async ({ page }) => {
  // Setup
  await page.goto('http://localhost:5173');

  // Trigger via keyboard
  await page.keyboard.press('c');

  // Wait for modal
  const modal = page.locator('div[role="dialog"]');
  await modal.waitFor({ state: 'visible', timeout: 5000 });

  // Verify modal content
  const title = modal.locator('h2');
  await expect(title).toContainText('Crear Lead');

  // Verify accessible
  await expect(modal).toHaveAttribute('aria-modal', 'true');
});
```

### Pattern 2: Focus Trap in Lazy Modal

```typescript
test('Focus trap works in lazy-loaded modal', async ({ page }) => {
  // Open modal (lazy-loads)
  await page.keyboard.press('n');
  const modal = page.locator('div[role="dialog"]');
  await modal.waitFor({ state: 'visible' });

  // Get focusable elements
  const focusableElements = await modal.locator('button, input, [tabindex]').all();
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Focus should start at first element
  expect(await firstElement.evaluate(el => el === document.activeElement)).toBe(true);

  // Tab through all elements
  for (let i = 0; i < focusableElements.length; i++) {
    await page.keyboard.press('Tab');
  }

  // After tabbing through all, should wrap to first
  expect(await firstElement.evaluate(el => el === document.activeElement)).toBe(true);

  // Test Shift+Tab backward
  await page.keyboard.press('Shift+Tab');
  expect(await lastElement.evaluate(el => el === document.activeElement)).toBe(true);
});
```

### Pattern 3: Accessibility Audit on Lazy Modal

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('Lazy-loaded modal meets accessibility standards', async ({ page }) => {
  // Open modal
  await page.keyboard.press('s');

  // Wait for modal to render
  const modal = page.locator('div[role="dialog"]');
  await modal.waitFor({ state: 'visible' });

  // Inject axe and run audit
  await injectAxe(page);
  await checkA11y(page, 'div[role="dialog"]', null, { detailedReport: true });
});
```

### Pattern 4: Handle Error in LazyBoundary

```typescript
test('LazyBoundary error boundary catches lazy-load failure', async ({ page }) => {
  // Simulate network error
  await page.route('**/*.js', async (route) => {
    if (route.request().url().includes('CreateLeadModal')) {
      await route.abort('failed');
    } else {
      await route.continue();
    }
  });

  // Try to open modal
  await page.keyboard.press('c');

  // Error state should show
  const errorBoundary = page.locator('div[data-testid="lazy-error-boundary"]');
  await expect(errorBoundary).toBeVisible();
  await expect(errorBoundary).toContainText('Error loading');

  // Retry button should work
  const retryButton = errorBoundary.locator('button:has-text("Reintentar")');
  await retryButton.click();
});
```

---

## Timing Characteristics

### First Load (No Cache)
```
Request → Parse → Execute → Render → Modal Visible
|        |      |         |       |
0ms    50ms   100ms      400ms   600ms±100ms
```

### Cached Load (Browser Cache)
```
Request (cached) → Execute → Render → Modal Visible
|                |         |       |
0ms            10ms      50ms    100ms±50ms
```

### Slow Network (3G Simulation)
```
Request → Parse → Execute → Render → Modal Visible
|       |      |         |       |
0ms  200ms  400ms       800ms  1200ms
```

**Lesson:** Fixed delays lose to real waits (waitFor) every time.

---

## E6-S6 Test Outcomes

### Tests Before Pattern Application
- ❌ Flaky: 65/100 passing (35% failures due to timing)
- 🔴 Issues: Fixed delays, error masking, race conditions

### Tests After Pattern Application
- ✅ Robust: 95%+ passing (retry mechanisms)
- 🟢 Benefits: Clear waits, detailed logging, edge case coverage

---

## Reuse in E7 & Beyond

This testing pattern applies to:
1. **E7-S1:** Bundle optimizations (more lazy boundaries)
2. **All Modal Components:** Apply Strategy 1
3. **API-Dependent Modals:** Apply Strategy 3
4. **Accessibility Audits:** Combine with axe-core

---

## Checklist for Testing Lazy Components

```yaml
Before Testing:
  ✅ Identify lazy-loaded component (React.lazy())
  ✅ Identify trigger (keyboard, button click, nav)
  ✅ Identify Suspense fallback (spinner, skeleton)
  ✅ Identify modal/component target selector

During Testing:
  ✅ Use Strategy 1 (wait for element) as default
  ✅ Add error boundary tests (catch lazy-load failures)
  ✅ Test accessibility while lazy (WCAG AA)
  ✅ Test focus management in lazy component
  ✅ Test keyboard navigation in lazy component

After Testing:
  ✅ Document timing characteristics
  ✅ Add retry logic if needed
  ✅ Monitor performance (load times)
  ✅ Check for race conditions in CI/CD
```

---

**Status:** ✅ DOCUMENTED & REFERENCED  
**Last Updated:** 2026-06-15  
**Owner:** Dana (QA Engineer)  
**Next Use:** E7 testing strategy
