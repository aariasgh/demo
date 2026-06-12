# Edge Case Hunter Review — E4-S3: Status Filter en Kanban
**Date**: 2026-06-12  
**Story**: E4-S3 - Status Filter en Kanban (56 tests passing)  
**Stack**: React 18 + TypeScript + Zustand  
**Methodology**: Systematic path analysis + boundary condition testing + type safety audit

---

## Executive Summary

**SEVERITY BREAKDOWN**:
- 🔴 **CRITICAL**: 2 issues (Silent failures, Type mismatch)
- 🟡 **MEDIUM**: 8 issues (Race conditions, Edge cases, UX bugs)
- 🟢 **LOW**: 5 issues (Minor optimizations, Accessibility)

**VERDICT**: ⚠️ **PRODUCTION-READY WITH RESERVATIONS**
- The 2 critical issues cause silent filtering failures and type mismatches
- Issue #1 (Type Mismatch) breaks filtering completely in edge cases
- All tests pass but they don't cover the type mismatch scenario
- Recommend fixing Critical issues before merge; Medium issues before v1

---

## 🔴 CRITICAL ISSUES

### Issue #1: LeadStatus Type Mismatch — SILENT FILTERING FAILURE
**Severity**: 🔴 CRITICAL  
**Component**: `kanbanFilterStore.ts` + `types/lead.ts` + `useLeadsByStatus.ts`  
**Category**: Type Safety / Silent Failure

#### Problem
```typescript
// types/lead.ts
export type LeadStatus = "Nuevo" | "En contacto" | "Propuesta enviada" | "Cerrado";

// store/kanbanFilterStore.ts (E4-S3)
export type LeadStatus = 'Nuevo' | 'En contacto' | 'Propuesta' | 'Cerrado';  // ❌ MISMATCH!

// types/index.ts
export type LeadStatus = 'Nuevo' | 'En contacto' | 'Propuesta enviada' | 'Cerrado';
```

