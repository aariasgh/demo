# Epic 5: TIMELINE Y AUDITORÍA — Plan de Sprint Detallado

**Proyecto:** Mini CRM de Seguimiento de Clientes  
**Epic:** E5 (Timeline & Auditoría)  
**Fecha:** 2026-06-12  
**Estado del Proyecto:** Epics 1-4 completados (100% = 144 pts). Epic 5: Ready to plan  
**Preparado por:** BMAD Sprint Planning  

---

## 📋 Resumen Ejecutivo

Epic 5 introduce dos características críticas para trazabilidad y auditoría:
- **E5-S1 (8 pts):** Timeline de Actividad por Lead — historial completo de eventos (notas, llamadas, emails, cambios de estado)
- **E5-S2 (5 pts):** Auditoría Backend — registro inmutable de todas las modificaciones para compliance

**Recomendación:** Ejecutar **E5-S1 primero** (ya tiene especificación E2E completa + roadmap de 5 fases), luego **E5-S2** como continuación.

**Duración Total Estimada:** 13 horas de desarrollo (8h E5-S1 + 5h E5-S2) + 2-3h code review  
**Riesgos:** Medium (Timeline: sin regresiones en E3 Kanban; Auditoría: requiere cuidado en triggers DB)  

---

## 🎯 Secuencia Recomendada de Stories

### Story 1: E5-S1 (Timeline Backend + Frontend) — **8 puntos**

| Aspecto | Detalles |
|---------|----------|
| **Status Actual** | ✅ Ready for Development |
| **Prioridad** | P2 (Después de Epics 1-4) |
| **Duración Estimada** | 5-6 horas (dev + testing) |
| **Razón de Secuencia** | 1️⃣ **Especificación E2E completa** (15 test scenarios) |
| | 2️⃣ **Roadmap de 5 fases documentado** |
| | 3️⃣ **Componentes con data-testid mapeados** (35 selectors) |
| | 4️⃣ **API backend especificada** (3 endpoints) |
| | 5️⃣ **No tiene dependencias externas** (E4 ya complete) |
| **Story Points Justificación** | 8 = 5h dev + 1.5h testing + 1.5h code review |

**Entregables:**
- ✅ TimelineEvent DB model (PostgreSQL)
- ✅ 3 API endpoints (GET, POST, DELETE)
- ✅ 10+ Frontend React components
- ✅ React Query hooks (useTimelineEvents, useAddTimelineEvent, useDeleteTimelineEvent)
- ✅ 15 E2E test scenarios passing (75 variants × 5 browsers)
- ✅ 0 TypeScript errors, build clean

---

### Story 2: E5-S2 (Auditoría Backend) — **5 puntos**

| Aspecto | Detalles |
|---------|----------|
| **Status Actual** | 📋 Backlog |
| **Prioridad** | P2 (Depende de E5-S1 timeline data) |
| **Duración Estimada** | 3-4 horas (dev + testing) |
| **Razón de Secuencia** | 1️⃣ **Depende de E5-S1** (Timeline eventos como audit source) |
| | 2️⃣ **Requiere Migration Alembic** (tabla lead_audit_log ya diseñada en arch) |
| | 3️⃣ **Triggers de BD** para capturar cambios automáticamente |
| | 4️⃣ **Sin UI frontend** (backend-only para MVP) |
| | 5️⃣ **API GET /leads/{id}/audit** para futura visualización |
| **Story Points Justificación** | 5 = 3h dev + 1h testing + 0.5h code review |

**Entregables:**
- ✅ Alembic migration para crear lead_audit_log table
- ✅ Triggers en PostgreSQL (UPDATE/DELETE en leads → registrar en audit_log)
- ✅ AuditLogModel (SQLAlchemy)
- ✅ GET /api/leads/{id}/audit endpoint
- ✅ 8+ unit tests para triggers y API
- ✅ Validación de immutability del audit log

**Nota:** E5-S2 está diseñada como **backend-only en MVP**. Frontend para visualizar auditoría puede venir en Epic 6 (UI/Polish) si hay tiempo.

---

## 🔗 Dependencias Internas y Externas

### Matriz de Dependencias

