# 🚀 Handoff: UX + Arquitectura → Amelia (Dev)

**Documento:** Especificación Final para Implementación  
**De:** Sally (UX) + Winston (Architect)  
**Para:** Amelia (Dev Lead)  
**Fecha:** 2026-06-07  
**Objetivo:** Amelia comienza a codificar SIN fricción, SIN preguntas  
**Timeline:** Hoy (2026-06-07) planning/setup, Mañana (2026-06-08) código listo para demo  

---

## 📌 TL;DR — Comienza Aquí

### Stack Decidido (NO negociable para demo)

| Componente | Tecnología | Razón |
|-----------|-----------|-------|
| **Frontend** | React + TypeScript | State complejo, optimistic updates fácil |
| **State Mgmt** | Zustand | Ligero, tipado, perfecto para este scope |
| **Drag & Drop** | react-beautiful-dnd | Estándar industrial para Kanban |
| **HTTP Client** | Tanstack Query (@tanstack/react-query) | Request dedup, caching automático |
| **Backend** | FastAPI + Python 3.11 | Async, rápido, documentación automática |
| **ORM** | SQLAlchemy + asyncpg | Async DB, migraciones con Alembic |
| **Base de Datos** | PostgreSQL | ACID, índices, performance garantizado |
| **Containerización** | Docker Compose | 3 servicios: Backend, Frontend, PostgreSQL |

---

### Que Hacemos Hoy (2026-06-07)

- [x] Decisiones UX finalizadas (Sally)
- [x] Decisiones Arquitectura finalizadas (Winston)
- [x] Timeline especificado sin ambigüedad (Sally)
- [ ] **Amelia: Setup base (repo, env, Docker, dependencies)**
- [ ] **Amelia: Database schema + migrations (Alembic)**

### Que Hacemos Mañana (2026-06-08)

- [ ] **Amelia: Core endpoints (Fase 1 - 6 endpoints)**
- [ ] **Amelia: Frontend Kanban (Fase 2 - React components)**
- [ ] **Amelia: Testing + Polish (Fase 3 - si hay tiempo)**
- [ ] **Demo: 20 minutos, 8 de Junio**

---

## 📐 Arquitectura de Alto Nivel (Referencia)

```
Frontend (React + Zustand)
    ↓ HTTP REST + Idempotency Keys
FastAPI (Backend + Middleware)
    ↓ SQLAlchemy ORM + asyncpg
PostgreSQL (DB + 5 índices estratégicos)
```

**Latencia esperada (p95):**
- Network (LAN): 10ms
- API endpoint: 20-40ms
- DB query: 30-60ms
- **Total p95: <100ms** (especificación Winston)

---

## 🗂️ Carpeta del Proyecto (Estructura)

