# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: timeline.spec.ts >> E5-S1: Timeline de Actividad por Lead >> Smoke: Timeline navigation from lead card
- Location: e2e\timeline.spec.ts:354:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('[data-testid="timeline-container"]') to be visible

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
        - button "Abrir filtro de prioridad" [ref=e15] [cursor=pointer]:
          - generic [ref=e16]: Prioridad
          - img [ref=e17]
      - tablist "Filtrar leads por estado" [ref=e20]:
        - tab "Filtrar por Todos" [ref=e21] [cursor=pointer]: Todos
        - tab "Filtrar por Nuevo" [ref=e22] [cursor=pointer]: Nuevo
        - tab "Filtrar por En contacto" [ref=e23] [cursor=pointer]: En contacto
        - tab "Filtrar por Propuesta" [ref=e24] [cursor=pointer]: Propuesta
        - tab "Filtrar por Cerrado" [ref=e25] [cursor=pointer]: Cerrado
      - generic [ref=e26]:
        - status [ref=e27]
        - generic [ref=e29] [cursor=pointer]:
          - generic [ref=e30]:
            - generic [ref=e31]: ✅
            - generic [ref=e32]: Todos en día
          - paragraph [ref=e33]: No hay leads en riesgo
        - generic [ref=e34]:
          - heading "Pipeline de Ventas" [level=1] [ref=e35]
          - paragraph [ref=e36]: "Total de leads: 0"
