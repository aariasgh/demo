# Redux Provider Test Fix - Charlie + Elena Task
**Epic:** 3 (Retrospective Action Item)  
**Assigned to:** Charlie (Senior Dev) + Elena (Junior Dev)  
**Duration:** 1.5 hours  
**Priority:** 🔴 BLOCKING for Epic 4  
**Created:** 2026-06-10T23:15:00Z  
**Status:** IN PROGRESS  

---

## 📋 TASK SUMMARY

Fix Redux Provider setup in component tests to resolve 8 pre-existing test failures:
- KanbanColumn.test.tsx: 7 failures (Redux Provider missing)
- LeadCard.test.tsx: 1 failure (Redux Provider + aria-label mismatch)

**Target:** 27/27 tests passing (KanbanBoard 7 + KanbanColumn 7 + LeadCard 13)

---

## 🎯 STEP-BY-STEP INSTRUCTIONS

### **PHASE 1: Create Redux Provider Test Wrapper** (30 min - Charlie)

**Location:** `frontend/src/utils/test-utils.tsx` (CREATE NEW FILE)

**What to do:**
1. Create a test wrapper component that provides Redux store
2. Wrap test components with Redux Provider + store

**Code template:**
```typescript
// frontend/src/utils/test-utils.tsx

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Import your actual reducers
// Example: import rootReducer from '../store/rootSlice';

// Create a test store factory
export function createTestStore(preloadedState?: PreloadedState<any>) {
  return configureStore({
    reducer: {
      // Add your actual reducers here
      // Example: root: rootReducer,
    },
    preloadedState,
  });
}

// Test wrapper component
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<any>;
  store?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), store };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders };
```

**Verification:**
- [ ] File exists at `frontend/src/utils/test-utils.tsx`
- [ ] No TypeScript errors when running: `npm run test -- src/utils/test-utils.tsx`

---

### **PHASE 2: Update KanbanColumn.test.tsx** (30 min - Elena)

**Location:** `frontend/src/components/KanbanColumn.test.tsx`

**What to change:**
1. Replace `import { render }` with `import { renderWithProviders }`
2. Replace `render(...)` calls with `renderWithProviders(...)`

**Before:**
```typescript
import { render, screen } from '@testing-library/react';

test('renders column header', () => {
  render(<KanbanColumn status="Nuevo" leads={[]} />);
  expect(screen.getByText('Nuevo')).toBeInTheDocument();
});
```

**After:**
```typescript
import { renderWithProviders, screen } from '../../utils/test-utils';

test('renders column header', () => {
  renderWithProviders(<KanbanColumn status="Nuevo" leads={[]} />);
  expect(screen.getByText('Nuevo')).toBeInTheDocument();
});
```

**Apply to ALL tests in file (7 tests total):**
- Test 1: Column rendering
- Test 2: Status color
- Test 3: Empty state
- Test 4: Leads display
- Test 5: Counter badge
- Test 6: Accessibility
- Test 7: Responsive grid

**Verification:**
- [ ] Run: `npm run test -- src/components/KanbanColumn.test.tsx`
- [ ] All 7 tests should now PASS (no Redux errors)

---

### **PHASE 3: Update LeadCard.test.tsx** (30 min - Elena)

**Location:** `frontend/src/components/LeadCard.test.tsx`

**What to change:**
1. Replace `import { render }` with `import { renderWithProviders }`
2. Replace `render(...)` calls with `renderWithProviders(...)`
3. **UPDATE aria-label expectation** (AC-12 enhancement from E3-S3)

**Before (OLD aria-label):**
```typescript
test('aria-label includes state and instructions', () => {
  render(<LeadCard lead={mockLead} />);
  expect(screen.getByRole('article')).toHaveAttribute(
    'aria-label',
    'Lead: John Doe' // OLD
  );
});
```

**After (NEW aria-label with state + instructions):**
```typescript
import { renderWithProviders, screen } from '../../utils/test-utils';

test('aria-label includes state and instructions', () => {
  renderWithProviders(<LeadCard lead={mockLead} />);
  expect(screen.getByRole('article')).toHaveAttribute(
    'aria-label',
    'Lead: John Doe de Acme Corp. Estado: Nuevo. Arrastra para cambiar estado.' // NEW
  );
});
```

**Apply to ALL tests (13 tests total):**
- Test 1-4: Rendering, display, hover
- Test 5-8: Long-press gesture, touch
- Test 9-13: Accessibility (including aria-label update)

**Key aria-label change:**
```
OLD: "Lead: {name}"
NEW: "Lead: {name} de {company}. Estado: {status}. Arrastra para cambiar estado."
```

