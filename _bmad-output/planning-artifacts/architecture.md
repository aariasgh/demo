---
stepsCompleted: [1]
inputDocuments: 
  - "prd-Demo-2026-06-07/prd.md"
  - "D-Design-System/ALINEACION-UX-ARQUITECTURA.md"
  - "D-Design-System/WINSTON-DECISIONES-ARQUITECTONICAS.md"
  - "D-Design-System/HANDOFF-AMELIA.md"
  - "D-Design-System/UX-01-WIREFRAMES-DETALLADOS.md"
  - "D-Design-System/UX-02-FLUJOS-DE-USUARIO.md"
  - "D-Design-System/UX-03-ESPECIFICACIONES-COMPONENTES.md"
  - "D-Design-System/UX-04-ESPECIFICACIONES-INTERACCION.md"
  - "D-Design-System/UX-05-DESIGN-TOKENS.md"
workflowType: 'architecture'
project_name: 'Demo - Mini CRM'
user_name: 'Anuar'
date: '2026-06-07'
status: 'VALIDATED & FINALIZED'
---

# 🏗️ Arquitectura Técnica — Mini CRM de Seguimiento de Clientes

**Documento:** Decisiones Arquitectónicas Formales Validadas  
**De:** Winston (System Architect)  
**Para:** Amelia (Developer), Sally (UX), Equipo Técnico  
**Fecha:** 2026-06-07  
**Presentación:** 2026-06-08  
**Estado:** ✅ FINALIZADO — Listo para Implementación  

---

## 📌 Resumen Ejecutivo

### La Apuesta Arquitectónica

Entregamos un **CRM funcional, escalable y documentado en 48 horas** priorizando:
1. **Viabilidad Inmediata** — Mañana debe funcionar, sin riesgos técnicos
2. **Escalabilidad Embebida** — Demo ~50 leads, producción 10k+ leads sin refactor
3. **UX como Driver Arquitectónico** — Si Sally especifica comportamiento, la arquitectura se adapta
4. **Código Profesional** — Documentado, testeable, transferible a equipos grandes

### Stack Decidido (NO NEGOCIABLE)

| Componente | Tecnología | Rationale |
|-----------|-----------|-----------|
| **Frontend** | React 18 + TypeScript | State complejo, optimistic updates, comunidad grande |
| **State Management** | Zustand | Ligero, tipado, perfecto para este scope |
| **HTTP/Caching** | TanStack Query (@tanstack/react-query) | Dedup automático, caching, síncrono |
| **Drag & Drop** | react-beautiful-dnd | Estándar Kanban, librería confiable |
| **Backend** | FastAPI + Python 3.11+ | Async nativo, performance, OpenAPI automático |
| **ORM** | SQLAlchemy 2.0 + asyncpg | Async, migraciones limpias, type hints |
| **Migraciones** | Alembic | Versionado de schema, rollback seguro |
| **Base de Datos** | PostgreSQL 15+ | ACID, índices avanzados, RLS future-ready |
| **Containerización** | Docker + Docker Compose | 3 servicios: Backend, Frontend, PostgreSQL |
| **Deployment** | Docker Compose (local demo) | `docker-compose up` y listo |

---

## 🎯 Decisiones Arquitectónicas Críticas

### Decisión #1: Actualización en Tiempo Real — Optimistic Updates

**Pregunta UX:** "¿Cómo hacemos que los cambios se reflejen sin recargar la página?"

**Decision:** ✅ **Optimistic Update Pattern**

**Rationale:**
- Sally especificó: "cambios se reflejan en tiempo real" → Optimistic es el estándar
- Con 50 leads en LAN (~10ms latencia), es viable y esperado
- Patrón estándar en CRM modernos (Salesforce, HubSpot)
- Requiere idempotencia en backend como segunda línea de defensa

**Flujo de Implementación:**

```
Usuario arrastra Lead de "Nuevo" → "En contacto"
    ↓
Frontend:
  1. Actualiza `state.leads[i].status = "En contacto"` INMEDIATAMENTE
  2. UI se re-renderiza (card se mueve al instante)
  3. Dispara en background: PATCH /api/leads/{id}/status
  4. Espera respuesta del servidor (no bloquea)
    
Si éxito (200):
  ✅ Nada. UI ya está correcta. Continuamos.

Si error (5xx):
  1. Retry automático (máx 2 intentos con backoff exponencial)
  2. Si falla completamente: Revert UI visualmente
  3. Toast rojo: "Error al guardar. Intenta de nuevo."
  4. Usuario puede clickear "Reintentar" manualmente
```

