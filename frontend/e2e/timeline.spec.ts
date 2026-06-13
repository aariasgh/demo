import { test, expect } from './fixtures';
import {
  navigateToTimeline,
  getTimelineEventCount,
  filterTimelineByEventType,
  takeScreenshot,
  logPageState,
} from './helpers';

/**
 * E2E Tests: E5-S1 Timeline de Actividad
 *
 * This test suite validates the Activity Timeline feature for individual leads.
 * The timeline shows all events (status changes, notes, calls, emails) for a lead.
 *
 * Key Features Tested:
 * 1. View timeline for a lead
 * 2. Add timeline event (note, call, email)
 * 3. Delete timeline event
 * 4. Filter events by type
 * 5. Timeline persists across page reloads
 *
 * Acceptance Criteria Reference:
 * - AC-1: Timeline loads with existing events
 * - AC-2: User can add note to timeline
 * - AC-3: User can add call event
 * - AC-4: User can add email event
 * - AC-5: User can delete timeline event
 * - AC-6: Filter by event type works
 * - AC-7: All events visible without scroll
 * - AC-8: Events persist after page reload
 * - AC-9: Timeline sorts by date (newest first)
 * - AC-10: Error on add event shows toast
 * - AC-11: Delete confirmation required
 * - AC-12: Empty timeline shows helpful message
 */

