# E5-S1: Timeline Feature - data-testid Attributes Reference

**Date:** 2026-06-12  
**Epic:** E5 (Timeline & Auditoría)  
**Story:** E5-S1 (Timeline de Actividad por Lead)  
**Status:** Test Specification (Ready for Implementation)  

---

## Overview

This document specifies all `data-testid` attributes required for E2E testing of the E5-S1 Timeline feature. These attributes must be implemented during the frontend development phase.

---

## Container & Layout Elements

### Timeline Container
```
data-testid="timeline-container"
Purpose: Main timeline view container
Usage: Page loading verification, viewport tests
Components: TimelineView.tsx

data-testid="timeline-view"
Purpose: Alternative selector for timeline view
Usage: Backup selector for reliability
Components: TimelineView.tsx

data-testid="timeline-empty-state"
Purpose: Empty state message when no events exist
Usage: AC-12 (Empty timeline verification)
Components: TimelineEmptyState.tsx

data-testid="timeline-add-first-event-cta"
Purpose: Call-to-action button to add first event
Usage: AC-12 (Empty state CTA)
Components: TimelineEmptyState.tsx
```

---

## Timeline Event Display

### Event Item
```
data-testid="timeline-event"
Purpose: Individual event item wrapper
Usage: Event count, filtering, visibility checks
Components: TimelineEvent.tsx
Repeat: One per event in list

data-testid="timeline-event-timestamp"
Purpose: Event timestamp/date display
Usage: AC-9 (Sort verification), AC-8 (Persistence check)
Components: TimelineEvent.tsx
Repeat: One per event

data-testid="timeline-event-content"
Purpose: Event description/content area
Usage: AC-7 (Visibility), content verification
Components: TimelineEvent.tsx
Repeat: One per event

data-testid="timeline-event-type-{type}"
Purpose: Event type badge (note, call, email, status_change)
Usage: AC-6 (Filter by type), type verification
Components: TimelineEvent.tsx
Repeat: One per event
Examples:
  - data-testid="timeline-event-type-note"
  - data-testid="timeline-event-type-call"
  - data-testid="timeline-event-type-email"
  - data-testid="timeline-event-type-status_change"

data-testid="timeline-delete-button"
Purpose: Delete button for timeline event
Usage: AC-5 (Delete functionality), AC-11 (Confirmation)
Components: TimelineEvent.tsx
Repeat: One per event (can be hidden if user lacks permission)
```

---

## Add Event Features

### Add Note
```
data-testid="timeline-add-note-button"
Purpose: Button to open add note dialog
Usage: AC-2 (Add note feature)
Components: TimelineAddButton.tsx or TimelineToolbar.tsx

data-testid="timeline-add-note-form"
Purpose: Modal/form for adding note
Usage: AC-2 (Form presence verification)
Components: TimelineAddNoteModal.tsx

data-testid="timeline-note-input"
Purpose: Text input for note content
Usage: AC-2 (Note content entry)
Components: TimelineAddNoteModal.tsx

data-testid="timeline-note-submit"
Purpose: Submit button for add note form
Usage: AC-2 (Form submission)
Components: TimelineAddNoteModal.tsx
```

### Add Call
```
data-testid="timeline-add-call-button"
Purpose: Button to open add call dialog
Usage: AC-3 (Add call feature)
Components: TimelineAddButton.tsx or TimelineToolbar.tsx

data-testid="timeline-add-call-form"
Purpose: Modal/form for adding call event
Usage: AC-3 (Form presence verification)
Components: TimelineAddCallModal.tsx

data-testid="timeline-call-duration"
Purpose: Input field for call duration (minutes)
Usage: AC-3 (Duration entry)
Components: TimelineAddCallModal.tsx

data-testid="timeline-call-notes"
Purpose: Text input for call notes
Usage: AC-3 (Notes entry)
Components: TimelineAddCallModal.tsx

data-testid="timeline-call-submit"
Purpose: Submit button for add call form
Usage: AC-3 (Form submission)
Components: TimelineAddCallModal.tsx
```

