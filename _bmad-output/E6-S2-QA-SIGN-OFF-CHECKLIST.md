# E6-S2 QA Sign-Off Checklist
**Story:** E6-S2: Animaciones, Transiciones y Feedback Visual  
**QA Review Date:** [TBD]  
**QA Engineer:** [TBD]  
**Status:** PENDING  

---

## 📋 FUNCTIONAL TESTING

### Loading State (AC-1)
- [ ] Dashboard loading spinner displays when fetching leads
- [ ] Spinner animation smooth and continuous (no jumps)
- [ ] Loading text "Cargando pipeline de ventas..." visible below spinner
- [ ] Full screen layout maintained (min-h-screen)
- [ ] Page not blank during load

### Error State (AC-2)
- [ ] Red banner appears when API returns 5xx error
- [ ] Error message displayed below "Error cargando pipeline"
- [ ] Retry button visible and clickable
- [ ] Retry button color and styling per design
- [ ] Banner dismissible (if auto-close enabled)

### Retry Functionality (AC-3) ✨ **CRITICAL PATCH**
- [ ] Clicking retry button re-fetches data
- [ ] Page does NOT reload (URL unchanged)
- [ ] App state preserved after retry (no modal close, no route change)
- [ ] Retry works on slow network (test with throttled connection)
- [ ] Success/error state properly handled after retry

### Empty State Display (AC-4)
- [ ] "No hay leads aún" appears when Kanban has no leads
- [ ] Empty state icon displays correctly
- [ ] Optional CTA button "Crear primer lead" visible (if implemented)
- [ ] Message changes when filters applied (e.g., search results)
- [ ] Empty state styling matches design

### Search No Results (AC-5)
- [ ] Search with no matching leads shows "No hay leads que coincidan con '[query]'"
- [ ] Message format matches design
- [ ] Search clears/resets properly

### Create Lead Form (AC-6)
- [ ] Form submit button shows loading state while processing
- [ ] Button disabled during submit
- [ ] Button text/icon indicates loading

### Success Toast (AC-7)
- [ ] Green success toast appears after lead created
- [ ] Toast message: "Lead creado exitosamente"
- [ ] Toast appears for ~3 seconds then auto-closes
- [ ] Modal closes after success
- [ ] Kanban board refreshes with new lead

### Error Toast (AC-8)
- [ ] Red error toast appears when form submit fails
- [ ] Error message extracted from API response
- [ ] Toast stays visible for ~5 seconds
- [ ] User can dismiss toast manually
- [ ] Modal remains open for error retry

### Skeleton Loader (AC-9)
- [ ] Skeleton placeholders display while data loading (if used)
- [ ] Skeleton grid matches final content layout
- [ ] Skeleton animation smooth and continuous
- [ ] Skeletons disappear when content loads

### Toast Positioning (AC-10)
- [ ] All toasts appear in bottom-right corner
- [ ] Toasts don't overlap with other UI elements
- [ ] Toasts visible on all screen sizes
- [ ] Toasts respect viewport boundaries

---

## 🎨 ANIMATION & TRANSITION TESTING

### Loading Spinner Animation
- [ ] Spin animation 1s per rotation (consistent timing)
- [ ] No jank or frame drops during animation
- [ ] Animation stops when loading completes
- [ ] Smooth 200ms fade-in when spinner appears

### LeadCard Transitions
- [ ] Card transitions smooth 200ms on hover
- [ ] Action buttons fade in smoothly (duration-200)
- [ ] No flashing or flickering
- [ ] Drag animation smooth (if dragging enabled)

### Modal/Toast Animations
- [ ] Success toast fades in smoothly
- [ ] Error banner slides in/out smoothly
- [ ] Modal animations consistent with existing modals
- [ ] No animation delays between related elements

### Animation Timing Consistency
- [ ] All animations use 200ms duration (standardized)
- [ ] No animations exceed 300ms for perceived performance
- [ ] Parallel animations don't cause jank

---

## ♿ ACCESSIBILITY TESTING

### Screen Reader Support
- [ ] Loading spinner announced as "Loading pipeline..."
- [ ] Error message announced immediately (role="alert")
- [ ] Success toast announced ("Lead created successfully")
- [ ] Form labels properly associated with inputs
- [ ] Button purposes clear from label text

### Keyboard Navigation
- [ ] Retry button accessible via Tab key
- [ ] Retry button activatable with Enter/Space
- [ ] Toast dismiss button accessible via keyboard
- [ ] Modal form fields navigable with Tab
- [ ] No keyboard traps

### Color Contrast
- [ ] Red error banner text readable (WCAG AA minimum)
- [ ] Green success toast text readable
- [ ] All text meets WCAG AA contrast ratios
- [ ] Color not sole indicator (icons/text also used)

### Reduced Motion Support
- [ ] prefers-reduced-motion respected
- [ ] Spinner does NOT spin when reduced motion enabled
- [ ] Animations disabled or minimal when preference set
- [ ] Functionality preserved without animations

