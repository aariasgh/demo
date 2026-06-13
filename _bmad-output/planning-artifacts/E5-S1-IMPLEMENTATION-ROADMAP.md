# E5-S1: Timeline de Actividad - Roadmap de Implementación

**Epic:** E5 (Timeline & Auditoría)  
**Story:** E5-S1 (Timeline de Actividad por Lead)  
**Status:** Ready for Development  
**Points:** 8  
**Priority:** P2  
**Date Created:** 2026-06-12  

---

## 📋 Executive Summary

E5-S1 implements an Activity Timeline feature for individual leads, showing a chronological history of all events (status changes, notes, calls, emails). Users can view, add, delete, and filter timeline events with full persistence and error handling.

**Key Deliverables:**
- ✅ 15 E2E test scenarios (19 acceptance criteria)
- ✅ data-testid reference guide (35 selectors)
- ✅ Backend API specification
- ✅ Frontend component architecture
- 🔄 Implementation (to be started)

---

## 🎯 Acceptance Criteria (12 AC → 15 Tests)

| # | AC | Title | Test Name | Points | Status |
|---|----|----|-----------|--------|--------|
| 1 | AC-1 | Timeline loads with existing events | `AC-1: Timeline loads` | 1 | ✅ Spec'd |
| 2 | AC-2 | User can add note to timeline | `AC-2: Add note` | 1 | ✅ Spec'd |
| 3 | AC-3 | User can add call event | `AC-3: Add call` | 1 | ✅ Spec'd |
| 4 | AC-4 | User can add email event | `AC-4: Add email` | 1 | ✅ Spec'd |
| 5 | AC-5 | User can delete timeline event | `AC-5: Delete event` | 1 | ✅ Spec'd |
| 6 | AC-6 | Filter by event type works | `AC-6: Filter` | 1 | ✅ Spec'd |
| 7 | AC-7 | All events visible without scroll | `AC-7: Visibility` | 0.5 | ✅ Spec'd |
| 8 | AC-8 | Events persist after page reload | `AC-8: Persistence` | 1 | ✅ Spec'd |
| 9 | AC-9 | Timeline sorts by date (newest first) | `AC-9: Sort` | 0.5 | ✅ Spec'd |
| 10 | AC-10 | Error on add event shows toast | `AC-10: Error handling` | 1 | ✅ Spec'd |
| 11 | AC-11 | Delete confirmation required | `AC-11: Delete confirm` | 0.5 | ✅ Spec'd |
| 12 | AC-12 | Empty timeline shows helpful message | `AC-12: Empty state` | 0.5 | ✅ Spec'd |
| — | — | Smoke Tests | `Smoke: Navigation`, `Timeline UI: Event details` | 1 | ✅ Spec'd |

**Total Test Coverage:** 15 test scenarios × 5 browsers = 75 E2E tests

---

## 🏗️ Component Architecture

### Frontend Components (React + TypeScript)

```
TimelineView.tsx (Main container)
├── TimelineHeader.tsx (Lead name, back button)
├── TimelineFilterBar.tsx (Filter by event type)
├── TimelineEventList.tsx (Event list container)
│   ├── TimelineEvent.tsx (Individual event item)
│   │   ├── EventBadge (type: note, call, email, status_change)
│   │   ├── EventContent (description/details)
│   │   ├── EventTimestamp (formatted date/time)
│   │   └── EventActions (delete button)
│   └── TimelineEmptyState.tsx (No events UI)
├── TimelineAddButton.tsx (Toolbar with add buttons)
│   ├── TimelineAddNoteModal.tsx (Modal for note)
│   ├── TimelineAddCallModal.tsx (Modal for call)
│   └── TimelineAddEmailModal.tsx (Modal for email)
└── TimelineDeleteConfirmation.tsx (Delete dialog)
```

### Component Specifications

#### TimelineView.tsx
```typescript
interface TimelineViewProps {
  leadId: number;
}

// Key responsibilities:
// 1. Fetch timeline events from API
// 2. Handle loading/error states
// 3. Render timeline container with all subcomponents
// 4. Manage filter state (via context or prop drilling)
// 5. Handle add/delete mutations
```

#### TimelineEvent.tsx
```typescript
interface TimelineEventProps {
  event: TimelineEvent;
  onDelete: (eventId: string) => Promise<void>;
}

// Key responsibilities:
// 1. Display event type badge
// 2. Render event content (description, metadata)
// 3. Show formatted timestamp
// 4. Handle delete button click
// 5. Provide data-testid attributes for E2E tests
```

