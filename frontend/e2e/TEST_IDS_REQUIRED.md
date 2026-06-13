---
title: "Test IDs Configuration for E2E Tests"
created: "2026-06-12"
epic_context: "E2E Framework setup for Epic 5"
applies_to: "All React components that need E2E testing"
---

# 📋 Test IDs Required for E2E Tests

This document lists all `data-testid` attributes needed for Playwright E2E tests to work correctly.

## Why Test IDs?

Playwright tests need reliable selectors. While CSS selectors and text content work, `data-testid` attributes are:
- **Explicit**: Clear intent that element is testable
- **Stable**: Won't break if CSS/styling changes
- **Maintainable**: Easy to find and update
- **Best Practice**: Standard for E2E testing

## Adding Test IDs

Add to React components like this:

```typescript
// Before
<div className="kanban-board">
  <div className="column">
    <h2>Nuevo</h2>
  </div>
</div>

// After
<div className="kanban-board" data-testid="kanban-board">
  <div className="column" data-testid="kanban-column-nuevo">
    <h2>Nuevo</h2>
  </div>
</div>
```

## Required Test IDs by Component

### KanbanBoard.tsx
```
data-testid="kanban-board"           // Main board container
data-testid="kanban-header"          // Header area (above columns)
data-testid="kanban-column-nuevo"
data-testid="kanban-column-en contacto"
data-testid="kanban-column-en revisión"
data-testid="kanban-column-cerrado"
data-testid="drag-sync-overlay"      // Sync indicator during drag (E4-S3)
```

### LeadCard.tsx
```
data-testid="lead-card"              // Individual lead card (repeating)
data-testid="lead-card-${lead.id}"   // More specific variant
```

### SearchFilterHeader.tsx
```
data-testid="search-input"
data-testid="priority-filter-button"
data-testid="priority-HIGH"
data-testid="priority-MEDIUM"
data-testid="priority-LOW"
```

### StatusFilterTabs.tsx (E4-S3)
```
data-testid="status-tab-nuevo"
data-testid="status-tab-en contacto"
data-testid="status-tab-en revisión"
data-testid="status-tab-cerrado"
```

### CreateLeadButton.tsx
```
data-testid="create-lead-button"
```

### CreateLeadModal.tsx
```
data-testid="create-lead-modal"
input[name="name"]                   // Standard form input
input[name="email"]
input[name="company"]
input[name="phone"]
data-testid="create-lead-submit"     // Submit button
```

### LeadsAtRiskWidget.tsx
```
data-testid="leads-at-risk-widget"
data-testid="leads-at-risk-badge"    // Badge showing count
```

### Toast Notifications
```
[role="alert"]                       // Standard ARIA for alerts
// Or add: data-testid="toast-${type}" (success, error, warning, info)
data-testid="toast-success"
data-testid="toast-error"
```

### Timeline Components (E5-S1 Preview)
```
data-testid="timeline-view"
data-testid="timeline-event"         // Individual event (repeating)
data-testid="timeline-filter-${eventType}"  // Event type filters
  - data-testid="timeline-filter-lead_created"
  - data-testid="timeline-filter-status_changed"
  - data-testid="timeline-filter-note_added"
  - data-testid="timeline-filter-call_made"
```

### Lead Detail Page
```
data-testid="lead-detail"
data-testid="lead-detail-header"
data-testid="lead-detail-timeline"
data-testid="lead-detail-activities"
```

## Implementation Checklist

For each component, ensure:
- [ ] Main container has `data-testid`
- [ ] Repeating elements have consistent naming (e.g., `lead-card`)
- [ ] Interactive elements (buttons, inputs) have IDs
- [ ] Status/state indicators have IDs (e.g., sync overlay)
- [ ] Modals and overlays have IDs

## Example: KanbanColumn.tsx

