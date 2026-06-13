# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: drag-drop.spec.ts >> E4-S3: Drag & Drop Status Changes >> AC-5: Error on drag reverts optimistic update (network error)
- Location: e2e\drag-drop.spec.ts:54:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text="Failed to update"')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 3000ms
  - waiting for locator('text="Failed to update"')

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
> 193 |   await expect(toast).toBeVisible({ timeout: 3000 });
      |                       ^ Error: expect(locator).toBeVisible() failed
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
  207 |   for (const col of columns) {
  208 |     await page.waitForSelector(`[data-testid="kanban-column-${col}"]`, { timeout: 5000 });
  209 |   }
  210 | }
  211 | 
  212 | // ============================================================
  213 | // Debug Helpers
  214 | // ============================================================
  215 | 
  216 | export async function takeScreenshot(page: Page, name: string) {
  217 |   await page.screenshot({ path: `./test-results/screenshots/${name}.png` });
  218 | }
  219 | 
  220 | export async function logPageState(page: Page) {
  221 |   const url = page.url();
  222 |   const title = await page.title();
  223 |   console.log(`[Page] URL: ${url}, Title: ${title}`);
  224 | }
  225 | 
```