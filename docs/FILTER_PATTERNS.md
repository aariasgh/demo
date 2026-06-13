---
title: "Filter Patterns — Zustand + React Query"
created: "2026-06-12"
epic_context: "Proven pattern from E4-S1, successfully reused in E4-S2 and E4-S3"
version: "1.0"
---

# 🎯 Filter Patterns — Zustand + React Query Synergy

> **Why This Guide:** E4-S1 established a powerful filter pattern (search + priority filtering). E4-S2 and E4-S3 successfully reused it, proving the pattern. This guide formalizes it for E5 and future features.

---

## 📊 THE PATTERN (At a Glance)

### Architecture
```
User Input (SearchFilterHeader)
    ↓
Zustand Store (kanbanFilterStore)
    ↓
Filtered State (useLeads + client-side filtering)
    ↓
UI Renders Filtered Data (KanbanBoard)
```

### Key Principles
1. **Zustand** holds filter state (not UI component local state)
2. **React Query** fetches ALL data from backend
3. **Client-side filtering** applies Zustand filters to React Query data
4. **Debouncing** on search input (prevent overload)
5. **Computed filtering** (not premature backend filtering)

---

## 🏗️ COMPONENT 1: ZUSTAND FILTER STORE

### Purpose
Centralized filter state that persists across component remounts and can be accessed from anywhere.

### Implementation Pattern

```typescript
// src/store/kanbanFilterStore.ts
import { create } from 'zustand';

interface KanbanFilterState {
  // Filter values
  searchQuery: string;
  selectedPriorities: string[]; // ['HIGH', 'MEDIUM'] or []
  selectedStatus: string[]; // ['Nuevo', 'En contacto'] or []
  
  // Actions
  setSearchQuery: (query: string) => void;
  togglePriority: (priority: string) => void;
  setPriorities: (priorities: string[]) => void;
  toggleStatus: (status: string) => void;
  setStatus: (status: string[]) => void;
  resetFilters: () => void;
}

export const useKanbanFilterStore = create<KanbanFilterState>((set) => ({
  // Initial state
  searchQuery: '',
  selectedPriorities: [],
  selectedStatus: [],
  
  // Actions
  setSearchQuery: (query) => set({ searchQuery: query.trim() }),
  
  togglePriority: (priority) =>
    set((state) => ({
      selectedPriorities: state.selectedPriorities.includes(priority)
        ? state.selectedPriorities.filter((p) => p !== priority)
        : [...state.selectedPriorities, priority],
    })),
  
  setPriorities: (priorities) =>
    set({ selectedPriorities: priorities }),
  
  toggleStatus: (status) =>
    set((state) => ({
      selectedStatus: state.selectedStatus.includes(status)
        ? state.selectedStatus.filter((s) => s !== status)
        : [...state.selectedStatus, status],
    })),
  
  setStatus: (status) =>
    set({ selectedStatus: status }),
  
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedPriorities: [],
      selectedStatus: [],
    }),
}));
```

### Store Benefits
✅ Single source of truth for filter state  
✅ No prop drilling  
✅ Survives component remounts  
✅ Easy to add new filters (add field + action)  
✅ Testable (pure functions in actions)

---

## 🎣 COMPONENT 2: REACT QUERY DATA FETCHING

### Purpose
Fetch full dataset, then apply filters on the client.

### Implementation Pattern

```typescript
// src/hooks/useLeads.ts
import { useQuery } from '@tanstack/react-query';

export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      return response.json(); // Returns: Lead[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
```

### Why Fetch ALL Data?
- **Consistency:** All leads in one request
- **Simplicity:** No complex backend filtering logic
- **Performance:** Client filtering is instant (cached data)
- **Offline Support:** Works even if network changes
- **Pagination:** Not needed for MVP (all leads fit in memory)

---

## ⚙️ COMPONENT 3: FILTERING LOGIC

### Purpose
Apply Zustand filters to React Query data in real-time.

### Implementation Pattern

```typescript
// src/hooks/useFilteredLeads.ts
import { useLeads } from './useLeads';
import { useKanbanFilterStore } from '../store/kanbanFilterStore';

export const useFilteredLeads = () => {
  const { data: leads = [] } = useLeads();
  const { searchQuery, selectedPriorities, selectedStatus } =
    useKanbanFilterStore();

  // Compute filtered leads
  const filteredLeads = leads.filter((lead) => {
    // Filter 1: Search (name, email, company)
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filter 2: Priority (if any selected)
    if (selectedPriorities.length > 0) {
      if (!selectedPriorities.includes(lead.priority)) return false;
    }

    // Filter 3: Status (if any selected)
    if (selectedStatus.length > 0) {
      if (!selectedStatus.includes(lead.status)) return false;
    }

    return true;
  });

  return {
    leads: filteredLeads,
    totalCount: leads.length,
    filteredCount: filteredLeads.length,
  };
};
```