```
demo/
├── backend/                          # Python FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app
│   │   ├── config.py                 # Config (DATABASE_URL, etc.)
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # POST /auth/login
│   │   │   └── leads.py              # All lead endpoints
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py               # User model
│   │   │   ├── lead.py               # Lead model
│   │   │   └── audit.py              # LeadAuditLog model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── lead.py               # LeadCreate, LeadUpdate, LeadResponse
│   │   │   └── audit.py              # AuditLogResponse
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Base classes, session maker
│   │   │   └── utils.py              # DB helpers
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # JWT middleware
│   │   │   └── logging.py            # Request logging + duration
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── validators.py         # Email, etc.
│   ├── migrations/                   # Alembic migrations
│   │   ├── versions/
│   │   │   ├── 0001_initial.py       # Create leads table
│   │   │   └── 0002_audit_log.py     # Create lead_audit_log table
│   │   └── env.py
│   ├── requirements.txt              # Dependencies
│   ├── pyproject.toml                # Project config
│   ├── Dockerfile
│   └── .env.example                  # Environment template
│
├── frontend/                         # React + TypeScript
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── api/
│   │   │   ├── client.ts             # Axios/Fetch wrapper + retry logic
│   │   │   └── leads.ts              # Lead API calls
│   │   ├── components/
│   │   │   ├── Kanban/
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── Column.tsx
│   │   │   │   ├── LeadCard.tsx
│   │   │   │   └── styles.css
│   │   │   ├── Forms/
│   │   │   │   ├── CreateLeadModal.tsx
│   │   │   │   ├── EditLeadModal.tsx
│   │   │   │   └── styles.css
│   │   │   ├── Timeline/
│   │   │   │   ├── TimelineDrawer.tsx
│   │   │   │   ├── EventItem.tsx
│   │   │   │   └── styles.css
│   │   │   ├── Search/
│   │   │   │   ├── SearchBox.tsx
│   │   │   │   └── styles.css
│   │   │   └── Shared/
│   │   │       ├── Toast.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       └── styles.css
│   │   ├── store/
│   │   │   ├── leadsStore.ts         # Zustand state
│   │   │   ├── uiStore.ts            # UI state (modals, toasts)
│   │   │   └── authStore.ts          # Auth state
│   │   ├── hooks/
│   │   │   ├── useLeads.ts           # Query hooks
│   │   │   ├── useLeadMutations.ts   # Mutation hooks
│   │   │   └── useDebounce.ts        # Debounce utility
│   │   ├── types/
│   │   │   ├── lead.ts               # Lead type definitions
│   │   │   └── api.ts                # API response types
│   │   └── utils/
│   │       └── constants.ts          # Colors, status enums, etc.
│   ├── public/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml                # Orquestación local
└── docs/
    ├── ALINEACION-UX-ARQUITECTURA.md
    ├── WINSTON-DECISIONES-ARQUITECTONICAS.md
    ├── TIMELINE-ESPECIFICACION-DETALLADA.md
    └── HANDOFF-AMELIA.md (este archivo)
```

---

## 🔌 Endpoints REST (6 Implementar en Fase 1)

### Endpoint 1: Auth Login

```
POST /auth/login

Request:
{
  "username": "anuar",
  "password": "password123"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "anuar"
  }
}

Response (401):
{
  "detail": "Invalid credentials"
}

Notes:
- MVP demo: username/password hardcoded (admin/demo123)
- Token: JWT, expires en 24 horas
- Middleware: Todos los otros endpoints requieren este token en header Authorization
```

---

### Endpoint 2: Listar Leads

```
GET /api/leads?status=NEW

Query Parameters:
  status: string (optional) - Filtrar por estado: NEW, IN_CONTACT, PROPOSAL_SENT, CLOSED
  limit: integer (optional, default=100) - Max leads retornados
  offset: integer (optional, default=0) - Para paginación

Headers:
  Authorization: Bearer <token>

Response (200):
{
  "count": 28,
  "leads": [
    {
      "id": 1,
      "name": "Juan García",
      "company": "TechCorp Inc",
      "email": "juan@techcorp.com",
      "phone": "+34 912 345 678",
      "status": "NEW",
      "created_at": "2026-06-07T10:30:00Z",
      "updated_at": "2026-06-07T10:30:00Z"
    },
    ...
  ]
}

Response (401):
{ "detail": "Unauthorized" }

Notes:
- GET /api/leads (sin query): retorna todos los leads (todos los estados)
- GET /api/leads?status=NEW: retorna solo leads con status='NEW'
- Retorna max 100 leads (limit default)
- Orden: created_at DESC (más recientes primero)
- Índice: idx_leads_status para performance
```

---

### Endpoint 3: Buscar Leads

```
GET /api/leads/search?q=juan&limit=20

Query Parameters:
  q: string (required) - Búsqueda en name, company, email (case-insensitive)
  limit: integer (optional, default=20) - Max resultados
  offset: integer (optional, default=0) - Paginación

Headers:
  Authorization: Bearer <token>

Response (200):
{
  "query": "juan",
  "count": 3,
  "results": [
    {
      "id": 1,
      "name": "Juan García",
      "company": "TechCorp Inc",
      "email": "juan@techcorp.com",
      "status": "NEW",
      "created_at": "2026-06-07T10:30:00Z"
    },
    ...
  ]
}

Response (400):
{ "detail": "Query parameter 'q' is required" }

Notes:
- Búsqueda es ILIKE (PostgreSQL) — case-insensitive wildcard
- Campos buscados: name, company, email con OR
- Retorna max 20 resultados (limit default, no paginación necesaria en demo)
- Índice: idx_leads_search para performance
- Frontend debounce 300ms antes de enviar query
```

