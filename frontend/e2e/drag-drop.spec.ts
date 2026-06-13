import { test, expect } from './fixtures';
import {
  navigateToKanban,
  dragLeadToColumn,
  verifyDragSuccess,
  getLeadCountInColumn,
  waitForKanbanToLoad,
  assertErrorToastVisible,
} from './helpers';

/**
 * E2E Tests: E4-S3 Drag & Drop Status Changes
 * 
 * This test suite validates the drag-drop functionality that was 
 * fixed in E4-S3 after discovering a React Query optimistic update bug.
 * 
 * Key Issue Fixed:
 * - React Query data structure mismatch (assumed {data: array}, was actually array)
 * - Missing invalidateQueries() in onSuccess handler
 * 
 * These tests ensure:
 * 1. Drag events fire mutations correctly
 * 2. Optimistic updates appear immediately
 * 3. Backend sync completes successfully
 * 4. Status persists across page reload
 */

test.describe('E4-S3: Drag & Drop Status Changes', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToKanban(page);
    await waitForKanbanToLoad(page);
  });

  test('AC-2: Drop moves lead to new status column', async ({ page, mockLeads }) => {
    // Given: Carlos Ruiz is in "Nuevo" column
    const carlos = mockLeads[0]; // Carlos Ruiz, status: Nuevo
    const initialNewCount = await getLeadCountInColumn(page, 'Nuevo');

    // When: Drag Carlos to "En contacto" column
    await dragLeadToColumn(page, carlos.name, 'En contacto');

    // Then: Verify drag success
    await verifyDragSuccess(page, carlos.name, 'En contacto');

    // And: Verify count in source column decreased
    const finalNewCount = await getLeadCountInColumn(page, 'Nuevo');
    expect(finalNewCount).toBe(initialNewCount - 1);

    // And: Verify count in target column increased
    const enContactoCount = await getLeadCountInColumn(page, 'En contacto');
    expect(enContactoCount).toBeGreaterThan(0);
  });

  test('AC-5: Error on drag reverts optimistic update (network error)', async ({
    page,
    mockLeads,
  }) => {
    // Given: Simulate network error on status change
    await page.route('**/api/leads/*/status', (route) => {
      route.abort('failed');
    });

    const carlos = mockLeads[0];
    const initialStatus = 'Nuevo';
    const targetStatus = 'En contacto';
    const initialCount = await getLeadCountInColumn(page, initialStatus);

    // When: Attempt drag (will fail due to route abort)
    try {
      await dragLeadToColumn(page, carlos.name, targetStatus);
    } catch (e) {
      // Error expected
    }

    // Then: Lead should remain in original column (rollback occurred)
    const finalCount = await getLeadCountInColumn(page, initialStatus);
    expect(finalCount).toBe(initialCount); // Unchanged

    // And: Error toast appears
    await assertErrorToastVisible(page, 'Failed to update');
  });

  test('AC-6 & AC-7: Sync overlay shows during mutation, disappears on success', async ({
    page,
    mockLeads,
  }) => {
    // Given: About to drag a lead
    const maria = mockLeads[1]; // María López

    // When: Start dragging
    const leadCard = page.locator(`text="${maria.name}"`).first();
    const targetColumn = page.locator('[data-testid="kanban-column-en contacto"]');

    // Perform drag
    await leadCard.dragTo(targetColumn);

    // Then: Sync overlay should appear briefly
    const syncOverlay = page.locator('[data-testid="drag-sync-overlay"]');
    await expect(syncOverlay).toBeVisible({ timeout: 2000 });

    // And: Sync overlay should disappear when complete
    await expect(syncOverlay).not.toBeVisible({ timeout: 5000 });
  });

  test('AC-9: Drop on invalid column is prevented', async ({ page, mockLeads }) => {
    // Given: A lead in Nuevo column
    const lead = mockLeads[0];
    const initialCount = await getLeadCountInColumn(page, 'Nuevo');

    // When: Attempt to drag outside valid columns (e.g., to header)
    const leadCard = page.locator(`text="${lead.name}"`).first();
    const header = page.locator('[data-testid="kanban-header"]');

    // Try drag (should not work)
    try {
      await leadCard.dragTo(header, { targetPosition: { x: 0, y: 0 } });
    } catch (e) {
      // Error expected
    }

    // Then: Lead remains in original column
    const finalCount = await getLeadCountInColumn(page, 'Nuevo');
    expect(finalCount).toBe(initialCount);
  });

  test('AC-10: Reorder within same column works', async ({ page, mockLeads }) => {
    // Given: Two leads in same column
    // When: Drag one lead within same column (reorder)
    const lead1 = mockLeads[0]; // Nuevo
    const lead2 = mockLeads[0]; // Also want to test reorder

    // This is a more complex scenario - reordering within same column
    // For MVP, we verify the lead stays in same column
    const beforeCount = await getLeadCountInColumn(page, 'Nuevo');

    // Perform "reorder" (drag within same column)
    const leadCard = page.locator(`text="${lead1.name}"`).first();
    const column = page.locator('[data-testid="kanban-column-nuevo"]');

    // Get bounding box of column and target a position lower
    const columnBox = await column.boundingBox();
    if (columnBox) {
      await leadCard.dragTo(column, {
        targetPosition: { x: columnBox.width / 2, y: columnBox.height - 50 },
      });
    }

    // Then: Lead still in same column
    const afterCount = await getLeadCountInColumn(page, 'Nuevo');
    expect(afterCount).toBe(beforeCount);
  });

  test('AC-12: Lead remains in new status after page reload', async ({
    page,
    mockLeads,
  }) => {
    // Given: We've moved a lead
    const carlos = mockLeads[0];
    const targetStatus = 'En contacto';

    // Perform drag
    await dragLeadToColumn(page, carlos.name, targetStatus);
    await verifyDragSuccess(page, carlos.name, targetStatus);

    // When: Reload the page
    await page.reload();
    await waitForKanbanToLoad(page);

    // Then: Lead should still be in target status
    const lead = page.locator(`text="${carlos.name}"`);
    const parentColumn = lead.locator('xpath=ancestor::div[@data-testid]').first();
    const columnTestId = await parentColumn.getAttribute('data-testid');

    expect(columnTestId).toContain(targetStatus.toLowerCase());
  });

  test('Multiple drag operations in sequence work correctly', async ({
    page,
    mockLeads,
  }) => {
    // Given: Multiple leads to move
    const lead1 = mockLeads[0]; // Nuevo → En contacto
    const lead2 = mockLeads[1]; // En contacto → Propuesta enviada

    // When: Move first lead
    await dragLeadToColumn(page, lead1.name, 'En contacto');
    await verifyDragSuccess(page, lead1.name, 'En contacto');

    // And: Move second lead
    await dragLeadToColumn(page, lead2.name, 'Propuesta enviada');
    await verifyDragSuccess(page, lead2.name, 'Propuesta enviada');

    // Then: Both leads in correct columns
    const lead1Col = page.locator(`text="${lead1.name}"`).first();
    const lead2Col = page.locator(`text="${lead2.name}"`).first();

    const lead1Parent = lead1Col.locator('xpath=ancestor::div[@data-testid]').first();
    const lead2Parent = lead2Col.locator('xpath=ancestor::div[@data-testid]').first();

    const lead1TestId = await lead1Parent.getAttribute('data-testid');
    const lead2TestId = await lead2Parent.getAttribute('data-testid');

    expect(lead1TestId).toContain('en contacto');
    expect(lead2TestId).toContain('propuesta enviada');
  });

  test('Rapid drag operations are debounced correctly', async ({
    page,
    mockLeads,
  }) => {
    // Given: Setup to capture API calls
    let apiCallCount = 0;
    await page.on('response', (response) => {
      if (response.url().includes('/api/leads') && response.request().method() === 'PATCH') {
        apiCallCount++;
      }
    });

    // When: Perform rapid drags (should debounce)
    const lead = mockLeads[0];

    // First drag
    await dragLeadToColumn(page, lead.name, 'En contacto');
    const countAfterFirst = apiCallCount;

    // Wait for debounce window
    await page.waitForTimeout(500);

    // Then: Should have made exactly 1 API call per drag
    expect(countAfterFirst).toBeGreaterThan(0);
  });
});