```
Epic 5-S1 (Timeline)
├─ Depende DE:
│  ├─ Epic 1-S1: Backend FastAPI ✅ COMPLETO
│  ├─ Epic 1-S2: PostgreSQL Schema ✅ COMPLETO
│  ├─ Epic 1-S3: React Frontend ✅ COMPLETO
│  ├─ Epic 1-S4: Docker Compose ✅ COMPLETO
│  ├─ Epic 2 (CRUD): Lead model + validation ✅ COMPLETO
│  └─ Epic 3 (Kanban): Lead navigation ✅ COMPLETO
│
├─ BLOQUEADORES: NINGUNO ✅
│
└─ DESBLOQUEA:
   ├─ E5-S2 (Auditoría): Necesita Timeline events como fuente
   ├─ E6 (UX/Polish): Timeline UI responsive
   ├─ E8 (E2E Coverage): Timeline scenarios
   └─ Futuro: Reports por Timeline

Epic 5-S2 (Auditoría)
├─ Depende DE:
│  ├─ Epic 5-S1: Timeline ✅ SERÁ COMPLETADO PRIMERO
│  ├─ Epic 2-S2: Lead update logic ✅ COMPLETO
│  └─ Epic 2-S3: Lead status changes ✅ COMPLETO
│
├─ BLOQUEADORES: E5-S1 (debe estar completo antes de empezar)
│
└─ DESBLOQUEA:
   ├─ E6 (Auditoría UI): Visualización en frontend
   └─ Compliance reporting
```

### Dependencias Técnicas Críticas

| Componente | Estado | Impacto | Mitigación |
|-----------|--------|--------|-----------|
| PostgreSQL version 12+ | ✅ Ya en producción | Timeline eventosrequiere JSON metadata | Sin acción |
| TanStack Query v5 | ✅ Ya en frontend | React Query hooks para caching | Sin acción |
| Playwright 5 browsers | ✅ Ya en testing | 75 E2E tests (15 × 5) | Sin acción |
| React Hook Form | ✅ Ya usado en E2-S4 | Modales add note/call/email | Sin acción |
| Tailwind CSS | ✅ Ya en componentes | Timeline styling (card layout) | Sin acción |
| Alembic migrations | ✅ Ya en backend | Migration para audit_log table | Revisar versión |

---

## ⏱️ Timeline Estimado por Story

### E5-S1: Timeline de Actividad (5-6 horas)

| Fase | Descripción | Duración | Horas Acum | Criterios de Éxito |
|------|-------------|----------|-----------|------------------|
| **Fase 1** | Backend API (3 endpoints) | 1-2h | 2h | Endpoints working, 8/8 tests ✅ |
| **Fase 2** | Frontend Componentes - Estructura | 1-1.5h | 3h | Components render, testid in place |
| **Fase 3** | Add/Delete Modales + Mutations | 1-1.5h | 4h | 4 modales working, AC-2 a AC-5 pass |
| **Fase 4** | Filtrado + Sort | 0.5h | 4.5h | Filter by type, sort by date |
| **Fase 5** | Testing & Validation | 0.5-1h | 5h | 75 E2E tests passing, 0 TS errors |
| | | | **Total: 5-6h** | |

**Fase 1: Backend API (Hours 0-2)**

```yaml
Tasks:
  - Create TimelineEvent database model in models/timeline.py
  - Implement GET /api/leads/{leadId}/timeline (with pagination/filter)
  - Implement POST /api/leads/{leadId}/timeline (add event)
  - Implement DELETE /api/leads/{leadId}/timeline/{eventId}
  - Add Pydantic schemas (TimelineEvent, AddTimelineEventRequest)
  - Write 8+ backend unit tests
  - Validate against API spec from roadmap

Files to Create:
  - backend/app/models/timeline.py
  - backend/app/schemas/timeline_schemas.py
  - backend/app/services/timeline_service.py
  - backend/app/routes/timeline_routes.py
  - backend/tests/test_timeline_api.py

Success Criteria:
  ✓ All 3 endpoints responding with correct status codes
  ✓ Tests: 8/8 passing
  ✓ Error handling: 400/404/401 codes working
  ✓ Response formats match spec exactly
```

**Fase 2: Frontend Components - Estructura (Hours 2-3)**

```yaml
Tasks:
  - Create TimelineView.tsx (main container with data fetching)
  - Create TimelineEvent.tsx (individual event display)
  - Create TimelineEventList.tsx (list container)
  - Create TimelineEmptyState.tsx (no events UI)
  - Create TimelineHeader.tsx (lead name, navigation)
  - Setup React Query hooks for timeline fetching
  - Add all data-testid attributes (from ref guide)

Files to Create:
  - frontend/src/components/TimelineView.tsx
  - frontend/src/components/TimelineEvent.tsx
  - frontend/src/components/TimelineEventList.tsx
  - frontend/src/components/TimelineEmptyState.tsx
  - frontend/src/components/TimelineHeader.tsx
  - frontend/src/hooks/useTimelineEvents.ts

Success Criteria:
  ✓ Timeline renders without errors
  ✓ useQuery fetches events correctly
  ✓ data-testid attributes visible in DOM
  ✓ Smoke test passes (AC-1, AC-12)
```

