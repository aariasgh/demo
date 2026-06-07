---
stepsCompleted: [1]
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-Demo-2026-06-07/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/design-artifacts/D-Design-System/UX-01-WIREFRAMES-DETALLADOS.md"
  - "_bmad-output/design-artifacts/D-Design-System/UX-02-FLUJOS-DE-USUARIO.md"
  - "_bmad-output/design-artifacts/D-Design-System/UX-03-ESPECIFICACIONES-COMPONENTES.md"
  - "_bmad-output/design-artifacts/D-Design-System/ALINEACION-UX-ARQUITECTURA.md"
  - "_bmad-output/design-artifacts/D-Design-System/WINSTON-DECISIONES-ARQUITECTONICAS.md"
project_name: "Demo - Mini CRM"
user_name: "Anuar"
date: "2026-06-07"
status: "REQUIREMENTS_EXTRACTED"
---

# Demo - Mini CRM — Epic Breakdown & User Stories

**Versión:** 1.0  
**Fecha:** 2026-06-07  
**Estado:** Requisitos Extraídos — Listos para Estimación  
**Audiencia:** Equipo de Desarrollo, QA, Product Manager  
**Salida:** Epics y Stories estructuradas para sprint planning  

---

## 📋 Resumen Ejecutivo

El Mini CRM de Seguimiento de Clientes Potenciales requiere **8 Epics** organizados en capas horizontales (Infraestructura → Core Features → UX/Polish → Quality). Cada Epic contiene 3-4 Stories de scope manejable, totalizando **26 User Stories** listas para desarrollo inmediato.

**Plazo:** 48 horas hasta demostración (2026-06-08 09:00)  
**Equipo:** 1 Developer Full-stack + 1 QA Automation  
**Definición de Éxito:** Código funcional, testeable, documentado, dockerizado  

---

## 📊 Inventario de Requisitos

### Requisitos Funcionales (FRs)

```
FR-1: Visualización de Pipeline (Kanban)
      - 4 columnas: Nuevo → En contacto → Propuesta enviada → Cerrado
      - Tarjetas draggables con información clara
      - Contador de leads por columna (actualización real-time)
      - Responsive: mobile 320px, tablet 768px, desktop 1200px+

FR-2: Crear Lead (Modal)
      - Campos: nombre, empresa, email, teléfono (optional), notas (optional)
      - Validaciones: nombre/empresa >= 2 chars, email único, formato válido
      - Validaciones inline (mientras escribe)
      - Botón crear deshabilitado hasta campos válidos
      - Toast de confirmación/error

FR-3: Cambiar Estado de Lead
      - Transiciones válidas: Nuevo → En contacto → Propuesta → Cerrado (cualquier orden si necesario retroceso)
      - Drag & drop entre columnas
      - Modal con selector de estado como alternativa
      - Cambio inmediato en UI (optimistic update)
      - Registro automático de timestamp y evento

FR-4: Timeline de Actividad por Lead
      - Historial completo de eventos (creación, cambios de estado, notas)
      - Evento muestra: tipo, descripción, timestamp, usuario
      - Timeline cronológico (más reciente arriba)
      - Usuario puede agregar nota desde modal timeline

FR-5: Widget "Leads en Riesgo"
      - Cálculo automático: leads sin cambio de estado hace >7 días
      - Badge visual (rojo si hay alertas)
      - Click en widget filtra Kanban solo leads en riesgo
      - Recuento exacto, actualización real-time

FR-6: Búsqueda y Filtro
      - Búsqueda por nombre, empresa, email (parcial, case-insensitive)
      - Búsqueda es "OR": si coincide cualquier campo, aparece
      - Debounce 300ms
      - Placeholder claro
      - Botón limpiar (X)

FR-7: Editar Lead
      - Editar: nombre, empresa, email, teléfono, notas
      - Same validations as FR-2
      - Email no puede cambiar a duplicado
      - Cambios registrados en timeline (auditoria)
```

### Requisitos No-Funcionales (NFRs)

```
NFR-1: Performance
      - Carga inicial Kanban (100 leads): <2 segundos
      - Búsqueda (debounce 300ms): resultados en <500ms
      - Movimiento de lead: actualización inmediata UI, sync backend <1s
      - API p95 <300ms

NFR-2: Disponibilidad
      - Uptime demo: 99.5% (tolerancia 1-2 min en 72h)
      - No pérdida de datos (ACID compliance)
      - Si backend cae: UI muestra error claro (no infinite spinner)

NFR-3: Seguridad
      - Autenticación: login hardcoded (demo/demo123)
      - Validación de input: sanitizado contra SQL injection, XSS
      - Error messages: no revelan internals (no stack traces)
      - HTTPS opcional para demo (HTTP ok localhost)

NFR-4: Escalabilidad (Architecture-Ready)
      - BD con índices en email, timestamps, status
      - API stateless (replicable)
      - Frontend bundle <2MB

NFR-5: Confiabilidad
      - API documentada (OpenAPI/Swagger)
      - Manejo exhaustivo de errores
      - Auditoria: cada cambio registra timestamp + usuario
      - Retry logic con exponential backoff
```

### Requisitos Adicionales (Architecture)

```
ARCH-1: Starter Template
        - FastAPI backend con async/await
        - React 18 + TypeScript frontend
        - Zustand para state management
        - TanStack Query para caching/dedup
        - react-beautiful-dnd para drag & drop
        - Tailwind CSS para styling

ARCH-2: Base de Datos
        - PostgreSQL 15+
        - ORM: SQLAlchemy 2.0 + asyncpg
        - Migraciones: Alembic
        - Schema: leads + lead_audit_log
        - Índices en: email, status, updated_at
        - UNIQUE constraint en email

ARCH-3: Patterns Técnicos
        - Optimistic updates en frontend
        - Idempotency keys para operaciones write
        - Connection pooling (SQLAlchemy)
        - Query optimization (no N+1)
        - Validación inline + server-side

ARCH-4: Deployment & DevOps
        - Docker + Docker Compose
        - 3 servicios: backend, frontend, postgresql
        - docker-compose.yml con volumes para persistencia
        - .env para configuración
        - Comandos: docker-compose up, docker-compose down

ARCH-5: Testing & Quality
        - pytest backend (asyncio, fixtures)
        - Playwright e2e tests
        - >70% cobertura
        - CI/CD pronta (GitHub Actions)

ARCH-6: Documentación
        - API: OpenAPI/Swagger (/api/docs)
        - Architecture.md con decisiones
        - README.md con setup local
        - ER diagram (leads, lead_audit_log)
        - Runbook para demo
```

### Requisitos de Diseño UX

```
UX-DR-1: Diseño Responsivo
         - Mobile: columnas stackeadas verticalmente, scroll horizontal deshabilitado
         - Tablet (768px): 2 columnas visibles, scroll horizontal para resto
         - Desktop (1200px+): 4 columnas visibles sin scroll horizontal
         - Lead cards escalables según viewport

UX-DR-2: Color Tokens por Estado
         - Nuevo: Azul #3B82F6 (circle icon)
         - En contacto: Naranja #F59E0B
         - Propuesta: Púrpura #A855F7
         - Cerrado: Verde #10B981

UX-DR-3: Lead Card Specification
         - Dimensiones: 100% ancho columna, min 120px altura
         - Contenido: nombre (bold 14px), empresa (12px gris), email (11px gris claro)
         - Estados: normal (white bg), hover (blue border, stronger shadow), dragging (0.7 opacity, large shadow)
         - Cursor: grab en hover, grabbing durante drag

UX-DR-4: Animaciones y Transiciones
         - Lead movement smooth (no jarring)
         - Modal open/close: fade-in/out 200ms
         - Load spinner: rotación suave
         - Toast appearance: slide-in desde bottom-right

UX-DR-5: Estados UI (Loading, Error, Empty)
         - Loading state: spinner + "Cargando..." texto
         - Error state: red banner con mensaje + botón retry
         - Empty state: imagen placeholder + "No hay leads aún" + CTA "Crear primer lead"

UX-DR-6: Accesibilidad
         - Focus outline visible (contrast 3:1 mínimo)
         - ARIA labels en inputs, buttons
         - Tab navigation funcional
         - Screen reader support (roles, live regions)
         - Keyboard shortcuts: Enter para confirmar, Esc para cerrar modals

UX-DR-7: Input Validation Feedback
         - Inline error display en red (#EF4444)
         - Success checkmark verde (#10B981)
         - Helper text bajo campo (max chars, format hints)
         - Disabled state visual claro (opacity 0.5)
```

---

## 📍 Coverage Map (Requisitos → Epics)

| Requisito | Epic | Story |
|-----------|------|-------|
| FR-1 (Kanban) | Epic 3 | 3.1, 3.2, 3.3 |
| FR-2 (Crear Lead) | Epic 2 | 2.1 |
| FR-3 (Cambiar Estado) | Epic 2 | 2.3 |
| FR-4 (Timeline) | Epic 5 | 5.1, 5.2 |
| FR-5 (Leads en Riesgo) | Epic 4 | 4.2 |
| FR-6 (Búsqueda) | Epic 4 | 4.1 |
| FR-7 (Editar Lead) | Epic 2 | 2.2 |
| NFR-1 (Performance) | Epic 7 | 7.1, 7.2, 7.3 |
| NFR-2 (Disponibilidad) | Epic 7 | 7.4 |
| NFR-3 (Seguridad) | Epic 2 | 2.1 (validación) |
| ARCH-1 (Stack) | Epic 1 | 1.1, 1.2, 1.3 |
| ARCH-2 (BD) | Epic 1 | 1.2 |
| ARCH-3 (Patterns) | Epic 7 | 7.2, 7.3 |
| UX-DR-1 → UX-DR-7 | Epic 6 | 6.1, 6.2, 6.3 |
| Testing | Epic 8 | 8.1, 8.2 |
| Documentación | Epic 8 | 8.3 |

