# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: timeline.spec.ts >> E5-S1: Timeline de Actividad por Lead >> AC-10: Error on add event shows toast
- Location: e2e\timeline.spec.ts:185:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('[data-testid="timeline-view"]') to be visible

```

```
Tearing down "context" exceeded the test timeout of 30000ms.
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