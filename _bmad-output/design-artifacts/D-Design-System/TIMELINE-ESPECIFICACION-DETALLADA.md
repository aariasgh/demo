# 🕐 Timeline de Actividad — Especificación Detallada

**Documento:** Refineamiento de FR-4 (Timeline / Auditoría)  
**Autor:** Sally (UX Designer) + Winston (Architecture input)  
**Fecha:** 2026-06-07  
**Audiencia:** Amelia (Dev), QA, Documentación  
**Estado:** ✅ LISTO PARA IMPLEMENTACIÓN (sin ambigüedad)  

---

## 📑 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Matriz de Eventos Registrados](#matriz-de-eventos-registrados)
3. [Especificación Técnica por Evento](#especificación-técnica-por-evento)
4. [Flujos de Creación de Eventos](#flujos-de-creación-de-eventos)
5. [Comportamiento UX del Timeline](#comportamiento-ux-del-timeline)
6. [Datos del Evento (JSON Schema)](#datos-del-evento-json-schema)
7. [Validaciones y Edge Cases](#validaciones-y-edge-cases)
8. [Testing Scenarios](#testing-scenarios)

---

## 🎯 Visión General

El **Timeline** es un registro histórico e inmutable de TODO lo que pasó con un lead:
- **Cuándo** se creó el lead
- **Cuándo** se movió de estado
- **Cuándo** se agregaron notas
- **Cuándo** se editaron campos clave
- **Quién** hizo cada cambio
- **Qué** exactamente cambió (delta)

**Principios:**
- ✅ **Cronológico:** más reciente arriba (DESC por timestamp)
- ✅ **Legible:** un humano debe entender qué pasó sin parsear JSON
- ✅ **Delta-based:** solo cambios finales, NO keystroke tracking
- ✅ **Auditoria profesional:** requerido en producción para cumplimiento
- ✅ **Inmutable:** una vez creado, un evento nunca se edita/borra (append-only)

---

## 📋 Matriz de Eventos Registrados

| # | Evento | Tipo | Disparador | ¿Siempre? | ¿Quién registra? |
|---|--------|------|-----------|----------|-----------------|
| 1 | **Lead Creado** | `CREATED` | POST /leads exitoso | SÍ | Backend |
| 2 | **Estado Cambia** | `STATUS_CHANGED` | PATCH /leads/{id}/status exitoso | SÍ | Backend |
| 3 | **Nota Agregada** | `NOTE_ADDED` | POST /leads/{id}/notes exitoso | SÍ | Backend |
| 4 | **Campo Editado** | `FIELD_EDITED` | PATCH /leads/{id} exitoso + delta | **SOLO si cambio** | Backend |
| 5 | **Lead Borrado** | `DELETED` | DELETE /leads/{id} exitoso | SÍ (soft delete) | Backend |

**¿QUÉ NO REGISTRAMOS?**
- ❌ Keystroke mientras usuario edita (ruido)
- ❌ Si usuario abre modal pero no hace cambios (ruido)
- ❌ Intentos fallidos (ej: POST /leads que falla por validación)
- ❌ Búsquedas o visualizaciones del lead (too noisy)

---

## 🔍 Especificación Técnica por Evento

### Evento #1: CREATED

**Descripción:** Lead fue creado por primera vez.

**Disparador:** POST /leads completado exitosamente.

**Datos Capturados:**

| Campo | Valor | Ejemplo |
|-------|-------|---------|
| `event_type` | `"CREATED"` | |
| `old_value` | `null` | |
| `new_value` | Lead completo | `{"name": "Juan García", "company": "TechCorp", "email": "juan@...", "phone": "+34..."}` |
| `description` | Texto legible | `"Lead creado por Anuar"` |
| `created_by_id` | ID usuario que creó | `1` (Anuar) |
| `created_at` | Timestamp | `2026-06-07T10:30:00Z` |

**Render en Timeline (UX):**

```
🟢 NUEVO LEAD
  Juan García creó un lead
  
  Datos iniciales:
  • Nombre: Juan García
  • Empresa: TechCorp Inc
  • Email: juan@techcorp.com
  • Teléfono: +34 912 345 678
  
  10:30 AM, 7 de Junio
```

**Validaciones:**
- ✅ Todos los campos requeridos existen (name, company, email)
- ✅ Email es válido
- ✅ Usuario tiene permisos para crear leads (auth)

---

### Evento #2: STATUS_CHANGED

**Descripción:** Lead se movió entre estados en el Kanban.

**Disparador:** PATCH /leads/{id}/status completado exitosamente.

**Transiciones Válidas:**

```
NEW → IN_CONTACT → PROPOSAL_SENT → CLOSED
↑        ↓              ↓
└─────────────────────┘ (backtrack permitido)

Cualquier estado puede ir a CLOSED
```

**Datos Capturados:**

| Campo | Valor | Ejemplo |
|-------|-------|---------|
| `event_type` | `"STATUS_CHANGED"` | |
| `old_value` | Estado anterior | `{"status": "NEW"}` |
| `new_value` | Estado nuevo | `{"status": "IN_CONTACT"}` |
| `description` | Texto legible | `"Movido de 'Nuevo' a 'En contacto'"` |
| `created_by_id` | ID usuario | `1` (Anuar) |
| `created_at` | Timestamp | `2026-06-07T11:15:00Z` |

**Render en Timeline (UX):**

```
🟠 CAMBIO DE ESTADO
  Anuar movió a 'En contacto'
  
  Nuevo → En contacto
  
  11:15 AM, 7 de Junio
```

**Validaciones:**
- ✅ Estado destino es válido (NEW, IN_CONTACT, PROPOSAL_SENT, CLOSED)
- ✅ Transición es permitida (no hay transiciones prohibidas, cualquiera es válida)
- ✅ Estado realmente cambió (old ≠ new)

---

### Evento #3: NOTE_ADDED

**Descripción:** Usuario agregó una nota/comentario al lead.

**Disparador:** POST /leads/{id}/notes completado exitosamente.

**Datos Capturados:**

| Campo | Valor | Ejemplo |
|-------|-------|---------|
| `event_type` | `"NOTE_ADDED"` | |
| `old_value` | `null` | |
| `new_value` | Nota completa | `{"note_id": 42, "content": "Cliente interesado en Feature X", "created_by": "Anuar"}` |
| `description` | Texto legible | `"Nota agregada por Anuar: 'Cliente interesado...'"` |
| `created_by_id` | ID usuario | `1` (Anuar) |
| `created_at` | Timestamp | `2026-06-07T11:45:00Z` |

**Render en Timeline (UX):**

```
💬 NOTA AGREGADA
  Anuar agregó una nota:
  
  "Cliente interesado en Feature X, llamar mañana"
  
  11:45 AM, 7 de Junio
```

**Validaciones:**
- ✅ Contenido no está vacío (min 1 char, max 5000 chars)
- ✅ Usuario tiene permisos para agregar notas
- ✅ Lead existe

---

### Evento #4: FIELD_EDITED

**Descripción:** Uno o más campos del lead fueron editados.

**Disparador:** PATCH /leads/{id} completado exitosamente + al menos un campo cambió.

**¿Qué campos pueden cambiar?**

Estos campos, SÍ registramos:
- ✅ `name`
- ✅ `company`
- ✅ `email` (muy raro, pero posible)
- ✅ `phone`
- ✅ `notes` (notas internas del lead, NO timeline notes)

Estos campos, NO registramos:
- ❌ `updated_at` (meta, siempre cambia)
- ❌ `created_by_id` (inmutable)
- ❌ timestamps de auditoría

**Datos Capturados (Ejemplo: Edit Name + Phone):**

| Campo | Valor | Ejemplo |
|-------|-------|---------|
| `event_type` | `"FIELD_EDITED"` | |
| `old_value` | Campos antes | `{"name": "Juan García", "phone": "+34 912 345 678"}` |
| `new_value` | Campos después | `{"name": "Juan Carlos García López", "phone": "+34 912 345 999"}` |
| `description` | Texto legible (delta) | `"Nombre: 'Juan García' → 'Juan Carlos García López'\nTeléfono: '+34 912 345 678' → '+34 912 345 999'"` |
| `created_by_id` | ID usuario | `1` (Anuar) |
| `created_at` | Timestamp | `2026-06-07T12:00:00Z` |

**Render en Timeline (UX):**

```
✏️ INFORMACIÓN EDITADA
  Anuar editó el lead:
  
  Nombre:
    Juan García → Juan Carlos García López
  
  Teléfono:
    +34 912 345 678 → +34 912 345 999
  
  12:00 PM, 7 de Junio
```

**Regla Clave: "Solo si hay delta"**

```python
# Pseudocode para Amelia
old_values = {...}  # valores anteriores
new_values = {...}  # valores nuevos

delta = {}
for field in ['name', 'company', 'email', 'phone', 'notes']:
    if old_values[field] != new_values[field]:
        delta[field] = (old_values[field], new_values[field])

if len(delta) > 0:
    # Crear FIELD_EDITED event
    create_audit_log(
        event_type='FIELD_EDITED',
        old_value={k: v[0] for k, v in delta.items()},
        new_value={k: v[1] for k, v in delta.items()},
        description=format_delta(delta)
    )
else:
    # NO crear evento (usuario no cambió nada)
    pass
```

**Validaciones:**
- ✅ Al menos un campo cambió (no eventos vacíos)
- ✅ Nuevos valores pasan validaciones (email válido, min lengths, etc.)
- ✅ Usuario tiene permisos para editar

---

### Evento #5: DELETED

**Descripción:** Lead fue borrado (soft delete).

**Disparador:** DELETE /leads/{id} completado exitosamente.

**Nota:** Usamos soft delete (set `deleted_at` timestamp). Nunca borramos de verdad.

**Datos Capturados:**

| Campo | Valor | Ejemplo |
|-------|-------|---------|
| `event_type` | `"DELETED"` | |
| `old_value` | Lead completo (para auditoría) | `{...full lead...}` |
| `new_value` | `null` | |
| `description` | Texto legible | `"Lead borrado por Anuar"` |
| `created_by_id` | ID usuario | `1` (Anuar) |
| `created_at` | Timestamp | `2026-06-07T15:30:00Z` |

**Render en Timeline (UX):**

```
🗑️ LEAD BORRADO
  Anuar borró este lead
  
  Razón: (opcional, si se proporciona)
  
  3:30 PM, 7 de Junio
```

**Validaciones:**
- ✅ Lead existe
- ✅ Usuario tiene permisos para borrar

**¿Quién puede ver leads borrados?**
- En MVP: Solo admins (futura feature)
- Por ahora: Leads borrados están hidden de todos

---

## 🔄 Flujos de Creación de Eventos

### Flujo A: Crear Lead

```
Frontend: POST /api/leads
├─ Body: {name, company, email, phone, notes}
└─ Response: 200 + new_lead

Backend:
├─ Validar entrada (email válido, unique, etc.)
├─ INSERT into leads table
│  └─ new_lead.id = 42
├─ CREATE audit log entry:
│  ├─ lead_id = 42
│  ├─ event_type = 'CREATED'
│  ├─ new_value = {name, company, email, phone}
│  ├─ description = "Lead creado por Anuar"
│  └─ created_by_id = 1
└─ Response 200 to frontend
```

---

### Flujo B: Mover Lead Entre Estados

```
Frontend: PATCH /api/leads/42/status
├─ Body: {status: 'IN_CONTACT'}
└─ Response: 200 + updated_lead

Backend:
├─ Validate status transition (always allowed in MVP)
├─ UPDATE leads SET status='IN_CONTACT' WHERE id=42
├─ CREATE audit log entry:
│  ├─ lead_id = 42
│  ├─ event_type = 'STATUS_CHANGED'
│  ├─ old_value = {status: 'NEW'} (del registro anterior)
│  ├─ new_value = {status: 'IN_CONTACT'}
│  ├─ description = "Movido de 'Nuevo' a 'En contacto'"
│  └─ created_by_id = 1
└─ Response 200 to frontend
```

---

### Flujo C: Agregar Nota

```
Frontend: POST /api/leads/42/notes
├─ Body: {content: 'Cliente interesado...'}
└─ Response: 200 + {note_id, content, created_at}

Backend:
├─ Validate note (not empty, <5000 chars)
├─ INSERT into notes table (optional table, or embed in lead)
│  └─ note.id = 999
├─ CREATE audit log entry:
│  ├─ lead_id = 42
│  ├─ event_type = 'NOTE_ADDED'
│  ├─ new_value = {note_id: 999, content: '...', created_by: 'Anuar'}
│  ├─ description = "Nota agregada por Anuar: 'Cliente interesado...'"
│  └─ created_by_id = 1
└─ Response 200 to frontend
```

---

### Flujo D: Editar Lead (Name + Phone)

```
Frontend: PATCH /api/leads/42
├─ Body: {name: 'Juan Carlos García López', phone: '+34 912 345 999'}
└─ Response: 200 + updated_lead

Backend:
├─ Fetch current lead: {name: 'Juan García', phone: '+34 912 345 678', ...}
├─ Validate new values
├─ UPDATE leads SET name='Juan Carlos...', phone='+34...' WHERE id=42
├─ Calculate delta:
│  ├─ name: 'Juan García' → 'Juan Carlos...'
│  └─ phone: '+34 912...' → '+34 912...'
├─ IF delta not empty:
│  ├─ CREATE audit log entry:
│  │  ├─ lead_id = 42
│  │  ├─ event_type = 'FIELD_EDITED'
│  │  ├─ old_value = {name: 'Juan García', phone: '+34 912 345 678'}
│  │  ├─ new_value = {name: 'Juan Carlos...', phone: '+34 912...'}
│  │  ├─ description = "Nombre: 'Juan García' → ...\nTeléfono: ... → ..."
│  │  └─ created_by_id = 1
└─ Response 200 to frontend
```

---

## 🎨 Comportamiento UX del Timeline

### Modal de Timeline

**Cómo se abre:**
1. Usuario hace click en lead card
2. Modal se abre (puede ser Drawer o Modal completo)
3. Se muestra:
   - Info básica del lead (nombre, empresa, email) — STICKY top
   - Timeline de eventos (scrollable)

**Layout de Timeline:**

```
┌─────────────────────────────────────────┐
│ 👤 Juan García García                   │
│ TechCorp Inc | juan@techcorp.com        │
├─────────────────────────────────────────┤
│ 🕐 TIMELINE (scrollable)                 │
│                                         │
│ 🟢 [Hoy, 3:45 PM]                       │
│    NUEVO LEAD                           │
│    Anuar creó un lead                   │
│    Datos: Juan García, TechCorp, ...    │
│                                         │
│ 🟠 [Hoy, 2:30 PM]                       │
│    CAMBIO DE ESTADO                     │
│    Anuar movió a 'En contacto'          │
│    Nuevo → En contacto                  │
│                                         │
│ 💬 [Hoy, 1:15 PM]                       │
│    NOTA                                 │
│    "Cliente interesado en Feature X"    │
│                                         │
│ ✏️ [Hoy, 12:00 PM]                      │
│    EDITADO                              │
│    Teléfono: +34 912 345 678 → +34...   │
│                                         │
└─────────────────────────────────────────┘
```

### Iconos y Colores por Evento

| Evento | Icono | Color | Badge |
|--------|-------|-------|-------|
| CREATED | 🟢 | Verde #10B981 | "NUEVO LEAD" |
| STATUS_CHANGED | 🟠 | Naranja #F59E0B | "CAMBIO DE ESTADO" |
| NOTE_ADDED | 💬 | Azul #3B82F6 | "NOTA" |
| FIELD_EDITED | ✏️ | Púrpura #A855F7 | "EDITADO" |
| DELETED | 🗑️ | Rojo #EF4444 | "BORRADO" |

### Información por Evento (Expandible?)

Cada evento muestra:
- **Tipo** (icono + badge)
- **Descripción** legible
- **Timestamp** (formato: "Hoy, 3:45 PM" o "7 de Junio, 10:30 AM")
- **Usuario** (quién lo hizo)
- **Detalles** (delta si aplica)

¿**Expandible**? (Opcional para MVP)
- Click en evento → muestra detalles técnicos (old_value, new_value en JSON)
- Útil para auditoría, pero probablemente no necesario para demo

---

## 📐 Datos del Evento (JSON Schema)

**Tabla `lead_audit_log` en PostgreSQL:**

```sql
CREATE TABLE lead_audit_log (
    id BIGSERIAL PRIMARY KEY,
    
    -- Referencia
    lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Tipo de evento
    event_type VARCHAR(50) NOT NULL,
    CHECK (event_type IN ('CREATED', 'STATUS_CHANGED', 'NOTE_ADDED', 'FIELD_EDITED', 'DELETED')),
    
    -- Valores (antes y después)
    old_value JSONB,                 -- null si CREATED o NOTE_ADDED
    new_value JSONB,                 -- null si DELETED
    
    -- Descripción legible (para UX)
    description TEXT NOT NULL,
    
    -- Auditoría
    created_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata (futuro)
    metadata JSONB DEFAULT '{}',  -- {ip, user_agent, request_id, ...}
    
    -- Índices para performance
    CONSTRAINT valid_values CHECK (
        (event_type = 'CREATED' AND old_value IS NULL AND new_value IS NOT NULL)
        OR (event_type = 'STATUS_CHANGED' AND old_value IS NOT NULL AND new_value IS NOT NULL)
        OR (event_type = 'NOTE_ADDED' AND old_value IS NULL AND new_value IS NOT NULL)
        OR (event_type = 'FIELD_EDITED' AND old_value IS NOT NULL AND new_value IS NOT NULL)
        OR (event_type = 'DELETED' AND old_value IS NOT NULL AND new_value IS NULL)
    )
);

CREATE INDEX idx_lead_audit_log_lead_id 
ON lead_audit_log(lead_id, created_at DESC);

CREATE INDEX idx_lead_audit_log_event_type 
ON lead_audit_log(event_type);
```

**JSON Schema para valores:**

```json
// CREATED: new_value
{
  "name": "string",
  "company": "string",
  "email": "string",
  "phone": "string (optional)",
  "notes": "string (optional)"
}

// STATUS_CHANGED: old_value y new_value
{
  "status": "enum(NEW|IN_CONTACT|PROPOSAL_SENT|CLOSED)"
}

// NOTE_ADDED: new_value
{
  "note_id": "integer",
  "content": "string",
  "created_by": "string (username)"
}

// FIELD_EDITED: old_value y new_value
{
  "name": "string (optional)",
  "company": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "notes": "string (optional)"
}

// DELETED: old_value (full snapshot)
{
  "name": "string",
  "company": "string",
  "email": "string",
  "phone": "string (optional)",
  "notes": "string (optional)",
  "status": "enum",
  "created_by_id": "integer"
}
```

---

## ✅ Validaciones y Edge Cases

### Validación #1: No Eventos Vacíos

**Escenario:** Usuario hace PATCH /leads/42 pero no cambia nada.

```python
# Backend logic
if old_values == new_values:
    # NO crear FIELD_EDITED event
    pass
else:
    # Crear evento
```

**Resultado:** No hay "ruido" en timeline.

---

### Validación #2: Delta Exacta

**Escenario:** Usuario edita nombre 3 veces: "Juan" → "Juan Carlos" → "Juan Carlos García"

**Esperado:**
- 3 eventos FIELD_EDITED separados (uno por cada PATCH)
- Cada evento registra la transición exacta

**NO esperado:**
- Un evento que resume todo (sería incorrecto para auditoría)

---

### Validación #3: Race Condition en Ediciones Simultáneas

**Escenario:** Dos usuarios editan el mismo lead simultáneamente.

```
User A: PATCH /leads/42 {name: 'Juan Carlos'}
User B: PATCH /leads/42 {phone: '+34 999'}

Esperado:
├─ Update A: name = 'Juan Carlos' ✅
│  └─ Event A: FIELD_EDITED {name: '...' → 'Juan Carlos'}
│
├─ Update B: phone = '+34 999' ✅
│  └─ Event B: FIELD_EDITED {phone: '...' → '+34 999'}
│
└─ Resultado final: {name: 'Juan Carlos', phone: '+34 999', ...}
   Timeline: 2 eventos, ambos registrados

NO es conflict: el segundo Update solo toca phone, name permanece.
```

**¿Si dos editan el MISMO campo?**

```
User A: PATCH /leads/42 {name: 'Juan Carlos'} (más lento)
User B: PATCH /leads/42 {name: 'Juan García López'} (más rápido)

Esperado (Last Write Wins):
├─ User B completa primero: name = 'Juan García López'
│  └─ Event B FIELD_EDITED: name: 'Juan' → 'Juan García López'
│
├─ User A completa después: name = 'Juan Carlos'
│  └─ Event A FIELD_EDITED: name: 'Juan García López' → 'Juan Carlos'
│
└─ Resultado final: name = 'Juan Carlos'
   Timeline: 2 eventos en orden (B primero, A segundo)
```

Esto es correcto. Timeline muestra la realidad: B escribió primero, A sobrescribió.

---

### Validación #4: Email Único en FIELD_EDITED

**Escenario:** Usuario intenta editar email a uno que ya existe.

```
PATCH /leads/42 {email: 'juan@already-exists.com'}

Backend:
├─ Validar: SELECT * FROM leads WHERE email='juan@...' AND id != 42
├─ Si existe otro lead con ese email: retorna 409 Conflict
│  └─ NO crear evento (la operación falló)
└─ Si no existe: UPDATE y crear evento
```

---

### Edge Case #1: Lead Borrado Pero Consultando Timeline

**Escenario:** Alguien borra un lead, pero luego quiere ver su timeline (auditoría).

```
DELETE /leads/42 (soft delete: set deleted_at)

Mañana:
├─ GET /leads/42 → 404 (lead está soft-deleted)
├─ Pero GET /leads/42/audit-log → 200 + timeline completo
│  └─ Útil para auditoría, forensics
```

---

### Edge Case #2: Usuario Borrado, Pero Evento Permanece

**Escenario:** Anuar crea un lead, luego su cuenta se borra.

```
DELETE FROM users WHERE id=1 (Anuar)

En timeline:
├─ Evento CREATED dice: created_by_id = 1
├─ Pero usuario no existe
├─ UX muestra: "Unknown User" o "[Usuario borrado]"
```

**No es problema:** auditoría permanece, solo el nombre es desconocido.

---

## 🧪 Testing Scenarios

### Test Scenario #1: Crear y Editar Lead (2 Eventos)

```gherkin
Given un usuario "Anuar" está logueado
When crea un lead:
  - Nombre: "Juan García"
  - Empresa: "TechCorp"
  - Email: "juan@techcorp.com"
Then se crea un evento CREATED
  - description: "Lead creado por Anuar"
  - new_value.name: "Juan García"

When Anuar edita el nombre a "Juan Carlos García"
Then se crea un evento FIELD_EDITED
  - description contiene: "Nombre: 'Juan García' → 'Juan Carlos García'"
  - old_value.name: "Juan García"
  - new_value.name: "Juan Carlos García"
```

**Verificación:**
- [ ] Eventos en orden DESC (más reciente primero)
- [ ] Timestamps son correctos
- [ ] created_by_id es 1 (Anuar)

---

### Test Scenario #2: Mover Lead (STATUS_CHANGED)

```gherkin
Given un lead en estado "NEW"
When usuario lo arrastra a "IN_CONTACT"
Then se crea evento STATUS_CHANGED
  - old_value.status: "NEW"
  - new_value.status: "IN_CONTACT"
  - description: "Movido de 'Nuevo' a 'En contacto'"

When usuario lo mueve a "PROPOSAL_SENT"
Then se crea segundo evento STATUS_CHANGED
  - old_value.status: "IN_CONTACT"
  - new_value.status: "PROPOSAL_SENT"

Then timeline muestra 2 eventos (más reciente primero)
```

---

### Test Scenario #3: No Crear Evento si No Hay Cambios

```gherkin
Given un lead con nombre "Juan García"
When usuario edita el nombre a "Juan García" (mismo valor)
Then NO se crea evento FIELD_EDITED
  (Si entra al bloque delta, sería vacío, no se registra)

When usuario edita empresa a "NewCorp" (cambio real)
Then se crea evento FIELD_EDITED
  - old_value.company: "TechCorp"
  - new_value.company: "NewCorp"
```

---

### Test Scenario #4: Timeline Completo (5 Eventos)

```
10:30 - CREATED (Anuar)
11:00 - STATUS_CHANGED: NEW → IN_CONTACT (Anuar)
11:15 - NOTE_ADDED: "Interesado en Feature X" (Anuar)
11:30 - FIELD_EDITED: phone actualizado (Anuar)
12:00 - STATUS_CHANGED: IN_CONTACT → PROPOSAL_SENT (Anuar)

GET /leads/42/audit-log (paginated, 20 por página)
Retorna eventos en DESC (12:00 primero, 10:30 último)
```

---

## 🎯 Checklist de Implementación para Amelia

- [ ] Crear tabla `lead_audit_log` con schema exacto
- [ ] 5 tipos de eventos: CREATED, STATUS_CHANGED, NOTE_ADDED, FIELD_EDITED, DELETED
- [ ] En cada operación sobre lead, crear evento en `lead_audit_log`
- [ ] Validación: No eventos vacíos (delta debe tener al menos un cambio)
- [ ] Endpoint: GET /leads/{id}/audit-log (retorna últimos 20 eventos DESC)
- [ ] UX: Timeline modal con iconos, colores, descriptions legibles
- [ ] Validación: Constraint CHECK en tabla para tipos de eventos válidos
- [ ] Testing: 4 test scenarios arriba
- [ ] Documentación: Si alguien edita el código de auditoría, sabe qué está pasando

---

## 📝 Documento de Control

| Propiedad | Valor |
|-----------|-------|
| **Documento** | TIMELINE-ESPECIFICACION-DETALLADA.md |
| **Versión** | 1.0 FINAL |
| **Fecha** | 2026-06-07 |
| **Estado** | ✅ LISTO PARA IMPLEMENTACIÓN |
| **Autor** | Sally (UX) + Winston (Architecture) |
| **Revisado por** | [Anuar — pendiente] |
| **Objetivo** | Zero ambigüedad en timeline/auditoría |

---

**Fin del Documento — Este spec permite que Amelia codifique el Timeline sin preguntas.**
