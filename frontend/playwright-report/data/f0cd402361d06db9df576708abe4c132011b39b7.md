# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> Accessibility - WCAG 2.1 Level AA (E6-S6) >> AC-1.1.11 - "?" key opens KeyboardShortcutsModal
- Location: e2e\accessibility.spec.ts:288:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
      - generic [ref=e9]:
        - region "Barra de búsqueda y filtros" [ref=e10]:
          - generic [ref=e12]:
            - generic [ref=e13]:
              - generic [ref=e14]: Buscar leads
              - textbox "Buscar leads por nombre, empresa o email (presiona / para enfocar)" [ref=e15]:
                - /placeholder: Nombre, empresa o email...
              - paragraph [ref=e16]: Busca en nombre, empresa o email (en tiempo real)
            - button "Abrir filtro de prioridad (presiona F para enfocar)" [ref=e18] [cursor=pointer]:
              - generic [ref=e19]: Prioridad
              - img [ref=e20]
        - tablist "Filtrar leads por estado" [ref=e23]:
          - tab "Filtrar por Todos" [ref=e24] [cursor=pointer]: Todos
          - tab "Filtrar por Nuevo" [ref=e25] [cursor=pointer]: Nuevo
          - tab "Filtrar por En contacto" [ref=e26] [cursor=pointer]: En contacto
          - tab "Filtrar por Propuesta" [ref=e27] [cursor=pointer]: Propuesta
          - tab "Filtrar por Cerrado" [ref=e28] [cursor=pointer]: Cerrado
        - generic [ref=e29]:
          - status [ref=e30]
          - generic [ref=e32] [cursor=pointer]:
            - generic [ref=e33]:
              - generic [ref=e34]: ✅
              - generic [ref=e35]: Todos en día
            - paragraph [ref=e36]: No hay leads en riesgo
          - generic [ref=e37]:
            - heading "Pipeline de Ventas" [level=1] [ref=e38]
            - paragraph [ref=e39]: "Total de leads: 1"
          - region "Kanban board with keyboard navigation" [ref=e40]:
            - region "Columna Nuevo, 0 leads" [ref=e41]:
              - button "Nuevo column header, 0 leads. Tab to navigate between columns, Arrow keys to navigate leads" [ref=e42] [cursor=pointer]:
                - heading "Nuevo" [level=2] [ref=e45]
                - generic "0 leads en Nuevo" [ref=e46]: "0"
              - region "Columna Nuevo con 0 leads" [ref=e47]:
                - generic [ref=e48]:
                  - paragraph [ref=e49]: No hay leads aún
                  - paragraph [ref=e50]: Crea tu primer lead
            - region "Columna En contacto, 1 leads" [ref=e51]:
              - button "En contacto column header, 1 leads. Tab to navigate between columns, Arrow keys to navigate leads" [ref=e52] [cursor=pointer]:
                - heading "En contacto" [level=2] [ref=e55]
                - generic "1 leads en En contacto" [ref=e56]: "1"
              - region "Columna En contacto con 1 leads" [ref=e57]:
                - 'button "Lead: Anuar de TestTech. Estado: En contacto. Arrastra para cambiar estado." [ref=e58]':
                  - 'article "Lead: Anuar de TestTech. Estado: En contacto. Arrastra para cambiar estado." [ref=e59]':
                    - paragraph [ref=e60]: Anuar
                    - paragraph [ref=e61]: TestTech
                    - paragraph [ref=e62]: test@ejemplo.com
                    - paragraph [ref=e63]: "0123456789"
                    - 'generic "Prioridad: Media" [ref=e65]': Media
            - region "Columna Propuesta enviada, 0 leads" [ref=e66]:
              - button "Propuesta enviada column header, 0 leads. Tab to navigate between columns, Arrow keys to navigate leads" [ref=e67] [cursor=pointer]:
                - heading "Propuesta enviada" [level=2] [ref=e70]
                - generic "0 leads en Propuesta enviada" [ref=e71]: "0"
              - region "Columna Propuesta enviada con 0 leads" [ref=e72]:
                - generic [ref=e73]:
                  - paragraph [ref=e74]: No hay leads aún
                  - paragraph [ref=e75]: Crea tu primer lead
            - region "Columna Cerrado, 0 leads" [ref=e76]:
              - button "Cerrado column header, 0 leads. Tab to navigate between columns, Arrow keys to navigate leads" [ref=e77] [cursor=pointer]:
                - heading "Cerrado" [level=2] [ref=e80]
                - generic "0 leads en Cerrado" [ref=e81]: "0"
              - region "Columna Cerrado con 0 leads" [ref=e82]:
                - generic [ref=e83]:
                  - paragraph [ref=e84]: No hay leads aún
                  - paragraph [ref=e85]: Crea tu primer lead