### Filtering Benefits
✅ Instant feedback (no network delay)  
✅ Combines multiple filters seamlessly  
✅ No backend dependency for filter changes  
✅ Works offline (with cached data)  
✅ Easy to test (pure function)

---

## 🖥️ COMPONENT 4: UI INTEGRATION

### SearchFilterHeader Component

```typescript
// src/components/SearchFilterHeader.tsx
import { useKanbanFilterStore } from '../store/kanbanFilterStore';
import { debounce } from 'lodash';
import { useMemo } from 'react';

export const SearchFilterHeader = () => {
  const { searchQuery, setSearchQuery, selectedPriorities, togglePriority } =
    useKanbanFilterStore();

  // Debounce search input (300ms delay)
  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  return (
    <header className="sticky top-0 bg-white shadow z-10 p-4">
      <div className="flex gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by name, email, company..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
        />

        {/* Priority Filter Dropdown */}
        <PriorityFilter
          selected={selectedPriorities}
          onToggle={togglePriority}
        />
      </div>
    </header>
  );
};
```

### UI Benefits
✅ Responsive to filter changes  
✅ Debounced search prevents lag  
✅ Multi-select priority filter  
✅ Connected to global Zustand state

---

## 🔄 DATA FLOW DIAGRAM

```
User Types "acme" in search
          ↓
setSearchQuery("acme") called on Zustand store
          ↓
useFilteredLeads() hook recalculates filtered array
          ↓
searchQuery.includes("acme") filter applied
          ↓
KanbanBoard re-renders with 3 matching leads
          ↓
User sees updated results instantly
```

---

## ✅ IMPLEMENTATION CHECKLIST

When applying this pattern in a new feature:

- [ ] **Step 1:** Create Zustand store with filter state + actions
- [ ] **Step 2:** Create useFilteredData hook (wraps useQuery + filtering logic)
- [ ] **Step 3:** Create UI components (search input, filter dropdowns)
- [ ] **Step 4:** Connect UI to Zustand store
- [ ] **Step 5:** Test filters (search, multi-select, combinations)
- [ ] **Step 6:** Add debouncing to expensive operations
- [ ] **Step 7:** Document filter combinations for QA
- [ ] **Step 8:** Verify performance (should be instant)

---

## 📋 PERFORMANCE CONSIDERATIONS

### Debouncing
```typescript
// Debounce expensive operations
const debouncedSearch = useMemo(
  () => debounce((query: string) => setSearchQuery(query), 300),
  []
);

// Every 300ms: filter recalculates, UI updates
```

**Why 300ms?**
- User typing: 60-100 WPM ≈ 1 character per 100ms
- 300ms debounce: Groups 2-3 characters together
- Result: Smooth filtering without lag

### Memoization (if needed)
```typescript
// If filtering logic is complex, memoize
const filteredLeads = useMemo(
  () => expensiveFilter(leads, filters),
  [leads, filters]
);
```

**When NOT to memoize:**
- Filtering logic is simple (like our example)
- Data size is small (<1000 items)
- Filter changes less frequently

---

## 🧪 TESTING PATTERN

### Test Structure

