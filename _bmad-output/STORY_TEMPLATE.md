---
template_version: "1.0"
epic: "EPIC_NUMBER"
title: "Story Title - Clear, Action-Oriented"
story_id: "ES-N"
points: 0
priority: "P0|P1|P2"
---

# 📖 STORY TEMPLATE — Estructura Estándar para Todas las Historias

> **VERSION:** 1.0 | **Created:** 2026-06-12  
> **Basis:** Learnings from E4-S1, E4-S2, E4-S3, and E4-S2 mid-epic improvements

---

## 1️⃣ CONTEXTO Y OBJETIVO

### Problema (Why)
**What business problem does this story solve?**
- Clear, concise statement of the problem
- Who experiences this problem?
- What's the impact if unsolved?

### Objetivo (What)
**What are we building?**
- Feature description in user-centric terms
- What will users be able to do?
- Success definition

### Conexión con Epic
**How does this story fit into the broader epic?**
- Epic goal reference
- Dependencies on previous stories
- Stories that depend on this one
- Blocking relationships

---

## 2️⃣ ESPECIFICACIÓN TÉCNICA

### Scope Definido
**What's IN scope for this story?**
- Clear boundaries
- What will be delivered?
- Frontend/Backend/Both?
- Database changes? (Yes/No)

**What's OUT of scope? (Explicitly call out)**
- Common temptations to avoid
- Related features that are separate stories
- Nice-to-haves deferred to future

### Dependencias
- **Backend Dependencies:** List any backend services/endpoints required
- **Frontend Dependencies:** List any components, hooks, or state management
- **Database Dependencies:** New migrations? Schema changes?
- **Third-party Libraries:** Any new packages to install?

### Blocking/Unblocking
- **Blocked by:** List stories that must complete first
- **Blocks:** List stories waiting for this one
- **Notes:** Any critical path items?

---

## 3️⃣ CRITERIOS DE ACEPTACIÓN

### Formato: Gherkin BDD

```gherkin
Feature: [Feature Title]
  Scenario: [Scenario 1]
    Given [Context]
    When [Action]
    Then [Expected Result]
  
  Scenario: [Scenario 2]
    Given [Context]
    When [Action]
    Then [Expected Result]
```

### AC Checklist
- [ ] AC-1: [Description]
- [ ] AC-2: [Description]
- [ ] AC-3: [Description]
- [ ] ... (20+ acceptance criteria is typical for 8pt stories)

### Quality Gates
- [ ] TypeScript: 0 errors (strict mode enforced)
- [ ] Tests: X/X passing (unit + integration)
- [ ] Code Review: Approved (3-layer review if >5pt)
- [ ] Build: Clean production build
- [ ] Manual Testing: Verified on desktop + mobile

---

## 4️⃣ IMPLEMENTACIÓN PREVISTA

### Architecture & Patterns

#### Frontend (if applicable)
**Key Components/Hooks:**
- Component names and responsibilities
- State management approach (Zustand? React Query? Local state?)
- Patterns to reuse from previous stories
- New patterns to introduce

**Data Flow:**
- How does user action trigger state changes?
- Optimistic updates? Cache invalidation?
- Error handling strategy

#### Backend (if applicable)
**Key Endpoints:**
- New routes? Modifications to existing?
- Request/Response contracts
- Validation rules
- Error codes

**Database:**
- New tables? Migrations?
- Indexes? Constraints?
- Query optimization notes?

**Business Logic:**
- Algorithms or business rules?
- Idempotency requirements?
- Transaction safety?

### Patrones a Reutilizar
**From Previous Stories:**
- E4-S1: Zustand filter store + React Query integration pattern
- E4-S2: Error classification + retry logic pattern
- E4-S3: Optimistic updates with error rollback (if applicable)
- [List other patterns to leverage]

### Patrones Nuevos a Introducir
- If creating new patterns, document them explicitly
- Why is a new pattern necessary vs. reusing existing?
- How will we validate the pattern?

---

## 5️⃣ HISTORIAS DE USUARIO / CASOS DE USO