#### Current Behavior
1. User clicks "Propuesta" tab in StatusFilterTabs
2. Store sets `selectedStatus = 'Propuesta'` (from store's LeadStatus type)
3. KanbanBoard filtering checks: `visibleColumns.includes(lead.status)` 
4. But `lead.status = 'Propuesta enviada'` (from types/lead.ts)
5. **Result**: `'Propuesta' !== 'Propuesta enviada'` → **lead is silently excluded**
6. User sees an empty "Propuesta" column (no error thrown)

#### Expected Behavior
- All three LeadStatus type definitions must match
- Filtering accurately shows all leads in selected status

#### Impact
- 🔥 Users see incorrect/empty columns for "Propuesta"
- Silent failure (no console error, no UI error message)
- Data appears to be missing when it's actually a type mismatch
- High frustration due to inconsistent filtering behavior
- Blocks Status Filter feature completely

#### Test Case
```typescript
// MISSING TEST: This should catch the issue
it('should filter leads with Propuesta status correctly', () => {
  render(<FilteringTestComponent />);
  
  // Mock leads with backend status value
  const mockLeads = [
    { id: 1, name: 'juan', status: 'Propuesta enviada', priority: 'Alta' } // ← Backend uses this
  ];
  
  fireEvent.click(screen.getByTestId('status-tab-Propuesta')); // ← Store uses this
  
  // ❌ FAILS: Lead is excluded due to type mismatch
  expect(screen.getByTestId('lead-1')).toBeInTheDocument();
});
```

#### Fix
**Option A (Recommended)**: Align store type with backend
```typescript
// store/kanbanFilterStore.ts
export type LeadStatus = 'Nuevo' | 'En contacto' | 'Propuesta enviada' | 'Cerrado';

const ALL_STATUSES: LeadStatus[] = [
  'Nuevo', 
  'En contacto', 
  'Propuesta enviada',  // ← Update tab value
  'Cerrado'
];

// StatusFilterTabs.tsx
const TABS = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'Nuevo' as const, label: 'Nuevo' },
  { value: 'En contacto' as const, label: 'En contacto' },
  { value: 'Propuesta enviada' as const, label: 'Propuesta' },  // ← Show 'Propuesta' but use 'Propuesta enviada'
  { value: 'Cerrado' as const, label: 'Cerrado' },
];
```

**Option B**: Centralize type definition
```typescript
// types/index.ts or types/lead.ts
export type LeadStatus = 'Nuevo' | 'En contacto' | 'Propuesta enviada' | 'Cerrado';

// All imports use this single source
import type { LeadStatus } from '../types';

// store/kanbanFilterStore.ts (import instead of redefine)
import type { LeadStatus } from '../types/lead';
```

**Option C**: Add test to catch this in the future
```typescript
// Add validation test
it('should use backend LeadStatus type consistently', () => {
  const backendStatuses: LeadStatus[] = ['Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado'];
  const storeStatuses = ALL_STATUSES;
  
  expect(storeStatuses).toEqual(backendStatuses);
});
```

---

### Issue #2: getVisibleColumns() Type Coercion on Invalid Status
**Severity**: 🔴 CRITICAL  
**Component**: `kanbanFilterStore.ts` - `getVisibleColumns()`  
**Category**: State Corruption / Type Safety

#### Problem
```typescript
getVisibleColumns: () => {
  const state = get();
  if (state.selectedStatus === 'all') {
    return ALL_STATUSES;
  }
  return [state.selectedStatus];  // ← Assumes selectedStatus is valid LeadStatus
};
```

**What if selectedStatus is corrupted or invalid?**

#### Scenarios Where This Fails

**Scenario A: Deserialization from corrupted localStorage/session**
```typescript
// Corrupted session storage (or manually edited)
const corruptedState = {
  selectedStatus: 'INVALID_STATUS'  // Not in LeadStatus union
};

// After hydration:
const visibleColumns = getVisibleColumns();
// Returns: ['INVALID_STATUS']
// This value never matches any lead.status, causing 0 results
```

**Scenario B: String interpolation / user input (hypothetically)**
```typescript
const selectedStatus = `Propuesta${externalValue}`;  // 'Propuesta_corrupted'
getVisibleColumns();  // Returns ['Propuesta_corrupted']
```

**Scenario C: Typo in store initialization**
```typescript
setSelectedStatus('Nuevoo' as any);  // Typo: one 'o' too many
getVisibleColumns();  // Returns ['Nuevoo'] → no leads match
```

#### Current Behavior
- Store returns invalid status without validation
- Filtering logic silently returns 0 results
- No error boundary or warning
- User sees empty board (confusing UX)

#### Expected Behavior
- Validate selectedStatus before returning
- Return 'all' or log warning if invalid
- Graceful fallback with user feedback

#### Impact
- Silent rendering of 0 results
- Confusing user experience ("where did all my leads go?")
- Difficult to debug (no console error)
- Corrupted state persists across session reloads

#### Test Case
```typescript
it('should validate selectedStatus and handle invalid values', () => {
  const store = useKanbanFilterStore.getState();
  
  // Manually corrupt state (simulating session deserialization)
  store.setSelectedStatus('INVALID' as any);
  
  const visibleColumns = store.getVisibleColumns();
  
  // ❌ CURRENT: Returns ['INVALID'] - silent failure
  // ✅ EXPECTED: Should either:
  //    - Return ALL_STATUSES (fallback to safe state)
  //    - Log console warning
  //    - Throw descriptive error
});
```

#### Fix

**Option A: Runtime Validation**
```typescript
getVisibleColumns: () => {
  const state = get();
  const validStatuses: (LeadStatus | 'all')[] = ['all', 'Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado'];
  
  if (!validStatuses.includes(state.selectedStatus)) {
    console.warn(
      `Invalid selectedStatus: "${state.selectedStatus}". Falling back to 'all'.`,
      { state }
    );
    return ALL_STATUSES;
  }
  
  if (state.selectedStatus === 'all') {
    return ALL_STATUSES;
  }
  return [state.selectedStatus];
},
```

**Option B: Type-level Enforcement**
```typescript
// Ensure selectedStatus is always typed correctly (already done, but add assertion in getter)
getVisibleColumns: (): LeadStatus[] => {
  const state = get();
  const status = state.selectedStatus as LeadStatus | 'all';  // Explicit cast
  
  if (status === 'all') {
    return ALL_STATUSES;
  }
  return [status];
},
```

**Option C: Zod/Runtime Validation Schema**
```typescript
import z from 'zod';

const StatusSchema = z.enum(['all', 'Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado']);

getVisibleColumns: () => {
  const state = get();
  const parsed = StatusSchema.safeParse(state.selectedStatus);
  
  if (!parsed.success) {
    console.error('Invalid status:', parsed.error);
    return ALL_STATUSES;
  }
  
  const status = parsed.data;
  return status === 'all' ? ALL_STATUSES : [status];
},
```

---

## 🟡 MEDIUM ISSUES

### Issue #3: Race Condition — Tab Click During Async Filtering
**Severity**: 🟡 MEDIUM  
**Component**: `KanbanBoard.tsx` + `StatusFilterTabs.tsx`  
**Category**: Race Condition / Concurrency

#### Problem
```
Timeline:
T0:   User clicks "Nuevo" tab
T1:   Store updates selectedStatus = 'Nuevo'
T2:   KanbanBoard.filteredGroupedLeads starts computing
T3:   User clicks "Propuesta" tab (before T2 completes)
T4:   Store updates selectedStatus = 'Propuesta'
T5:   useMemo from T2 finishes with selectedStatus from T3
T6:   Screen shows results mixed from both filters
```

#### Current Behavior
```typescript
const filteredGroupedLeads = useMemo(() => {
  const visibleColumns = getVisibleColumns();  // ← Which value? Old or new?
  
  // If selectedStatus changes during this computation,
  // visibleColumns might be inconsistent with dependency array
  
  // ...
}, [groupedLeads, searchQuery, selectedPriorities, selectedStatus, getVisibleColumns]);
```

#### Scenario
1. Kanban board is rendering 1000 leads
2. User rapid-clicks tabs: Nuevo → Propuesta → Cerrado → Nuevo
3. Each click triggers filteredGroupedLeads recalculation
4. If recalculation is slow, old and new filters mix
5. User briefly sees incorrect data

#### Expected Behavior
- Each tab click immediately shows results for selected status
- No flicker between different filter states
- Consistent UI state

#### Impact
- Visual flicker during rapid tab switching
- Temporary incorrect data display
- User confusion ("why did the results change?")
- Especially noticeable on slow devices/networks

#### Test Case
```typescript
it('should handle rapid tab clicks without mixing filter states', async () => {
  render(<FilteringTestComponent />);
  
  // Rapid clicks
  fireEvent.click(screen.getByTestId('status-tab-Nuevo'));
  fireEvent.click(screen.getByTestId('status-tab-Propuesta'));
  fireEvent.click(screen.getByTestId('status-tab-Cerrado'));
  fireEvent.click(screen.getByTestId('status-tab-Nuevo'));
  
  // Wait for all state updates
  await waitFor(() => {
    const { selectedStatus } = useKanbanFilterStore.getState();
    expect(selectedStatus).toBe('Nuevo');  // Final state is correct
  });
  
  // ⚠️ CURRENT: Might show mixed results during transitions
  // ✅ EXPECTED: Should show only Nuevo results (or loading state)
});
```

#### Fix

**Option A: Debounced State Update**
```typescript
// StatusFilterTabs.tsx
const handleTabClick = (status: LeadStatus | 'all') => {
  // Debounce rapid clicks
  if (clickTimeout.current) clearTimeout(clickTimeout.current);
  clickTimeout.current = setTimeout(() => {
    setSelectedStatus(status);
  }, 50);  // Small delay to batch clicks
};
```

**Option B: Add Loading State During Filter Change**
```typescript
// KanbanBoard.tsx
const [prevStatus, setPrevStatus] = useState(selectedStatus);

useEffect(() => {
  if (selectedStatus !== prevStatus) {
    // Show loading skeleton
    setIsFilterChanging(true);
    const timer = setTimeout(() => {
      setPrevStatus(selectedStatus);
      setIsFilterChanging(false);
    }, 50);
    return () => clearTimeout(timer);
  }
}, [selectedStatus, prevStatus]);
```

**Option C: Memoize visibleColumns Separately**
```typescript
const visibleColumns = useMemo(() => getVisibleColumns(), [getVisibleColumns]);

const filteredGroupedLeads = useMemo(() => {
  // Use memoized visibleColumns instead of computing in-place
  const filtered: Record<string, typeof groupedLeads[keyof typeof groupedLeads]> = {};
  
  visibleColumns.forEach((status) => {
    filtered[status] = groupedLeads[status]?.filter(...) ?? [];
  });
  
  return filtered;
}, [groupedLeads, visibleColumns, searchQuery, selectedPriorities]);
```

---

### Issue #4: Arrow Key Navigation Not Implemented (Feature Gap)
**Severity**: 🟡 MEDIUM  
**Component**: `StatusFilterTabs.tsx`  
**Category**: Accessibility / Keyboard Navigation

#### Problem
```typescript
// Current: Only supports Enter key
const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>, status: LeadStatus | 'all') => {
  if (e.key === 'Enter') {
    setSelectedStatus(status);
  }
};

// Missing: Arrow key navigation (standard for tab components)
// User expectations (WAI-ARIA Tabs pattern):
// - ArrowRight: Move to next tab
// - ArrowLeft: Move to previous tab
// - Home: First tab
// - End: Last tab
```

#### Current Behavior
- Only Enter/Space works to select a tab
- Arrow keys do nothing (no navigation)
- Tab key doesn't follow WAI-ARIA tabs pattern
- Keyboard-only users must tab through all 5 buttons

#### Expected Behavior (WAI-ARIA Tabs Pattern)
- ArrowRight: Select next tab and focus it
- ArrowLeft: Select previous tab and focus it
- Home: Select first tab
- End: Select last tab
- Enter/Space: Activate selected tab

#### Impact
- 🔴 **Accessibility Violation**: WAI-ARIA tabs pattern not followed
- Keyboard users get poor experience
- Screen reader users confused by tab order
- Does not meet WCAG 2.1 Level AA standards

#### Test Case
```typescript
it('should support arrow key navigation through tabs', async () => {
  render(<StatusFilterTabs />);
  
  const nuevoTab = screen.getByRole('tab', { name: /Nuevo/i });
  nuevoTab.focus();
  
  // ArrowRight should move to next tab (En contacto)
  fireEvent.keyDown(nuevoTab, { key: 'ArrowRight' });
  
  const enContactoTab = screen.getByRole('tab', { name: /En contacto/i });
  expect(enContactoTab).toHaveFocus();
  expect(enContactoTab).toHaveAttribute('aria-pressed', 'true');
});

it('should wrap around with arrow keys', () => {
  render(<StatusFilterTabs />);
  
  const cerradoTab = screen.getByRole('tab', { name: /Cerrado/i });
  cerradoTab.focus();
  
  // ArrowRight on last tab should wrap to first (Todos)
  fireEvent.keyDown(cerradoTab, { key: 'ArrowRight' });
  
  const todosTab = screen.getByRole('tab', { name: /Todos/i });
  expect(todosTab).toHaveFocus();
});
```

#### Fix

**Implement WAI-ARIA Tabs Pattern**
```typescript
export default function StatusFilterTabs() {
  const { selectedStatus, setSelectedStatus } = useKanbanFilterStore();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (index + 1) % TABS.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (index - 1 + TABS.length) % TABS.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = TABS.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setSelectedStatus(TABS[index].value);
        return;
      default:
        return;
    }

    // Set new tab as active
    const nextTab = TABS[nextIndex];
    setSelectedStatus(nextTab.value);
    
    // Focus the button
    setTimeout(() => {
      tabRefs.current[nextIndex]?.focus();
    }, 0);
  };

  return (
    <div role="tablist" aria-label="Filtrar leads por estado">
      {TABS.map((tab, index) => {
        const isActive = selectedStatus === tab.value;
        return (
          <button
            ref={(el) => { tabRefs.current[index] = el; }}
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="tab"
            aria-pressed={isActive}
            aria-label={`Filtrar por ${tab.label}`}
            tabIndex={isActive ? 0 : -1}
            className={/* ... */}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

---

### Issue #5: No Error Boundary for Store State Initialization Failure
**Severity**: 🟡 MEDIUM  
**Component**: `KanbanBoard.tsx` + `StatusFilterTabs.tsx`  
**Category**: Error Handling / Robustness

#### Problem
```typescript
// If Zustand store fails to initialize, entire app crashes
export const useKanbanFilterStore = create<KanbanFilterState>((set, get) => ({
  selectedStatus: 'all',
  // ...
}));

// Components assume store is always available
function StatusFilterTabs() {
  const { selectedStatus, setSelectedStatus } = useKanbanFilterStore();
  // ← If store is undefined, component crashes
}
```

#### Scenarios
1. **Corrupted session storage**: Session hydration fails
2. **Module load order issue**: Store not yet created when component renders
3. **Dev environment**: Store creation fails during hot reload
4. **Browser extension**: Injects code that breaks Zustand initialization

#### Current Behavior
- App crashes with cryptic error: "Cannot read property 'selectedStatus' of undefined"
- Entire Kanban board becomes unusable
- No recovery mechanism

#### Expected Behavior
- Show error message to user
- Provide recovery option (reload page)
- Log error for debugging

#### Impact
- 🔴 **Complete feature breakdown** if store fails
- Poor user experience during initialization issues
- Difficult to troubleshoot in production

#### Test Case
```typescript
it('should handle store initialization failure gracefully', () => {
  // Mock store failure
  vi.mocked(useKanbanFilterStore).mockReturnValueOnce(undefined as any);
  
  expect(() => {
    render(<StatusFilterTabs />);
  }).not.toThrow();  // Should not crash
  
  expect(screen.getByText(/Error/i)).toBeInTheDocument();
});
```

#### Fix

**Add Store Initialization Check**
```typescript
function withStoreErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function SafeComponent(props: P) {
    try {
      const store = useKanbanFilterStore.getState();
      if (!store) throw new Error('Filter store not initialized');
      return <Component {...props} />;
    } catch (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 font-semibold">Error loading filters</p>
          <p className="text-sm text-red-600">Please refresh the page</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh
          </button>
        </div>
      );
    }
  };
}