**Fase 3: Frontend Add/Delete Modales (Hours 3-4)**

```yaml
Tasks:
  - Create TimelineAddButton.tsx (toolbar with 3 buttons)
  - Create TimelineAddNoteModal.tsx + form logic
  - Create TimelineAddCallModal.tsx + form logic
  - Create TimelineAddEmailModal.tsx + form logic
  - Create TimelineDeleteConfirmation.tsx dialog
  - Implement useMutation hooks (add/delete)
  - Add toast notifications (success/error)
  - Handle error states gracefully

Files to Create:
  - frontend/src/components/TimelineAddButton.tsx
  - frontend/src/components/TimelineAddNoteModal.tsx
  - frontend/src/components/TimelineAddCallModal.tsx
  - frontend/src/components/TimelineAddEmailModal.tsx
  - frontend/src/components/TimelineDeleteConfirmation.tsx
  - frontend/src/hooks/useAddTimelineEvent.ts
  - frontend/src/hooks/useDeleteTimelineEvent.ts

Success Criteria:
  ✓ AC-2: Add note test passes
  ✓ AC-3: Add call test passes
  ✓ AC-4: Add email test passes
  ✓ AC-5: Delete test passes
  ✓ AC-10: Error handling toast shows
  ✓ AC-11: Delete confirmation appears
```

**Fase 4: Filtrado + Sort (Hours 4-4.5)**

```yaml
Tasks:
  - Create TimelineFilterBar.tsx (filter controls)
  - Implement filter state (useState or Zustand)
  - Add filter logic to timeline event list
  - Ensure sort order: newest first (AC-9)
  - Verify all events visible (AC-7)

Files to Create:
  - frontend/src/components/TimelineFilterBar.tsx
  - Update TimelineEventList.tsx with filter integration

Success Criteria:
  ✓ AC-6: Filter by type test passes
  ✓ AC-7: All events visible test passes
  ✓ AC-9: Sort order test passes
  ✓ Performance: filter < 200ms
```

**Fase 5: Testing & Validation (Hours 4.5-5.5)**

```yaml
Tasks:
  - Run all 15 E2E test scenarios: npm run e2e -- timeline.spec.ts
  - Debug and fix failing tests (expect 0 failures)
  - Verify all 12 acceptance criteria
  - Test mobile responsiveness (375px viewport)
  - Code review (adversarial: Blind Hunter, Edge Case Hunter, Auditor)
  - Apply review patches if any
  - Final build: npm run build (expect 0 errors)

Success Criteria:
  ✓ E2E tests: 75/75 passing (15 scenarios × 5 browsers)
  ✓ AC coverage: 12/12 met
  ✓ TypeScript errors: 0
  ✓ Code review: Approved
  ✓ Build: Clean (0 errors, < 5s)
  ✓ Mobile: Responsive 375px+
```

**Roadmap Visual (E5-S1):**

```
Dev Start: Day 1 Morning (06-12, 09:00)
  ├─ Phase 1 (2h):     [████████░░] Backend API
  ├─ Phase 2 (1.5h):   [███████░░░] Components Structure
  ├─ Phase 3 (1.5h):   [███████░░░] Add/Delete Modales
  ├─ Phase 4 (0.5h):   [██░░░░░░░░] Filtrado
  └─ Phase 5 (1h):     [██░░░░░░░░] Testing & Review
  
Dev Complete: Day 1 Evening (18:00, ~9h total = 5h dev + 1.5h review + ~2.5h buffer)
```

---

### E5-S2: Auditoría Backend (3-4 horas)

| Fase | Descripción | Duración | Horas Acum | Criterios de Éxito |
|------|-------------|----------|-----------|------------------|
| **Fase 1** | Alembic Migration + Triggers | 1-1.5h | 1.5h | Migration working, triggers firing |
| **Fase 2** | Backend API Endpoint | 1-1.5h | 3h | GET /api/leads/{id}/audit returns data |
| **Fase 3** | Unit Tests + Validation | 1h | 4h | 8+ tests passing, immutability verified |
| | | | **Total: 3-4h** | |

**Fase 1: Alembic Migration + DB Triggers (Hours 0-1.5)**