**Implicaciones:**

| Lado | Requerimiento |
|------|---------------|
| **Frontend** | State manager (Zustand) + retry logic con exponential backoff |
| **Backend** | Idempotency keys (header `Idempotency-Key: <uuid>`) + cache en Redis |
| **UX** | Feedback visual claro: spinner si >200ms, rollback + error si falla |

**Validación con Sally (UX):** ✅ Cumple requerimiento "tiempo real sin recargar"

---

### Decisión #2: Performance — SLA p95 < 1 segundo

**Pregunta UX:** "¿Cuánto tarda actualizar un lead?"

**Decision:** ✅ **p95 < 1 segundo (incluida latencia de red)**

**Rationale:**
- Sally especificó: "<1s sync" → es ambicioso pero viable
- Demo en LAN (~10ms): ~900ms para procesamiento
- Producción internet (~50ms): ~950ms para procesamiento
- Índices PostgreSQL + queries optimizadas lo hacen posible

**Desglose de Latencia por Endpoint:**

| Endpoint | Operación | Network | DB Query | API Logic | **p95 Total** |
|----------|-----------|---------|----------|-----------|---------------|
| `GET /leads` | Listar 50 leads + filtro | 10ms | 50ms | 20ms | **80ms** |
| `PATCH /leads/{id}/status` | Mover lead | 10ms | 30ms | 20ms | **60ms** |
| `GET /leads/search?q=X` | Buscar 10/50 leads | 10ms | 80ms | 20ms | **110ms** |
| `POST /leads` | Crear lead | 10ms | 40ms | 30ms | **80ms** |
| `GET /leads/{id}/timeline` | Timeline 10 eventos | 10ms | 20ms | 15ms | **45ms** |

**Cómo lo Garantizamos:**

1. **Índices PostgreSQL** (ver sección Schema)
2. **Connection Pooling** — SQLAlchemy + asyncpg maneja ~20 conexiones
3. **Query Optimization** — SELECT solo columnas necesarias, no N+1 queries
4. **Monitoring** — Logging de `request_id, duration_ms, endpoint, status`

**Si No Se Cumple:**
- Alertas diarias: reportar endpoints >200ms
- Corrección: agregar índice, reescribir query, o ajustar UX

**Validación con Sally (UX):** ✅ Cumple requerimiento "<1s"

---

### Decisión #3: Búsqueda — Backend-Driven (API Endpoint)

**Pregunta UX:** "¿Dónde filtramos: frontend o backend?"

**Decision:** ✅ **Backend (GET /api/leads/search)**

**Rationale:**
- Demo: 50 leads. Producción: 10k+ leads
- Descargar 10k leads = 1-2MB + lento = no escalable
- Backend search funciona con cualquier tamaño
- Desde ya preparamos para escala (BMAD principle)

**Flujo:**

```
Usuario escribe "juan" en input búsqueda
    ↓
Frontend:
  1. Debounce 300ms (evita bombardear server)
  2. GET /api/leads/search?q=juan&limit=20
  3. Muestra "Buscando..." mientras espera
    
Backend:
  1. Query: SELECT * FROM leads 
           WHERE (name ILIKE '%juan%' 
                  OR company ILIKE '%juan%' 
                  OR email ILIKE '%juan%')
                  AND created_by_id = :user_id
           LIMIT 20
  2. Usa índice `idx_leads_search` para rapidez
  3. Retorna JSON con 20 resultados
    
Frontend:
  1. Renderiza resultados
  2. Usuario puede hacer click en uno para abrir
```

**Implicaciones:**

| Lado | Requerimiento |
|------|---------------|
| **Frontend** | Input con debounce 300ms + TanStack Query para request dedup |
| **Backend** | GET /api/leads/search con ILIKE + índice multicolumna |
| **Database** | Índice `idx_leads_search` en (name, company, email) |

**Performance Esperado:** ~110ms p95 (ver tabla arriba)

**Validación con Sally (UX):** ✅ Cumple "<500ms para búsqueda"

---

### Decisión #4: Validación de Email — Inline + UNIQUE Constraint