---

## 📌 Lista de Epics

**Total: 8 Epics, 26 Stories (Estimación: 144 Story Points)**

1. **Epic 1: Infraestructura y Setup** (4 stories)
2. **Epic 2: Gestión de Leads (CRUD)** (4 stories)
3. **Epic 3: Visualización del Pipeline (Kanban)** (3 stories)
4. **Epic 4: Búsqueda, Filtrado y Alertas** (3 stories)
5. **Epic 5: Timeline y Auditoría** (2 stories)
6. **Epic 6: UX/UI, Responsivo y Accesibilidad** (3 stories)
7. **Epic 7: Performance, Optimización y Confiabilidad** (3 stories)
8. **Epic 8: Testing, Documentación y Preparación Demo** (3 stories)

---

## 🏗️ Epic 1: Infraestructura y Setup

**Epic Goal:** Establecer el stack técnico completamente configurado, listo para desarrollo de features. Incluye backend, frontend, BD, Docker, e integración inicial.

**Duración estimada:** 8 horas (Day 1)  
**Criterio de éxito:** `docker-compose up` levanta 3 servicios sin errores

### Story 1.1: Setup FastAPI Backend + PostgreSQL + Docker

**Tipo:** Technical Setup  
**Estimación:** 13 pts

**Como** desarrollador,  
**quiero** tener un backend FastAPI con PostgreSQL local dockerizado,  
**para que** pueda desarrollar y testear la API en mi máquina sin problemas de dependencias.

**Criterios de Aceptación:**

- [ ] **Dado** que ejecuto `docker-compose up` desde la raíz del proyecto,
  **Cuando** espero 10 segundos,
  **Entonces** FastAPI está disponible en `http://localhost:8000` sin errores

- [ ] **Dado** que accedo a `http://localhost:8000/docs`,
  **Cuando** cargo la página,
  **Entonces** veo Swagger UI con documentación OpenAPI

- [ ] **Dado** que el backend está corriendo,
  **Cuando** hago `GET /api/health`,
  **Entonces** recibo `{ "status": "ok" }` con código 200

- [ ] **Dado** que PostgreSQL está en el contenedor,
  **Cuando** el backend intenta conectar a la BD,
  **Entonces** la conexión es exitosa (pool de 20 conexiones)

- [ ] **Dado** que ejecuto `docker-compose down`,
  **Cuando** vuelvo a ejecutar `docker-compose up`,
  **Entonces** la BD persiste (volumen mapeado correctamente)

**Tareas Técnicas:**
- Dockerfile para FastAPI (multi-stage, <500MB)
- docker-compose.yml con 3 servicios (backend, frontend, postgres)
- .env.example con variables de config
- FastAPI app básica con health check
- SQLAlchemy engine configurado con asyncpg
- Connection pool settings

**Testing:** Verificar en terminal que servicios están up

**Out of Scope:** Endpoints reales de business logic (solo health check)

---

### Story 1.2: Diseño e Implementación del Schema PostgreSQL

**Tipo:** Database Schema  
**Estimación:** 8 pts

**Como** desarrollador,  
**quiero** tener un schema PostgreSQL completo con migraciones Alembic,  
**para que** la BD esté estructurada y optimizada desde el inicio.

**Criterios de Aceptación:**

- [ ] **Dado** que ejecuto `alembic upgrade head`,
  **Cuando** finaliza sin errores,
  **Entonces** las tablas `leads`, `lead_audit_log`, `users` existen

- [ ] **Dado** que intento insertar dos leads con mismo email,
  **Cuando** ejecuto la inserción,
  **Entonces** falla con UNIQUE constraint violation (código 23505 PostgreSQL)

- [ ] **Dado** que la tabla leads existe,
  **Cuando** inspecciono los índices,
  **Entonces** existen índices en: `leads(email)`, `leads(status)`, `leads(updated_at)`

- [ ] **Dado** que la tabla lead_audit_log existe,
  **Cuando** inspecciono su estructura,
  **Entonces** tiene columnas: `id, lead_id, event_type, old_value, new_value, description, created_by_id, created_at, metadata`

- [ ] **Dado** que ejecuto `alembic downgrade -1`,
  **Cuando** finaliza sin errores,
  **Entonces** puedo ejecutar `alembic upgrade` de nuevo exitosamente

**Tareas Técnicas:**
- Primera migración Alembic con tablas: leads, lead_audit_log, users
- UNIQUE constraint en leads(email)
- Índices multicolumna
- Foreign keys con ON DELETE cascade/set null
- Tipos de datos: SERIAL, VARCHAR, TIMESTAMP, JSONB, BIGINT
- Default values: timestamps, status

**Testing:** SQLAlchemy ORM reflection, introspección de índices

**Out of Scope:** Datos de seed (seed scripts irán en Epic 8)

---

### Story 1.3: Setup React Frontend + TypeScript + Zustand + TanStack Query

**Tipo:** Technical Setup  
**Estimación:** 13 pts

**Como** desarrollador frontend,  
**quiero** tener un proyecto React con TypeScript, Zustand (state), TanStack Query (caching),  
**para que** tenga una base sólida para desarrollar componentes y conectar a la API.

**Criterios de Aceptación:**

- [ ] **Dado** que ejecuto `docker-compose up` incluido frontend,
  **Cuando** accedo a `http://localhost:3000`,
  **Entonces** veo la página principal con mensaje "Mini CRM de Seguimiento de Leads"

- [ ] **Dado** que el frontend está corriendo,
  **Cuando** inspecciono la estructura del proyecto,
  **Entonces** existen carpetas: `src/components/`, `src/hooks/`, `src/store/`, `src/pages/`, `src/types/`

- [ ] **Dado** que hago `npm run build` (o `pnpm build`),
  **Cuando** finaliza sin errores,
  **Entonces** la carpeta `dist/` tiene un bundle <2MB

- [ ] **Dado** que hago `npm run lint`,
  **Cuando** ejecuta ESLint,
  **Entonces** no hay errores de código (0 violations)

- [ ] **Dado** que importo una query de TanStack Query,
  **Cuando** usa `useQuery` para fetch datos,
  **Entonces** la query se ejecuta automáticamente y cachea resultados

- [ ] **Dado** que el frontend intenta conectar a la API backend,
  **Cuando** hace un request a `http://localhost:8000/api/leads`,
  **Entonces** recibe la respuesta correctamente (CORS configurado)

**Tareas Técnicas:**
- Vite config con React 18 + TypeScript
- Zustand store básico (leads store vacío por ahora)
- TanStack Query client configurado
- Tailwind CSS integrado
- ESLint + Prettier configurados
- Dockerfile para frontend (multi-stage build)
- CORS proxy o headers backend para desarrollo
- .env.local con API_BASE_URL

**Testing:** Verificar en navegador que carga sin errores, console limpia

**Out of Scope:** Componentes de UI (irán en Epic 3)

---

### Story 1.4: Docker Compose Integración y Ambiente Local

**Tipo:** DevOps/Deployment  
**Estimación:** 8 pts

**Como** desarrollador,  
**quiero** que `docker-compose up` levante todo el stack en un solo comando,  
**para que** cualquiera pueda correr el proyecto sin fricción.

**Criterios de Aceptación:**

- [ ] **Dado** que clono el repositorio en mi máquina,
  **Cuando** ejecuto `docker-compose up`,
  **Entonces** después de 15 segundos, puedo acceder a:
  - Frontend: `http://localhost:3000`
  - Backend: `http://localhost:8000`
  - Swagger: `http://localhost:8000/docs`
  - PostgreSQL: `localhost:5432` (usuario: postgres, password: postgres)

- [ ] **Dado** que docker-compose está corriendo,
  **Cuando** hago un cambio en el código del backend,
  **Entonces** el servidor auto-recarga (hot reload vía volumen mount)

- [ ] **Dado** que docker-compose está corriendo,
  **Cuando** hago un cambio en el código del frontend,
  **Entonces** el navegador auto-actualiza (Vite HMR)

- [ ] **Dado** que ejecuto `docker-compose down`,
  **Cuando** los contenedores se detienen,
  **Entonces** los volúmenes persisten (BD no se borra)

- [ ] **Dado** que ejecuto `docker-compose logs -f backend`,
  **Cuando** hago un request al API,
  **Entonces** veo el log en tiempo real (request_id, endpoint, duration_ms)

**Tareas Técnicas:**
- docker-compose.yml completo (services: backend, frontend, postgres)
- Volúmenes para postgres (/var/lib/postgresql/data)
- Volúmenes para development (source code mounting)
- Healthchecks en servicios (db ready check, backend ready check)
- Environment files (.env, .env.local)
- Makefile con targets útiles: `make up`, `make down`, `make logs`, `make reset`

**Testing:** Ejecutar stack desde 0, verificar conectividad cruzada entre servicios

**Out of Scope:** Deployment a producción (cloud TBD)

---

## 💼 Epic 2: Gestión de Leads (CRUD)

**Epic Goal:** Implementar operaciones fundamentales: crear, leer, actualizar leads. Incluye validaciones exhaustivas y manejo de errores.

**Duración estimada:** 20 horas (Day 1.5 - Day 2)  
**Criterio de éxito:** CRUD endpoints funcionales, validaciones passing, backend tests >80% cobertura

### Story 2.1: Crear Lead - API Endpoint + Validaciones (Backend)

**Tipo:** Feature Implementation  
**Estimación:** 13 pts

**Como** ejecutivo de venta,  
**quiero** crear un nuevo lead con nombre, empresa, email, teléfono y notas,  
**para que** comience a aparecer en el pipeline.