```yaml
Tasks:
  - Create Alembic migration: add_lead_audit_log_table.py
  - Create lead_audit_log table (schema from architecture.md)
  - Add indices: (lead_id, created_at DESC), (event_type)
  - Create PostgreSQL triggers:
    - audit_lead_update (UPDATE → record in audit_log)
    - audit_lead_delete (DELETE → record in audit_log)
    - audit_lead_status_change (PATCH status → record in audit_log)
  - Test migration up/down
  - Verify indices created correctly

Files to Create:
  - backend/alembic/versions/002_add_lead_audit_log.py
  - backend/app/models/audit.py (AuditLogModel SQLAlchemy)
  - backend/db/triggers.sql (trigger definitions)

Success Criteria:
  ✓ Migration runs: alembic upgrade head
  ✓ lead_audit_log table exists with correct schema
  ✓ Indices created successfully
  ✓ Triggers installed and firing
  ✓ Test: Update lead → audit_log record created
```

**Fase 2: Backend API Endpoint (Hours 1.5-3)**

```yaml
Tasks:
  - Create AuditLog SQLAlchemy model
  - Implement GET /api/leads/{leadId}/audit endpoint
    - Returns list of audit events (paginated)
    - Shows: timestamp, action, old_value, new_value, changed_by_user
    - Ordered by created_at DESC
  - Add query optimizations (indices)
  - Add error handling (404 if lead not found)
  - Implement pagination (limit, offset)

Files to Create:
  - backend/app/models/audit.py
  - backend/app/schemas/audit_schemas.py
  - backend/app/services/audit_service.py
  - backend/app/routes/audit_routes.py

Success Criteria:
  ✓ GET /api/leads/{id}/audit responds with audit records
  ✓ Records in correct chronological order
  ✓ Response format: { data: [], meta: { total, limit, offset } }
  ✓ Performance: < 300ms for < 1000 audit records
  ✓ Error handling: 404 if lead not found
```

**Fase 3: Unit Tests + Validation (Hours 3-4)**

```yaml
Tasks:
  - Write backend unit tests (8+ test cases)
    - Test trigger fires on UPDATE
    - Test trigger fires on DELETE
    - Test trigger captures old/new values
    - Test API endpoint returns records
    - Test pagination works
    - Test immutability (cannot UPDATE audit_log directly)
    - Test performance with large datasets
    - Test user attribution (who made the change)
  - Integration test: Create lead → update → verify audit trail
  - Performance test: 1000 audit records pagination
  - Code review readiness

Files to Create:
  - backend/tests/test_audit_triggers.py
  - backend/tests/test_audit_api.py

Success Criteria:
  ✓ Tests: 8+/8+ passing
  ✓ Coverage: Triggers, API, pagination, error cases
  ✓ No regressions: E2-S1/S2/S3/S4 tests still passing
  ✓ Build: 0 errors
  ✓ Performance: Audit GET < 300ms
```

---

## ✅ Criterios de Entrada/Salida por Story

### E5-S1: Timeline de Actividad

#### Criterios de Entrada (Debe completarse antes de empezar)

| # | Criterio | Status | Validación |
|---|----------|--------|-----------|
| 1 | Epic 1 completado (Backend/Frontend/Docker) | ✅ | Done 2026-06-08 |
| 2 | Epic 2 completado (CRUD Lead) | ✅ | Done 2026-06-08 |
| 3 | Epic 3 completado (Kanban) | ✅ | Done 2026-06-10 |
| 4 | Epic 4 completado (Search/Alerts) | ✅ | Done 2026-06-12 |
| 5 | E2E test specification approved | ✅ | timeline.spec.ts reviewed |
| 6 | Roadmap 5-fases documentado | ✅ | E5-S1-IMPLEMENTATION-ROADMAP.md |
| 7 | data-testid reference guide completo | ✅ | 35 selectors mapeados |
| 8 | Backend team disponible 5-6h | ⏳ | Requiere asignación |
| 9 | Frontend team disponible 3-4h | ⏳ | Requiere asignación |
| 10 | Test environment ready (Docker running) | ⏳ | docker-compose up -d |

#### Criterios de Salida (Definición de Done)

| # | Criterio | Validación | Commits |
|---|----------|-----------|---------|
| 1 | TimelineEvent DB model creado | Check backend/app/models/timeline.py | [commit] |
| 2 | 3 API endpoints working | curl tests, 200/201/204 responses | [commit] |
| 3 | 8+ backend unit tests passing | pytest backend/tests/test_timeline.py | [commit] |
| 4 | 10+ React components creados | Tree structure en frontend/src/components | [commit] |
| 5 | 3 React Query hooks implemented | useTimelineEvents, useAddTimelineEvent, useDeleteTimelineEvent | [commit] |
| 6 | 15 E2E test scenarios passing | npm run e2e -- timeline.spec.ts = 75/75 ✅ | [commit] |
| 7 | 12 acceptance criteria met | All 12 AC from roadmap verified | [commit] |
| 8 | 0 TypeScript errors | npm run build = 0 errors | [commit] |
| 9 | Code review approved | 3-layer review (Blind, Edge Case, Auditor) | [commit] |
| 10 | Mobile responsive (375px) | Playwright mobile viewport test | [commit] |
| 11 | Story file merged to main | PR merged, deploy-ready | [commit] |