export default withStoreErrorBoundary(StatusFilterTabs);
```

---

### Issue #6: Empty visibleColumns Array Edge Case
**Severity**: 🟡 MEDIUM  
**Component**: `KanbanBoard.tsx` - `visibleColumns.map()`  
**Category**: State Validation / Edge Case

#### Problem
```typescript
const visibleColumns = useMemo(() => {
  return getVisibleColumns();
}, [getVisibleColumns]);

// ...

{visibleColumns.map((status) => (
  <KanbanColumn key={status} status={status} leads={filteredGroupedLeads[status] ?? []} />
))}
```

**What if getVisibleColumns() returns an empty array?**

#### Scenario
1. Store corruption: `ALL_STATUSES` becomes empty (or is reassigned)
2. Invalid state: `selectedStatus` is something unexpected
3. Future bug: Someone refactors and accidentally returns `[]`

```typescript
// Hypothetical bug
getVisibleColumns: () => {
  // Accidentally returns empty array
  return ALL_STATUSES.filter(() => false);  // ← Returns []
};
```

#### Current Behavior
```typescript
// When visibleColumns = []
visibleColumns.map(() => <KanbanColumn />)  // ← Renders 0 columns
// Result: Blank board with no error message
```

#### Expected Behavior
- Show meaningful message ("No statuses configured")
- Log warning
- Fallback to ALL_STATUSES

#### Impact
- Silent rendering of empty board
- User confusion ("Where's my data?")
- No indication of problem
- Difficult to debug

#### Test Case
```typescript
it('should handle empty visibleColumns with fallback', () => {
  // Mock empty visible columns
  const store = useKanbanFilterStore.getState();
  
  // Force empty (this is a safety edge case)
  vi.spyOn(store, 'getVisibleColumns').mockReturnValue([]);
  
  const { container } = render(<KanbanBoard />);
  
  // Should either:
  // 1. Show error message
  // 2. Fallback to all columns
  // 3. Log warning
  
  expect(screen.queryByText(/No statuses|Error/i)).toBeInTheDocument();
});
```

#### Fix

**Add Validation and Fallback**
```typescript
const visibleColumns = useMemo(() => {
  const columns = getVisibleColumns();
  
  if (columns.length === 0) {
    console.warn(
      'No visible columns! This should not happen. Falling back to ALL_STATUSES.',
      { selectedStatus: useKanbanFilterStore.getState().selectedStatus }
    );
    return ALL_STATUSES;
  }
  
  return columns;
}, [getVisibleColumns]);