---

### Endpoint 4: Crear Lead

```
POST /api/leads

Request:
{
  "name": "Juan García García",
  "company": "TechCorp Inc",
  "email": "juan.garcia@techcorp.com",
  "phone": "+34 912 345 678",
  "notes": "Interesado en Feature X"
}

Response (201):
{
  "id": 42,
  "name": "Juan García García",
  "company": "TechCorp Inc",
  "email": "juan.garcia@techcorp.com",
  "phone": "+34 912 345 678",
  "notes": "Interesado en Feature X",
  "status": "NEW",
  "created_by_id": 1,
  "created_at": "2026-06-07T11:30:00Z",
  "updated_at": "2026-06-07T11:30:00Z"
}

Response (400):
{
  "detail": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Min length 2 characters"
    },
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}

Response (409):
{
  "detail": "Email already exists in the system"
}

Notes:
- Validaciones:
  - name: required, min 2 chars, max 255
  - company: required, min 2 chars, max 255
  - email: required, valid email format, UNIQUE
  - phone: optional, max 20 chars
  - notes: optional, max 1000 chars
- Status por defecto: "NEW"
- IMPORTANTE: Crear evento CREATED en lead_audit_log
- Usar Idempotency-Key en header para retry-safety (Winston especificó)
```

---

### Endpoint 5: Editar Lead

```
PATCH /api/leads/42

Request (puede ser parcial):
{
  "name": "Juan Carlos García López",
  "phone": "+34 912 345 999"
}

Response (200):
{
  "id": 42,
  "name": "Juan Carlos García López",
  "company": "TechCorp Inc",
  "email": "juan.garcia@techcorp.com",
  "phone": "+34 912 345 999",
  "status": "NEW",
  "updated_at": "2026-06-07T12:00:00Z"
}

Response (400):
{ "detail": "Validation error: email must be unique" }

Response (404):
{ "detail": "Lead not found" }

Notes:
- Campos editables: name, company, email, phone, notes
- Campos NO editables: id, status (usa endpoint separate), created_at, created_by_id
- Validaciones: mismas que POST /leads
- IMPORTANTE: Crear evento FIELD_EDITED en lead_audit_log (solo si hay delta)
- Si email cambia: validar que es único
```

---

### Endpoint 6: Cambiar Estado (Mover en Kanban)

```
PATCH /api/leads/42/status

Request:
{
  "status": "IN_CONTACT"
}

Response (200):
{
  "id": 42,
  "status": "IN_CONTACT",
  "updated_at": "2026-06-07T12:15:00Z"
}

Response (400):
{ "detail": "Invalid status. Allowed: NEW, IN_CONTACT, PROPOSAL_SENT, CLOSED" }

Response (404):
{ "detail": "Lead not found" }

Notes:
- Status debe ser uno de: NEW, IN_CONTACT, PROPOSAL_SENT, CLOSED
- IMPORTANTE: Crear evento STATUS_CHANGED en lead_audit_log
- Usa este endpoint SOLO para cambios de estado
- Para otros cambios: usa PATCH /api/leads/42
- Transiciones: NO hay restricciones en MVP (cualquier → cualquiera es válido)
```

---

### Endpoint 7: Timeline (Audit Log)

