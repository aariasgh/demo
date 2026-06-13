# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: drag-drop.spec.ts >> E4-S3: Drag & Drop Status Changes >> Rapid drag operations are debounced correctly
- Location: e2e\drag-drop.spec.ts:207:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
            - paragraph [ref=e36]: "Total de leads: 4"
          - generic [ref=e37]:
            - generic [ref=e38]:
              - generic [ref=e39]:
                - heading "Nuevo" [level=2] [ref=e42]
                - generic "1 leads en Nuevo" [ref=e43]: "1"
              - region "Columna Nuevo con 1 leads" [ref=e44]:
                - 'button "Lead: Test Lead de Test Corp. Estado: Nuevo. Arrastra para cambiar estado." [ref=e45]':
                  - 'article "Lead: Test Lead de Test Corp. Estado: Nuevo. Arrastra para cambiar estado." [ref=e46]':
                    - paragraph [ref=e47]: Test Lead
                    - paragraph [ref=e48]: Test Corp
                    - paragraph [ref=e49]: test-1@example.com
                    - paragraph [ref=e50]: "+34912345670"
            - generic [ref=e51]:
              - generic [ref=e52]:
                - heading "En contacto" [level=2] [ref=e55]
                - generic "1 leads en En contacto" [ref=e56]: "1"
              - region "Columna En contacto con 1 leads" [ref=e57]:
                - 'button "Lead: María López de DataSys. Estado: En contacto. Arrastra para cambiar estado." [ref=e58]':
                  - 'article "Lead: María López de DataSys. Estado: En contacto. Arrastra para cambiar estado." [ref=e59]':
                    - paragraph [ref=e60]: María López
                    - paragraph [ref=e61]: DataSys
                    - paragraph [ref=e62]: maria@datasys.com
                    - paragraph [ref=e63]: "+34913456789"
            - generic [ref=e65]:
              - generic [ref=e66]:
                - heading "Propuesta enviada" [level=2] [ref=e69]
                - generic "1 leads en Propuesta enviada" [ref=e70]: "1"
              - region "Columna Propuesta enviada con 1 leads" [ref=e71]:
                - 'button "Lead: Juan García de TechCorp SA. Estado: Propuesta enviada. Arrastra para cambiar estado." [ref=e72]':
                  - 'article "Lead: Juan García de TechCorp SA. Estado: Propuesta enviada. Arrastra para cambiar estado." [ref=e73]':
                    - paragraph [ref=e74]: Juan García
                    - paragraph [ref=e75]: TechCorp SA
                    - paragraph [ref=e76]: test.lead@example.com
                    - paragraph [ref=e77]: "+34912345678"
            - generic [ref=e78]:
              - generic [ref=e79]:
                - heading "Cerrado" [level=2] [ref=e82]
                - generic "1 leads en Cerrado" [ref=e83]: "1"
              - region "Columna Cerrado con 1 leads" [ref=e84]:
                - 'button "Lead: Carlos Ruiz de CloudNet. Estado: Cerrado. Arrastra para cambiar estado." [ref=e85]':
                  - 'article "Lead: Carlos Ruiz de CloudNet. Estado: Cerrado. Arrastra para cambiar estado." [ref=e86]':
                    - paragraph [ref=e87]: Carlos Ruiz
                    - paragraph [ref=e88]: CloudNet
                    - paragraph [ref=e89]: carlos@cloudnet.es
                    - paragraph [ref=e90]: "+34914567890"
  - generic [ref=e91]: You have dropped the item. You have moved the item from position 1 to position 1
```

# Test source

```ts
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
  200 |     const lead1TestId = await lead1Parent.getAttribute('data-testid');
  201 |     const lead2TestId = await lead2Parent.getAttribute('data-testid');
  202 | 
  203 |     expect(lead1TestId).toContain('en contacto');
  204 |     expect(lead2TestId).toContain('propuesta enviada');
  205 |   });
  206 | 
  207 |   test('Rapid drag operations are debounced correctly', async ({
  208 |     page,
  209 |     mockLeads,
  210 |   }) => {
  211 |     // Given: Setup to capture API calls
  212 |     let apiCallCount = 0;
  213 |     await page.on('response', (response) => {
  214 |       if (response.url().includes('/api/leads') && response.request().method() === 'PATCH') {
  215 |         apiCallCount++;
  216 |       }
  217 |     });
  218 | 
  219 |     // When: Perform rapid drags (should debounce)
  220 |     const lead = mockLeads[0];
  221 | 
  222 |     // First drag
  223 |     await dragLeadToColumn(page, lead.name, 'En contacto');
  224 |     const countAfterFirst = apiCallCount;
  225 | 
  226 |     // Wait for debounce window
  227 |     await page.waitForTimeout(500);
  228 | 
  229 |     // Then: Should have made exactly 1 API call per drag
> 230 |     expect(countAfterFirst).toBeGreaterThan(0);
      |                             ^ Error: expect(received).toBeGreaterThan(expected)
  231 |   });
  232 | });
  233 | 
```