```

# Test source

```ts
  1   | import { test, expect } from './fixtures';
  2   | import {
  3   |   navigateToTimeline,
  4   |   getTimelineEventCount,
  5   |   filterTimelineByEventType,
  6   |   takeScreenshot,
  7   |   logPageState,
  8   | } from './helpers';
  9   | 
  10  | /**
  11  |  * E2E Tests: E5-S1 Timeline de Actividad
  12  |  *
  13  |  * This test suite validates the Activity Timeline feature for individual leads.
  14  |  * The timeline shows all events (status changes, notes, calls, emails) for a lead.
  15  |  *
  16  |  * Key Features Tested:
  17  |  * 1. View timeline for a lead
  18  |  * 2. Add timeline event (note, call, email)
  19  |  * 3. Delete timeline event
  20  |  * 4. Filter events by type
  21  |  * 5. Timeline persists across page reloads
  22  |  *
  23  |  * Acceptance Criteria Reference:
  24  |  * - AC-1: Timeline loads with existing events
  25  |  * - AC-2: User can add note to timeline
  26  |  * - AC-3: User can add call event
  27  |  * - AC-4: User can add email event
  28  |  * - AC-5: User can delete timeline event
  29  |  * - AC-6: Filter by event type works
  30  |  * - AC-7: All events visible without scroll
  31  |  * - AC-8: Events persist after page reload
  32  |  * - AC-9: Timeline sorts by date (newest first)
  33  |  * - AC-10: Error on add event shows toast
  34  |  * - AC-11: Delete confirmation required
  35  |  * - AC-12: Empty timeline shows helpful message
  36  |  */
  37  | 
  38  | test.describe('E5-S1: Timeline de Actividad por Lead', () => {
  39  |   test.beforeEach(async ({ page, mockLeads }) => {
  40  |     // Navigate to first lead's timeline
  41  |     const lead = mockLeads[0]; // Carlos Ruiz
  42  |     await page.goto(`/leads/${lead.id}/timeline`);
> 43  |     await page.waitForSelector('[data-testid="timeline-container"]', { timeout: 5000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
  44  |   });
  45  | 
  46  |   test('AC-1: Timeline loads with existing events', async ({ page, mockLeads, mockTimelineEvents }) => {
  47  |     // Given: Timeline is open for a lead
  48  |     // When: Timeline loads
  49  |     // Then: Existing events are displayed
  50  | 
  51  |     const eventCount = mockTimelineEvents.length;
  52  |     const displayedCount = await getTimelineEventCount(page);
  53  | 
  54  |     expect(displayedCount).toBe(eventCount);
  55  |     expect(displayedCount).toBeGreaterThan(0);
  56  | 
  57  |     // And: Events are visible without excessive scrolling
  58  |     const timelineContainer = page.locator('[data-testid="timeline-container"]');
  59  |     const isVisible = await timelineContainer.isVisible();
  60  |     expect(isVisible).toBe(true);
  61  | 
  62  |     // And: Events show timestamps
  63  |     const timestamps = await page.locator('[data-testid="timeline-event-timestamp"]').count();
  64  |     expect(timestamps).toBe(eventCount);
  65  |   });
  66  | 
  67  |   test('AC-2: User can add note to timeline', async ({ page, mockLeads }) => {
  68  |     // Given: Timeline is open
  69  |     // When: User adds a note event
  70  | 
  71  |     const addNoteButton = page.locator('[data-testid="timeline-add-note-button"]');
  72  |     await addNoteButton.click();
  73  | 
  74  |     // Then: Modal or form appears
  75  |     const noteForm = page.locator('[data-testid="timeline-add-note-form"]');
  76  |     await expect(noteForm).toBeVisible({ timeout: 2000 });
  77  | 
  78  |     // And: User types note
  79  |     const noteInput = page.locator('[data-testid="timeline-note-input"]');
  80  |     const noteText = 'Follow-up call scheduled for tomorrow';
  81  |     await noteInput.fill(noteText);
  82  | 
  83  |     // And: User submits form
  84  |     const submitButton = page.locator('[data-testid="timeline-note-submit"]');
  85  |     await submitButton.click();
  86  | 
  87  |     // Then: Note is added to timeline
  88  |     const noteEvent = page.locator(`text="${noteText}"`);
  89  |     await expect(noteEvent).toBeVisible({ timeout: 2000 });
  90  | 
  91  |     // And: Success toast appears
  92  |     const successToast = page.locator('[role="status"]:has-text("Note added")');
  93  |     await expect(successToast).toBeVisible({ timeout: 1000 });
  94  |   });
  95  | 
  96  |   test('AC-3: User can add call event', async ({ page }) => {
  97  |     // Given: Timeline is open
  98  |     // When: User adds a call event
  99  | 
  100 |     const addCallButton = page.locator('[data-testid="timeline-add-call-button"]');
  101 |     await addCallButton.click();
  102 | 
  103 |     // Then: Call event form appears
  104 |     const callForm = page.locator('[data-testid="timeline-add-call-form"]');
  105 |     await expect(callForm).toBeVisible({ timeout: 2000 });
  106 | 
  107 |     // And: User fills call details
  108 |     const durationInput = page.locator('[data-testid="timeline-call-duration"]');
  109 |     await durationInput.fill('15');
  110 | 
  111 |     const notesInput = page.locator('[data-testid="timeline-call-notes"]');
  112 |     await notesInput.fill('Discussed project scope and timeline');
  113 | 
  114 |     // And: User submits form
  115 |     const submitButton = page.locator('[data-testid="timeline-call-submit"]');
  116 |     await submitButton.click();
  117 | 
  118 |     // Then: Call event is added
  119 |     const callEvent = page.locator('[data-testid="timeline-event-type-call"]');
  120 |     await expect(callEvent).toBeVisible({ timeout: 2000 });
  121 | 
  122 |     // And: Duration is shown
  123 |     const durationDisplay = page.locator('text="15 minutes"');
  124 |     await expect(durationDisplay).toBeVisible();
  125 |   });
  126 | 
  127 |   test('AC-4: User can add email event', async ({ page }) => {
  128 |     // Given: Timeline is open
  129 |     // When: User adds an email event
  130 | 
  131 |     const addEmailButton = page.locator('[data-testid="timeline-add-email-button"]');
  132 |     await addEmailButton.click();
  133 | 
  134 |     // Then: Email event form appears
  135 |     const emailForm = page.locator('[data-testid="timeline-add-email-form"]');
  136 |     await expect(emailForm).toBeVisible({ timeout: 2000 });
  137 | 
  138 |     // And: User fills email details
  139 |     const subjectInput = page.locator('[data-testid="timeline-email-subject"]');
  140 |     await subjectInput.fill('Project Proposal - Next Steps');
  141 | 
  142 |     const bodyInput = page.locator('[data-testid="timeline-email-body"]');
  143 |     await bodyInput.fill('Please review the attached proposal and let me know your thoughts.');
```