// Or in render:
{visibleColumns.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-red-600">No statuses configured. Please refresh the page.</p>
  </div>
) : (
  <div className="grid ...">
    {visibleColumns.map(status => (...))}
  </div>
)}
```

---

### Issue #7: selectedStatus Not Cleared on Manual Store State Manipulation
**Severity**: 🟡 MEDIUM  
**Component**: `kanbanFilterStore.ts`  
**Category**: State Consistency / Data Integrity

#### Problem
```typescript
// User can manually reset other filters but not status filter in one call
clearAllFilters: () =>
  set({ 
    searchQuery: '', 
    selectedPriorities: [],
    selectedStatus: 'all'  // ← Currently included
  }),

// But what if someone calls clearSearch() expecting status to persist?
clearSearch: () =>
  set({ searchQuery: '' }),  // ← Only clears search, status remains
```

**Inconsistent behavior in filtering reset:**

```typescript
// AC-4.5: "Clear all filters" button
<button onClick={clearAllFilters}>Clear All</button>  // ← Clears status too

// But if someone implements "Clear Search" only:
<button onClick={clearSearch}>Clear Search</button>  // ← Leaves status filter
```

#### Current Behavior
- `clearAllFilters()` correctly resets status to 'all'
- `clearSearch()` leaves selectedStatus unchanged (correct)
- But no way to clear **just** status filter while keeping search + priority

#### Expected Behavior
- Should have `resetStatusFilter()` for API consistency
- Already implemented: `resetStatusFilter() → set({ selectedStatus: 'all' })`
- Good! (This is actually correct)

#### Issue Details
Actually, reviewing the code more carefully, `resetStatusFilter()` **IS implemented** and should work. However, the issue is:

**The real problem**: If external code (or developer) wants to reset **only** status filter while keeping search/priority, they must call:
```typescript
setSelectedStatus('all')  // Not intuitive
```

Instead of:
```typescript
resetStatusFilter()  // Clearer intent
```

#### Impact
- 🟢 **LOW**: Code clarity issue, not a functional bug
- API could be more discoverable
- Developers might use wrong method and get unexpected behavior

#### Fix

**Improve API Clarity (Documentation)**
```typescript
/**
 * Reset only the status filter to 'all' (show all columns)
 * Search and priority filters remain unchanged
 * 
 * Usage: When user clicks "Show all statuses" button
 * @see setSelectedStatus for setting a specific status
 */