**Story Signed Off By:** [Developer], [QA Lead], [Tech Lead]  
**Merge Ready:** When ALL criteria met ✅

---

### E5-S2: Auditoría Backend

#### Criterios de Entrada (Debe completarse antes de empezar)

| # | Criterio | Status | Validación |
|---|----------|--------|-----------|
| 1 | E5-S1 completado (Timeline funcional) | ⏳ | Depende de E5-S1 |
| 2 | Alembic migrations setup | ✅ | Ya en proyecto |
| 3 | PostgreSQL 12+ running | ✅ | Docker container |
| 4 | Architecture decision #5 (audit table) revisado | ✅ | architecture.md reviewed |
| 5 | Backend team disponible 3-4h | ⏳ | Requiere asignación |
| 6 | Test environment ready | ⏳ | docker-compose up -d |

#### Criterios de Salida (Definición de Done)

| # | Criterio | Validación | Commits |
|---|----------|-----------|---------|
| 1 | Alembic migration created | alembic upgrade head = success | [commit] |
| 2 | lead_audit_log table exists | SELECT COUNT(*) from lead_audit_log = 0 | [commit] |
| 3 | Indices created (2) | show index; on lead_audit_log | [commit] |
| 4 | Triggers installed (3) | show triggers; in information_schema | [commit] |
| 5 | Trigger firing verified | Update lead → audit_log record appears | [commit] |
| 6 | AuditLog SQLAlchemy model | backend/app/models/audit.py exists | [commit] |
| 7 | GET /api/leads/{id}/audit endpoint | curl http://localhost:8000/api/leads/1/audit | [commit] |
| 8 | 8+ backend unit tests passing | pytest backend/tests/test_audit*.py = 8+/8+ | [commit] |
| 9 | Immutability verified | Try UPDATE lead_audit_log → denied | [commit] |
| 10 | E2-S1/S2/S3/S4 tests still passing | Full regression: 39/39 E2-E4 tests | [commit] |
| 11 | Performance validated | GET /api/leads/1/audit < 300ms (1000 records) | [commit] |
| 12 | 0 TypeScript errors | npm run build = 0 errors | [commit] |
| 13 | Code review approved | 3-layer review | [commit] |
| 14 | Story merged to main | PR merged, deploy-ready | [commit] |

**Story Signed Off By:** [Backend Developer], [QA Lead], [Tech Lead]  
**Merge Ready:** When ALL criteria met ✅

---

## ⚠️ Riesgos y Mitigaciones

### Riesgos - E5-S1 (Timeline)

| # | Riesgo | Probabilidad | Impacto | Mitigación | Propietario |
|---|--------|--------------|--------|-----------|------------|
| R1 | Regresión en E3 Kanban durante drag-drop | Medium | High | Ejecutar suite completa (39 tests) después de cada fase | QA |
| R2 | React Query cache invalidation bugs | Medium | High | Seguir pattern de E2-S4 (setQueryData, invalidateQueries) | Frontend Dev |
| R3 | E2E test flakiness en parallelización | Low | Medium | Usar serial mode primero, luego workers=1 si hay issues | Test Engineer |
| R4 | Timezone issues (timestamps) | Low | Medium | Usar ISO 8601 consistently, test con múltiples zonas | Backend Dev |
| R5 | Mobile modal responsiveness | Medium | Low | Test con Playwright mobile (375px) desde Fase 2 | Frontend Dev |
| R6 | Performance: Timeline 1000+ events | Low | Medium | Implementar pagination/virtualization en Fase 4 | Frontend Lead |
| R7 | Error messages no claros en UI | Low | Low | Revisar all error toasts en code review (AC-10) | QA |

**Mitigación Global:** Seguir roadmap de 5 fases exactamente. No saltarse fases.

---

### Riesgos - E5-S2 (Auditoría)