#### TimelineAddNoteModal.tsx
```typescript
interface TimelineAddNoteModalProps {
  leadId: number;
  onSuccess: () => void;
  onClose: () => void;
}

// Key responsibilities:
// 1. Render modal form
// 2. Validate note content
// 3. Submit to POST /api/leads/{leadId}/timeline
// 4. Show success/error toasts
// 5. Handle form submission with React Hook Form
```

---

## 🔌 Backend API Specification

### Endpoints

#### 1. GET /api/leads/{leadId}/timeline
**Purpose:** Fetch all timeline events for a lead  
**Query Parameters:**
- `limit` (optional): Number of events to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): Filter by event type (note, call, email, status_change)

**Response:**
```typescript
interface TimelineEvent {
  id: string;
  leadId: number;
  eventType: 'LEAD_CREATED' | 'STATUS_CHANGED' | 'NOTE_ADDED' | 'CALL_MADE' | 'EMAIL_SENT';
  description: string;
  timestamp: string; // ISO 8601
  createdBy: string; // User ID or email
  metadata?: {
    callDuration?: number; // minutes
    emailSubject?: string;
    emailBody?: string;
    oldStatus?: string;
    newStatus?: string;
  };
}

// Response format:
{
  "data": TimelineEvent[],
  "meta": {
    "total": 42,
    "offset": 0,
    "limit": 50
  }
}
```

**Status Codes:**
- `200 OK` - Events retrieved successfully
- `404 Not Found` - Lead not found
- `401 Unauthorized` - User not authenticated

#### 2. POST /api/leads/{leadId}/timeline
**Purpose:** Add new timeline event  
**Request Body:**
```typescript
interface AddTimelineEventRequest {
  eventType: 'NOTE_ADDED' | 'CALL_MADE' | 'EMAIL_SENT';
  description: string;
  metadata?: {
    callDuration?: number;
    emailSubject?: string;
    emailBody?: string;
  };
}
```

**Response:**
```typescript
// Returns created TimelineEvent with 201 Created
{
  "id": "evt-uuid-123",
  "leadId": 1,
  "eventType": "NOTE_ADDED",
  "description": "Follow-up scheduled",
  "timestamp": "2026-06-12T14:30:00Z",
  "createdBy": "user@example.com",
  "metadata": {}
}
```

**Status Codes:**
- `201 Created` - Event created successfully
- `400 Bad Request` - Invalid request body
- `404 Not Found` - Lead not found
- `401 Unauthorized` - User not authenticated

#### 3. DELETE /api/leads/{leadId}/timeline/{eventId}
**Purpose:** Delete timeline event  
**Response:**
- `204 No Content` - Event deleted successfully
- `404 Not Found` - Event or lead not found
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User cannot delete this event

---

## 📊 State Management Architecture

### React Query Setup
```typescript
// hooks/useTimelineEvents.ts
export const useTimelineEvents = (leadId: number) => {
  return useQuery({
    queryKey: ['timeline', leadId],
    queryFn: () => fetch(`/api/leads/${leadId}/timeline`).then(r => r.json()),
    staleTime: 30_000, // 30 seconds
  });
};

// hooks/useAddTimelineEvent.ts
export const useAddTimelineEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/leads/${payload.leadId}/timeline`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['timeline', data.leadId]);
    },
  });
};