```
GET /api/leads/42/audit-log?limit=20&offset=0

Query Parameters:
  limit: integer (optional, default=20)
  offset: integer (optional, default=0)

Headers:
  Authorization: Bearer <token>

Response (200):
{
  "lead_id": 42,
  "total_events": 5,
  "events": [
    {
      "id": 999,
      "event_type": "STATUS_CHANGED",
      "description": "Movido de 'Nuevo' a 'En contacto'",
      "old_value": { "status": "NEW" },
      "new_value": { "status": "IN_CONTACT" },
      "created_by": "Anuar",
      "created_at": "2026-06-07T12:15:00Z"
    },
    {
      "id": 998,
      "event_type": "CREATED",
      "description": "Lead creado por Anuar",
      "old_value": null,
      "new_value": { 
        "name": "Juan García",
        "company": "TechCorp",
        "email": "juan@techcorp.com"
      },
      "created_by": "Anuar",
      "created_at": "2026-06-07T10:30:00Z"
    }
  ]
}

Response (404):
{ "detail": "Lead not found" }

Notes:
- Orden: DESC (más reciente primero)
- 5 tipos de eventos: CREATED, STATUS_CHANGED, NOTE_ADDED, FIELD_EDITED, DELETED
- Retorna max 20 eventos (limit default)
- Ver: TIMELINE-ESPECIFICACION-DETALLADA.md para detalles completos
- Índice: idx_lead_audit_log_lead_id para performance
```

---

### Endpoint 8: Agregar Nota (BONUS — si hay tiempo)

```
POST /api/leads/42/notes

Request:
{
  "content": "Cliente interesado en Feature X, llamar mañana"
}

Response (201):
{
  "id": 100,
  "lead_id": 42,
  "content": "Cliente interesado en Feature X, llamar mañana",
  "created_by": "Anuar",
  "created_at": "2026-06-07T12:30:00Z"
}

Response (400):
{ "detail": "Content is required and must be <= 5000 characters" }

Notes:
- Crea nota Y evento NOTE_ADDED en lead_audit_log
- Bonus MVP: no crítico para demo
```

---

### Endpoint 9: Validar Email (BONUS)

```
POST /api/leads/validate-email?email=juan@corp.com

Response (200):
{
  "email": "juan@corp.com",
  "available": true
}

Response (200):
{
  "email": "juan@corp.com",
  "available": false,
  "message": "Email already in use"
}

Notes:
- Frontend lo llama onBlur del campo email en Create/Edit forms
- Debounce 300ms en frontend
- IMPORTANTE: validación en BD es la verdad (UNIQUE constraint)
```

---

## 🎨 Frontend Components (React + TypeScript)

### Component 1: KanbanBoard

```typescript
// src/components/Kanban/KanbanBoard.tsx

interface KanbanBoardProps {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  onLeadMove: (leadId: number, newStatus: Status) => Promise<void>;
  onLeadClick: (leadId: number) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  isLoading,
  error,
  onLeadMove,
  onLeadClick
}) => {
  // State
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  
  // Render 4 columnas (NEW, IN_CONTACT, PROPOSAL_SENT, CLOSED)
  const statuses: Status[] = ['NEW', 'IN_CONTACT', 'PROPOSAL_SENT', 'CLOSED'];
  
  return (
    <div className="kanban-board">
      {statuses.map(status => (
        <Column
          key={status}
          status={status}
          leads={leads.filter(l => l.status === status)}
          onLeadMove={onLeadMove}
          onLeadClick={onLeadClick}
          onDragStart={setDraggedLeadId}
          onDragEnd={() => setDraggedLeadId(null)}
        />
      ))}
    </div>
  );
};

// Estilos necesarios (CSS/Tailwind)
// - 4 columnas igual ancho
// - Scrollable verticalmente dentro de cada columna
// - Responsive: en mobile, columnas stackeadas
// - Colores: Nuevo=#3B82F6, En contacto=#F59E0B, Propuesta=#A855F7, Cerrado=#10B981
```

---

### Component 2: LeadCard (Draggable)

