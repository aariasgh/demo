# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: drag-drop.spec.ts >> E4-S3: Drag & Drop Status Changes >> AC-2: Drop moves lead to new status column
- Location: e2e\drag-drop.spec.ts:34:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="kanban-column-en contacto"]').locator('text="Carlos Ruiz"')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="kanban-column-en contacto"]').locator('text="Carlos Ruiz"')

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
  45  |   await page.locator(`[data-testid="priority-${priority.toLowerCase()}"]`).click();
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
> 106 |   await expect(leadInColumn).toBeVisible({ timeout: 5000 });
      |                              ^ Error: expect(locator).toBeVisible() failed
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
  146 |   await page.waitForSelector('[data-testid="create-lead-modal"]', { timeout: 5000 });
  147 | }
  148 | 
  149 | export async function fillCreateLeadForm(page: Page, lead: Partial<LeadFixture>) {
  150 |   if (lead.name) {
  151 |     await page.locator('input[name="name"]').fill(lead.name);
  152 |   }
  153 |   if (lead.email) {
  154 |     await page.locator('input[name="email"]').fill(lead.email);
  155 |   }
  156 |   if (lead.company) {
  157 |     await page.locator('input[name="company"]').fill(lead.company);
  158 |   }
  159 |   if (lead.phone) {
  160 |     await page.locator('input[name="phone"]').fill(lead.phone);
  161 |   }
  162 | }
  163 | 
  164 | export async function submitCreateLeadForm(page: Page) {
  165 |   await page.locator('[data-testid="create-lead-submit"]').click();
  166 |   // Wait for success toast or modal to close
  167 |   await page.waitForTimeout(500);
  168 | }
  169 | 
  170 | // ============================================================
  171 | // Assertion Helpers
  172 | // ============================================================
  173 | 
  174 | export async function assertLeadVisible(page: Page, leadName: string) {
  175 |   const lead = page.locator(`text="${leadName}"`);
  176 |   await expect(lead).toBeVisible({ timeout: 5000 });
  177 | }
  178 | 
  179 | export async function assertLeadNotVisible(page: Page, leadName: string) {
  180 |   const lead = page.locator(`text="${leadName}"`);
  181 |   await expect(lead).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  182 |   // Use catch because lead might not exist at all, which is fine
  183 | }
  184 | 
  185 | export async function assertKanbanColumnEmpty(page: Page, status: string) {
  186 |   const columnSelector = `[data-testid="kanban-column-${status.toLowerCase()}"]`;
  187 |   const emptyState = page.locator(`${columnSelector}:has-text("No hay leads aún")`);
  188 |   await expect(emptyState).toBeVisible({ timeout: 5000 });
  189 | }
  190 | 
  191 | export async function assertErrorToastVisible(page: Page, message?: string) {
  192 |   const toast = message ? page.locator(`text="${message}"`) : page.locator('[role="alert"]');
  193 |   await expect(toast).toBeVisible({ timeout: 3000 });
  194 | }
  195 | 
  196 | // ============================================================
  197 | // Wait Helpers
  198 | // ============================================================
  199 | 
  200 | export async function waitForApiCall(page: Page, url: string) {
  201 |   await page.waitForResponse((response) => response.url().includes(url));
  202 | }
  203 | 
  204 | export async function waitForKanbanToLoad(page: Page) {
  205 |   // Wait for all columns to be visible
  206 |   const columns = ['nuevo', 'en contacto', 'propuesta enviada', 'cerrado'];
```