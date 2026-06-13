---
title: "Enhanced Code Review Checklist"
created: "2026-06-12"
epic_context: "Learnings from Epic 4 (E4-S3 React Query bug, E4-S2 structure issue)"
applies_to: "All stories starting with E5"
version: "1.0"
---

# ✅ Enhanced Code Review Checklist — Epic 4 Learnings

> **Why Updated:** E4-S3 discovered a critical React Query data structure mismatch that broke drag&drop. E4-S2 revealed story structure gaps. This checklist formalizes validation to catch issues BEFORE they reach production.

---

## 📋 CODE REVIEW PHASES

### Phase 0: Pre-Review (Before Code Arrives)
- [ ] Story file follows STORY_TEMPLATE.md structure (100%)
- [ ] Acceptance criteria clear and testable
- [ ] Dependencies documented and satisfied
- [ ] Tech lead approved story before dev started

**Why:** E4-S2 had incomplete story structure mid-epic. Catch this now.

---

### Phase 1: Structure & Clarity Review

#### Frontend Code
- [ ] Component organization logical (one component, one file)
- [ ] Imports organized (React, 3rd party, local)
- [ ] TypeScript interfaces defined at file top
- [ ] JSX properly formatted (closing tags, props)
- [ ] No console.log() left in production code (debug logs only)

#### Backend Code
- [ ] Imports organized (stdlib, 3rd party, local)
- [ ] Function docstrings present (especially for routers)
- [ ] Type hints complete (Pydantic models, function returns)
- [ ] No print() statements (use logging)

#### General
- [ ] Files follow project naming conventions
- [ ] No duplicate code (DRY principle)
- [ ] Comments explain WHY, not WHAT
- [ ] No magic numbers (use constants)

---

### Phase 2: React Query Pattern Validation ⭐ NEW (E4-S3 LESSON)

**CRITICAL:** Check every mutation and query integration

#### Query Data Structure
- [ ] **MUST:** Verify query cache structure (array vs wrapped object)
  ```typescript
  // What does API return?
  // Return: [lead1, lead2] → array
  // Return: { data: [...] } → wrapped
  // DECISION MADE: Use direct array (consistency)
  ```
- [ ] Query cache documented at top of hook
- [ ] setQueryData includes defensive structure check
  ```typescript
  // ✅ REQUIRED PATTERN
  if (!Array.isArray(old)) return old;
  return old.map(...);
  ```

#### Optimistic Updates
- [ ] onMutate cancels in-flight queries (`cancelQueries`)
- [ ] onMutate snapshots old data for rollback
- [ ] onMutate returns context with `previousData`
- [ ] setQueryData validates data structure (see above)
- [ ] **onSuccess includes invalidateQueries** ⚠️ (E4-S3 BUG: this was missing)
- [ ] onError includes rollback logic
- [ ] Error messages helpful for debugging

#### Mutation Testing
- [ ] Happy path: Data updates + success toast
- [ ] Error path: Rollback + error toast
- [ ] Race condition: Multiple rapid mutations handled
- [ ] Network timeout: Handled gracefully
- [ ] Retry logic: Exponential backoff (if applicable)

**Checklist Item:**
```typescript
// CODE REVIEW VALIDATION
const mutation = useMutation({
  mutationFn: ...,
  onMutate: (data) => {
    await queryClient.cancelQueries(...);          // ✅ Check
    const previous = queryClient.getQueryData(...); // ✅ Check
    queryClient.setQueryData(..., (old) => {
      if (!Array.isArray(old)) return old;        // ✅ CHECK THIS
      return old.map(...);                        // ✅ Check
    });
    return { previous };                          // ✅ Check
  },
  onSuccess: () => {
    queryClient.invalidateQueries(...);           // ✅ CHECK THIS (was missing in E4-S3)
    toast.success(...);
  },
  onError: (_, __, context) => {
    if (context?.previous) {                      // ✅ Check
      queryClient.setQueryData(..., context.previous);
    }
    toast.error(...);
  }
});
```

---

### Phase 3: React 18 + Library Compatibility ⭐ NEW (E4-S3 LESSON)

#### StrictMode Compatibility
- [ ] **React.StrictMode NOT wrapping app** (breaks react-beautiful-dnd)
- [ ] If using drag-drop library, check compatibility
- [ ] Document any StrictMode disables with reason

#### Component Lifecycle
- [ ] useEffect cleanup functions present (no memory leaks)
- [ ] Event listeners cleaned up
- [ ] Timers cleaned up
- [ ] No state updates after unmount

#### External Library Integration
- [ ] Library version compatible with React 18
- [ ] Any known issues documented in code comments
- [ ] Workarounds explained (e.g., StrictMode disable reason)