| # | Riesgo | Probabilidad | Impacto | Mitigación | Propietario |
|---|--------|--------------|--------|-----------|------------|
| R8 | Triggers DB causando regresiones en UPDATE | High | High | Test triggers en entorno isolado antes de integrar | Backend Dev |
| R9 | Audit log table size → DB performance | Medium | High | Crear índices en Fase 1, monitorear query plans | DBA |
| R10 | Trigger firing multiple times (duplicates) | Medium | Medium | Usar BEFORE/AFTER triggers correctamente, test de idempotency | Backend Dev |
| R11 | User attribution: quién hizo el cambio | Medium | Medium | Usar current_user context en PostgreSQL (set_config) | Backend Arch |
| R12 | Alembic migration rollback issues | Low | High | Test up/down migration en local antes de production | DevOps |
| R13 | Audit log immutability: alguien intenta UPDATE | Low | High | PostgreSQL constraints: CREATE AUDIT_LOG AS IMMUTABLE | Backend Dev |

**Mitigación Global:** Usar triggers probados (no custom), validar en staging primero.

---

## 🗺️ Roadmap Visual de Fases

### Roadmap Completo: Epic 5 (13 horas totales)

```
Día 1 (Miércoles 2026-06-12):
└─ E5-S1: Timeline Backend + Frontend
   ├─ 09:00-11:00 (Phase 1): Backend API endpoints
   │  └─ Setup → Models, schemas, routes → Tests
   ├─ 11:00-12:30 (Phase 2): Frontend structure
   │  └─ Timeline components, data-testid, useQuery
   ├─ 12:30-14:00 (Lunch Break - 1.5h)
   ├─ 14:00-15:30 (Phase 3): Add/Delete modales
   │  └─ Modales, mutations, toasts
   ├─ 15:30-16:00 (Phase 4): Filtering
   │  └─ FilterBar, sort order
   └─ 16:00-18:00 (Phase 5): Testing + Code Review
      └─ E2E tests (75/75), review patches, build

Día 2 (Jueves 2026-06-13):
└─ E5-S2: Auditoría Backend
   ├─ 09:00-10:30 (Phase 1): Migration + Triggers
   │  └─ Alembic, lead_audit_log table, DB triggers
   ├─ 10:30-12:00 (Phase 2): API endpoint
   │  └─ AuditLog model, GET /api/leads/{id}/audit
   ├─ 12:00-13:00 (Lunch Break)
   ├─ 13:00-14:00 (Phase 3): Tests + Validation
   │  └─ Unit tests, regression suite, performance
   └─ 14:00-15:00 (Code Review + Merge)
      └─ Review patches, merge to main
```

### Gantt Chart Visual

```
EPIC 5 SPRINT PLAN (13 hours total)
├─ E5-S1: Timeline (5-6h)
│  ├─ Phase 1: Backend API ▓▓░░░░░░░░ 2h
│  ├─ Phase 2: Components   ▓▓▓░░░░░░░ 1.5h
│  ├─ Phase 3: Add/Delete   ▓▓▓░░░░░░░ 1.5h
│  ├─ Phase 4: Filter       ▓░░░░░░░░░ 0.5h
│  └─ Phase 5: Testing      ▓░░░░░░░░░ 1h
│
└─ E5-S2: Auditoría (3-4h)
   ├─ Phase 1: Migration     ▓▓▓░░░░░░░ 1.5h
   ├─ Phase 2: API          ▓▓▓░░░░░░░ 1.5h
   └─ Phase 3: Tests        ▓░░░░░░░░░ 1h

Timeline:
Day 1: E5-S1 (9h work including review)
Day 2: E5-S2 (4h work including review)
Total: ~13h dev + ~2h code review = ~15h
Contingency: +5h (33% buffer) = 20h recommended
```

### Fases Parallelizables

Si hay equipo: Backend puede hacer E5-S1 Phase 1 mientras Frontend hace E5-S1 Phase 2:

```
PARALLELIZABLE PLAN (shorter timeline, more resources):
Day 1 Timeline:
 9:00-11:00: Backend Phase 1 ▓▓░░░░░░░░ 2h | Frontend prep
11:00-12:00: Backend testing ▓░░░░░░░░░ 1h | Frontend Phase 2 ▓▓▓░░░░░░░ 1.5h
12:00-13:00: Lunch
13:00-14:30: Frontend Phase 3 ▓▓▓░░░░░░░ 1.5h | Backend integration
14:30-15:30: Frontend Phase 4 ▓░░░░░░░░░ 0.5h | Backend tests
15:30-17:00: E2E Testing + Review ▓▓▓░░░░░░░ 1.5h

Result: E5-S1 completo en 1 día (vs 2 días sequential)
E5-S2 sigue al día siguiente (depende de E5-S1)
```

---

## 📊 Métricas de Éxito y Validación

### Métricas E5-S1 (Timeline)