**Pregunta UX:** "¿Cuándo validamos que email es único?"

**Decision:** ✅ **Inline (onBlur) + UNIQUE constraint como fallback**

**Rationale:**
- Mejor UX: feedback al salir del campo
- Seguro: UNIQUE constraint en BD como segunda línea (previene race conditions)
- Viable: una query por keystroke es negligible para 50 usuarios

**Flujo:**

```
Usuario escribe email en formulario
    ↓
Frontend:
  1. onBlur (sale del campo)
  2. POST /api/leads/validate-email?email=juan@corp.com
  3. Muestra ✅ si disponible, ❌ si ocupado
  4. Botón "Guardar" deshabilitado si ❌
    
Backend:
  SELECT EXISTS(SELECT 1 FROM leads WHERE email = ? AND deleted_at IS NULL)
  → Retorna { "available": true/false }
    
Si Usuario clickea "Guardar":
  1. POST /api/leads {name, company, email, ...}
  2. Backend intenta INSERT
  3. Si UNIQUE constraint viola (race condition):
     → Retorna 409 Conflict: "Email ya existe. Intenta otro."
  4. Frontend muestra error claro
```

**Implicaciones:**

| Lado | Requerimiento |
|------|---------------|
| **Frontend** | POST /validate-email en onBlur + state validation |
| **Backend** | Endpoint validate-email + manejo IntegrityError en POST |
| **Database** | UNIQUE constraint en `leads(email)` |

**Race Condition Handling:**
- Raro pero posible: dos usuarios crean mismo email simultáneamente
- UNIQUE constraint garantiza que solo uno gana (ACID)
- User 2 recibe 409 y puede intentar otro email
- No hay corrupción de datos

**Validación con Sally (UX):** ✅ Cumple "validación rápida + error claro"

---

### Decisión #5: Auditoría — Tabla Separada (lead_audit_log)

**Pregunta UX:** "¿Cómo guardamos el timeline de actividad?"

**Decision:** ✅ **Tabla separada `lead_audit_log`**

**Rationale:**
- Limpio: leads y eventos desacoplados (no mezcla concerns)
- Queryable: búsquedas en eventos sin parsear JSONB
- Escalable: 1M eventos no ralentiza queries a leads
- Auditoria profesional: requerida para compliance

**Qué Registramos:**

| Evento | Se Registra | Ejemplo |
|--------|-------------|---------|
| Lead creado | ✅ | `CREATED: {} → {name, company, email}` |
| Email editado | ✅ | `FIELD_EDITED: email "juan@old.com" → "juan@new.com"` |
| Nota agregada | ✅ | `NOTE_ADDED: "Cliente interesado en Feature X"` |
| Estado cambia | ✅ | `STATUS_CHANGED: "Nuevo" → "En contacto"` |
| Cada keystroke | ❌ | Ruido, no registramos (solo cambio final) |

**Schema:**

```sql
CREATE TABLE lead_audit_log (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL,  
    -- 'CREATED', 'STATUS_CHANGED', 'FIELD_EDITED', 'NOTE_ADDED'
    
    old_value JSONB,                  -- valor anterior
    new_value JSONB,                  -- valor nuevo
    
    description TEXT,                 -- resumen legible para timeline UI
    
    created_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    metadata JSONB DEFAULT '{}'       -- future: IP, user agent, etc.
);

-- Índices para performance
CREATE INDEX idx_lead_audit_log_lead_id 
ON lead_audit_log(lead_id, created_at DESC);

CREATE INDEX idx_lead_audit_log_event_type 
ON lead_audit_log(event_type);
```

**Implicaciones:**

| Lado | Requerimiento |
|------|---------------|
| **Frontend** | GET /api/leads/{id}/timeline → renderiza events en UI |
| **Backend** | Cada acción que modifica lead crea fila en audit_log |
| **Database** | Tabla + índices |

**Validación con Sally (UX):** ✅ Cumple "timeline completo del lead"

---

## 🗄️ Base de Datos — Schema y Índices

### Tabla: `users`

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
```

### Tabla: `leads`

```sql
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    
    -- Información del Lead
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    
    -- Estado del Pipeline
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    -- Estados: NEW, IN_CONTACT, PROPOSAL_SENT, CLOSED
    
    -- Relaciones
    created_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Índices para Performance
