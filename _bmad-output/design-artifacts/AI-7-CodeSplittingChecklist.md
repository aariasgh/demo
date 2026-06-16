---
title: "Code-Splitting Checklist"
author: "Charlie (Senior Dev)"
date: 2026-06-15
category: "Development Checklist"
status: "DOCUMENTED"
owner_team: ["Frontend", "Performance"]
epic_origin: "E6-S5"
---

# AI-7: Code-Splitting Checklist

## Overview

Reusable checklist for implementing code-splitting in React applications. Based on E6-S5 (Code Splitting) implementation that achieved 60% bundle reduction (437 kB → 173 kB).

**Key Metrics from E6-S5:**
- Bundle reduction: 60% (437 kB → 173 kB)
- Lighthouse score: 94/100
- FCP: 2.3s
- LCP: 2.6s
- TTI: 2.6s

---

## Pre-Implementation Checklist

### Analysis Phase
```yaml
analysis:
  - [ ] Profile current bundle size (webpack-bundle-analyzer)
  - [ ] Identify largest modules (>50 KB)
  - [ ] Map module dependencies
  - [ ] Identify lazy-loadable components (modals, popovers, heavy features)
  - [ ] Estimate code split opportunities (target: 3-5 chunks)
  - [ ] Check browser compatibility (all modern browsers support lazy)

target_metrics:
  main_bundle_size: "< 200 kB (gzip)"
  chunk_size: "< 100 kB (gzip) each"
  initial_page_load: "< 3s"
  time_to_interactive: "< 3s"
```

### Architecture Decision
```yaml
decisions:
  - [ ] Identify components to lazy-load
  - [ ] Identify shared dependencies (vendor chunks)
  - [ ] Decide chunking strategy:
      - Option A: By component (CreateLeadModal, QuickNotesModal, etc.)
      - Option B: By feature (lead-management, notifications, etc.)
      - Option C: By dependency (react-query, forms, dnd, etc.)
  - [ ] Decide Suspense fallback UI (LoadingSpinner, Skeleton, etc.)
  - [ ] Plan error boundary strategy (LazyBoundary component)
  - [ ] Document strategy in ADR (Architecture Decision Record)
```

---

## Implementation Checklist

### Step 1: Identify Components for Lazy Loading

```typescript
// CHECKLIST: Identify candidates
// - [ ] Modal components (user rarely needs all at once)
// - [ ] Feature-specific components (advanced features, infrequently used)
// - [ ] Heavy visualizations (charts, complex tables)
// - [ ] Exclude: Critical path components, above-the-fold, immediate UI

// Example from E6-S5:
// Lazy loaded:
//   ✅ CreateLeadModal (opened on demand, ~25 KB)
//   ✅ QuickNotesModal (opened on demand, ~18 KB)
//   ✅ QuickStatusModal (opened on demand, ~15 KB)
//   ✅ RiskWidgetContainer (conditional render, ~22 KB)
//
// NOT lazy loaded:
//   ❌ KanbanBoard (critical path)
//   ❌ LeadCard (high frequency)
//   ❌ Navigation (always visible)
```

### Step 2: Implement Lazy Loading

```typescript
// CHECKLIST: React.lazy() implementation

import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './components/LoadingSpinner';

// [ ] Use React.lazy() for each component
const CreateLeadModal = lazy(() => import('./components/CreateLeadModal'));
const QuickNotesModal = lazy(() => import('./components/QuickNotesModal'));
const RiskWidgetContainer = lazy(() => import('./containers/RiskWidgetContainer'));

// [ ] Add webpackChunkName comments for readable bundle
const CreateLeadModal = lazy(() =>
  import(/* webpackChunkName: "lead-modal" */ './components/CreateLeadModal')
);

// [ ] Verify imports are in separate files (not default export barrel)
// ✅ GOOD: import('./components/CreateLeadModal')
// ❌ BAD: import('./components/index') where index.ts re-exports all
```

### Step 3: Create Suspense Boundaries