**Criterios de Aceptación:**

- [ ] **Dado** que hago POST a `/api/leads` con payload válido:
  ```json
  { "name": "Juan García", "company": "TechCorp", "email": "juan@techcorp.com", "phone": "+34917777777", "notes": "Lead caliente" }
  ```
  **Cuando** la request se procesa,
  **Entonces** recibo 201 Created con el lead creado + id + timestamps

- [ ] **Dado** que intento crear un lead con email duplicado,
  **Cuando** envío POST /api/leads con ese email,
  **Entonces** recibo 409 Conflict con mensaje: "Email ya existe en el sistema"

- [ ] **Dado** que intento crear un lead con nombre vacío,
  **Cuando** envío POST sin el campo "name",
  **Entonces** recibo 400 Bad Request con error: "name es requerido y debe tener >= 2 caracteres"

- [ ] **Dado** que intento crear un lead con email inválido,
  **Cuando** envío POST con email = "invalido@",
  **Entonces** recibo 400 Bad Request con error: "email debe ser un formato válido"

- [ ] **Dado** que cré un lead exitosamente,
  **Cuando** hago GET /api/leads/{id},
  **Entonces** el lead existe con status = "Nuevo" (default)

- [ ] **Dado** que cré un lead con notas de 1000+ caracteres,
  **Cuando** la validación se ejecuta,
  **Entonces** recibo 400 Bad Request con error: "notas no pueden exceder 1000 caracteres"

- [ ] **Dado** que cré un lead válido,
  **Cuando** inspecciono la BD,
  **Entonces** existe un evento en lead_audit_log de tipo "CREATED" con el lead_id

**Tareas Técnicas:**
- Endpoint: `POST /api/leads`
- Request schema con Pydantic: LeadCreate (name, company, email, phone?, notes?)
- Validaciones: email único (query BD), email format, name/company >= 2 chars, notas <= 1000 chars
- Response schema: LeadResponse (id, name, company, email, phone, status, created_at, updated_at)
- Transaction: INSERT lead + INSERT audit log
- Error handling: try-catch IntegrityError (email duplicate), ValueError, etc.
- Logging: log cada creación (request_id, user_id, lead_id)

**Testing:**
- pytest: test_create_lead_valid
- pytest: test_create_lead_email_duplicate
- pytest: test_create_lead_missing_name
- pytest: test_create_lead_invalid_email
- pytest: test_create_lead_notas_exceeds_limit

**Out of Scope:** Frontend integration (irá en Story 2.4)

---

### Story 2.2: Editar Lead - API Endpoint + Validaciones (Backend)

**Tipo:** Feature Implementation  
**Estimación:** 13 pts

**Como** ejecutivo de venta,  
**quiero** editar los datos de un lead existente,  
**para que** pueda corregir información o agregar detalles.

**Criterios de Aceptación:**

- [ ] **Dado** que hago PUT a `/api/leads/{id}` con payload:
  ```json
  { "name": "Juan García García", "company": "NewCorp", "email": "juan@newcorp.com", "phone": "+34917888888", "notes": "Actualizado" }
  ```
  **Cuando** la request se procesa,
  **Entonces** recibo 200 OK con el lead actualizado

- [ ] **Dado** que intento cambiar el email a uno que ya existe (duplicado),
  **Cuando** envío PUT con ese email,
  **Entonces** recibo 409 Conflict

- [ ] **Dado** que edité un lead,
  **Cuando** inspeciono lead_audit_log,
  **Entonces** hay evento "FIELD_EDITED" con old_value y new_value de los campos que cambiaron

- [ ] **Dado** que intento editar un lead inexistente,
  **Cuando** envío PUT a `/api/leads/99999`,
  **Entonces** recibo 404 Not Found

- [ ] **Dado** que edité un lead con validaciones parciales (solo cambié nombre),
  **Cuando** el PUT se ejecuta,
  **Entonces** solo el nombre cambia, otros campos permanecen igual

- [ ] **Dado** que edité un lead,
  **Cuando** hago GET /api/leads/{id},
  **Entonces** veo los nuevos valores + updated_at fue actualizado

**Tareas Técnicas:**
- Endpoint: `PUT /api/leads/{id}`
- Request schema: LeadUpdate (partial fields, todos optional)
- Validaciones: same as create (unique email, format, length)
- Response: LeadResponse actualizado
- Audit log: track FIELD_EDITED events (old vs new)
- Error handling: 404 si lead no existe, 409 si email duplicate
- Idempotency: si same data se envía 2x, resultado es idéntico

**Testing:**
- pytest: test_edit_lead_valid
- pytest: test_edit_lead_email_duplicate
- pytest: test_edit_lead_not_found
- pytest: test_edit_lead_partial_update
- pytest: test_edit_lead_audit_log

**Out of Scope:** Frontend edit form (irá en Story 2.4)

---

### Story 2.3: Cambiar Estado de Lead (Backend API)

**Tipo:** Feature Implementation  
**Estimación:** 8 pts

**Como** ejecutivo de venta,  
**quiero** cambiar el estado de un lead (Nuevo → En contacto → Propuesta → Cerrado),  
**para que** el pipeline refleje el progreso comercial.

**Criterios de Aceptación:**

- [ ] **Dado** que hago PATCH a `/api/leads/{id}/status` con payload:
  ```json
  { "new_status": "En contacto" }
  ```
  **Cuando** la request se procesa,
  **Entonces** recibo 200 OK con el lead actualizado + nuevo status

- [ ] **Dado** que un lead está en status "Nuevo",
  **Cuando** cambio a "En contacto",
  **Entonces** el cambio es permitido (transición válida)

- [ ] **Dado** que intento cambiar status a uno inválido,
  **Cuando** envío PATCH con new_status = "Invalido",
  **Entonces** recibo 400 Bad Request: "status debe ser uno de: Nuevo, En contacto, Propuesta enviada, Cerrado"

- [ ] **Dado** que cambié el status de un lead,
  **Cuando** inspeciono lead_audit_log,
  **Entonces** hay evento "STATUS_CHANGED" con old_value="Nuevo", new_value="En contacto"

- [ ] **Dado** que cambié status,
  **Cuando** hago GET /api/leads/{id},
  **Entonces** el lead tiene status actualizado + updated_at actualizado

- [ ] **Dado** que cambio status múltiples veces rápidamente,
  **Cuando** uso Idempotency-Key header,
  **Entonces** cambios subsecuentes con misma key retornan resultado idéntico (no duplica en BD)

**Tareas Técnicas:**
- Endpoint: `PATCH /api/leads/{id}/status`
- Request schema: StatusChange (new_status: Enum)
- Validación: status es uno de los 4 permitidos
- Enum en Python: `class LeadStatus(str, Enum)`
- Audit log: STATUS_CHANGED event
- Idempotency key: header `Idempotency-Key` → lookup cache (Redis o dict en-memory por ahora)
- Response: LeadResponse con nuevo status

**Testing:**
- pytest: test_change_status_valid
- pytest: test_change_status_invalid
- pytest: test_change_status_idempotent
- pytest: test_change_status_audit_log

**Out of Scope:** Drag & drop UI (irá en Epic 3)

---

### Story 2.4: Crear Lead - Modal y Formulario (Frontend)

**Tipo:** UI Implementation  
**Estimación:** 13 pts

**Como** ejecutivo de venta,  
**quiero** hacer click en "+ Nuevo Lead" y rellenar un modal intuitivo,  
**para que** crear un lead sea rápido (<30 segundos) sin dejar de ver el pipeline.

**Criterios de Aceptación:**

- [ ] **Dado** que estoy en el dashboard,
  **Cuando** hago click en botón "+ Nuevo Lead",
  **Entonces** se abre un modal con título "Nuevo Lead" + formulario

- [ ] **Dado** que el modal está abierto,
  **Cuando** inspecciono los campos,
  **Entonces** veo: nombre (required), empresa (required), email (required), teléfono (optional), notas (optional)

- [ ] **Dado** que empiez a escribir en el input "nombre",
  **Cuando** escribo "J" (1 carácter),
  **Entonces** veo error inline en rojo: "Mínimo 2 caracteres"

- [ ] **Dado** que escribo "Juan" en nombre (válido),
  **Cuando** salgo del campo (blur),
  **Entonces** el error desaparece, checkmark verde aparece

- [ ] **Dado** que escribo un email y salgo del campo,
  **Cuando** hago POST /api/leads/validate-email internamente,
  **Entonces** si es único, aparece checkmark; si es duplicado, error rojo: "Email ya existe"

- [ ] **Dado** que todos los campos required son válidos,
  **Cuando** inspecciono el botón "Crear Lead",
  **Entonces** el botón está ENABLED (no deshabilitado)

- [ ] **Dado** que hago click en "Crear Lead" con datos válidos,
  **Cuando** la request se envía,
  **Entonces** aparece spinner + "Creando lead..." en el botón

- [ ] **Dado** que la creación es exitosa,
  **Cuando** finaliza,
  **Entonces** el modal cierra + aparece toast verde "Lead creado exitosamente" + nuevo lead aparece en columna "Nuevo"

- [ ] **Dado** que la creación falla (error 409 email duplicate),
  **Cuando** la request retorna error,
  **Entonces** modal permanece abierto, toast rojo muestra el error, usuario puede reintentar

- [ ] **Dado** que escribo 1100 caracteres en notas,
  **Cuando** valido el campo,
  **Entonces** veo error: "Máximo 1000 caracteres, has ingresado 1100"

**Tareas Técnicas:**
- Componente React: `CreateLeadModal.tsx`
- React Hook Form para manejo de formulario
- Zod o Yup para validaciones
- Inputs con validación inline (onChange + onBlur)
- Estados visuales: empty, validating, valid, error
- Integración con Zustand: dispatch action para crear lead
- TanStack Query mutation para POST /api/leads
- Toast notifications (react-hot-toast o similar)
- Modal backdrop + close button (X)
- Funcionalidad "Limpiar" botón

