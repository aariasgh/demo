# E2E Tests for Mini-CRM

This directory contains end-to-end (E2E) tests for the Mini-CRM frontend using Playwright.

## Setup

### Prerequisites
- Node.js 16+
- Frontend dependencies installed (`npm install`)
- Playwright installed (`npm install --save-dev @playwright/test`)

### Installation

```bash
cd frontend
npm install --save-dev @playwright/test
```

## Running Tests

### Run all E2E tests
```bash
npm run e2e
```

### Run tests in UI mode (interactive)
```bash
npm run e2e:ui
```

### Debug a specific test
```bash
npm run e2e:debug -- e2e/drag-drop.spec.ts
```

### View test report
```bash
npm run e2e:report
```

## Test Organization

### Test Files

#### `fixtures.ts`
Provides:
- Test data (mock leads, timeline events)
- Custom test fixture extension (if needed)

#### `helpers.ts`
Helper functions for common operations:
- Navigation (`navigateToKanban`, `navigateToTimeline`)
- Search & Filter (`searchLeads`, `filterByPriority`)
- Drag & Drop (`dragLeadToColumn`, `verifyDragSuccess`)
- Timeline (`navigateToTimeline`, `getTimelineEventCount`)
- Assertions (`assertLeadVisible`, `assertErrorToastVisible`)
- Debug (`takeScreenshot`, `logPageState`)

#### `drag-drop.spec.ts`
Tests for E4-S3 drag-drop functionality:
- AC-2: Drop moves lead to new status
- AC-5: Error on drag reverts optimistic update
- AC-6/AC-7: Sync overlay shows/hides
- AC-9: Invalid drop prevented
- AC-10: Reorder within column
- AC-12: Status persists after reload

#### `filters.spec.ts`
Tests for search, filters, and basic functionality:
- Smoke tests (board loads, columns visible)
- E4-S1 search tests (by name, email, company)
- E4-S3 status filter tabs

## Configuration

### `playwright.config.ts`
Playwright configuration:
- Base URL: `http://localhost:5173` (Vite dev server)
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Screenshots: Captured on failure
- Reports: HTML report available

### Key Settings
- **Retries**: 0 (locally), 2 (CI)
- **Parallel**: Yes (locally), No (CI)
- **Timeout**: 30s per test
- **Web Server**: Auto-starts `npm run dev`

## Writing New Tests

### Basic Structure

```typescript
import { test, expect } from './fixtures';
import { navigateToKanban, assertLeadVisible } from './helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup (e.g., navigate to page)
    await navigateToKanban(page);
  });

  test('should do something', async ({ page, mockLeads }) => {
    // Given: Setup context
    const lead = mockLeads[0];

    // When: Perform action
    await assertLeadVisible(page, lead.name);

    // Then: Verify result
    expect(true).toBe(true);
  });
});
```

### Using Fixtures

```typescript
test('example', async ({ page, mockLeads, mockTimelineEvents }) => {
  // mockLeads: Array of test leads
  // mockTimelineEvents: Array of test timeline events
});
```

### Using Helpers

```typescript
import {
  navigateToKanban,
  dragLeadToColumn,
  verifyDragSuccess,
  searchLeads,
  filterByPriority,
} from './helpers';

// Then use in tests
await navigateToKanban(page);
await dragLeadToColumn(page, 'Carlos Ruiz', 'En contacto');
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Use Given-When-Then structure
3. **Waits**: Use explicit waits (`page.waitForSelector`, `expect(...).toBeVisible()`)
4. **Cleanup**: Tests auto-cleanup, but reset state in `beforeEach` if needed
5. **Assertions**: Use meaningful assertions with timeouts
6. **Debugging**: Use helpers like `takeScreenshot` and `logPageState`

## Troubleshooting

### Tests timeout
- Increase timeout in `playwright.config.ts` or per test: `test.setTimeout(60000)`
- Add debug logging: `page.on('console', msg => console.log(msg.text()))`

### Element not found
- Check selector in browser devtools
- Verify test data is loaded (`waitForKanbanToLoad`)
- Add debug screenshot before assertion: `await page.screenshot()`

### Flaky tests
- Add explicit waits for state changes
- Use more specific selectors (`data-testid` preferred)
- Avoid hardcoded timeouts, use assertions instead

### Web server won't start
- Ensure Vite dev server runs: `npm run dev`
- Check port 5173 is available
- Verify `baseURL` in config matches dev server

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E tests
  run: npm run e2e

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Performance Targets

- **Drag-drop test**: <5s
- **Filter tests**: <3s per test
- **Full suite**: <2 min for all browsers

## Future Improvements

- [ ] Add visual regression testing
- [ ] Add performance metrics collection
- [ ] Integrate with monitoring (Sentry, DataDog)
- [ ] Add accessibility testing (axe-core)
- [ ] Add mobile device testing matrix

## References

- [Playwright Documentation](https://playwright.dev)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)