// hooks/useDeleteTimelineEvent.ts
export const useDeleteTimelineEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, eventId }) => {
      await fetch(`/api/leads/${leadId}/timeline/${eventId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries(['timeline', leadId]);
    },
  });
};
```

---

## 📐 Implementation Phases

### Phase 1: Backend API (Hours 1-2)

**Tasks:**
- [ ] Create TimelineEvent database model
- [ ] Implement GET /api/leads/{leadId}/timeline endpoint
- [ ] Implement POST /api/leads/{leadId}/timeline endpoint
- [ ] Implement DELETE /api/leads/{leadId}/timeline/{eventId} endpoint
- [ ] Add validation and error handling
- [ ] Write 8+ unit tests for backend

**Success Criteria:**
- ✅ All 3 endpoints working
- ✅ Tests passing: 8/8
- ✅ Error handling implemented
- ✅ Response formats match specification

**Files to Create:**
```
backend/app/models/timeline.py
backend/app/schemas/timeline.py
backend/app/services/timeline_service.py
backend/app/routes/timeline.py
backend/tests/test_timeline.py
```

### Phase 2: Frontend Components - Structure (Hours 2-3)

**Tasks:**
- [ ] Create TimelineView.tsx (main container)
- [ ] Create TimelineEvent.tsx (event item)
- [ ] Create TimelineEventList.tsx (list container)
- [ ] Create TimelineEmptyState.tsx (empty UI)
- [ ] Create TimelineHeader.tsx (header)
- [ ] Setup React Query hooks for timeline

**Success Criteria:**
- ✅ Components render without errors
- ✅ Data fetching works (useQuery)
- ✅ data-testid attributes in place
- ✅ Smoke test passes

**Files to Create:**
```
frontend/src/components/TimelineView.tsx
frontend/src/components/TimelineEvent.tsx
frontend/src/components/TimelineEventList.tsx
frontend/src/components/TimelineEmptyState.tsx
frontend/src/components/TimelineHeader.tsx
frontend/src/hooks/useTimelineEvents.ts
```

### Phase 3: Frontend Components - Add/Delete (Hours 3-4)

**Tasks:**
- [ ] Create TimelineAddButton.tsx (toolbar)
- [ ] Create TimelineAddNoteModal.tsx (add note form)
- [ ] Create TimelineAddCallModal.tsx (add call form)
- [ ] Create TimelineAddEmailModal.tsx (add email form)
- [ ] Create TimelineDeleteConfirmation.tsx (delete dialog)
- [ ] Implement mutations (useMutation hooks)
- [ ] Add success/error toasts

**Success Criteria:**
- ✅ Add note test passes: AC-2
- ✅ Add call test passes: AC-3
- ✅ Add email test passes: AC-4
- ✅ Delete test passes: AC-5
- ✅ Error handling test passes: AC-10

**Files to Create:**
```
frontend/src/components/TimelineAddButton.tsx
frontend/src/components/TimelineAddNoteModal.tsx
frontend/src/components/TimelineAddCallModal.tsx
frontend/src/components/TimelineAddEmailModal.tsx
frontend/src/components/TimelineDeleteConfirmation.tsx
frontend/src/hooks/useAddTimelineEvent.ts
frontend/src/hooks/useDeleteTimelineEvent.ts
```

### Phase 4: Frontend Components - Filtering (Hours 4-4.5)

**Tasks:**
- [ ] Create TimelineFilterBar.tsx (filter controls)
- [ ] Implement filter state management (useState or Zustand)
- [ ] Add filter logic to TimelineEventList
- [ ] Update data-testid for filter elements

**Success Criteria:**
- ✅ Filter by event type test passes: AC-6
- ✅ All events visible test passes: AC-7
- ✅ Sort order test passes: AC-9

**Files to Create:**
```
frontend/src/components/TimelineFilterBar.tsx
```

### Phase 5: Testing & Validation (Hours 4.5-5)

**Tasks:**
- [ ] Run all 15 E2E test scenarios
- [ ] Debug and fix failing tests
- [ ] Verify all 12 acceptance criteria
- [ ] Test mobile responsiveness
- [ ] Performance testing
- [ ] Code review and cleanup

**Success Criteria:**
- ✅ E2E tests: 75/75 passing (15 scenarios × 5 browsers)
- ✅ AC coverage: 12/12
- ✅ Build clean: 0 TypeScript errors
- ✅ Code review: Approved

---

## 🧪 E2E Test Execution

### Test Suite Location
```
frontend/e2e/timeline.spec.ts
```

### Running Tests
```bash
# Run E5-S1 timeline tests only
npm run e2e -- timeline.spec.ts

# Run with specific browser
npm run e2e -- timeline.spec.ts --project chromium

# Run with HTML report
npm run e2e -- timeline.spec.ts && npm run e2e:report
```

### Expected Output
```
Running 15 tests using 5 workers (timeline scenarios)

[Chromium]   ✅ AC-1: Timeline loads
[Chromium]   ✅ AC-2: Add note
[Chromium]   ✅ AC-3: Add call
[Chromium]   ✅ AC-4: Add email
[Chromium]   ✅ AC-5: Delete event
[Chromium]   ✅ AC-6: Filter by type
[Chromium]   ✅ AC-7: Visibility
[Chromium]   ✅ AC-8: Persistence
[Chromium]   ✅ AC-9: Sort
[Chromium]   ✅ AC-10: Error handling
[Chromium]   ✅ AC-11: Delete confirmation
[Chromium]   ✅ AC-12: Empty state
[Chromium]   ✅ Smoke: Navigation
[Chromium]   ✅ Timeline UI: Event details

75 passed (3.5m)
```

---

## 📦 Deliverables

### Documentation (✅ Complete)
- [x] E5-S1-TIMELINE-TESTID-REFERENCE.md (35 data-testid selectors)
- [x] timeline.spec.ts (15 E2E test scenarios)
- [x] This roadmap (implementation guide)

### Code to Implement (🔄 In Progress)
- [ ] Backend API (3 endpoints)
- [ ] Frontend Components (10+ components)
- [ ] React Query Hooks (3 custom hooks)
- [ ] Unit Tests (backend: 8+, frontend: 12+)

### Validation (⏳ After Implementation)
- [ ] E2E tests: 75/75 passing
- [ ] Build: 0 TypeScript errors
- [ ] Code review: Approved
- [ ] UAT: Signed off

---

## ⚠️ Critical Dependencies

### Backend Dependencies
- PostgreSQL: Timeline event model
- FastAPI: API endpoints
- SQLAlchemy: ORM operations
- Pydantic: Schema validation

### Frontend Dependencies
- React 18: Component framework
- TanStack Query: Data fetching & caching
- React Hook Form: Form handling
- Zod: Validation
- Tailwind CSS: Styling

### Testing Dependencies
- Playwright: E2E testing
- pytest: Backend unit tests
- Vitest: Frontend unit tests

---

## 🎯 Success Metrics

| Metric | Target | Achieved |
|--------|--------|----------|
| E2E tests passing | 75/75 (100%) | ⏳ |
| Acceptance criteria met | 12/12 (100%) | ⏳ |
| TypeScript errors | 0 | ⏳ |
| Code review | Approved | ⏳ |
| Build time | < 15s | ⏳ |
| Test execution time | < 5 minutes | ⏳ |
| Mobile responsive | Passes 375px | ⏳ |

---

## 📅 Timeline Estimate

| Phase | Duration | Hours | Cumulative |
|-------|----------|-------|-----------|
| Phase 1: Backend API | 1-2 hours | 2 | 2h |
| Phase 2: Components - Structure | 2-3 hours | 1 | 3h |
| Phase 3: Components - Add/Delete | 3-4 hours | 1 | 4h |
| Phase 4: Components - Filter | 4-4.5 hours | 0.5 | 4.5h |
| Phase 5: Testing & Validation | 4.5-5 hours | 0.5 | 5h |
| **Total** | **~5 hours** | **5** | **5h** |

**Story Points:** 8 (includes design, implementation, testing, code review)  
**Ideal Hours:** 5 hours of focused development + 1-2 hours code review

---

## 🚀 Go/No-Go Checklist

Before E5-S1 development starts:

- [ ] Backend team confirmed available (2 hours)
- [ ] Frontend team confirmed available (3 hours)
- [ ] Test environment ready (Docker, Playwright)
- [ ] data-testid reference guide reviewed
- [ ] E2E test scenarios reviewed and approved
- [ ] API specification agreed upon
- [ ] Component architecture approved
- [ ] All dependencies installed
- [ ] Code review process established

**Status:** ✅ Ready for Development  
**Date Approved:** 2026-06-12  
**Assigned To:** (TBD)

---

## 📚 Reference Materials

1. **Test Specification**: `frontend/e2e/timeline.spec.ts`
2. **data-testid Reference**: `docs/E5-S1-TIMELINE-TESTID-REFERENCE.md`
3. **React Query Patterns**: `docs/REACT_QUERY_PATTERNS.md` (Section: E5-S1)
4. **E2E Framework**: `frontend/e2e/fixtures.ts`, `helpers.ts`
5. **Component Examples**: E4-S3 (KanbanColumn), E4-S2 (LeadsAtRiskWidget)
6. **Form Examples**: E2-S4 (CreateLeadModal)

---

## 🔗 Blockers & Dependencies

**Blocks:**
- E5-S2 (Auditoría - depends on Timeline data)
- E5-S3 (any future features depending on timeline)

**Blocked By:**
- None (E4 is complete)

**Related Epics:**
- E4 (Búsqueda, Filtrado) - Complete
- E3 (Kanban) - Complete

---

**Document Status:** ✅ Complete & Ready for Handoff  
**Last Updated:** 2026-06-12T14:45:00Z  
**Created By:** E2E Framework & QA Team