CREATE UNIQUE INDEX idx_leads_email_unique 
ON leads(email) WHERE deleted_at IS NULL;

CREATE INDEX idx_leads_status 
ON leads(status) WHERE deleted_at IS NULL;

CREATE INDEX idx_leads_created_by 
ON leads(created_by_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_leads_search 
ON leads(name COLLATE "C", company COLLATE "C", email) 
WHERE deleted_at IS NULL;

CREATE INDEX idx_leads_created_at 
ON leads(created_at DESC) WHERE deleted_at IS NULL;
```

### Tabla: `lead_audit_log`

```sql
CREATE TABLE lead_audit_log (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    description TEXT,
    
    created_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_lead_audit_log_lead_id 
ON lead_audit_log(lead_id, created_at DESC);

CREATE INDEX idx_lead_audit_log_event_type 
ON lead_audit_log(event_type);
```

### Tabla: `idempotency_keys` (para Retry Idempotency)

```sql
CREATE TABLE idempotency_keys (
    key UUID PRIMARY KEY,
    status_code INTEGER NOT NULL,
    response_body JSONB NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '60 seconds')
);

-- Limpiar keys expirados (job diario)
CREATE INDEX idx_idempotency_keys_expires 
ON idempotency_keys(expires_at) 
WHERE expires_at > CURRENT_TIMESTAMP;
```

---

## 🔌 API Endpoints — Especificación Formal

### Base URL

```
http://localhost:8000/api
```

### Autenticación

Todos los endpoints (excepto `/auth/login`) requieren:

```
Authorization: Bearer <JWT_TOKEN>
```

---

### Autenticación

#### POST /auth/login

```
Cuerpo:
{
  "email": "user@example.com",
  "password": "password123"
}

Respuesta 200:
{
  "access_token": "<JWT>",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Juan"
  }
}

Respuesta 401:
{
  "detail": "Email o contraseña incorrectos"
}
```

---

### Leads — CRUD

#### GET /leads

Listar todos los leads (ordenados por nombre).

```
Query Params:
  - status?: "NEW" | "IN_CONTACT" | "PROPOSAL_SENT" | "CLOSED" (filtro opcional)
  - limit?: 100 (default)
  - offset?: 0 (default)

Respuesta 200:
{
  "total": 50,
  "leads": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "company": "Tech Corp",
      "email": "juan@techcorp.com",
      "phone": "+34 912 345 678",
      "status": "NEW",
      "created_at": "2026-06-07T10:00:00Z",
      "updated_at": "2026-06-07T10:00:00Z"
    },
    ...
  ]
}
```

#### GET /leads/search

Búsqueda en tiempo real (nombre, empresa, email).

```
Query Params:
  - q: "juan" (requerido, mín 2 caracteres)
  - limit?: 20 (default)
  - offset?: 0 (default)

Respuesta 200:
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "company": "Tech Corp",
      "email": "juan@techcorp.com",
      "status": "NEW"
    },
    ...
  ]
}
```

#### GET /leads/{id}

Obtener detalle de un lead + timeline.

```
Respuesta 200:
{
  "lead": {
    "id": 1,
    "name": "Juan Pérez",
    "company": "Tech Corp",
    "email": "juan@techcorp.com",
    "phone": "+34 912 345 678",
    "status": "NEW",
    "created_at": "2026-06-07T10:00:00Z",
    "updated_at": "2026-06-07T10:00:00Z"
  }
}
```

#### POST /leads

Crear un nuevo lead.

```
Headers:
  Content-Type: application/json
  Idempotency-Key: <UUID> (recomendado para retry safety)

Cuerpo:
{
  "name": "Juan Pérez",
  "company": "Tech Corp",
  "email": "juan@techcorp.com",
  "phone": "+34 912 345 678"
}

Respuesta 201:
{
  "id": 1,
  "name": "Juan Pérez",
  "company": "Tech Corp",
  "email": "juan@techcorp.com",
  "phone": "+34 912 345 678",
  "status": "NEW",
  "created_at": "2026-06-07T10:00:00Z",
  "updated_at": "2026-06-07T10:00:00Z"
}

Respuesta 409 (Email ya existe):
{
  "detail": "Lead con este email ya existe"
}
```

#### PATCH /leads/{id}

Actualizar lead (cualquier campo).

```
Headers:
  Content-Type: application/json
  Idempotency-Key: <UUID>