**Verification:**
- [ ] Run: `npm run test -- src/components/LeadCard.test.tsx`
- [ ] All 13 tests should now PASS
- [ ] aria-label test reflects new value with state + instructions

---

### **PHASE 4: Verify KanbanBoard Tests Still Pass** (15 min - Charlie)

**Location:** `frontend/src/components/KanbanBoard.test.tsx`

**What to do:**
- Just run tests, should still pass (KanbanBoard already uses Redux Provider)
- No changes needed to this file

**Verification:**
- [ ] Run: `npm run test -- src/components/KanbanBoard.test.tsx`
- [ ] All 7 tests PASS (no regressions)

---

### **PHASE 5: Run Full Test Suite** (15 min - Charlie)

**Command:**
```powershell
cd c:\SDD\Demo\frontend
npm run test 2>&1 | Select-Object -First 100
```

**Expected output:**
```
PASS  src/components/KanbanBoard.test.tsx (duration)
PASS  src/components/KanbanColumn.test.tsx (duration)
PASS  src/components/LeadCard.test.tsx (duration)

Test Suites: 3 passed, 3 total
Tests:       27 passed, 27 total
```

**What to check:**
- ✅ KanbanBoard: 7/7 PASS
- ✅ KanbanColumn: 7/7 PASS
- ✅ LeadCard: 13/13 PASS
- ✅ NO "Could not find store" errors
- ✅ NO Redux Provider errors

---

### **PHASE 6: Commit Changes** (10 min - Charlie)

**Commit message:**
```
fix: Redux Provider setup in component tests

- Add renderWithProviders test utility in frontend/src/utils/test-utils.tsx
- Update KanbanColumn.test.tsx to use Redux wrapper (7 tests now passing)
- Update LeadCard.test.tsx to use Redux wrapper + update aria-label expectation to match AC-12 (13 tests now passing)
- Verify KanbanBoard tests still pass (7/7)

Result: 27/27 tests passing (was 19/27 with 8 failures)

Fixes blocking issue for Epic 4 development
```

**Run:**
```powershell
cd c:\SDD\Demo\frontend
git add src/utils/test-utils.tsx src/components/KanbanColumn.test.tsx src/components/LeadCard.test.tsx
git commit -m "fix: Redux Provider setup in component tests - 27/27 tests passing"
git push
```

**Verification:**
- [ ] Commit appears in git log
- [ ] No uncommitted changes: `git status` shows clean

---

## 🎯 SUCCESS CRITERIA

### Before
```
Tests: 19/27 PASSING
Failures:
  - KanbanColumn.test.tsx: 7 failures (Redux error)
  - LeadCard.test.tsx: 1 failure (Redux error)
```

### After (Target)
```
Tests: 27/27 PASSING ✅
Failures: 0
Errors: 0
```

---

## 📊 TIMELINE

| Phase | Task | Owner | Duration | Time |
|-------|------|-------|----------|------|
| **1** | Create test-utils.tsx | Charlie | 30 min | 0:00-0:30 |
| **2** | Update KanbanColumn.test | Elena | 30 min | 0:30-1:00 |
| **3** | Update LeadCard.test | Elena | 30 min | 1:00-1:30 |
| **4** | Verify KanbanBoard | Charlie | 15 min | 1:30-1:45 |
| **5** | Full test run | Charlie | 15 min | 1:45-2:00 |
| **6** | Commit | Charlie | 10 min | 2:00-2:10 |

**Total: ~2 hours (estimated 1.5h, includes buffer)**

---

## ⚠️ COMMON PITFALLS

### ❌ DON'T:
- Don't forget to update BOTH KanbanColumn AND LeadCard
- Don't forget aria-label change in LeadCard test (new value includes state + instructions)
- Don't commit without running full test suite
- Don't use `render()` directly - must use `renderWithProviders()`

### ✅ DO:
- Verify each file after changes with `npm run test -- src/path/to/file.test.tsx`
- Run full suite before committing
- Update aria-label expectation to match LeadCard.tsx component implementation
- Ask if any test fails - don't move forward

---

## 📞 SUPPORT

**If you get stuck:**
1. Check error message carefully (usually tells you what's wrong)
2. Verify renderWithProviders is imported correctly
3. Verify store is passed to component
4. Check aria-label value matches exactly (punctuation, state name, etc.)

**Questions?** Ask {user_name} or debug with:
```powershell
npm run test -- src/components/KanbanColumn.test.tsx --verbose
npm run test -- src/components/LeadCard.test.tsx --verbose
```

---

**Status:** 🟢 READY TO START  
**Blocking:** 🔴 Epic 4 cannot start until tests pass  
**Success:** 27/27 tests passing  

Go! 🚀