```typescript
// Current (no test IDs)
export const KanbanColumn = ({ status, leads }) => (
  <div className="kanban-column">
    <h3>{status}</h3>
    <div className="column-body">
      {leads.map(lead => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  </div>
);

// Updated (with test IDs)
export const KanbanColumn = ({ status, leads }) => (
  <div 
    className="kanban-column"
    data-testid={`kanban-column-${status.toLowerCase()}`}
  >
    <h3>{status}</h3>
    <div className="column-body">
      {leads.map(lead => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  </div>
);
```

## Example: LeadCard.tsx

```typescript
// Before
export const LeadCard = ({ lead, onDragStart }) => (
  <div 
    className="lead-card"
    draggable
    onDragStart={onDragStart}
  >
    <h4>{lead.name}</h4>
    <p>{lead.email}</p>
  </div>
);

// After
export const LeadCard = ({ lead, onDragStart }) => (
  <div 
    className="lead-card"
    data-testid="lead-card"
    data-testid-id={lead.id}  // Optional, for more specific selector
    draggable
    onDragStart={onDragStart}
  >
    <h4>{lead.name}</h4>
    <p>{lead.email}</p>
  </div>
);
```

## Migration Strategy

### Phase 1: Critical Path (E4-S3 & E2E)
Priority 1 - Required for E2E tests to run:
- Kanban board + columns
- Lead cards
- Sync overlay (drag-drop)
- Status tabs
- Toast notifications

### Phase 2: Search & Filters (E4-S1)
Priority 2 - For comprehensive testing:
- Search input
- Priority filter
- Status filter

### Phase 3: Complete Coverage (E5+)
Priority 3 - Future features:
- Timeline components
- Lead detail page
- Modal dialogs

## Naming Conventions

### Kebab-Case for Test IDs
```
✅ data-testid="kanban-column-nuevo"
✅ data-testid="lead-card"
✅ data-testid="create-lead-button"

❌ data-testid="KanbanColumn"
❌ data-testid="leadCard"
❌ data-testid="CreateLeadButton"
```

### Descriptive Naming
```
✅ data-testid="drag-sync-overlay"
✅ data-testid="status-tab-en-contacto"
✅ data-testid="priority-filter-button"

❌ data-testid="sync"
❌ data-testid="tab1"
❌ data-testid="btn-filter"
```

### Parameterized IDs for Collections
```typescript
// For repeating elements, include the identifier
data-testid={`kanban-column-${status.toLowerCase()}`}
data-testid={`lead-card-${lead.id}`}
data-testid={`timeline-event-${event.id}`}
```

## Validation

### Automated Check
Run this script to validate test IDs are in place:

```bash
# After components updated, run E2E tests
npm run e2e

# If tests fail with "element not found", check:
# 1. Selector in test file
# 2. Test ID in component
# 3. Element visibility (may be hidden or off-screen)
```

### Manual Check
In browser devtools console:
```javascript
// Check if test ID exists
document.querySelector('[data-testid="kanban-board"]');  // Should return element

// List all test IDs on page
Array.from(document.querySelectorAll('[data-testid]'))
  .map(el => el.getAttribute('data-testid'));
```

## Performance Impact

Test IDs have **zero performance impact**:
- HTML attributes don't affect rendering
- Negligible added HTML size (<1KB)
- Not included in production optimizations
- Search engines ignore data-* attributes

## Maintenance

When refactoring components:
1. ✅ Keep test IDs stable (don't rename unnecessarily)
2. ✅ Update test IDs if component purpose changes
3. ✅ Document breaking changes for E2E tests
4. ✅ Run E2E tests after any component restructuring

## References

- [Playwright Selectors](https://playwright.dev/docs/locators)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/byTestid)
- [WAI-ARIA data-* attributes](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)

---

**Status**: Ready for Implementation  
**Last Updated**: 2026-06-12  
**Priority**: Critical Path (Phase 1)

**Next Step**: Developers add these test IDs to components before E2E tests can run successfully.