---

### Phase 4: State Management & Data Flow

#### Zustand Store Patterns (if used)
- [ ] Store actions are pure functions
- [ ] No API calls in store (only in hooks/mutations)
- [ ] Store state minimal (not duplicating API data)
- [ ] Store tested independently

#### React Query Integration
- [ ] Query keys consistent (follow naming: ['domain', 'action'])
- [ ] Stale time configured appropriately
- [ ] Cache invalidation strategy documented

#### Prop Drilling Prevention
- [ ] No more than 3 levels of prop passing
- [ ] Consider Zustand for cross-component state
- [ ] Context API used sparingly

---

### Phase 5: Error Handling & Edge Cases ⭐ EMPHASIS (E4-S2 STRONG MODEL)

#### Error Classification (E4-S2 Pattern)
- [ ] Errors classified: NETWORK, TIMEOUT, SERVER, CLIENT, UNKNOWN
- [ ] Error messages user-friendly (no stack traces)
- [ ] Network errors indicate "retry" option
- [ ] Server errors logged with request details

#### Edge Cases
- [ ] Empty state handled (no data)
- [ ] Loading state handled (fetching data)
- [ ] Error state handled (failed request)
- [ ] Null/undefined values guarded
- [ ] Boundary conditions tested (0, 1, max)

#### Input Validation
- [ ] Frontend: Zod/validation schema present
- [ ] Backend: Pydantic validation present
- [ ] Async validation (email, username uniqueness) handled
- [ ] SQL injection prevention (parameterized queries)

---

### Phase 6: Performance & Optimization

#### Frontend Performance
- [ ] No inline arrow functions in JSX (memoization)
- [ ] useMemo/useCallback used if >5 renders
- [ ] Images optimized (size < 100KB)
- [ ] Bundle size check (run `npm run build`)
- [ ] No unnecessary re-renders
- [ ] Debouncing on expensive operations (e.g., search)

#### Backend Performance
- [ ] Database queries optimized (use EXPLAIN if available)
- [ ] N+1 queries prevented (use JOINs)
- [ ] Indexes present for filtered columns
- [ ] Pagination implemented for large results
- [ ] Caching strategy documented (Redis/in-memory)

#### Monitoring
- [ ] Performance metrics logged (API response time)
- [ ] Slow queries identified and fixed
- [ ] Client-side errors tracked (Sentry/monitoring)

---

### Phase 7: Testing & Coverage

#### Unit Tests
- [ ] Tests exist for business logic
- [ ] Happy path tested
- [ ] Error paths tested
- [ ] Edge cases tested
- [ ] Test coverage >70%
- [ ] Tests have descriptive names
- [ ] Mocks used appropriately

#### Integration Tests
- [ ] Component integration verified
- [ ] State management integration tested
- [ ] API contract verified

#### E2E Tests ⭐ NEW (E4-S3 LESSON)
- [ ] User journeys automated (Playwright)
- [ ] Critical paths covered
- [ ] Cross-browser tested (Chrome, Firefox)
- [ ] Mobile viewport tested
- [ ] E2E tests pass consistently (no flakes)

**Why E2E Critical:** E4-S3 drag-drop bug only caught via E2E testing. Unit tests passed.

---

### Phase 8: Accessibility & Usability

#### Accessibility (WCAG AA)
- [ ] ARIA labels present (for screen readers)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Color not sole indicator (e.g., red text for errors)
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] Form labels associated with inputs

#### Usability
- [ ] Loading states clear
- [ ] Success/error feedback visible
- [ ] Disabled states distinct
- [ ] Touch targets >44px (mobile)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode support (if applicable)

---

### Phase 9: Security & Compliance

#### Security
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF tokens if needed
- [ ] Authentication/authorization checked
- [ ] Secrets not in code (use environment variables)
- [ ] Sensitive data encrypted

#### Compliance
- [ ] GDPR considerations (if EU users)
- [ ] Data retention policy documented
- [ ] Audit trail for changes (if required)

---

### Phase 10: Documentation & Maintainability

#### Code Documentation
- [ ] Complex logic has comments
- [ ] Functions have docstrings
- [ ] API contracts documented
- [ ] Database schema documented
- [ ] Architecture decisions recorded

#### Git & PR
- [ ] Commit messages semantic (type: description)
- [ ] PR description clear
- [ ] No merge conflicts
- [ ] Related issues linked

---

## 🎯 QUICK CHECKLIST (For Busy Reviewers)

### MUST-CHECK (Non-negotiable)
- [ ] **React Query:** Data structure validated + invalidateQueries present
- [ ] **Error Handling:** Happy + unhappy paths covered
- [ ] **Tests:** Unit + integration + E2E passing
- [ ] **TypeScript:** 0 errors
- [ ] **Build:** `npm run build` successful
- [ ] **Story Structure:** Follows STORY_TEMPLATE.md