| Métrica | Target | Validación | Status |
|---------|--------|-----------|--------|
| **Tests Passing** | 75/75 (100%) | npm run e2e -- timeline.spec.ts | ⏳ |
| **AC Coverage** | 12/12 (100%) | All AC from roadmap ✓ | ⏳ |
| **TypeScript Errors** | 0 | npm run build output | ⏳ |
| **Code Review** | Approved ✓ | 3-layer review completed | ⏳ |
| **Build Time** | < 5s | npm run build benchmark | ⏳ |
| **E2E Execution Time** | < 5 minutes | 75 tests in parallel | ⏳ |
| **Mobile Responsive** | Pass 375px | Playwright mobile viewport | ⏳ |
| **Performance** | API < 300ms | GET /timeline latency p95 | ⏳ |
| **Component Coverage** | 10+ components | Tree structure created | ⏳ |
| **Data-testid Selectors** | 35/35 | All selectors in DOM | ⏳ |

**Success Criteria:** 100% of metrics passing before code review approval

---

### Métricas E5-S2 (Auditoría)

| Métrica | Target | Validación | Status |
|---------|--------|-----------|--------|
| **Unit Tests** | 8+/8+ (100%) | pytest backend/tests/test_audit*.py | ⏳ |
| **Trigger Firing** | 100% | Update lead → audit record | ⏳ |
| **API Response** | < 300ms | GET /api/leads/{id}/audit | ⏳ |
| **Immutability** | ✓ | Cannot UPDATE audit_log | ⏳ |
| **Regression Tests** | 39/39 (100%) | E2-E4 suite still passing | ⏳ |
| **TypeScript Errors** | 0 | npm run build output | ⏳ |
| **Code Review** | Approved ✓ | 3-layer review completed | ⏳ |
| **Migration Rollback** | Success ✓ | alembic downgrade tested | ⏳ |

**Success Criteria:** 100% of metrics passing before merge

---

## 📝 Notas y Consideraciones Especiales

### E5-S1 Notas

1. **Especificación Completa:** El roadmap E5-S1-IMPLEMENTATION-ROADMAP.md es muy detallado. **Síguelo al pie**. No hagas cambios sin revisar con el equipo.

2. **data-testid Reference:** El documento E5-S1-TIMELINE-TESTID-REFERENCE.md tiene 35 selectores mapeados. **Úsalos exactamente** en los componentes para que E2E tests pasen.

3. **React Query Pattern:** E5-S1 usa el mismo pattern que E2-S4 (CreateLeadModal):
   - `useQuery` para GET /timeline
   - `useMutation` con `onSuccess` para invalidar cache
   - Optimistic updates donde sea posible

4. **Error Handling:** AC-10 requiere toast notifications en errores. Usa el patrón de E4-S2 (Phase 5: utils/toastNotifier.ts).

5. **Mobile Testing:** Desde Fase 2, prueba en Playwright mobile (375px). No dejes todo para Fase 5.

6. **No regresiones en E3:** Después de cada commit, corre la suite de E3-S2 (KanbanBoard) para verificar que el drag-drop sigue funcionando.

### E5-S2 Notas

1. **Triggers PostgreSQL:** Los triggers van en la migración Alembic. Usa SQL puro (no ORM).

   ```sql
   CREATE OR REPLACE FUNCTION audit_lead_update() RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO lead_audit_log (lead_id, action, old_value, new_value, created_by)
     VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER audit_lead_update_trigger
   AFTER UPDATE ON leads
   FOR EACH ROW
   EXECUTE FUNCTION audit_lead_update();
   ```

2. **Immutability:** La tabla `lead_audit_log` debe ser write-only (no UPDATE, no DELETE). Usa PostgreSQL policies si tienes RLS activado.

3. **Performance:** Crea índices en (lead_id, created_at DESC) e (event_type). Usa EXPLAIN ANALYZE para verificar query plans.

4. **User Attribution:** Para capturar quién hizo el cambio, usa `CURRENT_USER` en PostgreSQL o pasa user_id en la request FastAPI.

5. **No Frontend en MVP:** E5-S2 es backend-only en este sprint. La UI para visualizar auditoría viene en Epic 6 (si hay tiempo).

---

## 🔄 Definición de Procesos

### Código Review Adversarial

Ambas stories deben pasar un code review de 3 capas **antes** de merge:

1. **Blind Hunter:** "¿Hay bugs obvios que el dev puede haber pasado?"
   - Validación de inputs
   - Error handling incompleto
   - Memory leaks, race conditions
   - Off-by-one errors