Cuerpo (parcial):
{
  "name": "Juan Carlos Pérez",
  "status": "IN_CONTACT"
}

Respuesta 200:
{
  "id": 1,
  "name": "Juan Carlos Pérez",
  "company": "Tech Corp",
  "email": "juan@techcorp.com",
  "phone": "+34 912 345 678",
  "status": "IN_CONTACT",
  "updated_at": "2026-06-07T10:30:00Z"
}
```

---

### Validación

#### POST /leads/validate-email

Validar que un email no existe (para validación inline en formulario).

```
Query Params:
  - email: "juan@techcorp.com" (requerido)

Respuesta 200:
{
  "available": true,
  "email": "juan@techcorp.com"
}

o

{
  "available": false,
  "email": "juan@techcorp.com"
}
```

---

### Timeline / Auditoría

#### GET /leads/{id}/timeline

Obtener timeline de actividad de un lead.

```
Query Params:
  - limit?: 50 (default)
  - offset?: 0 (default)

Respuesta 200:
{
  "lead_id": 1,
  "events": [
    {
      "id": 101,
      "event_type": "CREATED",
      "description": "Lead creado",
      "old_value": null,
      "new_value": {
        "name": "Juan Pérez",
        "company": "Tech Corp",
        "email": "juan@techcorp.com"
      },
      "created_by": {
        "id": 1,
        "first_name": "Admin"
      },
      "created_at": "2026-06-07T10:00:00Z"
    },
    {
      "id": 102,
      "event_type": "STATUS_CHANGED",
      "description": "Movido a 'En contacto'",
      "old_value": { "status": "NEW" },
      "new_value": { "status": "IN_CONTACT" },
      "created_by": {
        "id": 1,
        "first_name": "Admin"
      },
      "created_at": "2026-06-07T10:15:00Z"
    }
  ]
}
```

---

## ⚡ Frontend — Arquitectura y State

### Stack

- **Framework:** React 18 + TypeScript
- **State:** Zustand (stores descentralizados)
- **HTTP:** TanStack Query (dedup, caching)
- **Drag & Drop:** react-beautiful-dnd
- **UI:** Componentes React + CSS Modules

### Stores (Zustand)

#### `leadsStore.ts`

```typescript
interface LeadsState {
  leads: Lead[];
  selectedLeadId: number | null;
  
  setLeads: (leads: Lead[]) => void;
  updateLead: (id: number, partial: Partial<Lead>) => void;
  deleteLead: (id: number) => void;
  selectLead: (id: number) => void;
}

