import { Page, expect } from '@playwright/test';
import type { LeadFixture, TimelineEventFixture } from './fixtures';

/**
 * E2E Test Utilities
 * Helper functions for common test operations
 */

// ============================================================
// Navigation & Page Helpers
// ============================================================

export async function navigateToKanban(page: Page) {
  await page.goto('/');
  // Wait for Kanban board to load
  await page.waitForSelector('[data-testid="kanban-board"]', { timeout: 5000 });
}

export async function navigateToLeadDetail(page: Page, leadId: number) {
  await page.goto(`/leads/${leadId}`);
  await page.waitForSelector('[data-testid="lead-detail"]', { timeout: 5000 });
}

// ============================================================
// Search & Filter Helpers
// ============================================================

export async function searchLeads(page: Page, query: string) {
  const searchInput = page.locator('input[placeholder*="Search"]');
  await searchInput.fill(query);
  // Wait for debounce (300ms) + render
  await page.waitForTimeout(400);
}

export async function clearSearch(page: Page) {
  const searchInput = page.locator('input[placeholder*="Search"]');
  await searchInput.clear();
  await page.waitForTimeout(400);
}

export async function filterByPriority(page: Page, priority: string) {
  // Click priority filter dropdown
  await page.locator('[data-testid="priority-filter-button"]').click();
  // Click the priority option
  await page.locator(`[data-testid="priority-${priority.toLowerCase()}"]`).click();
  // Wait for filter to apply
  await page.waitForTimeout(400);
}

export async function filterByStatus(page: Page, status: string) {
  // Click status filter tab
  await page.locator(`[data-testid="status-tab-${status.toLowerCase()}"]`).click();
  // Wait for filter to apply
  await page.waitForTimeout(400);
}

export async function getLeadCountInColumn(page: Page, status: string): Promise<number> {
  const columnSelector = `[data-testid="kanban-column-${status.toLowerCase()}"]`;
  const cardSelector = `${columnSelector} [data-testid="lead-card"]`;
  const cards = await page.locator(cardSelector).count();
  return cards;
}

// ============================================================
// Drag & Drop Helpers (E4-S3 Pattern)
// ============================================================

export async function dragLeadToColumn(
  page: Page,
  leadName: string,
  targetStatus: string
) {
  // Find the lead card by name
  const leadCard = page.locator(`[data-testid="lead-card"]`, {
    has: page.locator(`text="${leadName}"`),
  }).first();

  // Get source column
  const sourceColumn = leadCard.locator('xpath=ancestor::div[@data-testid]').first();

  // Get target column
  const targetColumn = page.locator(
    `[data-testid="kanban-column-${targetStatus.toLowerCase()}"]`
  );

  // Perform drag and drop
  await leadCard.dragTo(targetColumn);

  // Wait for mutation to complete (look for sync indicator to disappear)
  await page.waitForTimeout(500); // Allow time for sync
  const syncIndicator = page.locator('[data-testid="drag-sync-overlay"]');
  await expect(syncIndicator).not.toBeVisible({ timeout: 5000 });
}

export async function verifyDragSuccess(
  page: Page,
  leadName: string,
  targetStatus: string
) {
  // Verify lead is in target column
  const targetColumn = page.locator(
    `[data-testid="kanban-column-${targetStatus.toLowerCase()}"]`
  );
  const leadInColumn = targetColumn.locator(`text="${leadName}"`);

  await expect(leadInColumn).toBeVisible({ timeout: 5000 });

  // Verify success toast
  const successToast = page.locator('text=Status updated');
  await expect(successToast).toBeVisible({ timeout: 3000 });
}

// ============================================================
// Timeline Helpers (E5-S1)
// ============================================================

export async function navigateToTimeline(page: Page, leadId: number) {
  await page.goto(`/leads/${leadId}/timeline`);
  await page.waitForSelector('[data-testid="timeline-view"]', { timeout: 5000 });
}

export async function waitForTimelineToLoad(page: Page) {
  await page.waitForSelector('[data-testid="timeline-event-list"]', { timeout: 5000 });
}

export async function getTimelineEventCount(page: Page): Promise<number> {
  const events = await page.locator('[data-testid="timeline-event"]').count();
  return events;
}

export async function filterTimelineByEventType(page: Page, eventType: string) {
  await page.locator(`[data-testid="timeline-filter-${eventType.toLowerCase()}"]`).click();
  await page.waitForTimeout(400);
}

export async function verifyTimelineEventVisible(
  page: Page,
  description: string
) {
  const event = page.locator(`text="${description}"`);
  await expect(event).toBeVisible({ timeout: 5000 });
}

// ============================================================
// Modal & Form Helpers
// ============================================================

export async function openCreateLeadModal(page: Page) {
  await page.locator('[data-testid="create-lead-button"]').click();
  await page.waitForSelector('[data-testid="create-lead-modal"]', { timeout: 5000 });
}

export async function fillCreateLeadForm(page: Page, lead: Partial<LeadFixture>) {
  if (lead.name) {
    await page.locator('input[name="name"]').fill(lead.name);
  }
  if (lead.email) {
    await page.locator('input[name="email"]').fill(lead.email);
  }
  if (lead.company) {
    await page.locator('input[name="company"]').fill(lead.company);
  }
  if (lead.phone) {
    await page.locator('input[name="phone"]').fill(lead.phone);
  }
}

export async function submitCreateLeadForm(page: Page) {
  await page.locator('[data-testid="create-lead-submit"]').click();
  // Wait for success toast or modal to close
  await page.waitForTimeout(500);
}

// ============================================================
// Assertion Helpers
// ============================================================

export async function assertLeadVisible(page: Page, leadName: string) {
  const lead = page.locator(`text="${leadName}"`);
  await expect(lead).toBeVisible({ timeout: 5000 });
}

export async function assertLeadNotVisible(page: Page, leadName: string) {
  const lead = page.locator(`text="${leadName}"`);
  await expect(lead).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  // Use catch because lead might not exist at all, which is fine
}

export async function assertKanbanColumnEmpty(page: Page, status: string) {
  const columnSelector = `[data-testid="kanban-column-${status.toLowerCase()}"]`;
  const emptyState = page.locator(`${columnSelector}:has-text("No hay leads aún")`);
  await expect(emptyState).toBeVisible({ timeout: 5000 });
}

export async function assertErrorToastVisible(page: Page, message?: string) {
  const toast = message ? page.locator(`text="${message}"`) : page.locator('[role="alert"]');
  await expect(toast).toBeVisible({ timeout: 3000 });
}

// ============================================================
// Wait Helpers
// ============================================================

export async function waitForApiCall(page: Page, url: string) {
  await page.waitForResponse((response) => response.url().includes(url));
}

export async function waitForKanbanToLoad(page: Page) {
  // Wait for all columns to be visible
  const columns = ['nuevo', 'en contacto', 'propuesta enviada', 'cerrado'];
  for (const col of columns) {
    await page.waitForSelector(`[data-testid="kanban-column-${col}"]`, { timeout: 5000 });
  }
}

// ============================================================
// Debug Helpers
// ============================================================

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `./test-results/screenshots/${name}.png` });
}

export async function logPageState(page: Page) {
  const url = page.url();
  const title = await page.title();
  console.log(`[Page] URL: ${url}, Title: ${title}`);
}