resetStatusFilter: () =>
  set({ selectedStatus: 'all' }),
```

Or add a convenience method:
```typescript
// Method already exists, just ensure it's exported and used consistently
```

---

### Issue #8: Triple Filter Order of Operations Ambiguity
**Severity**: 🟡 MEDIUM  
**Component**: `KanbanBoard.tsx` - `filteredGroupedLeads` useMemo  
**Category**: Logic Clarity / Potential Bug

#### Problem
```typescript
const filteredGroupedLeads = useMemo(() => {
  const visibleColumns = getVisibleColumns();  // ← Order #1: Get visible status columns
  const filtered: Record<string, typeof groupedLeads[keyof typeof groupedLeads]> = {};
  const searchLower = searchQuery.toLowerCase();

  // Initialize filtered object with visible columns only (E4-S3: AC-2.1)
  visibleColumns.forEach((status) => {
    filtered[status] = [];
  });

  // Iterate through all groups, filter by status first
  Object.entries(groupedLeads).forEach(([status, leads]) => {
    // Only process if this status is in visible columns
    if (!visibleColumns.includes(status as any)) {
      return;  // ← Order #2: Skip leads not in visible columns
    }

    filtered[status] = leads.filter((lead: Lead) => {
      // Order #3: Apply search filter
      const matchesSearch = searchQuery === '' || (/* search logic */);

      // Order #4: Apply priority filter
      const matchesPriority = selectedPriorities.length === 0 || (/* priority logic */);

      return matchesSearch && matchesPriority;  // ← AND logic: all must be true
    });
  });

  return filtered;
}, [groupedLeads, searchQuery, selectedPriorities, selectedStatus, getVisibleColumns]);
```

#### Current Behavior - Order of Evaluation
1. Status filter (visibleColumns) ← FIRST
2. Search filter
3. Priority filter

The current order is Status-first, which means:
- If user selects "Nuevo" status
- Then searches for "xyz" (no matches)
- Result: Empty, even if other statuses have "xyz"

#### Question: Is this the desired behavior?

**Example:**
- Backend has: 
  - Nuevo: [Juan (has "xyz")]
  - Propuesta: [Maria (has "xyz")]
- User selects status="Propuesta"
- User searches for "xyz"
- Result: Show Maria (correct, both filters apply)
- BUT what if user switches to "Nuevo" while search="xyz"?
- Result: Show Juan (search remains, status filters to Nuevo, Juan has xyz)

This seems correct (AND logic), but it's worth documenting.

#### Expected Behavior
- Clear documentation of filter precedence
- Current implementation: Status AND Search AND Priority (correct)
- Each filter narrows results: Status column → Search results → Priority results

#### Impact
- 🟢 **LOW**: Current behavior is correct (AND logic)
- Minor: Documentation clarity issue
- Could confuse developers who expect different behavior

#### Test Case
```typescript
it('should apply filters in correct order (status → search → priority)', () => {
  // This test already exists and passes, but document the order
  
  // Status filter reduces columns
  // Search filter reduces leads within those columns
  // Priority filter further reduces leads
  
  // All three are AND: lead must match status AND search AND priority
});
```

#### Fix

**Add Comment/Documentation**
```typescript
/**
 * Filter pipeline (AND logic - all must match):
 * 1. Status filter: Select only leads in visibleColumns (from selectedStatus)
 * 2. Search filter: Within those columns, find leads matching searchQuery
 * 3. Priority filter: Further filter by selectedPriorities
 * 
 * Result: leads that match (status AND search AND priority)
 */
