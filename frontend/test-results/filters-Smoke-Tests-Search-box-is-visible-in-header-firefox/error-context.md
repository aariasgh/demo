# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: filters.spec.ts >> Smoke Tests >> Search box is visible in header
- Location: e2e\filters.spec.ts:38:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[placeholder*="Search"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[placeholder*="Search"]')

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
  4   |   searchLeads,
  5   |   filterByPriority,
  6   |   filterByStatus,
  7   |   getLeadCountInColumn,
  8   |   clearSearch,
  9   |   waitForKanbanToLoad,
  10  |   assertLeadVisible,
  11  |   assertLeadNotVisible,
  12  | } from './helpers';
  13  | 
  14  | /**
  15  |  * E2E Tests: Smoke Tests & Basic Functionality
  16  |  * 
  17  |  * Validates that core Kanban board features work:
  18  |  * - Page loads and renders correctly
  19  |  * - Kanban columns are visible
  20  |  * - Data displays properly
  21  |  */
  22  | 
  23  | test.describe('Smoke Tests', () => {
  24  |   test('Kanban board loads successfully', async ({ page }) => {
  25  |     // When: Navigate to Kanban
  26  |     await navigateToKanban(page);
  27  | 
  28  |     // Then: All columns visible
  29  |     const columns = ['Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado'];
  30  |     for (const col of columns) {
  31  |       const columnElement = page.locator(
  32  |         `[data-testid="kanban-column-${col.toLowerCase()}"]`
  33  |       );
  34  |       await expect(columnElement).toBeVisible();
  35  |     }
  36  |   });
  37  | 
  38  |   test('Search box is visible in header', async ({ page }) => {
  39  |     // When: Navigate to Kanban
  40  |     await navigateToKanban(page);
  41  | 
  42  |     // Then: Search input visible
  43  |     const searchInput = page.locator('input[placeholder*="Search"]');
> 44  |     await expect(searchInput).toBeVisible();
      |                               ^ Error: expect(locator).toBeVisible() failed
  45  |   });
  46  | 
  47  |   test('Leads render in columns', async ({ page, mockLeads }) => {
  48  |     // When: Navigate to Kanban
  49  |     await navigateToKanban(page);
  50  |     await waitForKanbanToLoad(page);
  51  | 
  52  |     // Then: At least one lead visible
  53  |     const firstLead = mockLeads[0];
  54  |     const leadElement = page.locator(`text="${firstLead.name}"`).first();
  55  |     await expect(leadElement).toBeVisible({ timeout: 5000 });
  56  |   });
  57  | 
  58  |   test('Column counts match visible leads', async ({ page }) => {
  59  |     // When: Navigate to Kanban
  60  |     await navigateToKanban(page);
  61  |     await waitForKanbanToLoad(page);
  62  | 
  63  |     // Then: Get count from column header
  64  |     const columnCount = await page.locator('[data-testid="kanban-column-nuevo"]').count();
  65  | 
  66  |     // Should be > 0
  67  |     expect(columnCount).toBeGreaterThan(0);
  68  |   });
  69  | });
  70  | 
  71  | /**
  72  |  * E2E Tests: E4-S1 Search & Filter Functionality
  73  |  * 
  74  |  * From E4-S1 story: Search and priority filtering
  75  |  */
  76  | 
  77  | test.describe('E4-S1: Search & Filter', () => {
  78  |   test.beforeEach(async ({ page }) => {
  79  |     await navigateToKanban(page);
  80  |     await waitForKanbanToLoad(page);
  81  |   });
  82  | 
  83  |   test('Search filters leads by name', async ({ page, mockLeads }) => {
  84  |     // Given: Kanban loaded with multiple leads
  85  |     // When: Search for "Carlos"
  86  |     await searchLeads(page, 'Carlos');
  87  | 
  88  |     // Then: Only Carlos visible
  89  |     await assertLeadVisible(page, 'Carlos Ruiz');
  90  | 
  91  |     // And: Other leads not visible
  92  |     await assertLeadNotVisible(page, 'María López');
  93  |   });
  94  | 
  95  |   test('Search filters leads by email', async ({ page }) => {
  96  |     // Given: Kanban loaded
  97  |     // When: Search by email domain
  98  |     await searchLeads(page, 'acme.com');
  99  | 
  100 |     // Then: Only leads with acme.com email visible
  101 |     const acmeLead = page.locator('text="Carlos Ruiz"');
  102 |     await expect(acmeLead).toBeVisible();
  103 |   });
  104 | 
  105 |   test('Search filters leads by company', async ({ page }) => {
  106 |     // Given: Kanban loaded
  107 |     // When: Search by company name
  108 |     await searchLeads(page, 'Enterprise');
  109 | 
  110 |     // Then: Enterprise leads visible
  111 |     const enterpriseLead = page.locator('text="Juan García"');
  112 |     await expect(enterpriseLead).toBeVisible();
  113 |   });
  114 | 
  115 |   test('Clear search shows all leads again', async ({ page, mockLeads }) => {
  116 |     // Given: Search is active
  117 |     await searchLeads(page, 'Carlos');
  118 |     await assertLeadVisible(page, 'Carlos Ruiz');
  119 | 
  120 |     // When: Clear search
  121 |     await clearSearch(page);
  122 | 
  123 |     // Then: All leads visible again
  124 |     for (const lead of mockLeads) {
  125 |       await assertLeadVisible(page, lead.name);
  126 |     }
  127 |   });
  128 | 
  129 |   test('Priority filter shows only selected priority', async ({ page, mockLeads }) => {
  130 |     // Given: Kanban with mixed priorities
  131 |     // When: Filter by HIGH priority
  132 |     await filterByPriority(page, 'HIGH');
  133 | 
  134 |     // Then: Only HIGH priority leads visible
  135 |     const highPriorityLeads = mockLeads.filter((l) => l.priority === 'HIGH');
  136 |     for (const lead of highPriorityLeads) {
  137 |       await assertLeadVisible(page, lead.name);
  138 |     }
  139 | 
  140 |     // And: Other priorities not visible
  141 |     const otherLeads = mockLeads.filter((l) => l.priority !== 'HIGH');
  142 |     for (const lead of otherLeads) {
  143 |       // Note: This might not work if HIGH and other priorities
  144 |       // are in different columns - adjust assertion as needed
```