```typescript
// src/components/Kanban/LeadCard.tsx

interface LeadCardProps {
  lead: Lead;
  isDragging: boolean;
  onEdit: (leadId: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  isDragging,
  onEdit,
  onDragStart,
  onDragEnd
}) => {
  // Render
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`lead-card ${isDragging ? 'dragging' : ''}`}
      onClick={() => onEdit(lead.id)}
    >
      <div className="lead-header">
        <div className="lead-name">{lead.name}</div>
        <div className="lead-company">{lead.company}</div>
      </div>
      <div className="lead-email">{lead.email}</div>
      <div className="lead-updated">
        Última actualización: {formatDate(lead.updated_at)}
      </div>
      <div className="lead-status-badge">
        <Status status={lead.status} />
      </div>
    </div>
  );
};

// Estilos necesarios
// - Default: white bg, 1px border #D1D5DB, padding 12px
// - Hover: blue border #3B82F6, shadow 0px 4px 12px
// - Dragging: opacity 0.7, rotate 2deg, scale 1.02
// - Loading: skeleton shimmer
```

---

### Component 3: CreateLeadModal

```typescript
// src/components/Forms/CreateLeadModal.tsx

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: LeadCreate) => Promise<void>;
}

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<LeadCreate>({
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Partial<LeadCreate>>({});
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validar email onBlur (debounce 300ms)
  const handleEmailBlur = async (email: string) => {
    const { available } = await validateEmail(email);
    setEmailAvailable(available);
  };
  
  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Toast éxito
      onClose();
    } catch (err) {
      // Toast error
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Botón submit: habilitado solo si:
  // - name, company, email válidos
  // - email disponible
  const isValid = 
    formData.name.length >= 2 &&
    formData.company.length >= 2 &&
    isValidEmail(formData.email) &&
    emailAvailable === true;
  
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <h2>Crear Lead</h2>
      
      <TextField
        label="Nombre"
        value={formData.name}
        onChange={(name) => setFormData({...formData, name})}
        error={errors.name}
        minLength={2}
      />
      
      <TextField
        label="Empresa"
        value={formData.company}
        onChange={(company) => setFormData({...formData, company})}
        error={errors.company}
        minLength={2}
      />
      
      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(email) => setFormData({...formData, email})}
        onBlur={() => handleEmailBlur(formData.email)}
        error={errors.email || (emailAvailable === false ? 'Email ya existe' : null)}
        validation={emailAvailable ? '✅' : emailAvailable === false ? '❌' : null}
      />
      
      <TextField
        label="Teléfono (opcional)"
        value={formData.phone}
        onChange={(phone) => setFormData({...formData, phone})}
      />
      
      <TextField
        label="Notas (opcional)"
        value={formData.notes}
        onChange={(notes) => setFormData({...formData, notes})}
        maxLength={1000}
      />
      
      <div className="modal-footer">
        <Button onClick={onClose} variant="secondary">Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
        >
          Crear Lead
        </Button>
      </div>
    </Dialog>
  );
};
```

---

### Component 4: TimelineDrawer

```typescript
// src/components/Timeline/TimelineDrawer.tsx

interface TimelineDrawerProps {
  leadId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const TimelineDrawer: React.FC<TimelineDrawerProps> = ({
  leadId,
  isOpen,
  onClose
}) => {
  const { auditLog, isLoading } = useAuditLog(leadId);
  
  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className="timeline-header">
        <h2>Timeline del Lead</h2>
      </div>
      
      <div className="timeline-container">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="timeline-events">
            {auditLog.events.map(event => (
              <EventItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};

// EventItem renderiza diferente según event_type
// - CREATED: 🟢 "Lead creado por X"
// - STATUS_CHANGED: 🟠 "Movido de Y a Z"
// - NOTE_ADDED: 💬 "Nota: '...'"
// - FIELD_EDITED: ✏️ "Nombre: X → Y"
// - DELETED: 🗑️ "Lead borrado"
```

---

## 🗄️ Database Schema (PostgreSQL)