const filteredGroupedLeads = useMemo(() => {
  // ... existing code ...
}, [...deps]);
```

---

### Issue #9: Mobile Responsive — Tab Overflow at 375px Viewport
**Severity**: 🟡 MEDIUM  
**Component**: `StatusFilterTabs.tsx`  
**Category**: Mobile UX / Responsive Design

#### Problem
```typescript
const TABS = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'Nuevo' as const, label: 'Nuevo' },
  { value: 'En contacto' as const, label: 'En contacto' },  // ← 11 chars
  { value: 'Propuesta' as const, label: 'Propuesta' },      // ← 9 chars
  { value: 'Cerrado' as const, label: 'Cerrado' },           // ← 7 chars
];

// Render:
<div className="flex gap-2 pb-4 border-b border-gray-200 overflow-x-auto sticky top-16 bg-white z-10">
  {/* 5 tabs, each with px-4 py-2 = minimum ~70px per tab */}
  {/* Total width needed: 5 × 70px = 350px + gaps = 360px+ */}
  {/* But 375px viewport minus padding (8px × 2) = 359px available */}
  {/* Result: Horizontal scroll needed */}
</div>
```

#### Current Behavior
- ✅ **Correct**: `overflow-x-auto` allows horizontal scrolling
- ✅ **Good**: All tabs are still accessible via scroll
- ⚠️ **Minor UX issue**: Some tabs hidden initially (scroll needed)

#### Metrics
- Tab widths (5 tabs): ~350-380px
- Viewport at 375px: ~359px available (after padding)
- Result: Slight horizontal scroll required

#### Expected Behavior
- All tabs visible without horizontal scroll (ideal)
- OR: Horizontal scroll with clear affordance (current)
- OR: Responsive tab labels (shrink on mobile)

#### Impact
- 🟢 **LOW**: Accessibility OK, usability slightly degraded
- Users must scroll horizontally to see all tabs
- Not a blocker, but could be improved

#### Test Case
```typescript
it('should fit all tabs within 375px viewport without scroll', () => {
  const originalInnerWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  });

  const { container } = render(<StatusFilterTabs />);
  const tabList = container.querySelector('[role="tablist"]') as HTMLElement;
  
  // Calculate if tabs fit
  const scrollWidth = tabList.scrollWidth;
  const clientWidth = tabList.clientWidth;
  
  // ⚠️ CURRENT: scrollWidth > clientWidth (scroll needed)
  // ✅ IDEAL: scrollWidth <= clientWidth
  
  console.log(`Tabs need scroll: ${scrollWidth > clientWidth}`);
  
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: originalInnerWidth,
  });
});
```

#### Fix

**Option A: Responsive Tab Labels**
```typescript
// Shorter labels on mobile
const TABS = [
  { value: 'all', label: 'Todos', shortLabel: 'T' },
  { value: 'Nuevo', label: 'Nuevo', shortLabel: 'N' },
  { value: 'En contacto', label: 'En contacto', shortLabel: 'EC' },
  { value: 'Propuesta', label: 'Propuesta', shortLabel: 'P' },
  { value: 'Cerrado', label: 'Cerrado', shortLabel: 'C' },
];

<button className="px-2 md:px-4 py-2">
  <span className="md:hidden">{tab.shortLabel}</span>
  <span className="hidden md:inline">{tab.label}</span>
</button>
```

**Option B: Reduce Padding on Mobile**
```typescript
<div className="flex gap-1 md:gap-2 pb-4 overflow-x-auto">
  <button className="px-2 md:px-4 py-2 text-xs md:text-sm">
    {tab.label}
  </button>