```

# Test source

```ts
  207 |       await kanbanColumn.focus();
  208 |       await page.keyboard.press('ArrowRight');
  209 |       await page.waitForTimeout(100);
  210 |       
  211 |       const focused = await page.evaluate(() =>
  212 |         document.activeElement?.getAttribute('data-testid') ||
  213 |         document.activeElement?.getAttribute('aria-label')
  214 |       );
  215 |       
  216 |       expect(focused).toBeTruthy();
  217 |       console.log('✅ Arrow keys navigate Kanban columns');
  218 |     } else {
  219 |       console.log('⚠️  Kanban columns not found, skipping arrow key test');
  220 |     }
  221 |   });
  222 | 
  223 |   test('AC-1.1.8 - Tab cycles between focusable elements', async ({ page }) => {
  224 |     // P-7: New test - Explicit Tab key cycling
  225 |     const focusables = await page.locator('button, input, a[href], [tabindex="0"]').all();
  226 |     
  227 |     if (focusables.length >= 2) {
  228 |       // Focus first element
  229 |       await focusables[0].focus();
  230 |       const firstFocused = await page.evaluate(() =>
  231 |         (document.activeElement as HTMLElement)?.tagName
  232 |       );
  233 |       
  234 |       // Tab to next
  235 |       await page.keyboard.press('Tab');
  236 |       await page.waitForTimeout(100);
  237 |       
  238 |       const secondFocused = await page.evaluate(() =>
  239 |         (document.activeElement as HTMLElement)?.tagName
  240 |       );
  241 |       
  242 |       expect(firstFocused).not.toBe(secondFocused);
  243 |       console.log('✅ Tab cycles between focusable elements');
  244 |     } else {
  245 |       console.log('⚠️  Not enough focusable elements, skipping Tab test');
  246 |     }
  247 |   });
  248 | 
  249 |   test('AC-1.1.9 - Escape closes modals', async ({ page }) => {
  250 |     await page.keyboard.press('KeyC');
  251 |     
  252 |     const modal = page.locator('role=dialog').first();
  253 |     await modal.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
  254 |     
  255 |     // Press Escape
  256 |     await page.keyboard.press('Escape');
  257 |     await page.waitForTimeout(300);
  258 |     
  259 |     const isStillVisible = await modal.isVisible().catch((err) => {
  260 |       console.warn('Modal visibility check after Escape:', err.message);
  261 |       return false;
  262 |     });
  263 |     
  264 |     expect(isStillVisible).toBe(false);
  265 |     console.log('✅ Escape closes modals');
  266 |   });
  267 | 
  268 |   test('AC-1.1.10 - Enter/Space activate buttons', async ({ page }) => {
  269 |     // P-7: New test - Explicit Enter/Space key handling
  270 |     const button = page.locator('button').first();
  271 |     
  272 |     if (await button.isVisible()) {
  273 |       await button.focus();
  274 |       
  275 |       // Get initial state
  276 |       const initialHTML = await button.innerHTML();
  277 |       
  278 |       // Press Space to activate
  279 |       await page.keyboard.press('Space');
  280 |       await page.waitForTimeout(100);
  281 |       
  282 |       console.log('✅ Enter/Space activate buttons');
  283 |     } else {
  284 |       console.log('⚠️  No button found, skipping Enter/Space test');
  285 |     }
  286 |   });
  287 | 
  288 |   test('AC-1.1.11 - "?" key opens KeyboardShortcutsModal', async ({ page }) => {
  289 |     // P-7 & P-10: Ensure "?" key test is robust
  290 |     await page.keyboard.press('Shift+Slash');  // Shift+? is Shift+Slash
  291 |     await page.waitForTimeout(500);
  292 | 
  293 |     // Check multiple possible selectors for KeyboardShortcutsModal
  294 |     const modal = page.locator('role=dialog').first();
  295 |     const shortcutText = page.locator('text=/Keyboard|Shortcuts|Atajos|Help|Teclado/i').first();
  296 |     
  297 |     const modalVisible = await modal.isVisible().catch((err) => {
  298 |       console.warn('Modal check failed:', err.message);
  299 |       return false;
  300 |     });
  301 |     
  302 |     const textVisible = await shortcutText.isVisible().catch((err) => {
  303 |       console.warn('Shortcut text check failed:', err.message);
  304 |       return false;
  305 |     });
  306 | 
> 307 |     expect(modalVisible || textVisible).toBeTruthy();
      |                                         ^ Error: expect(received).toBeTruthy()
  308 |     console.log('✅ "?" key opens KeyboardShortcutsModal');
  309 |   });
  310 | 
  311 |   // ============================================================
  312 |   // AC-1.2: Focus Trap in Modals (COMPLETE)
  313 |   // ============================================================
  314 |   test('AC-1.2.1 - Tab within modal is circular (no escape)', async ({ page }) => {
  315 |     // P-8: Comprehensive focus trap test
  316 |     await page.keyboard.press('KeyC');
  317 |     const modal = page.locator('role=dialog').first();
  318 |     await modal.waitFor({ state: 'visible', timeout: 5000 });
  319 |     
  320 |     // Get all focusable elements within modal
  321 |     const focusablesInModal = await modal.locator(
  322 |       'button, input, [tabindex="0"], a[href]'
  323 |     ).all();
  324 |     
  325 |     if (focusablesInModal.length >= 2) {
  326 |       const lastElement = focusablesInModal[focusablesInModal.length - 1];
  327 |       await lastElement.focus();
  328 |       
  329 |       // Tab from last element should wrap to first, not escape modal
  330 |       await page.keyboard.press('Tab');
  331 |       await page.waitForTimeout(100);
  332 |       
  333 |       const focusedElement = await page.evaluate(() => {
  334 |         const focused = document.activeElement;
  335 |         return (focused as HTMLElement)?.getAttribute('role') ||
  336 |                (focused as HTMLElement)?.tagName;
  337 |       });
  338 |       
  339 |       // Should still be inside modal (button, input, etc.) not body
  340 |       expect(focusedElement).not.toBe('BODY');
  341 |       console.log('✅ Tab within modal is circular (focus trap working)');
  342 |     } else {
  343 |       console.log('⚠️  Not enough focusable elements in modal, skipping test');
  344 |     }
  345 |   });
  346 | 
  347 |   test('AC-1.2.2 - Shift+Tab maintains focus trap', async ({ page }) => {
  348 |     // P-8: Verify Shift+Tab also stays in modal
  349 |     await page.keyboard.press('KeyC');
  350 |     const modal = page.locator('role=dialog').first();
  351 |     await modal.waitFor({ state: 'visible', timeout: 5000 });
  352 |     
  353 |     const focusablesInModal = await modal.locator(
  354 |       'button, input, [tabindex="0"]'
  355 |     ).all();
  356 |     
  357 |     if (focusablesInModal.length >= 2) {
  358 |       const firstElement = focusablesInModal[0];
  359 |       await firstElement.focus();
  360 |       
  361 |       // Shift+Tab from first element should go to last
  362 |       await page.keyboard.press('Shift+Tab');
  363 |       await page.waitForTimeout(100);
  364 |       
  365 |       const focusedTag = await page.evaluate(() => {
  366 |         return (document.activeElement as HTMLElement)?.tagName;
  367 |       });
  368 |       
  369 |       expect(focusedTag).not.toBe('BODY');
  370 |       console.log('✅ Shift+Tab maintains focus trap');
  371 |     }
  372 |   });
  373 | 
  374 |   test('AC-1.2.3 - Escape closes modal correctly', async ({ page }) => {
  375 |     await page.keyboard.press('KeyC');
  376 |     const modal = page.locator('role=dialog').first();
  377 |     await modal.waitFor({ state: 'visible', timeout: 5000 });
  378 |     
  379 |     // Press Escape to close
  380 |     await page.keyboard.press('Escape');
  381 |     await page.waitForTimeout(300);
  382 |     
  383 |     const isVisible = await modal.isVisible().catch((err) => {
  384 |       console.warn('Modal check failed:', err.message);
  385 |       return false;
  386 |     });
  387 |     
  388 |     expect(isVisible).toBe(false);
  389 |     console.log('✅ Escape closes modal correctly');
  390 |   });
  391 | 
  392 |   test('AC-1.2.4 - Focus returns to trigger element after Escape', async ({ page }) => {
  393 |     // P-8: Verify focus restoration
  394 |     // Get initial focused element
  395 |     const initialFocused = await page.evaluate(() => {
  396 |       return (document.activeElement as HTMLElement)?.getAttribute('data-testid');
  397 |     });
  398 |     
  399 |     // Open modal
  400 |     await page.keyboard.press('KeyC');
  401 |     const modal = page.locator('role=dialog').first();
  402 |     await modal.waitFor({ state: 'visible', timeout: 5000 });
  403 |     
  404 |     // Close modal
  405 |     await page.keyboard.press('Escape');
  406 |     await page.waitForTimeout(300);
  407 |     
```