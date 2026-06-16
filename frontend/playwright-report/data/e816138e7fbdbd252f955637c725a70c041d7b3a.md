# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: timeline.spec.ts >> E5-S1: Timeline de Actividad por Lead >> AC-8: Events persist after page reload
- Location: e2e\timeline.spec.ts:147:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('[data-testid="timeline-view"]') to be visible

```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```