**Testing:**
- Vitest / React Testing Library: test_modal_opens
- RTL: test_validation_inline
- RTL: test_create_lead_success
- RTL: test_create_lead_email_duplicate_error
- RTL: test_modal_closes_after_success

**Out of Scope:** Edición de lead (irá en Story 3.4)

---

## 🎨 Epic 3: Visualización del Pipeline (Kanban)

**Epic Goal:** Implementar el tablero Kanban interactivo con 4 columnas, drag & drop, y tarjetas de leads actualizándose en tiempo real.

**Duración estimada:** 20 horas (Day 1.5 - Day 2)  
**Criterio de éxito:** Kanban funcional, responsive, drag & drop suave, datos sincronizados

### Story 3.1: Listar Leads - API GET /leads (Backend)

**Tipo:** Feature Implementation  
**Estimación:** 8 pts

**Como** desarrollador frontend,  
**quiero** un endpoint GET /api/leads que retorne todos los leads agrupados por status,  
**para que** pueda renderizar el Kanban.

**Criterios de Aceptación:**

- [ ] **Dado** que hago GET a `/api/leads`,
  **Cuando** la request se procesa,
  **Entonces** recibo 200 OK con lista de todos los leads

- [ ] **Dado** que existen 50 leads en la BD,
  **Cuando** hago GET /api/leads,
  **Entonces** recibo un array con 50 objetos LeadResponse (id, name, company, email, status, created_at, updated_at)

- [ ] **Dado** que hago GET /api/leads?status=Nuevo,
  **Cuando** se procesa con query param,
  **Entonces** recibo solo los leads con status = "Nuevo"

- [ ] **Dado** que hago GET /api/leads?limit=20&offset=0,
  **Cuando** se procesa con paginación,
  **Entonces** recibo 20 leads + metadata { total: 50, limit: 20, offset: 0 }

- [ ] **Dado** que la response es grande (50 leads),
  **Cuando** inspecciono el tiempo de respuesta,
  **Entonces** es <100ms (p95)

- [ ] **Dado** que ejecuto GET /api/leads sin autenticación,
  **Cuando** se procesa (por ahora),
  **Entonces** recibo datos (auth está en scope futuro)

**Tareas Técnicas:**
- Endpoint: `GET /api/leads`
- Query params: `status` (filter), `limit`, `offset` (pagination)
- Response schema: `{ data: [LeadResponse, ...], meta: { total, limit, offset } }`
- Query optimization: índice en status para rapidez
- Order by: created_at DESC (más recientes primero)
- Logging: request_id, duration_ms, lead_count

**Testing:**
- pytest: test_get_leads_all
- pytest: test_get_leads_filter_by_status
- pytest: test_get_leads_pagination
- pytest: test_get_leads_performance (<100ms)

**Out of Scope:** Frontend rendering (irá en Story 3.2)

---

### Story 3.2: Dashboard Kanban - Render de 4 Columnas (Frontend)

**Tipo:** UI Implementation  
**Estimación:** 13 pts

**Como** ejecutivo de venta,  
**quiero** ver un tablero Kanban con 4 columnas (Nuevo, En contacto, Propuesta, Cerrado),  
**para que** tenga una vista clara del pipeline comercial.

**Criterios de Aceptación:**

- [ ] **Dado** que accedo a `/` (dashboard principal),
  **Cuando** la página carga,
  **Entonces** veo 4 columnas Kanban lado a lado (desktop)

- [ ] **Dado** que existen 50 leads en el sistema,
  **Cuando** las columnas se renderizan,
  **Entonces** cada columna muestra solo sus leads + contador exacto: "Nuevo (12)", "En contacto (8)", "Propuesta (5)", "Cerrado (3)"

- [ ] **Dado** que la página carga,
  **Cuando** inspecciono el contenido,
  **Entonces** veo encabezados de columna con icono de color según estado:
  - Nuevo: Azul #3B82F6
  - En contacto: Naranja #F59E0B
  - Propuesta: Púrpura #A855F7
  - Cerrado: Verde #10B981

- [ ] **Dado** que las columnas se renderizan,
  **Cuando** inspecciono cada columna,
  **Entonces** puedo scrollear verticalmente dentro de la columna si hay muchos leads

- [ ] **Dado** que es viewport mobile (320px),
  **Cuando** la página renderiza,
  **Entonces** las 4 columnas están stackeadas verticalmente (1 por fila)

- [ ] **Dado** que es viewport tablet (768px),
  **Cuando** la página renderiza,
  **Entonces** veo 2 columnas por fila, horizontal scroll habilitado

- [ ] **Dado** que es viewport desktop (1200px+),
  **Cuando** la página renderiza,
  **Entonces** veo 4 columnas sin scroll horizontal

- [ ] **Dado** que otro usuario crea un lead (backend change),
  **Cuando** pasan 2-3 segundos (polling),
  **Entonces** el nuevo lead aparece automáticamente en la columna correcta

**Tareas Técnicas:**
- Componente React: `KanbanBoard.tsx`
- Sub-componentes: `KanbanColumn.tsx`, `LeadCard.tsx`
- Estado global Zustand: `leadsStore` con setter de leads
- TanStack Query: hook personalizado `useLeads()` para polling
- Render conditional por status
- Tailwind CSS para responsive grid
- Colors basados en design tokens (Tailwind custom colors)
- Polling logic: cada 2-3 segundos GET /api/leads
- Optimización: memoization para evitar re-renders innecesarios

**Testing:**
- RTL: test_kanban_renders_4_columns
- RTL: test_kanban_responsive_mobile
- RTL: test_kanban_responsive_tablet
- RTL: test_kanban_responsive_desktop
- RTL: test_lead_counts_accurate
- RTL: test_new_lead_appears_after_polling

**Out of Scope:** Drag & drop (irá en Story 3.3)

---

### Story 3.3: Drag & Drop entre Columnas (Frontend + Backend Sync)

**Tipo:** Feature Implementation  
**Estimación:** 13 pts

**Como** ejecutivo de venta,  
**quiero** arrastrar un lead de una columna a otra para cambiar su estado,  
**para que** el cambio sea intuitivo y visual.

**Criterios de Aceptación:**

- [ ] **Dado** que estoy viendo el Kanban,
  **Cuando** hago hover sobre un lead card,
  **Entonces** el cursor cambia a "grab" (mano agarradora)

- [ ] **Dado** que tengo un lead card bajo el mouse,
  **Cuando** presiono mouse down y arrastro a otra columna,
  **Entonces** el card tiene opacidad 0.7 y sombra grande mientras se arrastra

- [ ] **Dado** que arrastramos un lead de "Nuevo" a "En contacto",
  **Cuando** soltamos el mouse,
  **Entonces** el card se mueve inmediatamente a la columna target (optimistic update)

- [ ] **Dado** que movemos un lead,
  **Cuando** se ejecuta el optimistic update,
  **Entonces** inmediatamente (sin esperar backend) vemos el card en la nueva columna

- [ ] **Dado** que el backend procesa el cambio (PATCH /leads/{id}/status),
  **Cuando** la respuesta retorna 200,
  **Entonces** nada cambia (UI ya estaba correcta)

- [ ] **Dado** que el backend retorna error (5xx),
  **Cuando** la respuesta es error,
  **Entonces** el card se revierte visualmente a su columna original + toast rojo: "Error al guardar. Intenta de nuevo."

- [ ] **Dado** que se revierte un movimiento,
  **Cuando** el usuario hace click en "Reintentar",
  **Entonces** la request se envía nuevamente

- [ ] **Dado** que arrastramos un lead dentro de la MISMA columna,
  **Cuando** lo movemos verticalmente (reordenar),
  **Entonces** el reordenamiento es visual pero NO se envía request al backend (no hay cambio de status)

- [ ] **Dado** que ejecutamos múltiples drag & drops rápidamente,
  **Cuando** cada uno genera un PATCH request,
  **Entonces** todos tienen Idempotency-Key único para evitar duplicados

**Tareas Técnicas:**
- Librería: react-beautiful-dnd
- Implementar drag handlers: onDragStart, onDragEnd
- State manager (Zustand): track dragging lead + source column
- Optimistic update pattern: cambiar UI inmediatamente, luego sync backend
- Retry logic con exponential backoff (500ms, 1000ms, 2000ms)
- Idempotency key generation: uuid() para cada request
- Toast notifications para errores y éxito
- Animation suave (CSS transitions)
- Accesibilidad: keyboard navigation support (Tab + Enter/Space para mover)

**Testing:**
- RTL: test_drag_and_drop_within_status
- RTL: test_drag_and_drop_between_status
- RTL: test_optimistic_update
- RTL: test_revert_on_error
- RTL: test_idempotency_on_rapid_drags
- E2E (Playwright): test_drag_and_drop_end_to_end

**Out of Scope:** Drag entre diferentes leads (reordenar) solo dentro de columna

---

## 🔍 Epic 4: Búsqueda, Filtrado y Alertas

**Epic Goal:** Implementar búsqueda rápida, filtrado flexible y widget de alertas para leads en riesgo.

**Duración estimada:** 16 horas (Day 1 final - Day 2)  
**Criterio de éxito:** Búsqueda <500ms, filtros funcionando, widget actualizado en tiempo real

### Story 4.1: Búsqueda de Leads - API GET /search (Backend)

**Tipo:** Feature Implementation  
**Estimación:** 8 pts

**Como** ejecutivo de venta,  
**quiero** buscar leads por nombre, empresa o email rápidamente,  
**para que** encuentre el lead que necesito sin navegar el Kanban completo.