### User Journey
```
User arrives at [page/feature]
  ↓
User sees [initial state]
  ↓
User takes action [action]
  ↓
System responds with [response]
  ↓
User sees [final state]
```

### Casos de Éxito
- **Happy Path:** User succeeds on first try
- **Unhappy Path 1:** [Error condition] → [Recovery]
- **Unhappy Path 2:** [Edge case] → [Handling]
- **Unhappy Path N:** [Timeout/Network/Server] → [Retry/Fallback]

---

## 6️⃣ NOTAS TÉCNICAS & GUARDRAILS

### Critical Guardrails (DO NOT VIOLATE)
1. **Data Structure Consistency:** [Example: Query cache must be array, not {data: array}]
2. **React 18 Compatibility:** StrictMode causes issues with [library]? Use [workaround]
3. **Error Handling:** [Specific patterns required]
4. **Performance:** [Specific thresholds or optimization targets]
5. **Accessibility:** [WCAG requirements]
6. **Security:** [Validation, auth, data protection requirements]

### Known Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|-----------|
| [Risk description] | [Impact if occurs] | [How to prevent] |

### Testing Strategy
**Unit Tests:**
- Component/function unit tests
- Test count target: X tests
- Coverage target: Y%

**Integration Tests:**
- Component integration with parent
- Data flow validation

**E2E Tests (NEW for Epic 5):**
- User journey scenarios
- Cross-component interaction validation
- Critical path scenarios

### Code Review Focus Areas
**High Priority:**
- [Specific patterns to validate]
- [Common mistakes in this domain]
- [Integration risks]

**Quality Checklist:**
- [ ] React Query patterns correct (data structure validated)
- [ ] Error handling implemented (happy + unhappy paths)
- [ ] Accessibility checked (ARIA, keyboard nav)
- [ ] Performance validated (load time, render optimization)
- [ ] Tests passing (unit + integration + E2E)

---

## 7️⃣ FASE DE DESARROLLO (Phases)

### Phase 1: Setup & Structure
**Duration:** X hours
**Deliverables:**
- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Skeleton components/files
- [ ] Build passing (0 TypeScript errors)

**Verification:**
- [ ] Code commits with clear messages
- [ ] Build: `npm run build` passing
- [ ] No console errors

### Phase 2: Core Implementation
**Duration:** Y hours
**Deliverables:**
- [ ] Main logic implemented
- [ ] Happy path scenarios working
- [ ] Initial tests passing (unit tests)

**Verification:**
- [ ] All AC happy paths satisfied
- [ ] Tests: X/X passing
- [ ] TypeScript: 0 errors

### Phase 3: Error Handling & Polish
**Duration:** Z hours
**Deliverables:**
- [ ] Error paths handled (unhappy paths)
- [ ] Retry logic implemented (if needed)
- [ ] UX polish (animations, transitions, feedback)

**Verification:**
- [ ] All AC satisfied
- [ ] Tests: X/X passing
- [ ] Manual testing: desktop + mobile working
- [ ] Code review ready

### Phase 4: Code Review & Fixes (if applicable)
**Duration:** Review time
**Process:**
- [ ] Three-layer review (if >5pt story)
- [ ] Patches applied
- [ ] Final build verification
- [ ] Approved for merge

---

## 8️⃣ TIMELINE & ESTIMACIÓN

### Estimación de Esfuerzo
- **Planning/Refinement:** X hours
- **Development:** Y hours
- **Testing:** Z hours
- **Code Review:** W hours
- **Total Estimate:** X+Y+Z+W = N points

### Calendario
- **Start Date:** TBD (after dependencies met)
- **Phase 1 Completion:** TBD
- **Phase 2 Completion:** TBD
- **Phase 3 Completion:** TBD
- **Code Review Start:** TBD
- **Merge Target:** TBD

### Dependencias Críticas
- What must be done BEFORE this story starts?
- Are those dependencies on track?
- Any blockers?

---

## 9️⃣ TESTING & QUALITY STRATEGY