export const useLeadsStore = create<LeadsState>((set) => ({
  leads: [],
  selectedLeadId: null,
  
  setLeads: (leads) => set({ leads }),
  updateLead: (id, partial) => set((state) => ({
    leads: state.leads.map((l) => l.id === id ? { ...l, ...partial } : l)
  })),
  deleteLead: (id) => set((state) => ({
    leads: state.leads.filter((l) => l.id !== id)
  })),
  selectLead: (id) => set({ selectedLeadId: id }),
}));
```

#### `uiStore.ts`

```typescript
interface UIState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  toastMessage: string | null;
  isLoading: boolean;
  
  openCreateModal: () => void;
  closeCreateModal: () => void;
  showToast: (message: string, duration?: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateModalOpen: false,
  isEditModalOpen: false,
  toastMessage: null,
  isLoading: false,
  
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  showToast: (message, duration = 3000) => {
    set({ toastMessage: message });
    setTimeout(() => set({ toastMessage: null }), duration);
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

### Hooks (TanStack Query)

#### `useLeads.ts` (Queries)

```typescript
export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await apiClient.get('/leads');
      return res.data.leads;
    },
  });
};

export const useSearchLeads = (q: string) => {
  return useQuery({
    queryKey: ['leads', 'search', q],
    queryFn: async () => {
      if (q.length < 2) return [];
      const res = await apiClient.get('/leads/search', { params: { q } });
      return res.data.results;
    },
    enabled: q.length >= 2,
  });
};

export const useLeadTimeline = (leadId: number) => {
  return useQuery({
    queryKey: ['leads', leadId, 'timeline'],
    queryFn: async () => {
      const res = await apiClient.get(`/leads/${leadId}/timeline`);
      return res.data.events;
    },
  });
};
```

#### `useLeadMutations.ts` (Mutations)

```typescript
export const useCreateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lead: LeadCreate) => apiClient.post('/leads', lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lead> }) =>
      apiClient.patch(`/leads/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export const useValidateEmail = () => {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post('/leads/validate-email', { email }),
  });
};
```

### Componentes Clave

- **KanbanBoard.tsx** — Contiene todas las columnas
- **Column.tsx** — Una columna (Nuevo, En contacto, Propuesta, Cerrado)
- **LeadCard.tsx** — Card individual (draggable)
- **CreateLeadModal.tsx** — Formulario crear lead
- **EditLeadModal.tsx** — Formulario editar lead
- **TimelineDrawer.tsx** — Sidebar con timeline
- **SearchBox.tsx** — Input búsqueda con debounce
- **Toast.tsx** — Notificaciones

---

## 📁 Estructura del Proyecto

```
demo/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app + middleware
│   │   ├── config.py                 # Config (DATABASE_URL, SECRET_KEY, etc.)
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # POST /auth/login
│   │   │   └── leads.py              # Todos los endpoints de leads
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py               # SQLAlchemy User model
│   │   │   ├── lead.py               # SQLAlchemy Lead model
│   │   │   └── audit.py              # SQLAlchemy LeadAuditLog model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── lead.py               # Pydantic schemas (LeadCreate, LeadUpdate, etc.)
│   │   │   └── audit.py              # Pydantic AuditLogResponse
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Base classes, session factory
│   │   │   └── utils.py              # DB helpers (get_session, etc.)
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # JWT middleware
│   │   │   └── logging.py            # Request logging + duration tracking
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── validators.py         # Email validation, etc.
│   ├── migrations/
│   │   ├── versions/
│   │   │   ├── 0001_initial.py       # Create users, leads tables + indexes
│   │   │   └── 0002_audit_log.py     # Create lead_audit_log table + indexes
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── alembic.ini
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── Dockerfile
│   ├── .env.example
│   └── tests/
│       ├── __init__.py
│       ├── test_leads.py
│       └── conftest.py
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── api/
│   │   │   ├── client.ts             # Axios wrapper + retry logic
│   │   │   └── leads.ts              # Lead API calls (deprecated if using hooks)
│   │   ├── components/
│   │   │   ├── Kanban/
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── Column.tsx
│   │   │   │   ├── LeadCard.tsx
│   │   │   │   └── styles.module.css
│   │   │   ├── Forms/
│   │   │   │   ├── CreateLeadModal.tsx
│   │   │   │   ├── EditLeadModal.tsx
│   │   │   │   └── styles.module.css
│   │   │   ├── Timeline/
│   │   │   │   ├── TimelineDrawer.tsx
│   │   │   │   ├── EventItem.tsx
│   │   │   │   └── styles.module.css
│   │   │   ├── Search/
│   │   │   │   ├── SearchBox.tsx
│   │   │   │   └── styles.module.css
│   │   │   └── Shared/
│   │   │       ├── Toast.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       └── styles.module.css
│   │   ├── store/
│   │   │   ├── leadsStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── authStore.ts
│   │   ├── hooks/
│   │   │   ├── useLeads.ts
│   │   │   ├── useLeadMutations.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useRetry.ts
│   │   │   └── useIdempotency.ts
│   │   ├── types/
│   │   │   ├── lead.ts
│   │   │   ├── api.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── constants.ts          # Colors, status enums, strings
│   │   │   └── helpers.ts
│   │   └── styles/
│   │       ├── index.css
│   │       └── theme.css
│   ├── public/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── docker-compose.yml
├── docs/
│   ├── project-context.md
│   ├── arquitectura.md               # Este documento
│   └── ...
└── .env.example
```

---

## ⚙️ Configuración y Deployment

### Docker Compose (Local Dev)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mini_crm_db
      POSTGRES_USER: crm_user
      POSTGRES_PASSWORD: crm_password_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    command: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    environment:
      DATABASE_URL: postgresql+asyncpg://crm_user:crm_password_dev@postgres:5432/mini_crm_db
      SECRET_KEY: ${SECRET_KEY:-dev-secret-key-do-not-use-in-production}
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    command: npm run dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      REACT_APP_API_URL: http://localhost:8000/api

volumes:
  postgres_data:
```