**Criterios de Aceptación:**

- [ ] **Dado** que hago GET `/api/leads/search?q=juan`,
  **Cuando** la request se procesa,
  **Entonces** recibo lista de leads donde nombre O empresa O email contiene "juan" (case-insensitive)

- [ ] **Dado** que hago GET `/api/leads/search?q=juan`,
  **Cuando** inspecciono el tiempo de respuesta,
  **Entonces** es <500ms incluso con 100+ leads

- [ ] **Dado** que hago GET `/api/leads/search?q=invalid_no_match`,
  **Cuando** no hay coincidencias,
  **Entonces** recibo array vacío []

- [ ] **Dado** que hago GET `/api/leads/search?q=&limit=20`,
  **Cuando** el query está vacío,
  **Entonces** retorno los primeros 20 leads (default behavior)

- [ ] **Dado** que hago GET `/api/leads/search?q=juan&limit=10&offset=0`,
  **Cuando** se procesa con paginación,
  **Entonces** retorno máximo 10 resultados

- [ ] **Dado** que busco "tecn" (parcial),
  **Cuando** hay leads con "TechCorp" y "Tecnológica Inc",
  **Entonces** ambos aparecen en resultados

- [ ] **Dado** que busco "JUAN" (mayúsculas),
  **Cuando** hay leads con "juan garcía" (minúsculas),
  **Entonces** aparecen en resultados (case-insensitive)

**Tareas Técnicas:**
- Endpoint: `GET /api/leads/search`
- Query param: `q` (search term)
- Query params: `limit`, `offset` para paginación
- Query SQL: `WHERE (name ILIKE '%q%' OR company ILIKE '%q%' OR email ILIKE '%q%')`
- Índice PostgreSQL: `idx_leads_search` en (name, company, email)
- Order by: relevancia o created_at DESC
- Response schema: `{ data: [LeadResponse, ...], meta: { total, limit, offset } }`

**Testing:**
- pytest: test_search_leads_by_name
- pytest: test_search_leads_by_company
- pytest: test_search_leads_by_email
- pytest: test_search_leads_case_insensitive
- pytest: test_search_leads_empty_query
- pytest: test_search_leads_performance

**Out of Scope:** Frontend search UI (irá en Story 4.3)

---

### Story 4.2: Widget "Leads en Riesgo" - Backend Calculation

**Tipo:** Feature Implementation  
**Estimación:** 13 pts

**Como** ejecutivo de venta,  
**quiero** ver un widget que me alerte automáticamente de leads que no he contactado en >7 días,  
**para que** no se me olvide ningún lead importante.

**Criterios de Aceptación:**

- [ ] **Dado** que hago GET `/api/leads/risk`,
  **Cuando** existen leads sin cambio de status en >7 días,
  **Entonces** recibo lista de esos leads + metadata { count: N, needs_attention: true/false }

- [ ] **Dado** que un lead fue creado hace 8 días y nunca cambió status,
  **Cuando** hago GET /api/leads/risk,
  **Entonces** ese lead aparece en la lista

- [ ] **Dado** que un lead fue creado hace 6 días,
  **Cuando** hago GET /api/leads/risk,
  **Entonces** ese lead NO aparece (aún en ventana de 7 días)

- [ ] **Dado** que un lead fue creado hace 8 días pero cambió status hace 1 día,
  **Cuando** hago GET /api/leads/risk,
  **Entonces** ese lead NO aparece (updated_at fue hace <7 días)

- [ ] **Dado** que un lead tiene status "Cerrado" hace >7 días,
  **Cuando** hago GET /api/leads/risk,
  **Entonces** ese lead NO aparece (closed leads no son en riesgo)

- [ ] **Dado** que hago GET /api/leads/risk múltiples veces en 5 minutos,
  **Cuando** inspecciono los resultados,
  **Entonces** son consistentes (cálculo es determinístico)

- [ ] **Dado** que agrego un nuevo lead y cambio status hace 1 día,
  **Cuando** pasan 6 días más (total 7 días),
  **Entonces** ese lead aparece en /api/leads/risk

**Tareas Técnicas:**
- Endpoint: `GET /api/leads/risk`
- Query: `SELECT * FROM leads WHERE (status != 'Cerrado') AND (EXTRACT(DAY FROM (NOW() - updated_at)) > 7)`
- Response: `{ data: [LeadResponse, ...], meta: { count: N, needs_attention: bool } }`
- Performance: usa índice en (status, updated_at)
- Caching: resultados cacheados por 1 hora (Redis o simple TTL)

**Testing:**
- pytest: test_leads_in_risk_calculation
- pytest: test_leads_not_in_risk_if_recent_update
- pytest: test_leads_not_in_risk_if_cerrado
- pytest: test_leads_in_risk_consistency

**Out of Scope:** Frontend widget (irá en Story 4.3)

---

### Story 4.3: Búsqueda UI + Widget Leads en Riesgo (Frontend)

**Tipo:** UI Implementation  
**Estimación:** 13 pts

**Como** ejecutivo de venta,  
**quiero** un input de búsqueda visible en el header y un widget que muestre leads en riesgo,  
**para que** pueda buscar y monitorear rápidamente.

**Criterios de Aceptación:**

- [ ] **Dado** que accedo al dashboard,
  **Cuando** cargo la página,
  **Entonces** veo un input de búsqueda en el header con placeholder "Buscar leads por nombre, empresa, email..."

- [ ] **Dado** que escribo "juan" en el input de búsqueda,
  **Cuando** termino de escribir,
  **Entonces** después de 300ms de debounce, GET /api/leads/search?q=juan se ejecuta

- [ ] **Dado** que la búsqueda retorna resultados,
  **Cuando** se renderizan,
  **Entonces** el Kanban se filtra mostrando solo esos leads

- [ ] **Dado** que la búsqueda retorna 0 resultados,
  **Cuando** la búsqueda se ejecuta,
  **Entonces** veo un empty state: "No hay leads que coincidan con 'juan'"

- [ ] **Dado** que hago click en el botón "Limpiar" (X) en el input,
  **Cuando** se ejecuta,
  **Entonces** el input se vacía y el Kanban vuelve a mostrar todos los leads

- [ ] **Dado** que accedo al dashboard,
  **Cuando** cargo la página,
  **Entonces** veo un widget en el header derecha que dice "3 en Riesgo" en color rojo

- [ ] **Dado** que no hay leads en riesgo,
  **Cuando** cargo el dashboard,
  **Entonces** el widget dice "0 en Riesgo" en color neutro (gris)

- [ ] **Dado** que hago click en el widget "3 en Riesgo",
  **Cuando** se ejecuta,
  **Entonces** el Kanban se filtra mostrando solo esos 3 leads en riesgo

- [ ] **Dado** que estoy viendo leads en riesgo,
  **Cuando** hago click en "Ver todos" o el widget nuevamente,
  **Entonces** vuelvo a ver todos los leads

- [ ] **Dado** que ejecuto una búsqueda o filtro,
  **Cuando** pasan 2-3 segundos (polling),
  **Entonces** GET /api/leads/risk se ejecuta y el widget se actualiza si hay cambios

**Tareas Técnicas:**
- Componentes React: `SearchBar.tsx`, `RiskWidget.tsx`
- Integración con Zustand: state para `searchQuery`, `riskFilter`
- TanStack Query: hooks `useSearchLeads()` y `useLeadsAtRisk()`
- Debounce: 300ms en input de búsqueda
- Polling: cada 2-3 segundos para actualizar risk widget
- Conditional rendering: filtra Kanban basado en activeFilters
- Toast notifications: para feedback
- Accessible: input con label oculto, aria-label, semantic HTML

**Testing:**
- RTL: test_search_bar_renders
- RTL: test_search_debounces_300ms
- RTL: test_kanban_filters_by_search
- RTL: test_clear_search_button
- RTL: test_risk_widget_renders
- RTL: test_risk_widget_click_filters
- RTL: test_risk_widget_updates_on_polling

**Out of Scope:** Búsqueda avanzada (múltiples filtros simultáneos)

---

## 📅 Epic 5: Timeline y Auditoría

**Epic Goal:** Implementar modal de detalle de lead con timeline completo de eventos y capacidad de agregar notas.

**Duración estimada:** 12 horas (Day 1.5 - Day 2)  
**Criterio de éxito:** Timeline funcional, eventos completos, notas working

### Story 5.1: Timeline de Actividad - API GET (Backend)

**Tipo:** Feature Implementation  
**Estimación:** 8 pts

**Como** ejecutivo de venta,  
**quiero** ver el historial completo de eventos de un lead (creación, cambios de estado, notas),  
**para que** comprenda el contexto y progreso del lead.

**Criterios de Aceptación:**

- [ ] **Dado** que hago GET `/api/leads/{id}/timeline`,
  **Cuando** el lead existe,
  **Entonces** recibo lista de eventos cronológicamente ordenados (más reciente primero)

- [ ] **Dado** que un lead fue creado, luego cambió status, luego agregamos nota,
  **Cuando** hago GET /api/leads/{id}/timeline,
  **Entonces** veo 3 eventos en orden correcto

- [ ] **Dado** que hago GET /api/leads/{id}/timeline,
  **Cuando** inspecciono cada evento,
  **Entonces** contiene: event_type, description, created_at, created_by_id

- [ ] **Dado** que el evento es type "STATUS_CHANGED",
  **Cuando** inspeccionamos old_value y new_value,
  **Entonces** vemos "Nuevo" → "En contacto" claramente

- [ ] **Dado** que el evento es type "FIELD_EDITED",
  **Cuando** inspeccionamos la descripción,
  **Entonces** vemos cuál campo cambió (ej: "email cambió de ... a ...")

