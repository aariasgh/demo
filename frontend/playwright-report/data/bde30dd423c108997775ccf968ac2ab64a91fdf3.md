# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: drag-drop.spec.ts >> E4-S3: Drag & Drop Status Changes >> AC-6 & AC-7: Sync overlay shows during mutation, disappears on success
- Location: e2e\drag-drop.spec.ts:83:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="drag-sync-overlay"]')
Expected: visible
Timeout: 2000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 2000ms
  - waiting for locator('[data-testid="drag-sync-overlay"]')

```

```yaml
- banner:
  - heading "Mini CRM de Seguimiento de Leads" [level=1]
- main:
  - textbox "Buscar leads por nombre, empresa o email":
    - /placeholder: "Buscar: nombre, empresa, email..."
  - button "Abrir filtro de prioridad":
    - text: Prioridad
    - img
  - tablist "Filtrar leads por estado":
    - tab "Filtrar por Todos": Todos
    - tab "Filtrar por Nuevo": Nuevo
    - tab "Filtrar por En contacto": En contacto
    - tab "Filtrar por Propuesta": Propuesta
    - tab "Filtrar por Cerrado": Cerrado
  - status
  - text: ✅ Todos en día
  - paragraph: No hay leads en riesgo
  - heading "Pipeline de Ventas" [level=1]
  - paragraph: "Total de leads: 4"
  - heading "Nuevo" [level=2]
  - text: "1"
  - region "Columna Nuevo con 1 leads":
    - 'button "Lead: Test Lead de Test Corp. Estado: Nuevo. Arrastra para cambiar estado."':
      - 'article "Lead: Test Lead de Test Corp. Estado: Nuevo. Arrastra para cambiar estado."':
        - paragraph: Test Lead
        - paragraph: Test Corp
        - paragraph: test-1@example.com
        - paragraph: "+34912345670"
  - heading "En contacto" [level=2]
  - text: "1"
  - region "Columna En contacto con 1 leads":
    - 'button "Lead: María López de DataSys. Estado: En contacto. Arrastra para cambiar estado."':
      - 'article "Lead: María López de DataSys. Estado: En contacto. Arrastra para cambiar estado."':
        - paragraph: María López
        - paragraph: DataSys
        - paragraph: maria@datasys.com
        - paragraph: "+34913456789"
  - heading "Propuesta enviada" [level=2]
  - text: "1"
  - region "Columna Propuesta enviada con 1 leads":
    - 'button "Lead: Juan García de TechCorp SA. Estado: Propuesta enviada. Arrastra para cambiar estado."':
      - 'article "Lead: Juan García de TechCorp SA. Estado: Propuesta enviada. Arrastra para cambiar estado."':
        - paragraph: Juan García
        - paragraph: TechCorp SA
        - paragraph: test.lead@example.com
        - paragraph: "+34912345678"
  - heading "Cerrado" [level=2]
  - text: "1"
  - region "Columna Cerrado con 1 leads":
    - 'button "Lead: Carlos Ruiz de CloudNet. Estado: Cerrado. Arrastra para cambiar estado."':
      - 'article "Lead: Carlos Ruiz de CloudNet. Estado: Cerrado. Arrastra para cambiar estado."':
        - paragraph: Carlos Ruiz
        - paragraph: CloudNet
        - paragraph: carlos@cloudnet.es
        - paragraph: "+34914567890"
