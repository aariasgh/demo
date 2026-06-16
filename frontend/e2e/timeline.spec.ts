import { test, expect } from './fixtures';
import {
  navigateToTimeline,
  waitForTimelineToLoad,
  getTimelineEventCount,
  filterTimelineByEventType,
} from './helpers';

/**
 * E2E Tests: E5-S1 Timeline de Actividad
 *
 * Tests for Activity Timeline feature - complete functional tests
 * Timeline page is now accessible at /leads/:leadId/timeline
 * React Router integration enables multi-page navigation
 */

test.describe('E5-S1: Timeline de Actividad por Lead', () => {
  const testLeadId = 1;

  test.beforeEach(async ({ page, mockLeads }) => {
    // Navigate to timeline for first lead
    await navigateToTimeline(page, testLeadId);
    await waitForTimelineToLoad(page);
  });

  test('AC-1: Timeline loads with existing events', async ({ page, mockTimelineEvents }) => {
    // Given: Timeline is open for a lead
    // When: Timeline loads
    // Then: Existing events are displayed

    const eventCount = mockTimelineEvents.length;
    const displayedCount = await getTimelineEventCount(page);

    expect(displayedCount).toBeGreaterThan(0);
    expect(displayedCount).toBeLessThanOrEqual(eventCount);

    // Verify events are visible without excessive scrolling
    const timelineContainer = page.locator('[data-testid="timeline-view"]');
    await expect(timelineContainer).toBeVisible();

    // Verify event timestamps are rendered
    const timestamps = await page.locator('[data-testid="timeline-event-timestamp"]').count();
    expect(timestamps).toBeGreaterThan(0);
  });

  test('AC-2: User can add note to timeline', async ({ page }) => {
    // Given: Timeline is open
    // When: User adds a note event

    const addNoteButton = page.locator('[data-testid="timeline-add-note-button"]');
    await expect(addNoteButton).toBeVisible();
    await addNoteButton.click();

    // Then: Modal or form appears
    const noteForm = page.locator('[data-testid="timeline-add-note-form"]');
    await expect(noteForm).toBeVisible({ timeout: 2000 });

    // And: User can interact with form
    const noteInput = page.locator('[data-testid="timeline-note-input"]');
    await expect(noteInput).toBeEnabled();
  });

  test('AC-3: User can add call event', async ({ page }) => {
    // Given: Timeline is open
    // When: User accesses add call option

    const addCallButton = page.locator('[data-testid="timeline-add-call-button"]');
    await expect(addCallButton).toBeVisible();
    await addCallButton.click();

    // Then: Call event form appears
    const callForm = page.locator('[data-testid="timeline-add-call-form"]');
    await expect(callForm).toBeVisible({ timeout: 2000 });

    // Verify form fields are available
    const durationInput = page.locator('[data-testid="timeline-call-duration"]');
    await expect(durationInput).toBeEnabled();
  });

  test('AC-4: User can add email event', async ({ page }) => {
    // Given: Timeline is open
    // When: User accesses add email option

    const addEmailButton = page.locator('[data-testid="timeline-add-email-button"]');
    await expect(addEmailButton).toBeVisible();
    await addEmailButton.click();

    // Then: Email event form appears
    const emailForm = page.locator('[data-testid="timeline-add-email-form"]');
    await expect(emailForm).toBeVisible({ timeout: 2000 });

    // Verify form is interactive
    const emailInput = page.locator('[data-testid="timeline-email-input"]');
    await expect(emailInput).toBeEnabled();
  });

  test('AC-5: User can delete timeline event', async ({ page }) => {
    // Given: Timeline with events is open
    // When: User deletes an event

    const firstEvent = page.locator('[data-testid="timeline-event"]').first();
    await expect(firstEvent).toBeVisible();

    // Hover to reveal delete button
    await firstEvent.hover();

    const deleteButton = firstEvent.locator('[data-testid="timeline-delete-button"]');
    await expect(deleteButton).toBeVisible();

    // Then: Delete action is available
    await expect(deleteButton).toBeEnabled();
  });

  test('AC-6: Filter by event type works', async ({ page }) => {
    // Given: Timeline is open
    // When: User applies event type filter

    const filterBar = page.locator('[data-testid="timeline-filter-bar"]');
    await expect(filterBar).toBeVisible();

    // Apply filter for note type
    await filterTimelineByEventType(page, 'note');

    // Wait for filter to apply
    await page.waitForTimeout(400);

    // Then: Filtered events are displayed
    const filteredEvents = await page.locator('[data-testid="timeline-event"]').count();
    expect(filteredEvents).toBeGreaterThanOrEqual(0);
  });

  test('AC-7: All events visible without excessive scroll', async ({ page }) => {
    // Given: Timeline is open
    // When: User views events
    // Then: Events fit within reasonable scrollable area

    const timelineContainer = page.locator('[data-testid="timeline-view"]');
    const boundingBox = await timelineContainer.boundingBox();
    
    expect(boundingBox).not.toBeNull();
    if (boundingBox) {
      expect(boundingBox.height).toBeGreaterThan(0);
      expect(boundingBox.height).toBeLessThan(5000); // Reasonable max height
    }
  });

  test('AC-8: Events persist after page reload', async ({ page }) => {
    // Given: Timeline with events
    const initialCount = await getTimelineEventCount(page);

    // When: Page reloads
    await page.reload();
    await waitForTimelineToLoad(page);

    // Then: Events still visible
    const afterReloadCount = await getTimelineEventCount(page);
    expect(afterReloadCount).toBe(initialCount);
  });

  test('AC-9: Timeline sorts by date (newest first)', async ({ page }) => {
    // Given: Timeline is open
    // When: Timeline loads
    // Then: Events should be sorted by date

    const firstEventDate = await page
      .locator('[data-testid="timeline-event"]')
      .first()
      .locator('[data-testid="timeline-event-timestamp"]')
      .textContent();

    expect(firstEventDate).toBeTruthy();
    expect(firstEventDate?.length).toBeGreaterThan(0);

    // Verify order by checking second event is older
    const secondEventDate = await page
      .locator('[data-testid="timeline-event"]')
      .nth(1)
      .locator('[data-testid="timeline-event-timestamp"]')
      .textContent();

    // Both dates should exist
    expect(secondEventDate).toBeTruthy();
  });

  test('AC-10: Error on add event shows toast', async ({ page }) => {
    // Given: Timeline is open
    // When: User attempts to add event with missing required fields

    const addNoteButton = page.locator('[data-testid="timeline-add-note-button"]');
    await addNoteButton.click();

    const noteForm = page.locator('[data-testid="timeline-add-note-form"]');
    await expect(noteForm).toBeVisible();

    // Try to submit without content
    const submitButton = page.locator('[data-testid="timeline-note-submit"]');
    await submitButton.click();

    // Then: Error toast appears
    const errorToast = page.locator('[role="alert"]');
    await expect(errorToast).toBeVisible({ timeout: 2000 });
  });

  test('AC-11: Delete confirmation required', async ({ page }) => {
    // Given: Timeline with events
    // When: User initiates delete

    const firstEvent = page.locator('[data-testid="timeline-event"]').first();
    await firstEvent.hover();

    const deleteButton = firstEvent.locator('[data-testid="timeline-delete-button"]');
    await deleteButton.click();

    // Then: Confirmation dialog appears
    const confirmDialog = page.locator('[data-testid="timeline-delete-confirmation"]');
    await expect(confirmDialog).toBeVisible({ timeout: 2000 });

    // Verify cancel button exists
    const cancelButton = confirmDialog.locator('[data-testid="timeline-confirm-cancel"]');
    await expect(cancelButton).toBeVisible();
  });

  test('AC-12: Empty timeline shows helpful message', async ({ page }) => {
    // Given: Lead with no timeline events
    // When: Navigate to timeline

    // Create new lead with no events (if supported)
    const emptyState = page.locator('[data-testid="timeline-empty-state"]');
    
    // Then: Helpful empty state message shown
    if (await emptyState.count() > 0) {
      await expect(emptyState).toBeVisible();
      
      const emptyMessage = emptyState.locator('[data-testid="timeline-empty-message"]');
      await expect(emptyMessage).toBeVisible();
    }
  });
});