```typescript
// src/hooks/__tests__/useFilteredLeads.test.ts
describe('useFilteredLeads', () => {
  const mockLeads = [
    { id: 1, name: 'Acme Corp', priority: 'HIGH', status: 'Nuevo' },
    { id: 2, name: 'Tech Startup', priority: 'MEDIUM', status: 'En contacto' },
    { id: 3, name: 'Enterprise', priority: 'LOW', status: 'Nuevo' },
  ];

  it('filters by search query', () => {
    // Setup: Mock useLeads and useKanbanFilterStore
    useLeads.mockReturnValue({ data: mockLeads });
    useKanbanFilterStore.mockReturnValue({
      searchQuery: 'acme',
      selectedPriorities: [],
      selectedStatus: [],
    });

    // Execute
    const { result } = renderHook(() => useFilteredLeads());

    // Assert
    expect(result.current.leads).toEqual([mockLeads[0]]);
    expect(result.current.filteredCount).toBe(1);
  });

  it('filters by priority', () => {
    // Setup
    useLeads.mockReturnValue({ data: mockLeads });
    useKanbanFilterStore.mockReturnValue({
      searchQuery: '',
      selectedPriorities: ['HIGH'],
      selectedStatus: [],
    });

    // Execute & Assert
    const { result } = renderHook(() => useFilteredLeads());
    expect(result.current.leads.length).toBe(1);
    expect(result.current.leads[0].priority).toBe('HIGH');
  });

  it('combines multiple filters', () => {
    // Multiple filters: search + priority + status
    useLeads.mockReturnValue({ data: mockLeads });
    useKanbanFilterStore.mockReturnValue({
      searchQuery: 'acme',
      selectedPriorities: ['HIGH'],
      selectedStatus: ['Nuevo'],
    });

    const { result } = renderHook(() => useFilteredLeads());
    expect(result.current.leads.length).toBe(1);
  });
});
```

---

## 🎯 PATTERN APPLICATION: E5 (TIMELINE)

### Potential Timeline Filters

```typescript
// E5: Timeline feature might need similar pattern
interface TimelineFilterState {
  dateRange: [Date, Date];
  eventTypes: string[]; // ['LEAD_CREATED', 'STATUS_CHANGED', 'NOTE_ADDED']
  searchQuery: string;
  
  setDateRange: (range: [Date, Date]) => void;
  toggleEventType: (type: string) => void;
  setSearchQuery: (query: string) => void;
}

// Then: useFilteredTimelineEvents hook combines:
// 1. Zustand filter state (dateRange, eventTypes, search)
// 2. React Query data (all timeline events)
// 3. Client-side filtering (instant results)
```

---

## ⚠️ ANTI-PATTERNS TO AVOID

### ❌ Anti-Pattern 1: Filter State in Local Component State
```typescript
// WRONG: Filter state in component
const [search, setSearch] = useState('');

// Loses state on remount
// Can't be accessed from sibling components
// Prop drilling nightmare
```

### ✅ Correct Approach
```typescript
// Use Zustand instead
const { searchQuery, setSearchQuery } = useKanbanFilterStore();
```

### ❌ Anti-Pattern 2: Backend Filtering Instead of Client-Side
```typescript
// WRONG: Different filter combos require new backend calls
fetchLeads({ search: 'acme', priority: 'HIGH' })
fetchLeads({ search: 'acme', priority: 'MEDIUM' })
// etc.

// Slow, wasteful, not scalable
```

### ✅ Correct Approach
```typescript
// Fetch ALL data once, filter on client
fetchLeads() // Get all 500 leads
// Then apply any combination of filters instantly
```

### ❌ Anti-Pattern 3: No Debouncing on Search
```typescript
// WRONG: Re-filter on every keystroke
const handleSearchChange = (e) => {
  setSearchQuery(e.target.value); // Triggers filter immediately
};

// Thousands of filter recalculations per second
```

### ✅ Correct Approach
```typescript
// Debounce expensive operations
const debouncedSearch = useMemo(
  () => debounce((query) => setSearchQuery(query), 300),
  []
);
```

---

## 📈 SCALABILITY & FUTURE IMPROVEMENTS

### Current Approach (MVP)
- Client-side filtering on 1-2K records
- Instant response
- No pagination needed

### When to Reconsider
- **Data size >10K leads:** Consider pagination + virtual scrolling
- **Complex filters:** Consider specialized search backends (Elasticsearch)
- **Real-time updates:** Consider WebSocket subscription instead of polling

### Backward Compatibility
If we scale to backend filtering later:
- Keep Zustand store structure same
- Change useFilteredLeads hook to POST backend filter
- UI components unchanged
- Migration transparent to rest of app

---

## ✅ VALIDATION FOR E5

Before E5-S1 starts:

- [ ] This pattern documented (✓ Done)
- [ ] Team trained on Zustand + React Query integration
- [ ] Example implementation available (E4-S1 in codebase)
- [ ] Testing patterns established
- [ ] Performance benchmarks set (aim: <50ms filter)
- [ ] Debounce time decided (300ms default)

---

**Pattern Status:** Production-Ready (Proven in E4-S1, E4-S2, E4-S3)  
**Last Updated:** 2026-06-12  
**Version:** 1.0  

**Next Step:** Reference this guide when planning E5 filtering features