```

# Test source

```ts
  1   | import { test, expect } from './fixtures';
  2   | import {
  3   |   navigateToKanban,
  4   |   dragLeadToColumn,
  5   |   verifyDragSuccess,
  6   |   getLeadCountInColumn,
  7   |   waitForKanbanToLoad,
  8   |   assertErrorToastVisible,
  9   | } from './helpers';
  10  | 
  11  | /**
  12  |  * E2E Tests: E4-S3 Drag & Drop Status Changes
  13  |  * 
  14  |  * This test suite validates the drag-drop functionality that was 
  15  |  * fixed in E4-S3 after discovering a React Query optimistic update bug.
  16  |  * 
  17  |  * Key Issue Fixed:
  18  |  * - React Query data structure mismatch (assumed {data: array}, was actually array)
  19  |  * - Missing invalidateQueries() in onSuccess handler
  20  |  * 
  21  |  * These tests ensure:
  22  |  * 1. Drag events fire mutations correctly
  23  |  * 2. Optimistic updates appear immediately
  24  |  * 3. Backend sync completes successfully
  25  |  * 4. Status persists across page reload
  26  |  */
  27  | 
  28  | test.describe('E4-S3: Drag & Drop Status Changes', () => {
  29  |   test.beforeEach(async ({ page }) => {
  30  |     await navigateToKanban(page);
  31  |     await waitForKanbanToLoad(page);
  32  |   });
  33  | 
  34  |   test('AC-2: Drop moves lead to new status column', async ({ page, mockLeads }) => {
  35  |     // Given: Carlos Ruiz is in "Nuevo" column
  36  |     const carlos = mockLeads[0]; // Carlos Ruiz, status: Nuevo
  37  |     const initialNewCount = await getLeadCountInColumn(page, 'Nuevo');
  38  | 
  39  |     // When: Drag Carlos to "En contacto" column
  40  |     await dragLeadToColumn(page, carlos.name, 'En contacto');
  41  | 
  42  |     // Then: Verify drag success
  43  |     await verifyDragSuccess(page, carlos.name, 'En contacto');
  44  | 
  45  |     // And: Verify count in source column decreased
  46  |     const finalNewCount = await getLeadCountInColumn(page, 'Nuevo');
  47  |     expect(finalNewCount).toBe(initialNewCount - 1);
  48  | 
  49  |     // And: Verify count in target column increased
  50  |     const enContactoCount = await getLeadCountInColumn(page, 'En contacto');
  51  |     expect(enContactoCount).toBeGreaterThan(0);
  52  |   });
  53  | 
  54  |   test('AC-5: Error on drag reverts optimistic update (network error)', async ({
  55  |     page,
  56  |     mockLeads,
  57  |   }) => {
  58  |     // Given: Simulate network error on status change
  59  |     await page.route('**/api/leads/*/status', (route) => {
  60  |       route.abort('failed');
  61  |     });
  62  | 
  63  |     const carlos = mockLeads[0];
  64  |     const initialStatus = 'Nuevo';
  65  |     const targetStatus = 'En contacto';
  66  |     const initialCount = await getLeadCountInColumn(page, initialStatus);
  67  | 
  68  |     // When: Attempt drag (will fail due to route abort)
  69  |     try {
  70  |       await dragLeadToColumn(page, carlos.name, targetStatus);
  71  |     } catch (e) {
  72  |       // Error expected
  73  |     }
  74  | 
  75  |     // Then: Lead should remain in original column (rollback occurred)
  76  |     const finalCount = await getLeadCountInColumn(page, initialStatus);
  77  |     expect(finalCount).toBe(initialCount); // Unchanged
  78  | 
  79  |     // And: Error toast appears
  80  |     await assertErrorToastVisible(page, 'Failed to update');
  81  |   });
  82  | 
  83  |   test('AC-6 & AC-7: Sync overlay shows during mutation, disappears on success', async ({
  84  |     page,
  85  |     mockLeads,
  86  |   }) => {
  87  |     // Given: About to drag a lead
  88  |     const maria = mockLeads[1]; // María López
  89  | 
  90  |     // When: Start dragging
  91  |     const leadCard = page.locator(`text="${maria.name}"`).first();
  92  |     const targetColumn = page.locator('[data-testid="kanban-column-en contacto"]');
  93  | 
  94  |     // Perform drag
  95  |     await leadCard.dragTo(targetColumn);
  96  | 
  97  |     // Then: Sync overlay should appear briefly
  98  |     const syncOverlay = page.locator('[data-testid="drag-sync-overlay"]');
> 99  |     await expect(syncOverlay).toBeVisible({ timeout: 2000 });
      |                               ^ Error: expect(locator).toBeVisible() failed
  100 | 
  101 |     // And: Sync overlay should disappear when complete
  102 |     await expect(syncOverlay).not.toBeVisible({ timeout: 5000 });
  103 |   });
  104 | 
  105 |   test('AC-9: Drop on invalid column is prevented', async ({ page, mockLeads }) => {
  106 |     // Given: A lead in Nuevo column
  107 |     const lead = mockLeads[0];
  108 |     const initialCount = await getLeadCountInColumn(page, 'Nuevo');
  109 | 
  110 |     // When: Attempt to drag outside valid columns (e.g., to header)
  111 |     const leadCard = page.locator(`text="${lead.name}"`).first();
  112 |     const header = page.locator('[data-testid="kanban-header"]');
  113 | 
  114 |     // Try drag (should not work)
  115 |     try {
  116 |       await leadCard.dragTo(header, { targetPosition: { x: 0, y: 0 } });
  117 |     } catch (e) {
  118 |       // Error expected
  119 |     }
  120 | 
  121 |     // Then: Lead remains in original column
  122 |     const finalCount = await getLeadCountInColumn(page, 'Nuevo');
  123 |     expect(finalCount).toBe(initialCount);
  124 |   });
  125 | 
  126 |   test('AC-10: Reorder within same column works', async ({ page, mockLeads }) => {
  127 |     // Given: Two leads in same column
  128 |     // When: Drag one lead within same column (reorder)
  129 |     const lead1 = mockLeads[0]; // Nuevo
  130 |     const lead2 = mockLeads[0]; // Also want to test reorder
  131 | 
  132 |     // This is a more complex scenario - reordering within same column
  133 |     // For MVP, we verify the lead stays in same column
  134 |     const beforeCount = await getLeadCountInColumn(page, 'Nuevo');
  135 | 
  136 |     // Perform "reorder" (drag within same column)
  137 |     const leadCard = page.locator(`text="${lead1.name}"`).first();
  138 |     const column = page.locator('[data-testid="kanban-column-nuevo"]');
  139 | 
  140 |     // Get bounding box of column and target a position lower
  141 |     const columnBox = await column.boundingBox();
  142 |     if (columnBox) {
  143 |       await leadCard.dragTo(column, {
  144 |         targetPosition: { x: columnBox.width / 2, y: columnBox.height - 50 },
  145 |       });
  146 |     }
  147 | 
  148 |     // Then: Lead still in same column
  149 |     const afterCount = await getLeadCountInColumn(page, 'Nuevo');
  150 |     expect(afterCount).toBe(beforeCount);
  151 |   });
  152 | 
  153 |   test('AC-12: Lead remains in new status after page reload', async ({
  154 |     page,
  155 |     mockLeads,
  156 |   }) => {
  157 |     // Given: We've moved a lead
  158 |     const carlos = mockLeads[0];
  159 |     const targetStatus = 'En contacto';
  160 | 
  161 |     // Perform drag
  162 |     await dragLeadToColumn(page, carlos.name, targetStatus);
  163 |     await verifyDragSuccess(page, carlos.name, targetStatus);
  164 | 
  165 |     // When: Reload the page
  166 |     await page.reload();
  167 |     await waitForKanbanToLoad(page);
  168 | 
  169 |     // Then: Lead should still be in target status
  170 |     const lead = page.locator(`text="${carlos.name}"`);
  171 |     const parentColumn = lead.locator('xpath=ancestor::div[@data-testid]').first();
  172 |     const columnTestId = await parentColumn.getAttribute('data-testid');
  173 | 
  174 |     expect(columnTestId).toContain(targetStatus.toLowerCase());
  175 |   });
  176 | 
  177 |   test('Multiple drag operations in sequence work correctly', async ({
  178 |     page,
  179 |     mockLeads,
  180 |   }) => {
  181 |     // Given: Multiple leads to move
  182 |     const lead1 = mockLeads[0]; // Nuevo → En contacto
  183 |     const lead2 = mockLeads[1]; // En contacto → Propuesta enviada
  184 | 
  185 |     // When: Move first lead
  186 |     await dragLeadToColumn(page, lead1.name, 'En contacto');
  187 |     await verifyDragSuccess(page, lead1.name, 'En contacto');
  188 | 
  189 |     // And: Move second lead
  190 |     await dragLeadToColumn(page, lead2.name, 'Propuesta enviada');
  191 |     await verifyDragSuccess(page, lead2.name, 'Propuesta enviada');
  192 | 
  193 |     // Then: Both leads in correct columns
  194 |     const lead1Col = page.locator(`text="${lead1.name}"`).first();
  195 |     const lead2Col = page.locator(`text="${lead2.name}"`).first();
  196 | 
  197 |     const lead1Parent = lead1Col.locator('xpath=ancestor::div[@data-testid]').first();
  198 |     const lead2Parent = lead2Col.locator('xpath=ancestor::div[@data-testid]').first();
  199 | 
```