test.describe('E5-S1: Timeline de Actividad por Lead', () => {
  test.beforeEach(async ({ page, mockLeads }) => {
    // Navigate to first lead's timeline
    const lead = mockLeads[0]; // Carlos Ruiz
    await page.goto(`/leads/${lead.id}/timeline`);
    await page.waitForSelector('[data-testid="timeline-container"]', { timeout: 5000 });
  });

  test('AC-1: Timeline loads with existing events', async ({ page, mockLeads, mockTimelineEvents }) => {
    // Given: Timeline is open for a lead
    // When: Timeline loads
    // Then: Existing events are displayed

    const eventCount = mockTimelineEvents.length;
    const displayedCount = await getTimelineEventCount(page);

    expect(displayedCount).toBe(eventCount);
    expect(displayedCount).toBeGreaterThan(0);

    // And: Events are visible without excessive scrolling
    const timelineContainer = page.locator('[data-testid="timeline-container"]');
    const isVisible = await timelineContainer.isVisible();
    expect(isVisible).toBe(true);

    // And: Events show timestamps
    const timestamps = await page.locator('[data-testid="timeline-event-timestamp"]').count();
    expect(timestamps).toBe(eventCount);
  });

  test('AC-2: User can add note to timeline', async ({ page, mockLeads }) => {
    // Given: Timeline is open
    // When: User adds a note event

    const addNoteButton = page.locator('[data-testid="timeline-add-note-button"]');
    await addNoteButton.click();

    // Then: Modal or form appears
    const noteForm = page.locator('[data-testid="timeline-add-note-form"]');
    await expect(noteForm).toBeVisible({ timeout: 2000 });

    // And: User types note
    const noteInput = page.locator('[data-testid="timeline-note-input"]');
    const noteText = 'Follow-up call scheduled for tomorrow';
    await noteInput.fill(noteText);

    // And: User submits form
    const submitButton = page.locator('[data-testid="timeline-note-submit"]');
    await submitButton.click();

    // Then: Note is added to timeline
    const noteEvent = page.locator(`text="${noteText}"`);
    await expect(noteEvent).toBeVisible({ timeout: 2000 });

    // And: Success toast appears
    const successToast = page.locator('[role="status"]:has-text("Note added")');
    await expect(successToast).toBeVisible({ timeout: 1000 });
  });

  test('AC-3: User can add call event', async ({ page }) => {
    // Given: Timeline is open
    // When: User adds a call event

    const addCallButton = page.locator('[data-testid="timeline-add-call-button"]');
    await addCallButton.click();

    // Then: Call event form appears
    const callForm = page.locator('[data-testid="timeline-add-call-form"]');
    await expect(callForm).toBeVisible({ timeout: 2000 });

    // And: User fills call details
    const durationInput = page.locator('[data-testid="timeline-call-duration"]');
    await durationInput.fill('15');

    const notesInput = page.locator('[data-testid="timeline-call-notes"]');
    await notesInput.fill('Discussed project scope and timeline');

    // And: User submits form
    const submitButton = page.locator('[data-testid="timeline-call-submit"]');
    await submitButton.click();

    // Then: Call event is added
    const callEvent = page.locator('[data-testid="timeline-event-type-call"]');
    await expect(callEvent).toBeVisible({ timeout: 2000 });

    // And: Duration is shown
    const durationDisplay = page.locator('text="15 minutes"');
    await expect(durationDisplay).toBeVisible();
  });

  test('AC-4: User can add email event', async ({ page }) => {
    // Given: Timeline is open
    // When: User adds an email event

    const addEmailButton = page.locator('[data-testid="timeline-add-email-button"]');
    await addEmailButton.click();

    // Then: Email event form appears
    const emailForm = page.locator('[data-testid="timeline-add-email-form"]');
    await expect(emailForm).toBeVisible({ timeout: 2000 });

    // And: User fills email details
    const subjectInput = page.locator('[data-testid="timeline-email-subject"]');
    await subjectInput.fill('Project Proposal - Next Steps');

    const bodyInput = page.locator('[data-testid="timeline-email-body"]');
    await bodyInput.fill('Please review the attached proposal and let me know your thoughts.');

    // And: User submits form
    const submitButton = page.locator('[data-testid="timeline-email-submit"]');
    await submitButton.click();

    // Then: Email event is added
    const emailEvent = page.locator('[data-testid="timeline-event-type-email"]');
    await expect(emailEvent).toBeVisible({ timeout: 2000 });

    // And: Subject is displayed
    const subjectDisplay = page.locator('text="Project Proposal - Next Steps"');
    await expect(subjectDisplay).toBeVisible();
  });

  test('AC-5: User can delete timeline event', async ({ page, mockTimelineEvents }) => {
    // Given: Timeline has events
    const initialCount = await getTimelineEventCount(page);
    expect(initialCount).toBeGreaterThan(0);

    // When: User clicks delete on first event
    const deleteButton = page.locator('[data-testid="timeline-delete-button"]').first();
    await deleteButton.click();

    // Then: Confirmation dialog appears
    const confirmDialog = page.locator('[role="dialog"]:has-text("Delete event")');
    await expect(confirmDialog).toBeVisible({ timeout: 1000 });

    // And: User confirms deletion
    const confirmButton = page.locator('[data-testid="timeline-delete-confirm"]');
    await confirmButton.click();

    // Then: Event is removed from timeline
    const finalCount = await getTimelineEventCount(page);
    expect(finalCount).toBe(initialCount - 1);

    // And: Success toast appears
    const successToast = page.locator('[role="status"]:has-text("Event deleted")');
    await expect(successToast).toBeVisible({ timeout: 1000 });
  });

  test('AC-6: Filter by event type works', async ({ page, mockTimelineEvents }) => {
    // Given: Timeline has multiple event types
    // When: User clicks filter for "call" events only

    const callFilter = page.locator('[data-testid="timeline-filter-call"]');
    await callFilter.click();

    // Then: Only call events are displayed
    const callEvents = await page.locator('[data-testid="timeline-event-type-call"]').count();
    const otherEvents = await page.locator('[data-testid="timeline-event-type-note"]').count();

    expect(callEvents).toBeGreaterThan(0);
    expect(otherEvents).toBe(0);

    // And: Filter badge shows "Call (X)"
    const filterBadge = page.locator('[data-testid="timeline-filter-badge-call"]');
    await expect(filterBadge).toBeVisible();

    // When: User clears filter
    const clearButton = page.locator('[data-testid="timeline-filter-clear"]');
    await clearButton.click();

    // Then: All events are displayed again
    const allCount = await getTimelineEventCount(page);
    expect(allCount).toBe(mockTimelineEvents.length);
  });

  test('AC-7: All events visible without excessive scroll', async ({ page }) => {
    // Given: Timeline is open
    // When: Timeline loads

    // Then: At least first 10 events should be visible
    const visibleEvents = await page.locator('[data-testid="timeline-event"]:visible').count();
    expect(visibleEvents).toBeGreaterThanOrEqual(Math.min(10, await getTimelineEventCount(page)));

    // And: Timeline container fits in viewport without large scroll
    const timelineContainer = page.locator('[data-testid="timeline-container"]');
    const containerBox = await timelineContainer.boundingBox();
    const viewportSize = await page.viewportSize();

    // Timeline should not require scrolling more than viewport height
    expect(containerBox?.height || 0).toBeLessThanOrEqual((viewportSize?.height || 0) * 2);
  });

  test('AC-8: Events persist after page reload', async ({ page, mockLeads, mockTimelineEvents }) => {
    // Given: Timeline has events (from beforeEach)
    const initialCount = await getTimelineEventCount(page);

    // When: User reloads page
    await page.reload();
    await page.waitForSelector('[data-testid="timeline-container"]', { timeout: 5000 });

    // Then: Same number of events are displayed
    const reloadedCount = await getTimelineEventCount(page);
    expect(reloadedCount).toBe(initialCount);

    // And: Event content is the same
    const timestamps = await page.locator('[data-testid="timeline-event-timestamp"]').allTextContents();
    expect(timestamps.length).toBe(initialCount);
  });

  test('AC-9: Timeline sorts by date (newest first)', async ({ page }) => {
    // Given: Timeline loads
    // When: Timeline is displayed

    // Then: Events are sorted by date descending (newest first)
    const dates = await page.locator('[data-testid="timeline-event-timestamp"]').allTextContents();

    // Parse dates and verify descending order
    let isDescending = true;
    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]).getTime();
      const next = new Date(dates[i + 1]).getTime();
      if (current < next) {
        isDescending = false;
        break;
      }
    }

    expect(isDescending).toBe(true);
  });

  test('AC-10: Error on add event shows toast', async ({ page }) => {
    // Given: Timeline is open
    // When: Simulate network error on add event
    await page.route('**/api/leads/*/timeline', (route) => {
      route.abort('failed');
    });

    const addNoteButton = page.locator('[data-testid="timeline-add-note-button"]');
    await addNoteButton.click();

    const noteForm = page.locator('[data-testid="timeline-add-note-form"]');
    await expect(noteForm).toBeVisible();

    const noteInput = page.locator('[data-testid="timeline-note-input"]');
    await noteInput.fill('Test note');

    const submitButton = page.locator('[data-testid="timeline-note-submit"]');
    await submitButton.click();

    // Then: Error toast appears
    const errorToast = page.locator('[role="alert"]:has-text("Failed")');
    await expect(errorToast).toBeVisible({ timeout: 2000 });
  });

  test('AC-11: Delete confirmation required', async ({ page }) => {
    // Given: Timeline has events
    // When: User clicks delete button

    const deleteButton = page.locator('[data-testid="timeline-delete-button"]').first();
    await deleteButton.click();

    // Then: Confirmation dialog appears (not immediate deletion)
    const confirmDialog = page.locator('[role="dialog"]:has-text("Delete event")');
    await expect(confirmDialog).toBeVisible({ timeout: 1000 });

    // And: Cancel button works
    const cancelButton = page.locator('[data-testid="timeline-delete-cancel"]');
    await cancelButton.click();

    // Then: Dialog closes without deletion
    await expect(confirmDialog).not.toBeVisible();

    const eventCount = await getTimelineEventCount(page);
    expect(eventCount).toBeGreaterThan(0);
  });

  test('AC-12: Empty timeline shows helpful message', async ({ page, mockLeads }) => {
    // Given: Navigate to a lead with no events (if available)
    // For MVP, create a new lead first
    await page.goto('/');
    await page.waitForSelector('[data-testid="create-lead-modal-trigger"]', { timeout: 5000 });

    // Create a new lead
    const createButton = page.locator('[data-testid="create-lead-modal-trigger"]');
    await createButton.click();

    const nameInput = page.locator('[data-testid="lead-name-input"]');
    await nameInput.fill('Empty Timeline Lead');

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(`emptylead-${Date.now()}@test.com`);

    const companyInput = page.locator('input[placeholder*="Company"]');
    await companyInput.fill('Test Corp');

    const submitButton = page.locator('[data-testid="create-lead-submit"]');
    await submitButton.click();

    // Navigate to timeline of new lead
    await page.waitForSelector('[data-testid="kanban-board"]', { timeout: 3000 });
    const newLeadCard = page.locator('text="Empty Timeline Lead"').first();
    await newLeadCard.click();

    const timelineLink = page.locator('[data-testid="lead-timeline-link"]');
    await timelineLink.click();

    // Then: Empty state message appears
    const emptyState = page.locator('[data-testid="timeline-empty-state"]');
    await expect(emptyState).toBeVisible();

    const emptyMessage = page.locator('text="No events yet"');
    await expect(emptyMessage).toBeVisible();

    // And: Helpful CTA appears
    const ctaButton = page.locator('[data-testid="timeline-add-first-event-cta"]');
    await expect(ctaButton).toBeVisible();
  });

  test('Smoke: Timeline navigation from lead card', async ({ page, mockLeads }) => {
    // Navigate to Kanban first
    await page.goto('/');
    await page.waitForSelector('[data-testid="kanban-board"]', { timeout: 5000 });

    // Click on a lead card
    const leadCard = page.locator('[data-testid="lead-card"]').first();
    await leadCard.click();

    // Click timeline link
    const timelineLink = page.locator('[data-testid="lead-timeline-link"]');
    await timelineLink.click();

    // Verify timeline loads
    const timelineContainer = page.locator('[data-testid="timeline-container"]');
    await expect(timelineContainer).toBeVisible({ timeout: 5000 });
  });

  test('Timeline UI: Event details visible', async ({ page }) => {
    // Given: Timeline loads
    // When: Timeline is displayed

    // Then: Each event shows required fields
    const events = page.locator('[data-testid="timeline-event"]');
    const eventCount = await events.count();

    for (let i = 0; i < Math.min(eventCount, 3); i++) {
      const event = events.nth(i);

      // Type badge
      const typeId = await event.locator('[data-testid^="timeline-event-type-"]').getAttribute('data-testid');
      expect(typeId).toBeTruthy();

      // Timestamp
      const timestamp = await event.locator('[data-testid="timeline-event-timestamp"]').isVisible();
      expect(timestamp).toBe(true);

      // Description or content
      const content = await event.locator('[data-testid="timeline-event-content"]').isVisible();
      expect(content).toBe(true);
    }
  });
});