- [ ] **Dado** que hago GET /api/leads/999/timeline (lead no existe),
  **Cuando** se procesa,
  **Entonces** recibo 404 Not Found

**Tareas Técnicas:**
- Endpoint: `GET /api/leads/{id}/timeline`
- Query: `SELECT * FROM lead_audit_log WHERE lead_id = ? ORDER BY created_at DESC`
- Response schema: `{ data: [AuditEvent, ...] }`
- AuditEvent: id, lead_id, event_type, old_value, new_value, description, created_at, created_by_id
- Join con users table para incluir nombre del usuario
- Performance: índice en (lead_id, created_at DESC)

**Testing:**
- pytest: test_get_timeline_for_lead
- pytest: test_timeline_events_in_correct_order
- pytest: test_timeline_not_found

**Out of Scope:** Frontend timeline UI (irá en Story 5.2)

---

### Story 5.2: Timeline UI + Agregar Notas (Frontend)

**Tipo:** UI Implementation  
**Estimación:** 13 pts

**Como** ejecutivo de venta,  
**quiero** hacer click en un lead card, ver su timeline completo y agregar notas,  
**para que** pueda documentar interacciones y contexto.

**Criterios de Aceptación:**

- [ ] **Dado** que hago click en un lead card en el Kanban,
  **Cuando** se ejecuta,
  **Entonces** se abre un modal/drawer con detalles del lead

- [ ] **Dado** que el modal está abierto,
  **Cuando** inspecciono el contenido,
  **Entonces** veo: información básica (nombre, empresa, email, teléfono) + sección de timeline

- [ ] **Dado** que GET /api/leads/{id}/timeline retorna 5 eventos,
  **Cuando** el modal renderiza,
  **Entonces** veo 5 eventos en formato timeline vertical (más reciente arriba)

- [ ] **Dado** que inspecciono cada evento en la timeline,
  **Cuando** veo el contenido,
  **Entonces** cada evento muestra: icono tipo evento, descripción, timestamp, usuario

- [ ] **Dado** que hay un evento "STATUS_CHANGED",
  **Cuando** lo inspeciono,
  **Entonces** veo badges de color: "Nuevo" → "En contacto"

- [ ] **Dado** que el modal está abierto,
  **Cuando** desplazo hacia abajo,
  **Entonces** veo un input para agregar nota: "Agregar nota..." + botón "Guardar"

- [ ] **Dado** que escribo una nota y hago click "Guardar",
  **Cuando** se ejecuta POST /api/leads/{id}/notes,
  **Entonces** la nota se agrega al timeline inmediatamente (optimistic)

- [ ] **Dado** que cierro el modal,
  **Cuando** vuelvo a hacer click en el mismo lead,
  **Entonces** la nota que agregué sigue ahí (persiste)

- [ ] **Dado** que el modal está abierto,
  **Cuando** hago click en botón "Editar",
  **Entonces** puedo editar los campos básicos del lead (nombre, empresa, etc.)

- [ ] **Dado** que edité campos,
  **Cuando** hago click "Guardar",
  **Entonces** PUT /api/leads/{id} se ejecuta + nuevo evento aparece en timeline "FIELD_EDITED"

**Tareas Técnicas:**
- Componente React: `LeadDetailModal.tsx`
- Sub-componentes: `TimelineView.tsx`, `LeadInfo.tsx`, `AddNoteForm.tsx`
- Integración con TanStack Query: `useLeadTimeline(leadId)`
- Integración con API: POST /api/leads/{id}/notes
- State management: Zustand para selected lead
- Modal backdrop: click outside para cerrar
- Optimistic updates: mostrar nota antes de confirmar
- Accesibilidad: focus trap, keyboard support
- Conditional rendering: edit mode vs read mode

**Testing:**
- RTL: test_lead_detail_modal_opens
- RTL: test_timeline_renders_all_events
- RTL: test_add_note_optimistic_update
- RTL: test_edit_lead_from_modal
- E2E (Playwright): test_lead_detail_complete_flow

**Out of Scope:** Timeline filtering por tipo de evento (future feature)

---

## 🎨 Epic 6: UX/UI, Responsivo y Accesibilidad

**Epic Goal:** Pulir la interfaz para mobile, tablet y desktop; agregar estados de loading/error; asegurar accesibilidad.

**Duración estimada:** 16 horas (Day 1.5 - Day 2)  
**Criterio de éxito:** UI completamente responsive, accesible, estados visuales claros

### Story 6.1: Diseño Responsivo - Mobile, Tablet, Desktop

**Tipo:** UI Polish  
**Estimación:** 13 pts

**Como** ejecutivo de venta,  
**quiero** usar el CRM en mi teléfono mientras estoy en la calle,  
**para que** pueda ver y actualizar leads sin estar en la oficina.

**Criterios de Aceptación:**

- [ ] **Dado** que accedo al dashboard en viewport 320px (mobile),
  **Cuando** la página renderiza,
  **Entonces** las 4 columnas están stackeadas verticalmente (1 columna por fila)

- [ ] **Dado** que estoy en mobile,
  **Cuando** inspecciono los lead cards,
  **Entonces** la información es legible (texto >12px), touch targets >44px

- [ ] **Dado** que estoy en mobile,
  **Cuando** hago click en "+ Nuevo Lead",
  **Entonces** el modal se abre fullscreen o casi fullscreen (más usable que desktop)

- [ ] **Dado** que estoy en tablet (768px),
  **Cuando** la página renderiza,
  **Entonces** veo 2 columnas por fila, scroll horizontal para columnas 3-4

- [ ] **Dado** que estoy en desktop (1200px+),
  **Cuando** la página renderiza,
  **Entonces** veo 4 columnas sin scroll horizontal

- [ ] **Dado** que estoy en cualquier viewport,
  **Cuando** hago drag & drop en lead cards,
  **Entonces** el comportamiento es consistente (no errores de touch)

- [ ] **Dado** que estoy en mobile,
  **Cuando** veo el input de búsqueda,
  **Entonces** el input ocupa >80% del width disponible

- [ ] **Dado** que estoy en mobile,
  **Cuando** abro el modal de detalles de lead,
  **Entonces** puedo scrollear contenido sin que se mueva el fondo

- [ ] **Dado** que hago rotate de móvil landscape → portrait,
  **Cuando** se ejecuta,
  **Entonces** el layout se adapta sin errores (media queries funcionan)

**Tareas Técnicas:**
- Tailwind CSS responsive classes: sm:, md:, lg:, xl:
- Mobile-first approach (diseñar para 320px, luego escalar)
- Touch-friendly targets (min 44x44px)
- Viewport meta tag correcto
- CSS media queries para puntos de quiebre: 320px, 768px, 1200px
- SVG icons que escalen
- Font sizes escalonadas por viewport
- Padding/margin escalable
- Flexbox/grid para layouts flexibles
- No fixed widths (usar max-width)

**Testing:**
- Playwright: test_responsive_mobile_320
- Playwright: test_responsive_tablet_768
- Playwright: test_responsive_desktop_1200
- Manual: verificar en navegador real

**Out of Scope:** Versión nativa mobile (app nativa)

---

### Story 6.2: Estados UI - Loading, Error, Empty State

**Tipo:** UI Polish  
**Estimación:** 8 pts

**Como** ejecutivo de venta,  
**quiero** ver estados visuales claros (cargando, error, vacío),  
**para que** sepa qué está pasando cuando algo toma tiempo o falla.

**Criterios de Aceptación:**

- [ ] **Dado** que cargo el dashboard por primera vez,
  **Cuando** GET /api/leads está en progreso,
  **Entonces** veo un spinner centrado + "Cargando leads..." (no blanco en blanco)

- [ ] **Dado** que GET /api/leads falla (5xx error),
  **Cuando** la request finaliza,
  **Entonces** veo un banner rojo con error + icono + botón "Reintentar"

- [ ] **Dado** que hago click en "Reintentar",
  **Cuando** se ejecuta,
  **Entonces** la request se reintenta (no vuelve a la página principal)

- [ ] **Dado** que el sistema tiene 0 leads,
  **Cuando** accedo al dashboard,
  **Entonces** veo empty state: imagen + "No hay leads aún" + botón "Crear primer lead"

- [ ] **Dado** que busco "zzzzz" (sin resultados),
  **Cuando** la búsqueda finaliza,
  **Entonces** veo empty state: "No hay leads que coincidan con 'zzzzz'"

- [ ] **Dado** que hago click en "+ Nuevo Lead",
  **Cuando** el formulario se envía,
  **Entonces** veo spinner en el botón "Crear Lead" (cambio visual claro)

- [ ] **Dado** que la creación es exitosa,
  **Cuando** finaliza,
  **Entonces** veo toast verde "Lead creado exitosamente" + modal cierra

- [ ] **Dado** que la creación falla,
  **Cuando** finaliza,
  **Entonces** veo toast rojo con mensaje de error + modal permanece abierto

- [ ] **Dado** que estoy cargando el timeline de un lead,
  **Cuando** GET /api/leads/{id}/timeline está en progreso,
  **Entonces** veo un skeleton loading en la sección de timeline (no blanco vacío)

**Tareas Técnicas:**
- Componentes React: `LoadingSpinner.tsx`, `ErrorBanner.tsx`, `EmptyState.tsx`, `SkeletonLoader.tsx`
- Toast notifications: react-hot-toast o similar
- Spinner SVG o animation CSS
- Condicionales en renders basado en estado (loading, error, success, empty)
- Retry buttons con onClick handlers
- Accesibilidad: role="status" para announcements
- Testing visuales: screenshot tests si es posible

**Testing:**
- RTL: test_loading_spinner_appears
- RTL: test_error_banner_appears_on_error
- RTL: test_retry_button_works
- RTL: test_empty_state_renders
- RTL: test_toast_notifications