### SHOULD-CHECK (High priority)
- [ ] Performance: No N+1 queries, debouncing on search
- [ ] Accessibility: ARIA labels, keyboard nav
- [ ] Security: No SQL injection, secrets in env vars

### NICE-TO-CHECK (If time permits)
- [ ] Code organization
- [ ] Comment quality
- [ ] Naming conventions

---

## 🚨 RED FLAGS (AUTOMATIC REJECTION)

If reviewer sees these, request changes BEFORE approval:

### Code Quality Red Flags
- ❌ TypeScript errors present (0 allowed)
- ❌ Build fails (`npm run build` error)
- ❌ Tests failing (100% pass required)
- ❌ Console.log() left in production code
- ❌ Secrets in code (API keys, tokens)

### React Query Red Flags (E4-S3 LESSON)
- ❌ setQueryData WITHOUT structure validation
- ❌ onSuccess WITHOUT invalidateQueries
- ❌ onError WITHOUT rollback logic
- ❌ onMutate WITHOUT cancelQueries

### E4-S2 Red Flags (Story Structure)
- ❌ Story file incomplete or non-standard
- ❌ Acceptance criteria unclear
- ❌ Dependencies not satisfied

### Architecture Red Flags
- ❌ More than 5 levels of prop drilling
- ❌ State management scattered (no single source of truth)
- ❌ Complex logic in components (extract to hooks)
- ❌ No error handling

---

## 📊 REVIEW SEVERITY LEVELS

### DECISION-NEEDED (Must resolve before merge)
- Architectural concerns
- Security issues
- API contract mismatches
- React Query pattern violations

### PATCH (Should fix before merge)
- Performance issues
- Missing error paths
- Test coverage gaps
- Accessibility issues

### DEFER (Nice-to-have, future improvement)
- Code organization refactoring
- Minor optimization
- Documentation improvements

### DISMISS (Reviewer noise, ignore)
- Style preferences (use linters instead)
- Opinions on variable names
- "I would do it differently"

---

## 🎓 TRAINING FOR REVIEWERS

### E4-S3 Case Study: React Query Bug

**What We Learned:**
```typescript
// BROKEN (E4-S3 initial)
queryClient.setQueryData(['leads'], (old) => ({
  ...old,
  data: old.data.map(lead => ...) // ❌ Assumes {data: array}
}));

// FIXED
queryClient.setQueryData(['leads'], (old: any) => {
  if (!Array.isArray(old)) return old; // ✅ Validates structure
  return old.map(lead => ...);
});
```

**Code Review Lesson:** This should be caught in review, not discovered in testing.

### Review Questions to Ask
1. What's the shape of the query data? (Array? Wrapped object?)
2. Is setQueryData validating structure? (See defensive check)
3. Does onSuccess include invalidateQueries? (Refetch to sync)
4. Does onError include rollback? (Restore old data)
5. What happens on network timeout? (Retry logic?)

---

## 📝 REVIEW COMMENT TEMPLATE

When reviewer finds React Query issue:

```
🔴 DECISION NEEDED: React Query Pattern

Issue: `setQueryData` assumes `{data: array}` structure
Impact: If query cache is actually direct array, will break optimistic updates
Fix: Add structure validation

Before:
```typescript
queryClient.setQueryData(['leads'], (old) => ({
  ...old,
  data: old.data.map(...) // ❌
}));
```

After:
```typescript
queryClient.setQueryData(['leads'], (old: any) => {
  if (!Array.isArray(old)) return old; // ✅
  return old.map(...);
});
```

Reference: docs/REACT_QUERY_PATTERNS.md
```

---

## ✅ WHEN TO APPROVE

Story is ready to merge when:

- ✅ All MUST-CHECK items verified
- ✅ No RED FLAGS present
- ✅ At least 1 reviewer approved
- ✅ Tech lead sign-off (for >8pt stories)
- ✅ CI/CD all green
- ✅ Manual testing passed (desktop + mobile)

---

## 🎯 FOR EPIC 5 TEAM

**Before E5-S1 Development Starts:**
1. Review and discuss this checklist
2. Training on E4-S3 React Query lesson
3. Reference REACT_QUERY_PATTERNS.md in code review
4. Designate primary reviewer for E5 stories
5. Team agrees on severity levels (DECISION vs PATCH vs DEFER)

---

**Checklist Status:** Ready for E5  
**Last Updated:** 2026-06-12  
**Version:** 1.0  

**Distribution:** Share with all Epic 5 reviewers before day 1 of development