### Focus Management
- [ ] Focus visible on all interactive elements
- [ ] Focus indicators high contrast
- [ ] Tab order logical
- [ ] Focus trap in modals works correctly

---

## 📱 RESPONSIVE DESIGN TESTING

### Mobile (320px - 640px)
- [ ] Loading spinner centered on small screens
- [ ] Error banner readable on mobile
- [ ] Toast positioning doesn't cover critical content
- [ ] All buttons tappable (minimum 44x44px)
- [ ] Text readable without zoom

### Tablet (641px - 1024px)
- [ ] Layout adapts properly to tablet size
- [ ] Kanban columns stack or scroll appropriately
- [ ] Animations performant on tablet devices

### Desktop (1025px+)
- [ ] Full layout visible without scroll
- [ ] Animations smooth at high refresh rates
- [ ] No performance degradation with many leads

---

## 🔧 BROWSER COMPATIBILITY

### Chrome/Chromium
- [ ] All animations smooth
- [ ] Error handling works
- [ ] Accessibility features work
- [ ] No console errors

### Firefox
- [ ] All animations smooth
- [ ] Error handling works
- [ ] Accessibility features work
- [ ] No console errors

### Safari
- [ ] Animations render correctly
- [ ] Color rendering consistent
- [ ] Touch interactions work on iPad
- [ ] No performance issues

### Edge
- [ ] All features work
- [ ] Animations smooth
- [ ] No visual glitches

---

## ⚡ PERFORMANCE TESTING

### Loading Performance
- [ ] Spinner appears within 100ms of load start
- [ ] Full page load < 3 seconds (on good connection)
- [ ] No layout shift when spinner replaces content
- [ ] No visible jank during animation

### Animation Performance
- [ ] 60 FPS animation (DevTools Performance tab)
- [ ] No frame drops on slow devices
- [ ] GPU acceleration detected (transform/opacity)
- [ ] CPU usage minimal during animations

### Network Throttling (QA Environment)
- [ ] Retry works on slow 3G connection
- [ ] Spinner displays correctly on throttled load
- [ ] Error handling works without timeout issues
- [ ] Toast messages visible long enough to read

---

## 🔴 ERROR SCENARIOS

### API Errors
- [ ] 500 Internal Server Error handled (red banner, message, retry)
- [ ] 503 Service Unavailable handled
- [ ] 400 Bad Request handled (form validation)
- [ ] Network timeout handled (connection lost)
- [ ] CORS error handled gracefully

### Edge Cases
- [ ] Very long error messages truncated/wrapped properly
- [ ] Special characters in error messages rendered correctly
- [ ] Multiple errors don't stack toasts excessively
- [ ] Retry on already-loading request handled
- [ ] Rapid retry clicks don't spam API

---

## 📊 TEST RESULTS SUMMARY

| Category | Tests | Pass | Fail | Notes |
|----------|-------|------|------|-------|
| Functional | 20 | — | — | |
| Animations | 10 | — | — | |
| Accessibility | 15 | — | — | |
| Responsive | 10 | — | — | |
| Browser | 12 | — | — | |
| Performance | 8 | — | — | |
| Error Scenarios | 8 | — | — | |
| **TOTAL** | **83** | — | — | |

---

## ✅ SIGN-OFF

### QA Engineer Approval
- **Name:** [TBD]
- **Date:** [TBD]
- **Status:** ⏳ PENDING
- **Comments:** [TBD]

### Ready for Production?
- [ ] All functional tests passing
- [ ] No critical accessibility issues
- [ ] Performance acceptable
- [ ] All browsers tested
- [ ] Edge cases handled
- **APPROVED FOR MERGE:** ⏳ PENDING

---

## 📝 NOTES FOR QA

### Priority Items
1. **AC-3 Retry Logic** - Verify retry doesn't reload page (verify URL stays same in browser)
2. **Error Message Extraction** - Test with various API error responses (see backend error_response format)
3. **Animation Performance** - Check DevTools Performance tab for 60 FPS on all animations
4. **Mobile Responsiveness** - Test on actual iOS/Android devices if possible

### Known Deferred Items
1. Animation composition conflict (`animate-in fade-in duration-200`) - Monitor for frame drops
2. Large lead list animation performance - Test with 50+ leads in Kanban

### Testing Environment
- **Backend URL:** [TBD]
- **Test Data:** Use existing leads from previous sprints or create test leads
- **Throttling:** Test with Chrome DevTools slow 3G for retry logic
- **Accessibility:** Use NVDA (Windows) or VoiceOver (Mac) for screen reader testing

---

## 📞 ESCALATION

If critical issues found:
1. Document issue with steps to reproduce
2. Screenshot/video of issue
3. Browser/OS information
4. Contact dev team immediately
5. Flag for hotfix if blocking merge