**Out of Scope:** Animaciones complejas

---

### Story 6.3: Accesibilidad - Focus Management, ARIA, Keyboard Navigation

**Tipo:** Quality/Compliance  
**Estimación:** 13 pts

**Como** usuario con necesidades de accesibilidad,  
**quiero** poder navegar y usar el CRM con teclado + screen reader,  
**para que** el sistema sea inclusivo.

**Criterios de Aceptación:**

- [ ] **Dado** que navego con Tab,
  **Cuando** presiono Tab,
  **Entonces** veo un focus outline visible azul (#3B82F6, contraste >3:1) alrededor de cada elemento interactivo

- [ ] **Dado** que estoy en el input de búsqueda,
  **Cuando** presiono Enter,
  **Entonces** se ejecuta la búsqueda (no requiere button click)

- [ ] **Dado** que tengo el foco en un modal,
  **Cuando** presiono Escape,
  **Entonces** el modal cierra (trap del foco dentro del modal)

- [ ] **Dado** que tengo el foco en un lead card,
  **Cuando** presiono Enter o Space,
  **Entonces** se abre el modal de detalles

- [ ] **Dado** que tengo el foco en "Nuevo" button,
  **Cuando** presiono Enter,
  **Entonces** se abre el modal de creación

- [ ] **Dado** que inspecciono los inputs del formulario,
  **Cuando** analizo,
  **Entonces** cada input tiene label asociado: `<label for="input-name">`

- [ ] **Dado** que un input tiene error,
  **Cuando** inspecciono,
  **Entonces** el error tiene `aria-live="polite"` para anunciarse en screen reader

- [ ] **Dado** que hago drag & drop de un lead,
  **Cuando** lo suelto,
  **Entonces** se anuncia la acción: "Lead movido de Nuevo a En contacto" (aria-live)

- [ ] **Dado** que uso un screen reader,
  **Cuando** accedo al dashboard,
  **Entonces** veo headings semánticos `<h1>`, `<h2>` estructurados correctamente

- [ ] **Dado** que inspecciono las columnas del Kanban,
  **Cuando** analizo el markup,
  **Entonces** uso `<section role="group" aria-label="Nuevo (12 leads)">`

**Tareas Técnicas:**
- Semantic HTML: `<button>`, `<input>`, `<label>`, `<heading>`
- ARIA attributes: aria-label, aria-describedby, aria-live, role
- Focus styles: visibles en todos los elementos interactivos
- Focus management: modal trap, restore focus cuando cierra
- Keyboard handlers: Enter, Space, Escape, Tab
- Color contrast: verificar que textos tengan >3:1 contrast
- Lighthouse accessibility audit
- Screen reader testing: NVDA o similar

**Testing:**
- Lighthouse: score >90 accesibilidad
- Manual: keyboard navigation completa
- Manual: screen reader testing
- axe-core para auditoría automática

**Out of Scope:** Localización a múltiples idiomas

---

## ⚡ Epic 7: Performance, Optimización y Confiabilidad

**Epic Goal:** Optimizar queries, implementar retry logic, monitoring, asegurar <1s sync y <100ms API responses.

**Duración estimada:** 16 horas (Day 1.5 - Day 2)  
**Criterio de éxito:** Todas las operaciones cumplen SLAs de performance

### Story 7.1: Database Query Optimization & Indexing

**Tipo:** Performance Optimization  
**Estimación:** 13 pts

**Como** desarrollador/DevOps,  
**quiero** que las queries de BD sean rápidas incluso con 1000+ leads,  
**para que** el sistema escale sin degradación.

**Criterios de Aceptación:**

- [ ] **Dado** que tengo 1000 leads en la BD,
  **Cuando** ejecuto GET /api/leads,
  **Entonces** la query tarda <50ms (p95) gracias a índices

- [ ] **Dado** que ejecuto GET /api/leads/search?q=juan,
  **Cuando** procesa 1000 leads,
  **Entonces** retorna en <100ms (p95)

- [ ] **Dado** que ejecuto GET /api/leads/risk,
  **Cuando** calcula leads sin cambio >7 días,
  **Entonces** tarda <50ms (p95) gracias a índice en (status, updated_at)

- [ ] **Dado** que ejecuto GET /api/leads/{id}/timeline,
  **Cuando** retorna 50 eventos,
  **Entonces** tarda <30ms (p95)

- [ ] **Dado** que ejecuto PATCH /api/leads/{id}/status,
  **Cuando** actualiza el lead + inserta audit log,
  **Entonces** tarda <40ms (p95, excluyendo network)

- [ ] **Dado** que analizo queries con EXPLAIN,
  **Cuando** veo el plan de ejecución,
  **Entonces** no hay sequential scans (todos usan índices)

- [ ] **Dado** que inspecciono el índice idx_leads_search,
  **Cuando** analizo,
  **Entonces** está creado en (name, company, email) y es usado por ILIKE queries

**Tareas Técnicas:**
- Crear índices:
  - `CREATE INDEX idx_leads_email ON leads(email)`
  - `CREATE INDEX idx_leads_status ON leads(status)`
  - `CREATE INDEX idx_leads_updated_at ON leads(updated_at DESC)`
  - `CREATE INDEX idx_leads_search ON leads(name, company, email)` (multicolumna para ILIKE)
  - `CREATE INDEX idx_lead_audit_log_lead_id ON lead_audit_log(lead_id, created_at DESC)`
- Query optimization: SELECT solo columnas necesarias, no SELECT *
- N+1 prevention: eager loading con join, no loop queries
- Connection pooling: SQLAlchemy pool_size=20, max_overflow=0
- EXPLAIN ANALYZE para verificar planes de ejecución

**Testing:**
- SQL: EXPLAIN ANALYZE en cada query crítica
- Performance test: pytest con medición de duración
- Load test: simular 100 requests simultáneos, verificar <200ms p95

**Out of Scope:** Sharding o particionado de tabla

---

### Story 7.2: Optimistic Updates & Retry Logic (Frontend)

**Tipo:** Feature Implementation  
**Estimación:** 13 pts

**Como** ejecutivo de venta,  
**quiero** que los cambios aparezcan inmediatamente en la UI (sin esperar backend),  
**para que** la experiencia sea rápida incluso si la red es lenta.

**Criterios de Aceptación:**

- [ ] **Dado** que arrastra un lead de "Nuevo" a "En contacto",
  **Cuando** suelta el mouse,
  **Entonces** el card se mueve INMEDIATAMENTE a la nueva columna (no espera al backend)

- [ ] **Dado** que el backend procesa PATCH /api/leads/{id}/status,
  **Cuando** retorna 200 OK,
  **Entonces** nada cambia en la UI (ya estaba correcta por optimistic update)

- [ ] **Dado** que el backend retorna error (5xx),
  **Cuando** la respuesta llega,
  **Entonces** el card se REVIERTE visualmente a su columna original

- [ ] **Dado** que se revierte un cambio,
  **Cuando** inspecciono,
  **Entonces** hay un toast rojo: "Error al guardar. Intenta de nuevo." + botón Reintentar

- [ ] **Dado** que hago click en "Reintentar",
  **Cuando** se ejecuta,
  **Entonces** la request se reintenta (con exponential backoff: 500ms, 1000ms, 2000ms)

- [ ] **Dado** que la primera retry falla,
  **Cuando** espero 1000ms y reintenta,
  **Entonces** la segunda retry tiene oportunidad de éxito

- [ ] **Dado** que fallan 3 retries,
  **Cuando** termina,
  **Entonces** un toast final dice: "No se pudo guardar. Intenta más tarde."

- [ ] **Dado** que envío múltiples cambios rápidamente,
  **Cuando** cada uno tiene Idempotency-Key único,
  **Entonces** no hay duplicados en la BD incluso si las requests se reenvían

**Tareas Técnicas:**
- State manager (Zustand): track pending updates
- Optimistic update pattern: local state change antes de API call
- Error handling: revert UI on error
- Retry logic: exponential backoff (500ms, 1000ms, 2000ms)
- Idempotency-Key: `import { v4 as uuidv4 }; const key = uuidv4()`
- Toast notifications: success, error, retry
- Request deduplication: si 2 cambios idénticos en <100ms, enviar solo 1
- Backend idempotency: cache responses por 5 minutos con Idempotency-Key

**Testing:**
- RTL: test_optimistic_update_success
- RTL: test_optimistic_update_revert_on_error
- RTL: test_retry_logic_exponential_backoff
- RTL: test_idempotency_key_prevents_duplicates

**Out of Scope:** WebSocket real-time (polling es suficiente)

---

### Story 7.3: API Response Logging & Monitoring

**Tipo:** Operations/Monitoring  
**Estimación:** 8 pts

**Como** DevOps/Developer,  
**quiero** logs detallados de cada request (latencia, status, errores),  
**para que** pueda monitorear performance y debuggear problemas.

**Criterios de Aceptación:**

- [ ] **Dado** que ejecuto GET /api/leads,
  **Cuando** la request se procesa,
  **Entonces** en logs aparece: `[2026-06-08 10:30:45] request_id=abc123 method=GET path=/api/leads status=200 duration_ms=45 lead_count=50`

- [ ] **Dado** que ejecuto POST /api/leads con error,
  **Cuando** la request falla,
  **Entonces** en logs aparece: `[...] request_id=def456 method=POST path=/api/leads status=400 duration_ms=12 error=email_duplicate`

- [ ] **Dado** que una query tarda >200ms,
  **Cuando** log se escribe,
  **Entonces** aparece un warning: `[WARN] request_id=ghi789 slow_query duration_ms=250 endpoint=/api/leads/search`

- [ ] **Dado** que inspecciono logs,
  **Cuando** filtering por request_id,
  **Entonces** veo toda la trazabilidad: request in → query → response out

- [ ] **Dado** que logs se acumulan,
  **Cuando** el archivo alcanza 100MB,
  **Entonces** se rota a backup (logs.1, logs.2, etc.)

- [ ] **Dado** que acceso a los logs,
  **Cuando** busco por endpoint,
  **Entonces** puedo ver historial de requests y latencias

**Tareas Técnicas:**
- Middleware FastAPI: logging en request enter y exit
- Log format: timestamp, request_id, method, path, status, duration_ms, user_id, error (if any)
- Request ID generation: UUID en header `X-Request-ID`, propagar a logs
- Performance thresholds: warn si >200ms, error si >1000ms
- Log rotation: logrotate o Python logging handler
- Structured logging: JSON format para parsing
- Logging library: Python `logging` module con handlers

**Testing:**
- Verificar logs en stdout/file después de requests
- Manual: curl y verificar que log aparece

**Out of Scope:** ELK stack o alerting (futuro)

---

## 🧪 Epic 8: Testing, Documentación y Preparación Demo

**Epic Goal:** Coverage de tests >70%, documentación completa, runbook para demo sin fricción.

**Duración estimada:** 16 horas (Day 1.5 - Day 2)  
**Criterio de éxito:** Tests pasan, documentación clara, demo runbook funcional

### Story 8.1: Backend Unit Tests & Integration Tests

**Tipo:** Quality/Testing  
**Estimación:** 13 pts

**Como** desarrollador,  
**quiero** tests exhaustivos que verifiquen cada endpoint y flujo,  
**para que** tenga confianza en el código y evite regresiones.

**Criterios de Aceptación:**

- [ ] **Dado** que ejecuto `pytest`,
  **Cuando** finaliza,
  **Entonces** >70% de cobertura de líneas (backend)

- [ ] **Dado** que ejecuto `pytest -v`,
  **Cuando** finaliza,
  **Entonces** todos los tests pasan sin fallos (0 failures)

- [ ] **Dado** que inspecciono los tests,
  **Cuando** analizo,
  **Entonces** hay cobertura para:
  - CREATE lead (valid, duplicate email, invalid data)
  - READ leads (all, filter by status, search)
  - UPDATE lead (valid, invalid email, not found)
  - CHANGE status (valid, invalid, audit log)
  - TIMELINE (events order, not found)
  - LEADS AT RISK (calculation, >7 days)

- [ ] **Dado** que hago fixture en pytest,
  **Cuando** uso `@pytest.fixture`,
  **Entonces** setup/teardown es limpio (no lleva >100ms por test)

- [ ] **Dado** que ejecuto tests,
  **Cuando** finaliza,
  **Entonces** BD de test está limpia (no deja datos residuales)

- [ ] **Dado** que hay test para async endpoint,
  **Cuando** usa `@pytest.mark.asyncio`,
  **Entonces** funciona correctamente con FastAPI async

- [ ] **Dado** que hay mock de BD o dependencias,
  **Cuando** uso `unittest.mock` o `pytest-mock`,
  **Entonces** mocks son precisos y tests son aislados

**Tareas Técnicas:**
- pytest setup: conftest.py con fixtures
- Database fixtures: session de test, rollback después de cada test
- Async fixtures: pytest-asyncio para async context
- Mock dependencies: FastAPI dependency overrides
- Coverage reporting: `pytest --cov` con target >70%
- Test structure: test files en `tests/` folder
- Test naming: `test_function_name_scenario`

**Testing:**
- Run: `pytest -v --cov`
- Expected: 0 failures, >70% coverage

**Out of Scope:** Performance testing (load testing)

---

### Story 8.2: End-to-End Tests (Playwright)

**Tipo:** Quality/Testing  
**Estimación:** 13 pts

**Como** QA,  
**quiero** tests e2e que verifiquen flujos reales de usuario,  
**para que** sepamos que el sistema funciona end-to-end.

**Criterios de Aceptación:**

- [ ] **Dado** que ejecuto `npx playwright test`,
  **Cuando** finaliza,
  **Entonces** todos los e2e tests pasan sin fallos

- [ ] **Dado** que inspecciono los tests e2e,
  **Cuando** analizo,
  **Entonces** hay cobertura para flujos:
  - Crear lead → aparece en Kanban
  - Mover lead entre columnas (drag & drop)
  - Abrir modal de lead → editar → guardar
  - Buscar lead
  - Ver widget "leads en riesgo"

- [ ] **Dado** que ejecuto e2e en headless mode,
  **Cuando** finaliza,
  **Entonces** los tests pasan (no dependen de UI visual)

- [ ] **Dado** que un test falla,
  **Cuando** inspecciono,
  **Entonces** hay screenshot y video de falha para debugging

- [ ] **Dado** que los tests pasan,
  **Cuando** verifico cobertura,
  **Entonces** >80% de rutas de usuario están cubiertas

**Tareas Técnicas:**
- Playwright setup: `npx playwright install`
- Test structure: tests/e2e/ folder
- Page objects: abstracción de elementos UI
- Fixtures: test database + frontend running
- Screenshots on failure: auto-capture
- Video recording: para debugging
- Async/await para flujos multi-step

**Testing:**
- Run: `npx playwright test`
- Expected: 0 failures

**Out of Scope:** Visual regression testing

---

### Story 8.3: Documentación y Runbook para Demo

**Tipo:** Documentation  
**Estimación:** 13 pts

**Como** presenter / partner,  
**quiero** documentación clara y runbook para ejecutar la demo sin sorpresas,  
**para que** la presentación del 8 de junio sea fluida.

**Criterios de Aceptación:**

- [ ] **Dado** que leo README.md en la raíz del repo,
  **Cuando** inspecciono,
  **Entonces** contiene:
  - Overview del proyecto
  - Prerequisites (Docker, Node.js, Python versiones)
  - Setup rápido: `docker-compose up`
  - URLs de acceso (frontend 3000, backend 8000)
  - Credenciales demo (demo/demo123)
  - Troubleshooting (errores comunes)

- [ ] **Dado** que accedo a `/docs` en el backend,
  **Cuando** cargo `http://localhost:8000/docs`,
  **Entonces** veo Swagger UI con:
  - Todos los endpoints documentados
  - Schemas de request/response claros
  - Ejemplos de payloads
  - Status codes esperados

- [ ] **Dado** que leo ARCHITECTURE.md,
  **Cuando** inspecciono,
  **Entonces** contiene:
  - Stack tech (React, FastAPI, PostgreSQL, Docker)
  - Decisiones arquitectónicas clave
  - Diagrama de componentes (ASCII o imagen)
  - Patrones utilizados (optimistic updates, idempotency)

- [ ] **Dado** que leo DEMO_RUNBOOK.md,
  **Cuando** inspecciono,
  **Entonces** contiene pasos exactos:
  - Paso 1: `docker-compose up`
  - Paso 2: Abrir frontend http://localhost:3000
  - Paso 3: Crear 5 leads manualmente (con valores de ejemplo)
  - Paso 4: Mover leads entre estados
  - Paso 5: Mostrar widget "Leads en Riesgo"
  - Paso 6: Buscar un lead
  - Paso 7: Abrir modal y mostrar timeline
  - Timing esperado: ~5 minutos

- [ ] **Dado** que hay ER diagram (Entity Relationship),
  **Cuando** inspecciono,
  **Entonces** muestra tablas (leads, lead_audit_log, users) y sus relaciones

- [ ] **Dado** que ejecuto el runbook,
  **Cuando** sigo los pasos,
  **Entonces** no hay sorpresas ni errores no documentados

**Tareas Técnicas:**
- README.md: con setup, troubleshooting, quickstart
- ARCHITECTURE.md: decisiones, diagrama, patrones
- API.md o /docs Swagger: endpoints documentados
- ER_DIAGRAM.md: tabla visualmente clara
- DEMO_RUNBOOK.md: pasos exactos, timing, valores de ejemplo
- CHANGELOG.md: versiones y cambios
- CONTRIBUTING.md: guía para contribuidores (opcional)
- Code comments: en funciones complejas
- Docstrings: en Python modules/classes/functions
- TypeScript JSDoc: en funciones críticas frontend

**Testing:**
- Manual: leer cada documento y verificar exactitud
- Manual: ejecutar runbook completo sin errores

**Out of Scope:** Video tutorial

---

## 📊 Resumen de Epics & Estimación

| Epic | Historias | Pts Est. | Duración | Status |
|------|-----------|----------|----------|--------|
| Epic 1: Infraestructura | 4 | 42 | 8h | Próximo |
| Epic 2: Gestión CRUD | 4 | 47 | 20h | Próximo |
| Epic 3: Kanban | 3 | 34 | 20h | Próximo |
| Epic 4: Búsqueda & Alertas | 3 | 34 | 16h | Próximo |
| Epic 5: Timeline & Auditoria | 2 | 21 | 12h | Próximo |
| Epic 6: UX/UI & Accesibilidad | 3 | 34 | 16h | Próximo |
| Epic 7: Performance | 3 | 34 | 16h | Próximo |
| Epic 8: Testing & Docs | 3 | 39 | 16h | Próximo |
| **TOTAL** | **26** | **285** | **136h** | **IN PROGRESS** |

---

## 🎯 Próximos Pasos

1. **Validación:** ¿Confirmas que estos requisitos alinean con tu visión?
2. **Priorización:** ¿Hay stories que deben priorizarse antes que otras?
3. **Estimación:** ¿Las estimaciones (en story points) te parecen realistas?
4. **Asignación:** ¿Quién está a cargo de cada epic/story?
5. **Seguimiento:** ¿Sprint planning el [DATE]? ¿Daily standups a las [TIME]?