</div>
```

**Option C: Scrolling Indicator**
```typescript
// Add visual indicator that more tabs are available
<div className="relative">
  <div className="flex gap-2 overflow-x-auto">
    {/* tabs */}
  </div>
  {/* Gradient fade on right edge to show more tabs available */}
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
</div>
```

---

## 🟢 LOW-SEVERITY ISSUES

### Issue #10: Keyboard Navigation — Missing Space Key Support
**Severity**: 🟢 LOW  
**Component**: `StatusFilterTabs.tsx` - `handleKeyPress`  
**Category**: Keyboard Accessibility / Minor

#### Problem
```typescript
const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>, status: LeadStatus | 'all') => {
  if (e.key === 'Enter') {
    setSelectedStatus(status);
  }
  // ← Missing: e.key === ' ' (Space key)
};
```

#### Current Behavior
- ✅ Enter key works: Selects tab
- ❌ Space key doesn't work: Expected to work on buttons

#### Expected Behavior (HTML Standard Button Behavior)
- Enter key: Activate button
- Space key: Activate button
- Both should work

#### Impact
- 🟢 **LOW**: Minor a11y issue
- Users expect Space to work on buttons (standard HTML behavior)
- Not a blocker

#### Test Case
```typescript
it('should select tab when Space key is pressed', () => {
  render(<StatusFilterTabs />);
  
  const nuevoTab = screen.getByRole('tab', { name: /Nuevo/i });
  fireEvent.keyPress(nuevoTab, { key: ' ', code: 'Space', charCode: 32 });
  
  const { selectedStatus } = useKanbanFilterStore.getState();
  expect(selectedStatus).toBe('Nuevo');
});
```

#### Fix
```typescript
const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>, status: LeadStatus | 'all') => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();  // Prevent page scroll on Space
    setSelectedStatus(status);
  }
};
```

---

### Issue #11: No Loading State During Filter Change
**Severity**: 🟢 LOW  
**Component**: `KanbanBoard.tsx` - `filteredGroupedLeads` rendering  
**Category**: UX Polish / User Feedback

#### Problem
```typescript
// When user clicks tab, filtering might take time (if 1000+ leads)
// But there's no visual feedback

const filteredGroupedLeads = useMemo(() => {
  // This computation is synchronous but might be noticeable
  // No skeleton, spinner, or fade transition shown
}, [...]);
```

#### Current Behavior
- Filter computes synchronously
- Results update immediately (appears fast)
- ✅ On slow devices: Noticeable stutter/lag
- No visual feedback of filtering in progress

#### Expected Behavior
- Show brief loading state or transition
- Visual feedback that filtering is happening

#### Impact
- 🟢 **LOW**: Performance is good, but UX could be smoother
- Users might think app is frozen on slow devices
- Better experience with loading state

#### Test Case
```typescript
it('should show loading state during filter change', () => {
  render(<KanbanBoard />);
  
  fireEvent.click(screen.getByTestId('status-tab-Nuevo'));
  
  // Should briefly show loading indicator
  // (if filtering is async or slow)
});
```

#### Fix

**Add Transition/Fade Effect**
```typescript
const [isTransitioning, setIsTransitioning] = useState(false);
const prevStatusRef = useRef(selectedStatus);

useEffect(() => {
  if (selectedStatus !== prevStatusRef.current) {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      prevStatusRef.current = selectedStatus;
      setIsTransitioning(false);
    }, 100);
    return () => clearTimeout(timer);
  }
}, [selectedStatus]);

return (
  <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
    {/* Kanban grid */}
  </div>
);
```

---

### Issue #12: No Undo/Redo for Filter Changes
**Severity**: 🟢 LOW  
**Component**: `StatusFilterTabs.tsx` + `kanbanFilterStore.ts`  
**Category**: UX Feature / Polish

#### Problem
```typescript
// If user accidentally clicks wrong tab, no undo
// They must manually click correct tab again
```

#### Current Behavior
- User clicks "Propuesta" by mistake
- No undo button/shortcut
- Must manually click correct tab

#### Expected Behavior
- Optional: Add Ctrl+Z undo (nice-to-have)
- Or: Back button returns to previous filter state

#### Impact
- 🟢 **LOW**: Minor UX convenience
- Not expected for Kanban board (users expect direct selection)
- Could be added as future polish feature

#### Test Case
```typescript
it('should support undo/redo if implemented', () => {
  // Future enhancement test
});
```

---

### Issue #13: Missing Tab Description for Screen Readers
**Severity**: 🟢 LOW  
**Component**: `StatusFilterTabs.tsx`  
**Category**: Accessibility / a11y Polish

#### Problem
```typescript
<button
  role="tab"
  aria-pressed={isActive}
  aria-label={`Filtrar por ${tab.label}`}
  // ← Missing: aria-description for additional context
>
  {tab.label}
</button>
```

#### Current Behavior
- aria-label exists: ✅ Good
- Tab is announced: ✅ Good
- But no description of what tab does: ⚠️

#### Expected Behavior
- Could add aria-description for extra context

#### Impact
- 🟢 **LOW**: Nice-to-have, not required
- Current implementation is WCAG AA compliant

#### Fix
```typescript
<button
  role="tab"
  aria-pressed={isActive}
  aria-label={`Filtrar por ${tab.label}`}
  aria-description={`Mostrar solo leads en estado ${tab.label}`}
>
  {tab.label}
