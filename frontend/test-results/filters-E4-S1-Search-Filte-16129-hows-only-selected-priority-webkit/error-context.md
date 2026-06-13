# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: filters.spec.ts >> E4-S1: Search & Filter >> Priority filter shows only selected priority
- Location: e2e\filters.spec.ts:129:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="priority-high"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - heading "Mini CRM de Seguimiento de Leads" [level=1] [ref=e6]
  - main [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e11]:
        - textbox "Buscar leads por nombre, empresa o email" [ref=e13]:
          - /placeholder: "Buscar: nombre, empresa, email..."
        - generic [ref=e14]:
          - button "Abrir filtro de prioridad" [expanded] [ref=e15] [cursor=pointer]:
            - generic [ref=e16]: Prioridad
            - img [ref=e17]
          - menu [ref=e19]:
            - generic [ref=e20]:
              - generic [ref=e21] [cursor=pointer]:
                - checkbox "Filtrar por prioridad Baja" [ref=e22]
                - generic [ref=e25]: Baja
              - generic [ref=e26] [cursor=pointer]:
                - checkbox "Filtrar por prioridad Media" [ref=e27]
                - generic [ref=e30]: Media
              - generic [ref=e31] [cursor=pointer]:
                - checkbox "Filtrar por prioridad Alta" [ref=e32]
                - generic [ref=e35]: Alta
              - generic [ref=e36] [cursor=pointer]:
                - checkbox "Filtrar por prioridad Urgente" [ref=e37]
                - generic [ref=e40]: Urgente
            - menuitem "Mostrar todas las prioridades" [ref=e42] [cursor=pointer]: Mostrar todo
      - tablist "Filtrar leads por estado" [ref=e44]:
        - tab "Filtrar por Todos" [ref=e45] [cursor=pointer]: Todos
        - tab "Filtrar por Nuevo" [ref=e46] [cursor=pointer]: Nuevo
        - tab "Filtrar por En contacto" [ref=e47] [cursor=pointer]: En contacto
        - tab "Filtrar por Propuesta" [ref=e48] [cursor=pointer]: Propuesta
        - tab "Filtrar por Cerrado" [ref=e49] [cursor=pointer]: Cerrado
      - generic [ref=e50]:
        - status [ref=e51]
        - generic [ref=e53] [cursor=pointer]:
          - generic [ref=e54]:
            - generic [ref=e55]: ✅
            - generic [ref=e56]: Todos en día
          - paragraph [ref=e57]: No hay leads en riesgo
        - generic [ref=e58]:
          - heading "Pipeline de Ventas" [level=1] [ref=e59]
          - paragraph [ref=e60]: "Total de leads: 4"
        - generic [ref=e61]:
          - generic [ref=e62]:
            - generic [ref=e63]:
              - heading "Nuevo" [level=2] [ref=e66]
              - generic "1 leads en Nuevo" [ref=e67]: "1"
            - region "Columna Nuevo con 1 leads" [ref=e68]:
              - 'button "Lead: Test Lead de Test Corp. Estado: Nuevo. Arrastra para cambiar estado." [ref=e69]':
                - 'article "Lead: Test Lead de Test Corp. Estado: Nuevo. Arrastra para cambiar estado." [ref=e70]':
                  - paragraph [ref=e71]: Test Lead
                  - paragraph [ref=e72]: Test Corp
                  - paragraph [ref=e73]: test-1@example.com
                  - paragraph [ref=e74]: "+34912345670"
          - generic [ref=e75]:
            - generic [ref=e76]:
              - heading "En contacto" [level=2] [ref=e79]
              - generic "1 leads en En contacto" [ref=e80]: "1"
            - region "Columna En contacto con 1 leads" [ref=e81]:
              - 'button "Lead: María López de DataSys. Estado: En contacto. Arrastra para cambiar estado." [ref=e82]':
                - 'article "Lead: María López de DataSys. Estado: En contacto. Arrastra para cambiar estado." [ref=e83]':
                  - paragraph [ref=e84]: María López
                  - paragraph [ref=e85]: DataSys
                  - paragraph [ref=e86]: maria@datasys.com
                  - paragraph [ref=e87]: "+34913456789"
          - generic [ref=e88]:
            - generic [ref=e89]:
              - heading "Propuesta enviada" [level=2] [ref=e92]
              - generic "1 leads en Propuesta enviada" [ref=e93]: "1"
            - region "Columna Propuesta enviada con 1 leads" [ref=e94]:
              - 'button "Lead: Juan García de TechCorp SA. Estado: Propuesta enviada. Arrastra para cambiar estado." [ref=e95]':
                - 'article "Lead: Juan García de TechCorp SA. Estado: Propuesta enviada. Arrastra para cambiar estado." [ref=e96]':
                  - paragraph [ref=e97]: Juan García
                  - paragraph [ref=e98]: TechCorp SA
                  - paragraph [ref=e99]: test.lead@example.com
                  - paragraph [ref=e100]: "+34912345678"
          - generic [ref=e101]:
            - generic [ref=e102]:
              - heading "Cerrado" [level=2] [ref=e105]
              - generic "1 leads en Cerrado" [ref=e106]: "1"
            - region "Columna Cerrado con 1 leads" [ref=e107]:
              - 'button "Lead: Carlos Ruiz de CloudNet. Estado: Cerrado. Arrastra para cambiar estado." [ref=e108]':
                - 'article "Lead: Carlos Ruiz de CloudNet. Estado: Cerrado. Arrastra para cambiar estado." [ref=e109]':
                  - paragraph [ref=e110]: Carlos Ruiz
                  - paragraph [ref=e111]: CloudNet
                  - paragraph [ref=e112]: carlos@cloudnet.es
                  - paragraph [ref=e113]: "+34914567890"