### Table: users

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password_hash) 
VALUES ('anuar', '$2b$12$...'); -- bcrypt hash of "demo123"
```

---

### Table: leads

```sql
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    notes TEXT DEFAULT '',
    
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    CHECK (status IN ('NEW', 'IN_CONTACT', 'PROPOSAL_SENT', 'CLOSED')),
    
    created_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Índices (Winston especificó)
    CONSTRAINT leads_email_not_deleted UNIQUE (email) WHERE deleted_at IS NULL
);

CREATE INDEX idx_leads_status ON leads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_created_at ON leads(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_created_by ON leads(created_by_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_search ON leads(name COLLATE "C", company COLLATE "C", email) 
    WHERE deleted_at IS NULL;
```

---

### Table: lead_audit_log

```sql
CREATE TABLE lead_audit_log (
    id BIGSERIAL PRIMARY KEY,
    
    lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL,
    CHECK (event_type IN ('CREATED', 'STATUS_CHANGED', 'NOTE_ADDED', 'FIELD_EDITED', 'DELETED')),
    
    old_value JSONB,
    new_value JSONB,
    
    description TEXT NOT NULL,
    
    created_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    metadata JSONB DEFAULT '{}',
    
    -- Validaciones (Winston especificó)
    CONSTRAINT valid_event_values CHECK (
        (event_type = 'CREATED' AND old_value IS NULL AND new_value IS NOT NULL)
        OR (event_type = 'STATUS_CHANGED' AND old_value IS NOT NULL AND new_value IS NOT NULL)
        OR (event_type = 'NOTE_ADDED' AND old_value IS NULL AND new_value IS NOT NULL)
        OR (event_type = 'FIELD_EDITED' AND old_value IS NOT NULL AND new_value IS NOT NULL)
        OR (event_type = 'DELETED' AND old_value IS NOT NULL AND new_value IS NULL)
    )
);

CREATE INDEX idx_lead_audit_log_lead_id 
ON lead_audit_log(lead_id, created_at DESC);
```

---

## 🔐 Autenticación y Seguridad

### JWT Token

```
Token type: Bearer
Algorithm: HS256
Payload:
{
  "sub": "1",
  "username": "anuar",
  "exp": <timestamp en 24h>
}

Header en todos los requests:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### Middleware: Auth

```python
# backend/app/middleware/auth.py

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    # Skip para POST /auth/login
    if request.url.path == "/auth/login":
        return await call_next(request)
    
    # Requerir token en Authorization header
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return JSONResponse(
            status_code=401,
            content={"detail": "Missing Authorization header"}
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        request.state.user_id = payload["sub"]
        request.state.username = payload["username"]
    except jwt.ExpiredSignatureError:
        return JSONResponse(
            status_code=401,
            content={"detail": "Token expired"}
        )
    except jwt.InvalidTokenError:
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid token"}
        )
    
    return await call_next(request)
```

---

## 🧪 Testing Checklist (Fase 3 — si hay tiempo)

### Unit Tests (Backend)

```python
# tests/test_validators.py
def test_email_validation():
    assert is_valid_email("juan@techcorp.com") == True
    assert is_valid_email("invalid-email") == False

# tests/test_models.py
def test_lead_creation():
    lead = Lead(name="Juan", company="Corp", email="juan@corp.com")
    assert lead.status == "NEW"
```

---

### Integration Tests (Endpoints)

```python
# tests/test_leads_api.py

def test_create_lead():
    response = client.post("/api/leads", json={
        "name": "Juan García",
        "company": "TechCorp",
        "email": "juan@corp.com"
    }, headers={"Authorization": "Bearer <token>"})
    assert response.status_code == 201
    assert response.json()["id"] > 0
    # Verificar que se creó evento CREATED en audit log
    audit_logs = get_audit_logs(response.json()["id"])
    assert len(audit_logs) == 1
    assert audit_logs[0].event_type == "CREATED"

def test_move_lead():
    lead_id = 42
    response = client.patch(f"/api/leads/{lead_id}/status", json={
        "status": "IN_CONTACT"
    }, headers={"Authorization": "Bearer <token>"})
    assert response.status_code == 200
    # Verificar que se creó evento STATUS_CHANGED
    audit_logs = get_audit_logs(lead_id)
    assert any(e.event_type == "STATUS_CHANGED" for e in audit_logs)
```

---

## 📋 Checklist de Implementación

### Hoy (2026-06-07) — Setup

- [ ] Crear repo con estructura carpeta (arriba)
- [ ] Setup FastAPI:
  - [ ] requirements.txt con dependencias
  - [ ] config.py (DATABASE_URL desde .env)
  - [ ] main.py con app básica
- [ ] Setup Frontend:
  - [ ] package.json con React, TypeScript, Zustand, react-beautiful-dnd
  - [ ] tsconfig.json
  - [ ] vite.config.ts (si usas Vite) o webpack
- [ ] Docker:
  - [ ] docker-compose.yml con 3 servicios (backend, frontend, postgres)
  - [ ] Dockerfiles para backend y frontend
- [ ] Database:
  - [ ] Alembic setup
  - [ ] Migrations: users, leads, lead_audit_log tables

---

### Mañana (2026-06-08) — Core

**Backend (Amelia-1):**
- [ ] POST /auth/login → JWT token
- [ ] GET /api/leads (con filtro status)
- [ ] GET /api/leads/search?q=X
- [ ] POST /api/leads (crear + evento CREATED)
- [ ] PATCH /api/leads/{id}/status (mover + evento STATUS_CHANGED)
- [ ] GET /api/leads/{id}/audit-log (timeline)

**Frontend (Amelia-2):**
- [ ] Login page
- [ ] KanbanBoard component
- [ ] LeadCard component (draggable)
- [ ] CreateLeadModal
- [ ] Drag & drop entre columnas
- [ ] TimelineDrawer
- [ ] Search box (debounce 300ms)
- [ ] Toast notifications

**Polish (Amelia-3 — si hay tiempo):**
- [ ] EditLeadModal
- [ ] Performance testing
- [ ] Error boundaries

---

## 🚨 Performance Targets (Winston)

| Métrica | Target | Monitor |
|---------|--------|---------|
| Carga inicial Kanban (50 leads) | <2s | Network + DB query time |
| Búsqueda (debounce 300ms) | <500ms | Query execution time |
| Movimiento lead | <1s (p95) | API + UI update time |
| API p95 | <300ms | Middleware logging |

**Monitoring:** Agregar logs en middleware para request duration. Si algo excede target, optimizar.

---

## 🔗 Referencias Cruzadas

- **UX Specs:** [ALINEACION-UX-ARQUITECTURA.md](./ALINEACION-UX-ARQUITECTURA.md)
- **Decisiones Arquitectura:** [WINSTON-DECISIONES-ARQUITECTONICAS.md](./WINSTON-DECISIONES-ARQUITECTONICAS.md)
- **Timeline Detallado:** [TIMELINE-ESPECIFICACION-DETALLADA.md](./TIMELINE-ESPECIFICACION-DETALLADA.md)
- **Design Tokens:** D-Design-System/UX-05-DESIGN-TOKENS.md
- **PRD:** prd.md

---

## ❓ Dudas o Bloqueadores?

Si Amelia tiene preguntas:
- Preguntas UX: tira a Sally
- Preguntas Arquitectura: tira a Winston
- Preguntas de "cómo debo estructurar X": este documento

**No avances sin clarity. Las decisiones aquí NO se renegocian mañana.**

---

## 📝 Documento de Control

| Propiedad | Valor |
|-----------|-------|
| **Documento** | HANDOFF-AMELIA.md |
| **Versión** | 1.0 FINAL |
| **Fecha** | 2026-06-07 |
| **Estado** | ✅ LISTO PARA CODIFICACIÓN |
| **De** | Sally (UX) + Winston (Architect) |
| **Para** | Amelia (Dev) |
| **Timeline** | Setup hoy, código mañana |

---

**Amelia: Todo lo que necesitas está aquí. ¡Vamos a hacerlo!**