### Ejecución

```bash
# Primer uso: construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up

# En otra terminal: correr migrations
docker-compose exec backend alembic upgrade head

# Acceder a la app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/docs (Swagger)
```

---

## ✅ Validación Contra Requerimientos

### PRD Validación

| Requerimiento | Cumplido | Evidencia |
|---------------|----------|-----------|
| **FR-1: Crear Lead** | ✅ | POST /api/leads, form modal, validación email |
| **FR-2: Email único** | ✅ | UNIQUE constraint + validación inline |
| **FR-3: Actualizar estado** | ✅ | PATCH /leads/{id}, transiciones validadas |
| **FR-4: Pipeline Kanban** | ✅ | React + react-beautiful-dnd, 4 columnas |
| **FR-5: Timeline actividad** | ✅ | GET /leads/{id}/timeline, tabla audit_log |
| **FR-6: Búsqueda en tiempo real** | ✅ | GET /leads/search, debounce 300ms, <500ms |
| **FR-7: <1s sync** | ✅ | Índices + query optimization, monitoring |

### UX Validación (Sally)

| Requerimiento UX | Cumplido | Implementación |
|------------------|----------|-----------------|
| Cambios sin recargar | ✅ | Optimistic updates |
| Pipeline tiempo real | ✅ | Zustand + TanStack Query |
| Validación inline email | ✅ | onBlur + POST /validate-email |
| Rollback si error | ✅ | Retry automático + revert visual |
| Timeline legible | ✅ | lead_audit_log, delta-only |
| Búsqueda <500ms | ✅ | Backend + índice |

---

## 📋 Próximos Pasos — Handoff a Amelia (Dev)

### Hoy (2026-06-07) — Planning & Setup

- [x] ✅ Decisiones arquitectónicas finalizadas
- [x] ✅ Stack decidido
- [ ] Amelia: **Inicializar repo** (estructura, Docker, env)
- [ ] Amelia: **Database schema + migrations** (Alembic)
- [ ] Amelia: **Requirements.txt + pyproject.toml**

### Mañana (2026-06-08) — Implementación & Demo

**Fase 1 (Morning): Backend Core Endpoints**
- [ ] POST /auth/login
- [ ] GET /leads + GET /leads/search
- [ ] POST /leads + PATCH /leads/{id}
- [ ] POST /leads/validate-email
- [ ] GET /leads/{id}/timeline

**Fase 2 (Afternoon): Frontend Kanban**
- [ ] KanbanBoard + Columns + LeadCards
- [ ] Drag & drop con optimistic update
- [ ] Forms (Create, Edit)
- [ ] Search + timeline drawer

**Fase 3 (If Time): Testing & Polish**
- [ ] Tests unitarios backend (pytest)
- [ ] Error handling + toasts
- [ ] Loading states
- [ ] Styling (design tokens Sally)

**Fase 4: Demo Preparation**
- [ ] `docker-compose up` y que funcione
- [ ] Datos seed (10-20 leads demo)
- [ ] Walkthrough: crear lead → mover → ver timeline

---

## 🎯 Principios de Implementación (Para Amelia)

1. **Especificación sobre Adivinanza** — Cada endpoint tiene spec arriba. Úsala.
2. **Indexes Primero** — Antes de tests, crea indices en migrations
3. **Logging Diario** — Cada request registra duration. Revisamos mañana.
4. **Type Safety** — SQLAlchemy + Pydantic + TypeScript. Sin `any`.
5. **Errores Claros** — Cada error tiene status code + descripción legible
6. **Documentación Automática** — FastAPI + OpenAPI, Swagger en `/docs`

---

## ✨ Sumario

Esta arquitectura es:

✅ **Viable Inmediatamente** — Stack probado, sin experimentos  
✅ **Escalable** — Índices + queries optimizadas desde día 1  
✅ **UX-First** — Cada decisión validada contra Sally (UX)  
✅ **Profesional** — Documentación clara, código transferible  
✅ **Listo para Mañana** — Demo funcional, presentación a tiempo  

---

**Documento Generado:** 2026-06-07  
**Estado:** ✅ FINALIZED - Ready for Implementation  
**Siguiente:** Step 2 — Implementation Readiness Check (Amelia confirmation)