```

# Test source

```ts
  1   | import { Page, expect } from '@playwright/test';
  2   | import type { LeadFixture, TimelineEventFixture } from './fixtures';
  3   | 
  4   | /**
  5   |  * E2E Test Utilities
  6   |  * Helper functions for common test operations
  7   |  */
  8   | 
  9   | // ============================================================
  10  | // Navigation & Page Helpers
  11  | // ============================================================
  12  | 
  13  | export async function navigateToKanban(page: Page) {
  14  |   await page.goto('/');
  15  |   // Wait for Kanban board to load
  16  |   await page.waitForSelector('[data-testid="kanban-board"]', { timeout: 5000 });
  17  | }
  18  | 
  19  | export async function navigateToLeadDetail(page: Page, leadId: number) {
  20  |   await page.goto(`/leads/${leadId}`);
  21  |   await page.waitForSelector('[data-testid="lead-detail"]', { timeout: 5000 });
  22  | }
  23  | 
  24  | // ============================================================
  25  | // Search & Filter Helpers
  26  | // ============================================================
  27  | 
  28  | export async function searchLeads(page: Page, query: string) {
  29  |   const searchInput = page.locator('input[placeholder*="Search"]');
  30  |   await searchInput.fill(query);
  31  |   // Wait for debounce (300ms) + render
  32  |   await page.waitForTimeout(400);
  33  | }
  34  | 
  35  | export async function clearSearch(page: Page) {
  36  |   const searchInput = page.locator('input[placeholder*="Search"]');
  37  |   await searchInput.clear();
  38  |   await page.waitForTimeout(400);
  39  | }
  40  | 
  41  | export async function filterByPriority(page: Page, priority: string) {
  42  |   // Click priority filter dropdown
  43  |   await page.locator('[data-testid="priority-filter-button"]').click();
  44  |   // Click the priority option
> 45  |   await page.locator(`[data-testid="priority-${priority.toLowerCase()}"]`).click();
      |                                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  46  |   // Wait for filter to apply
  47  |   await page.waitForTimeout(400);
  48  | }
  49  | 
  50  | export async function filterByStatus(page: Page, status: string) {
  51  |   // Click status filter tab
  52  |   await page.locator(`[data-testid="status-tab-${status.toLowerCase()}"]`).click();
  53  |   // Wait for filter to apply
  54  |   await page.waitForTimeout(400);
  55  | }
  56  | 
  57  | export async function getLeadCountInColumn(page: Page, status: string): Promise<number> {
  58  |   const columnSelector = `[data-testid="kanban-column-${status.toLowerCase()}"]`;
  59  |   const cardSelector = `${columnSelector} [data-testid="lead-card"]`;
  60  |   const cards = await page.locator(cardSelector).count();
  61  |   return cards;
  62  | }
  63  | 
  64  | // ============================================================
  65  | // Drag & Drop Helpers (E4-S3 Pattern)
  66  | // ============================================================
  67  | 
  68  | export async function dragLeadToColumn(
  69  |   page: Page,
  70  |   leadName: string,
  71  |   targetStatus: string
  72  | ) {
  73  |   // Find the lead card by name
  74  |   const leadCard = page.locator(`[data-testid="lead-card"]`, {
  75  |     has: page.locator(`text="${leadName}"`),
  76  |   }).first();
  77  | 
  78  |   // Get source column
  79  |   const sourceColumn = leadCard.locator('xpath=ancestor::div[@data-testid]').first();
  80  | 
  81  |   // Get target column
  82  |   const targetColumn = page.locator(
  83  |     `[data-testid="kanban-column-${targetStatus.toLowerCase()}"]`
  84  |   );
  85  | 
  86  |   // Perform drag and drop
  87  |   await leadCard.dragTo(targetColumn);
  88  | 
  89  |   // Wait for mutation to complete (look for sync indicator to disappear)
  90  |   await page.waitForTimeout(500); // Allow time for sync
  91  |   const syncIndicator = page.locator('[data-testid="drag-sync-overlay"]');
  92  |   await expect(syncIndicator).not.toBeVisible({ timeout: 5000 });
  93  | }
  94  | 
  95  | export async function verifyDragSuccess(
  96  |   page: Page,
  97  |   leadName: string,
  98  |   targetStatus: string
  99  | ) {
  100 |   // Verify lead is in target column
  101 |   const targetColumn = page.locator(
  102 |     `[data-testid="kanban-column-${targetStatus.toLowerCase()}"]`
  103 |   );
  104 |   const leadInColumn = targetColumn.locator(`text="${leadName}"`);
  105 | 
  106 |   await expect(leadInColumn).toBeVisible({ timeout: 5000 });
  107 | 
  108 |   // Verify success toast
  109 |   const successToast = page.locator('text=Status updated');
  110 |   await expect(successToast).toBeVisible({ timeout: 3000 });
  111 | }
  112 | 
  113 | // ============================================================
  114 | // Timeline Helpers (E5-S1 Preview)
  115 | // ============================================================
  116 | 
  117 | export async function navigateToTimeline(page: Page, leadId: number) {
  118 |   await page.goto(`/leads/${leadId}/timeline`);
  119 |   await page.waitForSelector('[data-testid="timeline-view"]', { timeout: 5000 });
  120 | }
  121 | 
  122 | export async function getTimelineEventCount(page: Page): Promise<number> {
  123 |   const events = await page.locator('[data-testid="timeline-event"]').count();
  124 |   return events;
  125 | }
  126 | 
  127 | export async function filterTimelineByEventType(page: Page, eventType: string) {
  128 |   await page.locator(`[data-testid="timeline-filter-${eventType.toLowerCase()}"]`).click();
  129 |   await page.waitForTimeout(400);
  130 | }
  131 | 
  132 | export async function verifyTimelineEventVisible(
  133 |   page: Page,
  134 |   description: string
  135 | ) {
  136 |   const event = page.locator(`text="${description}"`);
  137 |   await expect(event).toBeVisible({ timeout: 5000 });
  138 | }
  139 | 
  140 | // ============================================================
  141 | // Modal & Form Helpers
  142 | // ============================================================
  143 | 
  144 | export async function openCreateLeadModal(page: Page) {
  145 |   await page.locator('[data-testid="create-lead-button"]').click();
```