```typescript
// CHECKLIST: Suspense setup

// [ ] Create LazyBoundary wrapper component
function LazyBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}

// [ ] Add error boundary (catch lazy load failures)
class LazyErrorBoundary extends React.Component<Props, State> {
  // Error handling for failed lazy load
}

// [ ] Use in render
<LazyBoundary>
  <CreateLeadModal isOpen={isOpen} onClose={onClose} />
</LazyBoundary>

// [ ] Test loading state appears
// [ ] Test error state when lazy load fails
// [ ] Verify spinner shows briefly on first load
```

### Step 4: Configure Build Tool (Vite)

```typescript
// CHECKLIST: Vite configuration

// vite.config.ts
export default defineConfig({
  build: {
    // [ ] Enable rollupOptions for manual chunking
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - isolate heavy dependencies
          'vendor-dnd': ['react-beautiful-dnd', 'react-dnd'],  // Drag & drop libs
          'vendor-forms': ['react-hook-form', 'zod'],           // Form libs
          'vendor-query': ['react-query'],                      // Data fetching
          'vendor-focus-trap': ['focus-trap-react'],            // Focus management (or custom)
          
          // Feature chunks - by domain
          'lead-features': [
            './src/components/CreateLeadModal',
            './src/components/EditLeadModal',
          ],
          'analytics': [
            './src/pages/Analytics',
            './src/components/Charts',
          ],
        },
      },
    },
    
    // [ ] Set target chunk size limit
    chunkSizeWarningLimit: 100, // Warn if chunk > 100 KB
    
    // [ ] Enable source maps for debugging
    sourcemap: true,
  },
});
```

### Step 5: Test Code Splits

```typescript
// CHECKLIST: Verification tests

test('Code splitting works', async () => {
  // [ ] Main bundle is small
  const mainBundle = await getMainBundleSize();
  expect(mainBundle).toBeLessThan(200 * 1024); // 200 KB

  // [ ] Lazy chunks exist
  const chunks = await getBundleChunks();
  expect(chunks.length).toBeGreaterThan(1);

  // [ ] Each chunk is reasonable size
  chunks.forEach(chunk => {
    expect(chunk.size).toBeLessThan(100 * 1024); // 100 KB max
  });

  // [ ] Lazy component loads on demand
  const CreateLeadModal = lazy(() => import('./CreateLeadModal'));
  const { findByRole } = render(
    <Suspense fallback={<div>Loading...</div>}>
      <CreateLeadModal isOpen={true} onClose={() => {}} />
    </Suspense>
  );
  
  // [ ] Spinner shows first
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // [ ] Component loads
  const modal = await findByRole('dialog');
  expect(modal).toBeInTheDocument();
});

// [ ] Performance test: measure FCP, LCP, TTI
// [ ] Network test: simulate slow 3G, verify lazy still loads
// [ ] Error test: fail lazy load, verify error boundary catches
```

---

## Post-Implementation Checklist

### Performance Verification

```yaml
performance:
  - [ ] Run `pnpm run build` and verify no warnings
  - [ ] Check bundle size report (should show chunks)
  - [ ] Run Lighthouse: Performance score >= 90
  - [ ] Measure First Contentful Paint (FCP) < 3s
  - [ ] Measure Largest Contentful Paint (LCP) < 3s
  - [ ] Measure Time to Interactive (TTI) < 3s
  - [ ] Test on slow network (3G throttling)
  - [ ] Test on low-end device (slow CPU)

acceptance_criteria:
  main_bundle: "< 200 kB (gzip)"
  largest_chunk: "< 100 kB (gzip)"
  load_time: "< 3s on 4G"
  lighthouse: ">= 90"
```

### Documentation

```yaml
documentation:
  - [ ] ADR created: why code-splitting strategy chosen
  - [ ] List of lazy-loaded components documented
  - [ ] Chunk map documented (which modules go in which chunks)
  - [ ] Error handling documented (what happens if lazy load fails)
  - [ ] Performance baseline captured (metrics from E6-S5)
  - [ ] README updated with code-splitting explanation
```

### Team Awareness

```yaml
team_communication:
  - [ ] Standup: explain code-splitting rationale
  - [ ] Code review: point out where lazy loading applies
  - [ ] Future stories: "Consider lazy-loading for new heavy components"
  - [ ] Onboarding: new devs understand chunking strategy
```

---

## Common Patterns from E6-S5

