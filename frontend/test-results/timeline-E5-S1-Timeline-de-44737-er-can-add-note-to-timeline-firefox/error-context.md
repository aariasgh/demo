# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: timeline.spec.ts >> E5-S1: Timeline de Actividad por Lead >> AC-2: User can add note to timeline
- Location: e2e\timeline.spec.ts:46:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('[data-testid="timeline-view"]') to be visible

```

# Page snapshot

```yaml
- application "Mini CRM de Seguimiento de Leads" [ref=e2]:
  - generic [ref=e3]:
    - banner "Encabezado de la aplicación" [ref=e4]:
      - generic [ref=e5]:
        - heading "Mini CRM de Seguimiento de Leads" [level=1] [ref=e6]
        - paragraph [ref=e7]: Panel de Kanban accesible para seguimiento de clientes potenciales
    - main "Área principal de la aplicación" [ref=e8]:
      - generic [ref=e9]: Error al cargar timeline
```

# Test source

```ts
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
  106 |   await expect(leadInColumn).toBeVisible({ timeout: 5000 });
  107 | 
  108 |   // Verify success toast
  109 |   const successToast = page.locator('text=Status updated');
  110 |   await expect(successToast).toBeVisible({ timeout: 3000 });
  111 | }
  112 | 
  113 | // ============================================================
  114 | // Timeline Helpers (E5-S1)
  115 | // ============================================================
  116 | 
  117 | export async function navigateToTimeline(page: Page, leadId: number) {
  118 |   await page.goto(`/leads/${leadId}/timeline`);
> 119 |   await page.waitForSelector('[data-testid="timeline-view"]', { timeout: 5000 });
      |              ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
  120 | }
  121 | 
  122 | export async function waitForTimelineToLoad(page: Page) {
  123 |   await page.waitForSelector('[data-testid="timeline-event-list"]', { timeout: 5000 });
  124 | }
  125 | 
  126 | export async function getTimelineEventCount(page: Page): Promise<number> {
  127 |   const events = await page.locator('[data-testid="timeline-event"]').count();
  128 |   return events;
  129 | }
  130 | 
  131 | export async function filterTimelineByEventType(page: Page, eventType: string) {
  132 |   await page.locator(`[data-testid="timeline-filter-${eventType.toLowerCase()}"]`).click();
  133 |   await page.waitForTimeout(400);
  134 | }
  135 | 
  136 | export async function verifyTimelineEventVisible(
  137 |   page: Page,
  138 |   description: string
  139 | ) {
  140 |   const event = page.locator(`text="${description}"`);
  141 |   await expect(event).toBeVisible({ timeout: 5000 });
  142 | }
  143 | 
  144 | // ============================================================
  145 | // Modal & Form Helpers
  146 | // ============================================================
  147 | 
  148 | export async function openCreateLeadModal(page: Page) {
  149 |   await page.locator('[data-testid="create-lead-button"]').click();
  150 |   await page.waitForSelector('[data-testid="create-lead-modal"]', { timeout: 5000 });
  151 | }
  152 | 
  153 | export async function fillCreateLeadForm(page: Page, lead: Partial<LeadFixture>) {
  154 |   if (lead.name) {
  155 |     await page.locator('input[name="name"]').fill(lead.name);
  156 |   }
  157 |   if (lead.email) {
  158 |     await page.locator('input[name="email"]').fill(lead.email);
  159 |   }
  160 |   if (lead.company) {
  161 |     await page.locator('input[name="company"]').fill(lead.company);
  162 |   }
  163 |   if (lead.phone) {
  164 |     await page.locator('input[name="phone"]').fill(lead.phone);
  165 |   }
  166 | }
  167 | 
  168 | export async function submitCreateLeadForm(page: Page) {
  169 |   await page.locator('[data-testid="create-lead-submit"]').click();
  170 |   // Wait for success toast or modal to close
  171 |   await page.waitForTimeout(500);
  172 | }
  173 | 
  174 | // ============================================================
  175 | // Assertion Helpers
  176 | // ============================================================
  177 | 
  178 | export async function assertLeadVisible(page: Page, leadName: string) {
  179 |   const lead = page.locator(`text="${leadName}"`);
  180 |   await expect(lead).toBeVisible({ timeout: 5000 });
  181 | }
  182 | 
  183 | export async function assertLeadNotVisible(page: Page, leadName: string) {
  184 |   const lead = page.locator(`text="${leadName}"`);
  185 |   await expect(lead).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  186 |   // Use catch because lead might not exist at all, which is fine
  187 | }
  188 | 
  189 | export async function assertKanbanColumnEmpty(page: Page, status: string) {
  190 |   const columnSelector = `[data-testid="kanban-column-${status.toLowerCase()}"]`;
  191 |   const emptyState = page.locator(`${columnSelector}:has-text("No hay leads aún")`);
  192 |   await expect(emptyState).toBeVisible({ timeout: 5000 });
  193 | }
  194 | 
  195 | export async function assertErrorToastVisible(page: Page, message?: string) {
  196 |   const toast = message ? page.locator(`text="${message}"`) : page.locator('[role="alert"]');
  197 |   await expect(toast).toBeVisible({ timeout: 3000 });
  198 | }
  199 | 
  200 | // ============================================================
  201 | // Wait Helpers
  202 | // ============================================================
  203 | 
  204 | export async function waitForApiCall(page: Page, url: string) {
  205 |   await page.waitForResponse((response) => response.url().includes(url));
  206 | }
  207 | 
  208 | export async function waitForKanbanToLoad(page: Page) {
  209 |   // Wait for all columns to be visible
  210 |   const columns = ['nuevo', 'en contacto', 'propuesta enviada', 'cerrado'];
  211 |   for (const col of columns) {
  212 |     await page.waitForSelector(`[data-testid="kanban-column-${col}"]`, { timeout: 5000 });
  213 |   }
  214 | }
  215 | 
  216 | // ============================================================
  217 | // Debug Helpers
  218 | // ============================================================
  219 | 
```