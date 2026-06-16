# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: timeline.spec.ts >> E5-S1: Timeline de Actividad por Lead >> AC-11: Delete confirmation required
- Location: e2e\timeline.spec.ts:204:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

# Test source

```ts
  1   | import { test, expect } from './fixtures';
  2   | import {
  3   |   navigateToTimeline,
  4   |   waitForTimelineToLoad,
  5   |   getTimelineEventCount,
  6   |   filterTimelineByEventType,
  7   | } from './helpers';
  8   | 
  9   | /**
  10  |  * E2E Tests: E5-S1 Timeline de Actividad
  11  |  *
  12  |  * Tests for Activity Timeline feature - complete functional tests
  13  |  * Timeline page is now accessible at /leads/:leadId/timeline
  14  |  * React Router integration enables multi-page navigation
  15  |  */
  16  | 
  17  | test.describe('E5-S1: Timeline de Actividad por Lead', () => {
  18  |   const testLeadId = 1;
  19  | 
> 20  |   test.beforeEach(async ({ page, mockLeads }) => {
      |        ^ Test timeout of 30000ms exceeded while running "beforeEach" hook.
  21  |     // Navigate to timeline for first lead
  22  |     await navigateToTimeline(page, testLeadId);
  23  |     await waitForTimelineToLoad(page);
  24  |   });
  25  | 
  26  |   test('AC-1: Timeline loads with existing events', async ({ page, mockTimelineEvents }) => {
  27  |     // Given: Timeline is open for a lead
  28  |     // When: Timeline loads
  29  |     // Then: Existing events are displayed
  30  | 
  31  |     const eventCount = mockTimelineEvents.length;
  32  |     const displayedCount = await getTimelineEventCount(page);
  33  | 
  34  |     expect(displayedCount).toBeGreaterThan(0);
  35  |     expect(displayedCount).toBeLessThanOrEqual(eventCount);
  36  | 
  37  |     // Verify events are visible without excessive scrolling
  38  |     const timelineContainer = page.locator('[data-testid="timeline-view"]');
  39  |     await expect(timelineContainer).toBeVisible();
  40  | 
  41  |     // Verify event timestamps are rendered
  42  |     const timestamps = await page.locator('[data-testid="timeline-event-timestamp"]').count();
  43  |     expect(timestamps).toBeGreaterThan(0);
  44  |   });
  45  | 
  46  |   test('AC-2: User can add note to timeline', async ({ page }) => {
  47  |     // Given: Timeline is open
  48  |     // When: User adds a note event
  49  | 
  50  |     const addNoteButton = page.locator('[data-testid="timeline-add-note-button"]');
  51  |     await expect(addNoteButton).toBeVisible();
  52  |     await addNoteButton.click();
  53  | 
  54  |     // Then: Modal or form appears
  55  |     const noteForm = page.locator('[data-testid="timeline-add-note-form"]');
  56  |     await expect(noteForm).toBeVisible({ timeout: 2000 });
  57  | 
  58  |     // And: User can interact with form
  59  |     const noteInput = page.locator('[data-testid="timeline-note-input"]');
  60  |     await expect(noteInput).toBeEnabled();
  61  |   });
  62  | 
  63  |   test('AC-3: User can add call event', async ({ page }) => {
  64  |     // Given: Timeline is open
  65  |     // When: User accesses add call option
  66  | 
  67  |     const addCallButton = page.locator('[data-testid="timeline-add-call-button"]');
  68  |     await expect(addCallButton).toBeVisible();
  69  |     await addCallButton.click();
  70  | 
  71  |     // Then: Call event form appears
  72  |     const callForm = page.locator('[data-testid="timeline-add-call-form"]');
  73  |     await expect(callForm).toBeVisible({ timeout: 2000 });
  74  | 
  75  |     // Verify form fields are available
  76  |     const durationInput = page.locator('[data-testid="timeline-call-duration"]');
  77  |     await expect(durationInput).toBeEnabled();
  78  |   });
  79  | 
  80  |   test('AC-4: User can add email event', async ({ page }) => {
  81  |     // Given: Timeline is open
  82  |     // When: User accesses add email option
  83  | 
  84  |     const addEmailButton = page.locator('[data-testid="timeline-add-email-button"]');
  85  |     await expect(addEmailButton).toBeVisible();
  86  |     await addEmailButton.click();
  87  | 
  88  |     // Then: Email event form appears
  89  |     const emailForm = page.locator('[data-testid="timeline-add-email-form"]');
  90  |     await expect(emailForm).toBeVisible({ timeout: 2000 });
  91  | 
  92  |     // Verify form is interactive
  93  |     const emailInput = page.locator('[data-testid="timeline-email-input"]');
  94  |     await expect(emailInput).toBeEnabled();
  95  |   });
  96  | 
  97  |   test('AC-5: User can delete timeline event', async ({ page }) => {
  98  |     // Given: Timeline with events is open
  99  |     // When: User deletes an event
  100 | 
  101 |     const firstEvent = page.locator('[data-testid="timeline-event"]').first();
  102 |     await expect(firstEvent).toBeVisible();
  103 | 
  104 |     // Hover to reveal delete button
  105 |     await firstEvent.hover();
  106 | 
  107 |     const deleteButton = firstEvent.locator('[data-testid="timeline-delete-button"]');
  108 |     await expect(deleteButton).toBeVisible();
  109 | 
  110 |     // Then: Delete action is available
  111 |     await expect(deleteButton).toBeEnabled();
  112 |   });
  113 | 
  114 |   test('AC-6: Filter by event type works', async ({ page }) => {
  115 |     // Given: Timeline is open
  116 |     // When: User applies event type filter
  117 | 
  118 |     const filterBar = page.locator('[data-testid="timeline-filter-bar"]');
  119 |     await expect(filterBar).toBeVisible();
  120 | 
```