</button>
```

---

### Issue #14: No Telemetry for Filter Usage
**Severity**: 🟢 LOW  
**Component**: `StatusFilterTabs.tsx` + `SearchFilterHeader.tsx`  
**Category**: Analytics / Future Enhancement

#### Problem
```typescript
const handleTabClick = (status: LeadStatus | 'all') => {
  setSelectedStatus(status);
  // ← No event tracking/logging
};
```

#### Current Behavior
- No analytics data collected
- Can't measure which filters are used most
- Can't track user behavior

#### Expected Behavior
- Optional: Add event tracking for filter usage
- Track: which tabs are clicked, how often, by user

#### Impact
- 🟢 **LOW**: Not required for MVP
- Nice-to-have for future analytics

#### Fix (Future)
```typescript
const handleTabClick = (status: LeadStatus | 'all') => {
  setSelectedStatus(status);
  // Track event (future implementation)
  // analytics.event('filter_status_changed', { status });
};
```

---

## 📊 Summary Table

| ID | Component | Issue | Severity | Status | Impact |
|--|--|--|--|--|--|
| #1 | kanbanFilterStore.ts | Type Mismatch (Propuesta vs Propuesta enviada) | 🔴 CRITICAL | 🔧 Fix Required | Silent filtering failure, blocks feature |
| #2 | kanbanFilterStore.ts | Invalid selectedStatus no validation | 🔴 CRITICAL | 🔧 Fix Required | State corruption, silent 0 results |
| #3 | KanbanBoard.tsx | Race condition on rapid tab clicks | 🟡 MEDIUM | ⚠️ Should Fix | Visual flicker, mixed filter states |
| #4 | StatusFilterTabs.tsx | Arrow key navigation missing | 🟡 MEDIUM | ⚠️ Should Fix | a11y violation, poor keyboard UX |
| #5 | KanbanBoard.tsx | No error boundary for store failure | 🟡 MEDIUM | ⚠️ Should Fix | App crash on init failure |
| #6 | KanbanBoard.tsx | Empty visibleColumns edge case | 🟡 MEDIUM | ⚠️ Should Fix | Silent blank board |
| #7 | kanbanFilterStore.ts | Status filter reset API clarity | 🟡 MEDIUM | 📝 Document | Developer confusion |
| #8 | KanbanBoard.tsx | Triple filter order ambiguity | 🟡 MEDIUM | 📝 Document | Potential confusion |
| #9 | StatusFilterTabs.tsx | Tab overflow at 375px | 🟡 MEDIUM | 💡 Nice-to-have | Mobile UX degradation |
| #10 | StatusFilterTabs.tsx | Space key not supported | 🟢 LOW | 💡 Nice-to-have | Minor a11y issue |
| #11 | KanbanBoard.tsx | No loading state on filter | 🟢 LOW | 💡 Nice-to-have | UX polish |
| #12 | StatusFilterTabs.tsx | No undo/redo | 🟢 LOW | 💡 Nice-to-have | UX convenience |
| #13 | StatusFilterTabs.tsx | Missing tab descriptions | 🟢 LOW | 💡 Nice-to-have | Minor a11y |
| #14 | StatusFilterTabs.tsx | No analytics tracking | 🟢 LOW | 📋 Future | No impact on function |

---

## 🎯 Prioritized Fix List

### BEFORE MERGE (CRITICAL - BLOCKS FEATURE):
1. **Issue #1**: Fix LeadStatus type mismatch (Propuesta vs Propuesta enviada)
   - Estimated effort: 15 minutes
   - Impact: Feature broken without this
   - Tests: Add type consistency test

2. **Issue #2**: Add validation to getVisibleColumns()
   - Estimated effort: 10 minutes
   - Impact: Prevents silent failures from corrupted state
   - Tests: Add invalid status handling test

### BEFORE V1 (MEDIUM - GOOD TO FIX):
3. **Issue #3**: Debounce rapid tab clicks or add loading state
   - Estimated effort: 20 minutes
   - Impact: Better UX during rapid filtering

4. **Issue #4**: Implement arrow key navigation (WAI-ARIA tabs)
   - Estimated effort: 30 minutes
   - Impact: Proper a11y compliance

5. **Issue #5**: Add error boundary for store failures
   - Estimated effort: 15 minutes
   - Impact: Better error handling

### NICE-TO-HAVE (LOW - POST-V1):
6. **Issue #6**: Empty visibleColumns fallback
7. **Issue #7**: Document status filter reset API
8. **Issue #8**: Document triple filter order
9. **Issue #9**: Optimize mobile tab layout
10. **Issue #10**: Add Space key support
11. **Issue #11**: Add loading state during filter
12. **Issue #12**: Implement undo/redo
13. **Issue #13**: Add aria-description
14. **Issue #14**: Add analytics tracking

---

## Risk Assessment

### High Risk 🔴
- **Issue #1**: Type mismatch causes silent data filtering failures
- **Issue #2**: Invalid state leads to empty board with no error

### Medium Risk 🟡
- **Issues #3-9**: UX degradation, accessibility issues, edge cases

### Low Risk 🟢
- **Issues #10-14**: Polish and convenience features

### Overall Feature Status
- ✅ **Functional**: Feature works for normal use cases
- ⚠️ **Production-Ready**: With reservations (2 critical issues must be fixed)
- 🟡 **Recommended Action**: Fix Issues #1-2 before merge, schedule Issues #3-9 for v1

---

## Conclusion

E4-S3 (Status Filter) is **feature-complete and tested** but has **2 critical issues** that silently break filtering functionality:

1. **Type Mismatch**: Store uses 'Propuesta' but backend uses 'Propuesta enviada'
2. **No Validation**: Invalid status values not validated, causing silent failures

**Recommendation**: 
- 🟢 **Fix Issues #1-2 before merge** (30 minutes total)
- 🟡 **Schedule Issues #3-9 for v1 sprint** (2-3 hours total)
- 🟢 **Issues #10-14 are post-v1 enhancements** (polish features)

Once Issues #1-2 are resolved, this feature is **production-ready**.