### Test Plan
| Test Type | Scope | Tool | Target | Status |
|-----------|-------|------|--------|--------|
| Unit Tests | Components/Functions | Vitest | X/X passing | ⏳ |
| Integration Tests | Component + Store | Vitest | X/X passing | ⏳ |
| E2E Tests (NEW) | User journeys | Playwright | X/X passing | ⏳ |
| Manual Testing | Desktop + Mobile | Browser | All AC verified | ⏳ |
| Code Review | Full implementation | GitHub | Approved | ⏳ |

### Quality Metrics
- **Build:** 0 TypeScript errors
- **Tests:** 100% of acceptance criteria covered
- **Coverage:** X% code coverage (target: 70%+)
- **Performance:** [Specific metrics, e.g., <2s load time]
- **Accessibility:** WCAG AA compliance

---

## 🔟 ENTREGA Y MERGE

### Pre-Merge Checklist
- [ ] All AC satisfied (verified manually)
- [ ] All tests passing (unit + integration + E2E)
- [ ] TypeScript: 0 errors
- [ ] Build: `npm run build` successful
- [ ] Code review: Approved (all patches applied)
- [ ] No console warnings or errors
- [ ] Docker deployment verified (if full-stack)
- [ ] Manual testing on multiple devices

### Merge Process
1. Code review approval from tech lead
2. All CI/CD checks passing
3. Merge to main branch
4. Deploy to staging (if applicable)
5. Verify in production

### Post-Merge Validation
- [ ] Feature working in production
- [ ] No regressions in existing features
- [ ] Performance metrics acceptable
- [ ] Monitoring/alerts functional

---

## 1️⃣1️⃣ REFERENCIAS & CONTEXTO

### Related Stories
- Previous story (dependency): [E-S-N]
- Follow-up stories (blocked by this): [E-S-N]
- Related but independent: [E-S-N]

### Documentation References
- API Contract: [Link to endpoint specs]
- Database Schema: [Link to migrations]
- Design System: [Link to component library]
- Pattern Guide: [E.g., FILTER_PATTERNS.md, REACT_QUERY_PATTERNS.md]

### Key Files
```
Frontend:
  src/components/[NewComponent].tsx
  src/hooks/[NewHook].ts
  src/store/[NewStore].ts
  src/[folder]/[NewComponent].test.tsx

Backend:
  app/routers/[new_router].py
  app/schemas/[new_schema].py
  app/models/[new_model].py
  tests/test_[feature].py

Database:
  alembic/versions/[migration].py
  
Documentation:
  docs/[FEATURE_DOCS].md
```

---

## 1️⃣2️⃣ NOTAS FINALES

### Lecciones Aplicadas (From Epic 4)
- E4-S1: Pattern reusability accelerates development
- E4-S2: Comprehensive code review improves quality
- E4-S3: React Query data structure must be validated
- **E4-S2 Specific:** Story structure must be complete from day 1 (no mid-epic fixes)

### Cambios vs. Epics Anteriores
- ✅ Story structure standardized (prevents E4-S2-type issues)
- ✅ E2E testing framework in place (prevents E4-S3-type bugs)
- ✅ React Query pattern guide available (prevents data structure mismatches)
- ✅ Code review checklist enhanced (catches integration issues earlier)

### Success Definition
This story is **COMPLETE** when:
1. ✅ All acceptance criteria satisfied
2. ✅ All tests passing (unit + integration + E2E)
3. ✅ Code review approved
4. ✅ Manual testing verified on desktop + mobile
5. ✅ Zero TypeScript errors
6. ✅ Clean production build
7. ✅ Merged to main and deployed
8. ✅ No regressions in production

---

## 📋 CHECKLIST PARA STORY CREATOR

Before marking story as "ready for dev":
- [ ] All sections above completed
- [ ] Dependencies verified (predecessor stories complete?)
- [ ] Acceptance criteria clear and testable
- [ ] Architecture decision documented
- [ ] Testing strategy defined
- [ ] Estimated effort reasonable
- [ ] No scope creep detected
- [ ] Tech lead review passed
- [ ] Story file follows this template exactly

---

**Template Status:** Ready for use in Epic 5  
**Last Updated:** 2026-06-12  
**Version:** 1.0  

**Next:** Use this template for E5-S1 and E5-S2 story creation