### Pattern 1: Modal Code-Splitting

```typescript
// PATTERN: Lazy-load modals that users don't always need

// Define lazy modals
const CreateLeadModal = lazy(() =>
  import(/* webpackChunkName: "lead-modal" */ './modals/CreateLeadModal')
);
const QuickNotesModal = lazy(() =>
  import(/* webpackChunkName: "notes-modal" */ './modals/QuickNotesModal')
);

// Render with Suspense + error boundary
<LazyBoundary>
  {showCreateModal && <CreateLeadModal isOpen={true} onClose={handleClose} />}
  {showNotesModal && <QuickNotesModal isOpen={true} onClose={handleClose} />}
</LazyBoundary>
```

**Result from E6-S5:** Saved ~15 KB in main bundle by deferring modal code.

### Pattern 2: Feature-Based Chunking

```typescript
// PATTERN: Group related features into one chunk

const manualChunks = {
  'lead-management': [
    './src/components/CreateLeadModal',
    './src/components/EditLeadModal',
    './src/components/LeadDetail',
    './src/hooks/useLeads',
  ],
  'risk-analysis': [
    './src/components/RiskWidgetContainer',
    './src/components/RiskMatrix',
    './src/utils/riskCalculations',
  ],
};
```

**Benefit:** Cohesive features stay together, preventing dependency splitting.

### Pattern 3: Vendor Chunking

```typescript
// PATTERN: Isolate heavy third-party libs

const manualChunks = {
  'vendor-dnd': ['react-beautiful-dnd'],
  'vendor-forms': ['react-hook-form'],
  'vendor-query': ['@tanstack/react-query'],
};
```

**Benefit from E6-S5:** 
- react-query chunk: 12 KB (only load if feature using queries is accessed)
- dnd chunk: 8 KB (only load if drag-drop is needed)
- Total saved: ~20 KB in main bundle

---

## Metrics from E6-S5

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Main Bundle | 437 kB | 173 kB | -60% ✅ |
| Chunks Count | 1 | 5 | Better distribution |
| Lighthouse | 85/100 | 94/100 | +9 points |
| FCP | 3.2s | 2.3s | -900ms |
| LCP | 3.4s | 2.6s | -800ms |
| TTI | 3.5s | 2.6s | -900ms |

---

## Troubleshooting

### Issue: Chunk too large (>100 KB)

```yaml
solutions:
  - [ ] Check for duplicate dependencies (npm dedup)
  - [ ] Move heavy dependency to separate chunk
  - [ ] Consider lazy-loading deeper in component tree
  - [ ] Check for circular dependencies (webpack analyzer)
```

### Issue: Lazy load fails in production

```yaml
solutions:
  - [ ] Verify lazy chunk files exist in build output
  - [ ] Check error boundary logs for failure reason
  - [ ] Test with `npm run build && npm run preview`
  - [ ] Check CDN/static file serving configuration
```

### Issue: Flash of loading spinner

```yaml
solutions:
  - [ ] Increase Suspense timeout (defer component)
  - [ ] Pre-fetch chunk on hover (link prefetch)
  - [ ] Use skeleton screens instead of spinner
  - [ ] Measure: if <300ms, spinner may not be necessary
```

---

## Reuse in E7 & Beyond

E7 will likely need:
- [ ] Further micro-optimizations (bundlebuddy analysis)
- [ ] Route-based code-splitting (Suspense + React Router)
- [ ] Prefetching strategy (preload likely chunks)
- [ ] Service worker caching (offline chunk loading)

This checklist applies to all E7+ code-splitting work.

---

## Quick Reference

```bash
# Analyze bundle
npm run build
npm run bundle-analyzer

# Check chunk sizes
webpack-bundle-analyzer dist/stats.json

# Profile in DevTools
# 1. Chrome DevTools → Performance tab
# 2. Record page load
# 3. Check "Parse" and "Compile" times
```

---

**Status:** ✅ CHECKLIST DOCUMENTED  
**Last Updated:** 2026-06-15  
**Owner:** Charlie (Senior Dev)  
**Applicable To:** E7-S1 (Frontend Bundle Optimization), Future UI-heavy features  
**Estimated Effort per Story:** 4-6 hours