### Add Email
```
data-testid="timeline-add-email-button"
Purpose: Button to open add email dialog
Usage: AC-4 (Add email feature)
Components: TimelineAddButton.tsx or TimelineToolbar.tsx

data-testid="timeline-add-email-form"
Purpose: Modal/form for adding email event
Usage: AC-4 (Form presence verification)
Components: TimelineAddEmailModal.tsx

data-testid="timeline-email-subject"
Purpose: Input field for email subject
Usage: AC-4 (Subject entry)
Components: TimelineAddEmailModal.tsx

data-testid="timeline-email-body"
Purpose: Text area for email body
Usage: AC-4 (Body entry)
Components: TimelineAddEmailModal.tsx

data-testid="timeline-email-submit"
Purpose: Submit button for add email form
Usage: AC-4 (Form submission)
Components: TimelineAddEmailModal.tsx
```

---

## Delete Confirmation Dialog

```
data-testid="timeline-delete-button"
Purpose: Delete button (see above)
Usage: AC-5, AC-11

[role="dialog"]:has-text("Delete event")
Purpose: Confirmation dialog for deletion
Usage: AC-11 (Confirmation requirement)
HTML Structure: <div role="dialog">...</div>

data-testid="timeline-delete-confirm"
Purpose: Confirm deletion button
Usage: AC-5 (Delete confirmation), AC-11 (Confirm action)
Components: TimelineDeleteConfirmation.tsx

data-testid="timeline-delete-cancel"
Purpose: Cancel deletion button
Usage: AC-11 (Cancel action verification)
Components: TimelineDeleteConfirmation.tsx
```

---

## Filtering

```
data-testid="timeline-filter-{type}"
Purpose: Filter button for specific event type
Usage: AC-6 (Filter by type)
Components: TimelineFilterBar.tsx
Examples:
  - data-testid="timeline-filter-note"
  - data-testid="timeline-filter-call"
  - data-testid="timeline-filter-email"
  - data-testid="timeline-filter-status_change"

data-testid="timeline-filter-badge-{type}"
Purpose: Badge showing active filter (e.g., "Call (3)")
Usage: AC-6 (Filter status indication)
Components: TimelineFilterBar.tsx

data-testid="timeline-filter-clear"
Purpose: Button to clear all filters
Usage: AC-6 (Clear filter verification)
Components: TimelineFilterBar.tsx
```

---

## Navigation & Links

```
data-testid="lead-timeline-link"
Purpose: Link to timeline from lead card/details
Usage: Smoke test (Timeline navigation)
Components: LeadCard.tsx or LeadDetailsPanel.tsx
```

---

## Toast Notifications

**Note:** These use standard role="status" or role="alert" from the toast system.

```
[role="status"]:has-text("Note added")
Purpose: Success notification for add note
Usage: AC-2 (Success feedback)

[role="status"]:has-text("Event deleted")
Purpose: Success notification for delete
Usage: AC-5 (Success feedback)

[role="alert"]:has-text("Failed")
Purpose: Error notification for failed operations
Usage: AC-10 (Error handling)

[role="status"]:has-text("Call added")
Purpose: Success notification for add call
Usage: AC-3 (Success feedback)

[role="status"]:has-text("Email added")
Purpose: Success notification for add email
Usage: AC-4 (Success feedback)
```

---

## Summary Table

| Feature | Primary Selector | Component | AC Coverage |
|---------|------------------|-----------|-------------|
| Timeline Load | `timeline-container` | TimelineView.tsx | AC-1, AC-8 |
| Add Note | `timeline-add-note-button` | TimelineAddButton.tsx | AC-2 |
| Add Call | `timeline-add-call-button` | TimelineAddButton.tsx | AC-3 |
| Add Email | `timeline-add-email-button` | TimelineAddButton.tsx | AC-4 |
| Delete Event | `timeline-delete-button` | TimelineEvent.tsx | AC-5, AC-11 |
| Filter | `timeline-filter-{type}` | TimelineFilterBar.tsx | AC-6 |
| Event Display | `timeline-event` | TimelineEvent.tsx | AC-7, AC-9, AC-12 |
| Persistence | `timeline-container` | TimelineView.tsx | AC-8 |
| Error Toast | `[role="alert"]` | Toast system | AC-10 |
| Empty State | `timeline-empty-state` | TimelineEmptyState.tsx | AC-12 |

---

## Implementation Checklist

Before E5-S1 development starts:

- [ ] **TimelineView.tsx** - Main timeline container component
- [ ] **TimelineEvent.tsx** - Individual event display component with delete
- [ ] **TimelineAddButton.tsx** - Toolbar with add note/call/email buttons
- [ ] **TimelineAddNoteModal.tsx** - Modal for adding notes
- [ ] **TimelineAddCallModal.tsx** - Modal for adding call events
- [ ] **TimelineAddEmailModal.tsx** - Modal for adding email events
- [ ] **TimelineDeleteConfirmation.tsx** - Delete confirmation dialog
- [ ] **TimelineFilterBar.tsx** - Filter controls for event types
- [ ] **TimelineEmptyState.tsx** - Empty state UI
- [ ] All data-testid attributes implemented in components
- [ ] E2E helpers updated in helpers.ts
- [ ] timeline.spec.ts passing (19 test scenarios)

---

## Backend Requirements

The E5-S1 Timeline feature requires these API endpoints:

### GET /api/leads/{leadId}/timeline
**Purpose:** Fetch all timeline events for a lead  
**Response:** `TimelineEvent[]`

```typescript
interface TimelineEvent {
  id: string;
  leadId: number;
  eventType: 'LEAD_CREATED' | 'STATUS_CHANGED' | 'NOTE_ADDED' | 'CALL_MADE' | 'EMAIL_SENT';
  description: string;
  timestamp: ISO8601;
  metadata?: {
    callDuration?: number;
    emailSubject?: string;
    newStatus?: string;
  };
}
```

### POST /api/leads/{leadId}/timeline
**Purpose:** Add new timeline event  
**Request:** Timeline event creation payload  
**Response:** Created TimelineEvent

### DELETE /api/leads/{leadId}/timeline/{eventId}
**Purpose:** Delete timeline event  
**Response:** 204 No Content

---

## Test Coverage Summary

| Test Name | ACs Covered | Selectors Used | Status |
|-----------|------------|----------------|--------|
| AC-1: Timeline loads | 1 | `timeline-container`, `timeline-event` | ✅ Ready |
| AC-2: Add note | 2 | `timeline-add-note-*` | ✅ Ready |
| AC-3: Add call | 3 | `timeline-add-call-*` | ✅ Ready |
| AC-4: Add email | 4 | `timeline-add-email-*` | ✅ Ready |
| AC-5: Delete event | 5 | `timeline-delete-*` | ✅ Ready |
| AC-6: Filter by type | 6 | `timeline-filter-*` | ✅ Ready |
| AC-7: Visible without scroll | 7 | `timeline-container` | ✅ Ready |
| AC-8: Persist on reload | 8 | `timeline-container` | ✅ Ready |
| AC-9: Sort descending | 9 | `timeline-event-timestamp` | ✅ Ready |
| AC-10: Error toast | 10 | `[role="alert"]` | ✅ Ready |
| AC-11: Delete confirmation | 11 | `timeline-delete-*` | ✅ Ready |
| AC-12: Empty state | 12 | `timeline-empty-state` | ✅ Ready |

---

## Notes for Implementation Team

1. **Status Badge Pattern**: Follow same pattern as E4-S3 StatusFilterTabs for consistency
2. **Modal Dialogs**: Reuse CreateLeadModal patterns from E2-S4
3. **Toast Notifications**: Use existing toast system from E4-S2
4. **Error Handling**: Follow React Query patterns from REACT_QUERY_PATTERNS.md
5. **Mobile Responsive**: Ensure timeline works on 375px viewport (smoke test included)
6. **Accessibility**: Implement ARIA labels, keyboard navigation, screen reader support
7. **Performance**: Timeline should load first 20 events, lazy-load on scroll
8. **Data Sorting**: Newest events first (descending by timestamp)

---

## Reference Documents

- **E5-S1 Story File**: `_bmad-output/implementation-artifacts/E5-S1.md` (to be created)
- **E2E Tests**: `frontend/e2e/timeline.spec.ts` (created)
- **Test Fixtures**: `frontend/e2e/fixtures.ts` (has mockTimelineEvents)
- **Test Helpers**: `frontend/e2e/helpers.ts` (navigateToTimeline, etc.)
- **React Query Patterns**: `docs/REACT_QUERY_PATTERNS.md` (E5-S1 section)

---

**Document Status:** ✅ Ready for E5-S1 Development  
**Last Updated:** 2026-06-12  
**Created By:** E2E Framework Team