2. **Edge Case Hunter:** "¿Qué pasa en casos extremos?"
   - Timeline con 0 eventos
   - Usuario sin permisos
   - Timeout en API
   - Concurrent requests
   - Invalid IDs/UUIDs

3. **Acceptance Auditor:** "¿Cumple 100% con las AC?"
   - Check todos los AC (12 para E5-S1, 0 tests para E5-S2)
   - Validar contra spec original
   - Performance targets
   - Accessibility requirements

**Output:** Findings triaged en 3 categorías:
- 🔴 Decision Needed (resolve before merge)
- 🟡 Patches (apply to code)
- 🟢 Defer (document for future)
- ⚪ Dismiss (noise, reject finding)

### Testing Strategy

**E5-S1:**
- Unit tests: Backend (8+), Frontend (12+) usando Vitest
- Component tests: E2E Playwright (15 scenarios = 75 tests)
- Integration: Backend-frontend contract

**E5-S2:**
- Unit tests: Trigger logic (4), API logic (4+)
- Integration: Trigger firing on UPDATE/DELETE
- Performance: 1000 audit records pagination
- Regression: E2-S1/S2/S3/S4 (39 tests must still pass)

### Deployment Strategy

**Local Development:**
```bash
docker-compose up -d  # All services running
npm run dev           # Frontend dev server
npm run backend       # Backend server (if not Docker)
```

**Testing:**
```bash
# E5-S1 E2E tests
cd frontend && npm run e2e -- timeline.spec.ts --headed

# E5-S2 Backend tests
cd backend && pytest tests/test_audit*.py -v
```

**Merge to Main:**
- [ ] All tests passing (75/75 E2E + 8+ backend)
- [ ] Code review approved
- [ ] Build clean (0 TS errors)
- [ ] No regressions (39 E2-S1/S2/S3/S4 tests still pass)
- [ ] Commits are semantic (feat: timeline, fix: filter, etc)

---

## 📚 Referencia Rápida

### Archivos Clave

| Documento | Ubicación | Propósito |
|-----------|-----------|----------|
| E5-S1 Roadmap | _bmad-output/planning-artifacts/E5-S1-IMPLEMENTATION-ROADMAP.md | Guía de desarrollo (5 fases) |
| data-testid Ref | docs/E5-S1-TIMELINE-TESTID-REFERENCE.md | 35 selectores E2E |
| E2E Tests | frontend/e2e/timeline.spec.ts | 15 test scenarios |
| Architecture | _bmad-output/planning-artifacts/architecture.md | Decisiones de diseño (Decisión #5 audit) |
| Sprint Status | _bmad-output/implementation-artifacts/sprint-status.yaml | Estado actual del proyecto |

### Comandos Útiles

```powershell
# Backend setup
cd backend
pip install -r requirements.txt
alembic upgrade head        # Run migrations
pytest tests/test_timeline.py -v

# Frontend setup
cd frontend
npm install
npm run dev                 # Dev server with HMR

# Run E2E tests
npm run e2e -- timeline.spec.ts --headed

# Docker stack
docker-compose up -d        # Start all services
docker-compose logs -f      # Follow logs
docker-compose down         # Stop services

# Build & deploy check
npm run build               # Should be 0 errors
npm run lint                # Check code quality
```

### Personas y Asignación (Plantilla)

| Rol | Persona | Responsabilidad |
|-----|---------|-----------------|
| **Backend Dev** | [Name] | E5-S1 Fase 1, E5-S2 Fases 1-3 |
| **Frontend Dev** | [Name] | E5-S1 Fases 2-4 |
| **QA/Test Eng** | [Name] | E2E test execution, code review (Acceptance Auditor) |
| **Tech Lead** | [Name] | Code review (Blind Hunter), merge decisions |
| **Architect** | [Name] | Architecture decisions, risk mitigation |

---

## ✨ Conclusión

**Epic 5 es ejecutable ahora mismo.** E5-S1 tiene especificación completa, roadmap de 5 fases, y 15 E2E test scenarios ready. E5-S2 depende de E5-S1 pero es straightforward (triggers + API endpoint).

**Recomendación final:**
1. Asignar E5-S1 al equipo hoy
2. Ejecutar Fases 1-2 (3 horas) para validar que todo está en orden
3. Continuar Fases 3-5 según roadmap
4. Empezar E5-S2 solo después que E5-S1 esté merge-ready

**Timeline total:** 2 días de desarrollo con buffer de 5h contingencia.

---

**Documento generado:** 2026-06-12  
**Próxima revisión:** Después de E5-S1 Fase 1 complete  
**Preparado por:** BMAD Sprint Planning Agent
