# 📊 Anexo BMAD — Mini CRM: Matrices de Referencia y Modelo de Datos

**Documento:** Anexo Técnico — Mini CRM Especificación  
**Objetivo:** Referencia rápida para Diseñadores UX, Arquitectos, Desarrolladores  
**Audiencia:** Freya (UX), Mimir (Developer), Saga (Analysis)  

---

## 1. Modelo de Datos — Vista de Entidades

### 1.1 Diagrama ER (Conceptual)

```
┌─────────────────────────┐
│        LEADS            │
├─────────────────────────┤
│ id_lead (UUID)      [PK]│
│ nombre (VARCHAR)    [NN]│
│ empresa (VARCHAR)   [NN]│
│ email (VARCHAR)     [NN,UQ]│
│ telefono (VARCHAR)      │
│ estado (ENUM)       [NN]│
│ fuente (ENUM)           │
│ monto_estimado (DECIMAL)│
│ fecha_creacion      [NN]│
│ fecha_actualizacion [NN]│
│ fecha_proximo_contacto  │
│ notas (TEXT)            │
│ asignado_a (FK→users)   │
│ prioridad (ENUM)        │
│ dias_en_estado (COMPUTED)│
│ version (INT)       [OPT]│
└─────────────────────────┘
          │
          │ 1:N
          └────→ ┌──────────────────────┐
                 │   LEADS_AUDIT        │
                 ├──────────────────────┤
                 │ audit_id (UUID)  [PK]│
                 │ lead_id (FK)     [NN]│
                 │ campo_modificado [NN]│
                 │ valor_anterior       │
                 │ valor_nuevo          │
                 │ usuario_id       [NN]│
                 │ timestamp        [NN]│
                 │ accion (ENUM)    [NN]│
                 └──────────────────────┘

Legend:
[PK] = Primary Key
[FK] = Foreign Key
[UQ] = Unique
[NN] = Not Null
[OPT] = Optional
```

### 1.2 Tabla de Campos Detallada

```sql
CREATE TABLE leads (
    id_lead UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    empresa VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    estado ENUM('Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado') 
        NOT NULL DEFAULT 'Nuevo',
    fuente ENUM('Referencia', 'Inbound', 'Campaña', 'Red Social', 'Evento', 'Otra')
        DEFAULT 'Otra',
    monto_estimado DECIMAL(12, 2),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_proximo_contacto DATE,
    notas TEXT,
    asignado_a UUID REFERENCES users(id),
    prioridad ENUM('Baja', 'Media', 'Alta', 'Urgente') DEFAULT 'Media',
    version INT DEFAULT 1,  -- Para optimistic locking
    
    CONSTRAINT valid_monto CHECK (monto_estimado >= 0),
    CONSTRAINT valid_fecha_contacto CHECK (
        fecha_proximo_contacto IS NULL OR 
        fecha_proximo_contacto >= CURRENT_DATE
    ),
    CONSTRAINT estado_cierre CHECK (
        -- Si estado = Cerrado, no modificar except notas
        TRUE -- Controlado en aplicación
    )
);

CREATE TABLE leads_audit (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id_lead) ON DELETE CASCADE,
    campo_modificado VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    usuario_id UUID NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accion ENUM('CREATE', 'UPDATE', 'DELETE', 'MOVE') NOT NULL
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_estado ON leads(estado);
CREATE INDEX idx_leads_asignado ON leads(asignado_a);
CREATE INDEX idx_leads_fecha_creacion ON leads(fecha_creacion);
CREATE INDEX idx_audit_lead_id ON leads_audit(lead_id);
```

---

## 2. Estados y Transiciones — Matriz Exhaustiva

### 2.1 Matriz de Transiciones Válidas

```
FROM / TO      │  Nuevo  │ En contacto │ Propuesta │ Cerrado
───────────────┼─────────┼─────────────┼───────────┼─────────
Nuevo          │   —     │      ✅     │     ❌    │   ❌
En contacto    │   ✅    │      —      │     ✅    │   ❌
Propuesta      │   ✅    │      ✅     │     —     │   ✅
Cerrado        │   ❌    │      ❌     │     ❌    │   —

Legend:
✅ = Permitida
❌ = Rechazada
— = N/A (mismo estado)
```

### 2.2 Lógica de Transición (Pseudocódigo)

```python
def can_transition(current_state: str, target_state: str) -> bool:
    """
    Valida si transición de estado es permitida
    """
    if current_state == target_state:
        return False  # No cambio
    
    # Matriz de transiciones válidas
    valid_transitions = {
        "Nuevo": ["En contacto"],
        "En contacto": ["Nuevo", "Propuesta enviada"],
        "Propuesta enviada": ["Nuevo", "En contacto", "Cerrado"],
        "Cerrado": []  # Terminal, sin salidas
    }
    
    return target_state in valid_transitions.get(current_state, [])


def apply_transition(lead_id: str, target_state: str, user_id: str):
    """
    Aplica transición de estado con auditoría
    """
    # 1. Obtener lead actual
    lead = db.query("SELECT * FROM leads WHERE id_lead = ?", [lead_id])
    current_state = lead.estado
    
    # 2. Validar transición
    if not can_transition(current_state, target_state):
        raise InvalidTransitionError(f"{current_state} → {target_state}")
    
    # 3. Actualizar con versionado (optimistic locking)
    rows_affected = db.update(
        """UPDATE leads 
           SET estado = ?, fecha_actualizacion = NOW(), version = version + 1
           WHERE id_lead = ? AND version = ?""",
        [target_state, lead_id, lead.version]
    )
    
    if rows_affected == 0:
        raise ConcurrentModificationError("Lead fue modificado por otro usuario")
    
    # 4. Registrar en auditoría
    db.insert("leads_audit", {
        "lead_id": lead_id,
        "campo_modificado": "estado",
        "valor_anterior": current_state,
        "valor_nuevo": target_state,
        "usuario_id": user_id,
        "accion": "MOVE"
    })
    
    return {"success": True, "new_state": target_state}
```

---

## 3. Validaciones — Matriz de Reglas de Entrada

### 3.1 Reglas de Validación Ejecutables

```yaml
validation_rules:
  
  nombre:
    type: "text"
    required: true
    min_length: 2
    max_length: 100
    pattern: "^[\\p{L}\\p{N}\\s\\-\\']+$"  # Letras, números, espacios, guiones, apóstrofe
    error_messages:
      required: "El nombre es obligatorio"
      too_short: "Nombre debe tener al menos 2 caracteres"
      too_long: "Nombre no puede exceder 100 caracteres"
      invalid_format: "Nombre contiene caracteres inválidos"
  
  empresa:
    type: "text"
    required: true
    min_length: 2
    max_length: 100
    pattern: "^[\\p{L}\\p{N}\\s\\-\\']+$"
    error_messages:
      required: "La empresa es obligatoria"
      too_short: "Empresa debe tener al menos 2 caracteres"
      too_long: "Empresa no puede exceder 100 caracteres"
  
  email:
    type: "email"
    required: true
    max_length: 120
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    unique: true  # Verificar en BD antes de guardar
    error_messages:
      required: "El email es obligatorio"
      invalid_format: "Email inválido. Ej: usuario@empresa.com"
      too_long: "Email no puede exceder 120 caracteres"
      already_exists: "Este email ya está registrado"
  
  telefono:
    type: "phone"
    required: false
    min_length: 7
    max_length: 20
    pattern: "^[\\+]?[(]?[0-9]{1,4}[)]?[-\\s.]?[(]?[0-9]{1,4}[)]?[-\\s.]?[0-9]{1,9}$"
    error_messages:
      too_short: "Teléfono muy corto (mín. 7 dígitos)"
      too_long: "Teléfono muy largo (máx. 20 caracteres)"
      invalid_format: "Teléfono inválido. Ej: +34 91 123 4567"
  
  monto_estimado:
    type: "number"
    required: false
    min_value: 0
    max_value: 999999.99
    decimals: 2
    error_messages:
      negative: "El monto debe ser positivo"
      too_large: "Monto máximo es $999.999,99 USD"
      invalid_decimals: "Máximo 2 decimales permitidos"
  
  notas:
    type: "text"
    required: false
    max_length: 1000
    multiline: true
    error_messages:
      too_long: "Notas no pueden exceder 1000 caracteres"
  
  fecha_proximo_contacto:
    type: "date"
    required: false
    min_date: "today"
    max_date: "+365 days"
    error_messages:
      past_date: "La fecha debe ser futura"
      too_far: "La fecha no puede ser más de 365 días en el futuro"
  
  estado:
    type: "enum"
    required: true
    allowed_values: ["Nuevo", "En contacto", "Propuesta enviada", "Cerrado"]
    editable_when: "creating"  # Cambiable solo vía drag-drop, no en formulario
    error_messages:
      invalid_value: "Estado no válido"
  
  prioridad:
    type: "enum"
    required: false
    allowed_values: ["Baja", "Media", "Alta", "Urgente"]
    default_value: "Media"
    error_messages:
      invalid_value: "Prioridad no válida"
  
  fuente:
    type: "enum"
    required: false
    allowed_values: ["Referencia", "Inbound", "Campaña", "Red Social", "Evento", "Otra"]
    default_value: "Otra"
    error_messages:
      invalid_value: "Fuente no válida"
```

### 3.2 Validación en Tiempo Real (Frontend)

```javascript
// validation-config.js - Para uso en formularios React/Vue

export const fieldValidations = {
  nombre: {
    validate: (value) => value?.trim().length >= 2 && value?.trim().length <= 100,
    hint: "2-100 caracteres",
    debounce: 0
  },
  empresa: {
    validate: (value) => value?.trim().length >= 2 && value?.trim().length <= 100,
    hint: "2-100 caracteres",
    debounce: 0
  },
  email: {
    validate: (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
    hint: "usuario@empresa.com",
    debounce: 500,  // Esperar a que termine de escribir
    asyncValidate: async (value) => {
      const response = await fetch(`/api/leads/check-email?email=${encodeURIComponent(value)}`);
      return response.ok ? { available: true } : { available: false, taken_by: response.data };
    }
  },
  telefono: {
    validate: (value) => !value || /^[\+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(value),
    hint: "+34 91 123 4567",
    debounce: 300,
    warn_if_invalid: true  // Solo advertencia, no error bloqueante
  },
  monto_estimado: {
    validate: (value) => !value || (Number(value) >= 0 && Number(value) <= 999999.99),
    hint: "0 - 999,999.99 USD",
    debounce: 0,
    parse: (value) => value ? Number(value).toFixed(2) : null
  },
  notas: {
    validate: (value) => !value || value.length <= 1000,
    hint: "Máximo 1000 caracteres",
    debounce: 200,
    counter: true  // Mostrar contador de caracteres
  },
  fecha_proximo_contacto: {
    validate: (value) => !value || new Date(value) >= new Date().setHours(0, 0, 0, 0),
    hint: "Debe ser futura",
    debounce: 0
  }
};
```

---

## 4. Enums — Valores Permitidos

### 4.1 Tabla de Valores de Enum

```
STATE ENUM (estado):
  Código         │ Etiqueta         │ Color  │ Significado
  ───────────────┼──────────────────┼────────┼───────────────────────────
  "Nuevo"        │ Nuevo            │ 🔵    │ Lead recién ingresado
  "En contacto"  │ En contacto      │ 🟡    │ Comunicación establecida
  "Propuesta"    │ Propuesta Enviada│ 🟣    │ Propuesta compartida
  "Cerrado"      │ Cerrado          │ 🟢    │ Transacción completada

SOURCE ENUM (fuente):
  "Referencia"   │ Referencia de cliente actual
  "Inbound"      │ Lead que se contactó a nosotros
  "Campaña"      │ De una campaña de marketing
  "Red Social"   │ Proviene de redes sociales
  "Evento"       │ De un evento, conferencia, webinar
  "Otra"         │ Otro origen / No especificado

PRIORITY ENUM (prioridad):
  "Baja"         │ Seguimiento después de otras oportunidades
  "Media"        │ Prioridad estándar (default)
  "Alta"         │ Requiere seguimiento urgente
  "Urgente"      │ Contacto inmediato necesario

ACTION ENUM (accion en auditoría):
  "CREATE"       │ Lead fue creado
  "UPDATE"       │ Un campo fue modificado
  "DELETE"       │ Lead fue eliminado (soft delete)
  "MOVE"         │ Estado del lead cambió
```

---

## 5. Matriz de Permisos y Roles

### 5.1 Matriz de Control de Acceso (RBAC)

```
              │ CREAR │ VER  │ EDITAR │ MOVER │ REASIGNAR │ ELIMINAR │ VER AUDIT
──────────────┼───────┼──────┼────────┼───────┼───────────┼──────────┼──────────
Ejecutivo     │  ✅   │ 🟡¹  │  ✅²   │  ✅   │    ❌     │    ❌    │    ❌
Coordinador   │  ✅   │  ✅   │  ✅   │  ✅   │    ✅     │    🟡³   │    ✅
Admin/Manager │  ✅   │  ✅   │  ✅   │  ✅   │    ✅     │    ✅    │    ✅
Viewer (Leer) │  ❌   │  ✅   │  ❌   │  ❌   │    ❌     │    ❌    │    ✅

Notas:
1. 🟡¹ = Ver solo leads asignados a él
2. ✅² = Editar solo campos no-sistema, no edita leads de otros
3. 🟡³ = Puede borrar leads sin venta (soft delete)
```

---

## 6. Matriz de Mensajes de Error

### 6.1 Catálogo de Errores Estandarizado

```yaml
errors:
  
  VALIDATION_ERROR:
    code: "VAL-001"
    status: 400
    messages:
      REQUIRED_FIELD: "El campo {field} es requerido"
      INVALID_FORMAT: "El campo {field} tiene formato inválido"
      DUPLICATE_EMAIL: "El email {email} ya está registrado"
      TOO_LONG: "El campo {field} no puede exceder {max} caracteres ({actual} ingresados)"
      TOO_SHORT: "El campo {field} debe tener al menos {min} caracteres"
      OUT_OF_RANGE: "El valor {value} está fuera del rango permitido ({min} - {max})"
  
  INVALID_TRANSITION:
    code: "TRANS-001"
    status: 422
    messages:
      INVALID_STATE_CHANGE: "No se puede cambiar de {from} a {to}"
      CANNOT_EDIT_CLOSED: "No se puede editar un lead cerrado"
      IMMUTABLE_FIELD: "El campo {field} no puede ser modificado"
  
  CONFLICT:
    code: "CONF-001"
    status: 409
    messages:
      CONCURRENT_MODIFICATION: "Este lead fue modificado por otro usuario"
      DUPLICATE_ENTRY: "Ya existe un lead con estos datos"
      STATE_MISMATCH: "El estado no coincide. Recarga la página"
  
  NOT_FOUND:
    code: "NOT-001"
    status: 404
    messages:
      LEAD_NOT_FOUND: "El lead no existe o fue eliminado"
  
  PERMISSION_DENIED:
    code: "PERM-001"
    status: 403
    messages:
      ACCESS_DENIED: "No tienes permiso para acceder a este recurso"
      INSUFFICIENT_ROLE: "Tu rol no permite esta acción"
  
  INTERNAL_ERROR:
    code: "ERR-001"
    status: 500
    messages:
      DATABASE_ERROR: "Error de base de datos. Intenta más tarde"
      TIMEOUT: "La operación tomó demasiado tiempo. Intenta nuevamente"
      UNKNOWN_ERROR: "Algo salió mal. Contacta a soporte"
```

---

## 7. Matriz de Campos por Formulario

### 7.1 Formulario de Creación (CU-01)

```
╔════════════════════════════════════╗
║     CREAR LEAD - Formulario        ║
╠════════════════════════════════════╣
║ Campo                │ Requerido    ║
║ ─────────────────────┼──────────    ║
║ Nombre               │ ✅ YES       ║
║ Empresa              │ ✅ YES       ║
║ Email                │ ✅ YES       ║
║ Teléfono             │ ❌ NO        ║
║ Fuente               │ ❌ NO        ║
║ Monto Estimado       │ ❌ NO        ║
║ Prioridad            │ ❌ NO        ║
║ Notas                │ ❌ NO        ║
║ ─────────────────────┼──────────    ║
║ [Cancelar] [Guardar] │              ║
╚════════════════════════════════════╝
```

### 7.2 Formulario de Edición (CU-03)

```
╔════════════════════════════════════╗
║     EDITAR LEAD - Formulario       ║
╠════════════════════════════════════╣
║ Campo                │ Editable     ║
║ ─────────────────────┼──────────    ║
║ ID Lead              │ ❌ RO        ║
║ Nombre               │ ✅ Sí        ║
║ Empresa              │ ✅ Sí        ║
║ Email                │ ✅ Sí        ║
║ Teléfono             │ ✅ Sí        ║
║ Estado               │ ❌ RO        ║ ← Cambiar vía drag-drop
║ Fuente               │ ✅ Sí        ║
║ Monto Estimado       │ ✅ Sí        ║
║ Prioridad            │ ✅ Sí        ║
║ Fecha Próximo Contacto│ ✅ Sí       ║
║ Notas                │ ✅ Sí (append) ║
║ Fecha Creación       │ ❌ RO        ║
║ Fecha Actualización  │ ❌ RO        ║
║ Días en Estado       │ ❌ RO        ║
║ ─────────────────────┼──────────    ║
║ [Cancelar] [Guardar] │              ║
╚════════════════════════════════════╝

Legend:
✅ = Editable
❌ = Read-Only
RO = Read-Only
```

---

## 8. Matriz de Búsqueda y Filtrado

### 8.1 Capacidades de Búsqueda

```
BÚSQUEDA RÁPIDA (CU-04a):
  Campo de Búsqueda: "Buscar lead..."
  
  Busca en:
    ✅ nombre (case-insensitive, partial match)
    ✅ empresa (case-insensitive, partial match)
    ✅ email (case-insensitive, exact o partial)
  
  Comportamiento:
    - Tiempo real (sin botón buscar)
    - Debounce: 300ms
    - Resultados filtrados en todas las columnas
    - Muestra count filtrado: "Mostrando 5 de 28 leads"
    - Botón X para limpiar búsqueda
    - Si no hay resultados: "No hay leads que coincidan"

FILTROS (CU-04b):
  
  1. Filtro por Prioridad
     ☐ Baja
     ☐ Media (default checked)
     ☐ Alta
     ☐ Urgente
     [Mostrar Todo]
  
  2. Filtro por Fuente (Advanced)
     ☐ Referencia
     ☐ Inbound
     ☐ Campaña
     ☐ Red Social
     ☐ Evento
     ☐ Otra
  
  3. Filtro por Rango de Fechas (Advanced)
     Desde: [DATE]
     Hasta: [DATE]
     Aplica a: fecha_creacion
  
  Comportamiento de Filtros:
    - Múltiple selección permitida
    - Se combinan con AND (Prioridad=Alta AND Fuente=Inbound)
    - Estado persiste durante sesión
    - Se combinan con búsqueda (AND)
```

---

## 9. Matriz de Operaciones API

### 9.1 Endpoints REST

```
# CREATE LEAD
POST /api/leads
Request Body: {
  "nombre": "string (required, 2-100 chars)",
  "empresa": "string (required, 2-100 chars)",
  "email": "string (required, email format, unique)",
  "telefono": "string (optional, 7-20 chars)",
  "fuente": "enum (optional)",
  "monto_estimado": "number (optional, >= 0)",
  "prioridad": "enum (optional)",
  "notas": "string (optional, <= 1000 chars)"
}
Response: 201 Created
{
  "id_lead": "uuid",
  "estado": "Nuevo",
  "fecha_creacion": "2026-06-07T14:30:00Z",
  "asignado_a": "current_user_id",
  "version": 1
}

# GET PIPELINE (List Leads)
GET /api/leads?limit=50&offset=0
Response: 200 OK
{
  "data": [
    {
      "id_lead": "uuid",
      "nombre": "string",
      "empresa": "string",
      "estado": "string",
      "prioridad": "string",
      "dias_en_estado": 3,
      ...
    }
  ],
  "total": 28,
  "limit": 50,
  "offset": 0
}

# GET SINGLE LEAD
GET /api/leads/{id}
Response: 200 OK
{
  "id_lead": "uuid",
  ... all fields ...
}

# UPDATE LEAD
PATCH /api/leads/{id}
Request Body: {
  "nombre": "string",
  "email": "string",
  ... (solo campos que cambian)
  "version": 5  // Para optimistic locking
}
Response: 200 OK
{
  ... updated lead ...
  "version": 6
}

# MOVE LEAD (Change State)
PATCH /api/leads/{id}/estado
Request Body: {
  "new_estado": "En contacto",
  "version": 5
}
Response: 200 OK
{
  "id_lead": "uuid",
  "estado": "En contacto",
  "version": 6
}

# GET AUDIT TRAIL
GET /api/leads/{id}/audit
Response: 200 OK
{
  "audit_trail": [
    {
      "timestamp": "2026-06-07T14:30:00Z",
      "usuario_id": "...",
      "accion": "CREATE",
      ...
    }
  ]
}

# SEARCH LEADS
GET /api/leads/search?q=juan
Response: 200 OK
{
  "results": [
    { ... lead objects ... }
  ]
}

# CHECK EMAIL AVAILABILITY
GET /api/leads/check-email?email=test@test.com
Response: 200 OK | 409 Conflict
{
  "available": true | false,
  "lead_id": "uuid (if taken)"
}

# DELETE LEAD (Soft)
DELETE /api/leads/{id}
Response: 204 No Content

# GET METRICS
GET /api/metrics/pipeline
Response: 200 OK
{
  "counts": {
    "Nuevo": 12,
    "En contacto": 8,
    "Propuesta": 5,
    "Cerrado": 3
  },
  "total": 28,
  "conversion_rate": 0.167,
  "avg_days_in_state": {
    "Nuevo": 2.3,
    "En contacto": 6.1,
    ...
  }
}
```

---

## 10. Matriz de Casos de Prueba Críticos

### 10.1 Critical Path Tests

```
┌────────────────────────────────────────────┐
│ SMOKE TEST SUITE - Mini CRM MVP           │
└────────────────────────────────────────────┘

[TEST] T-001: Create Lead Happy Path
  1. Open "Create Lead" form
  2. Fill: Nombre="Juan", Empresa="Tech", Email="juan@tech.com"
  3. Click "Guardar"
  ✓ Assert: Lead appears in "Nuevo" column
  ✓ Assert: Toast "Lead creado"
  ✓ Assert: Email is unique in DB

[TEST] T-002: Reject Duplicate Email
  1. Lead with "juan@tech.com" exists
  2. Try to create another with same email
  ✓ Assert: Error "Email ya registrado"
  ✓ Assert: Form retains data

[TEST] T-003: Drag-Drop State Change
  1. Leads visible in pipeline
  2. Drag "Nuevo" lead to "En contacto" column
  ✓ Assert: Lead moves visually
  ✓ Assert: Estado in DB changes
  ✓ Assert: Audit trail created

[TEST] T-004: Block Invalid Transition
  1. Lead in "Nuevo" state
  2. Try to drag to "Propuesta" column
  ✓ Assert: Drag is rejected
  ✓ Assert: Lead stays in "Nuevo"
  ✓ Assert: Tooltip shows valid states

[TEST] T-005: Search Real-Time
  1. 20 leads visible
  2. Type "Google" in search box
  ✓ Assert: Leads filtered instantly
  ✓ Assert: Only leads with "Google" visible
  ✓ Assert: Count updates

[TEST] T-006: Edit Lead Data
  1. Open lead panel
  2. Change "Nombre" to "New Name"
  3. Click "Guardar"
  ✓ Assert: Changes saved in DB
  ✓ Assert: Audit recorded
  ✓ Assert: UI updates

[TEST] T-007: Concurrent Edit - Optimistic Locking
  1. User A reads lead (version=5)
  2. User B reads lead (version=5)
  3. User A saves (version increments to 6)
  4. User B tries to save
  ✓ Assert: User B gets conflict error
  ✓ Assert: Option to reload

[TEST] T-008: Metrics Dashboard
  1. Create 10 leads
  2. Move 3 to "Cerrado"
  3. View metrics
  ✓ Assert: Counts correct (10 total, 3 closed)
  ✓ Assert: Conversion rate = 30%
  ✓ Assert: Average days calculated

[TEST] T-009: No Edit After Closed
  1. Lead in "Cerrado" state
  2. Try to change "Nombre"
  ✓ Assert: Cannot edit except notas
  ✓ Assert: Message "Lead cerrado"

[TEST] T-010: Session Persistence
  1. Create lead
  2. Refresh page
  ✓ Assert: Lead still exists
  ✓ Assert: State persisted correctly
```

---

## 11. Diccionario de Términos BMAD

### 11.1 Glosario Mini CRM

```
LEAD (Cliente Potencial)
  Definición: Contacto comercial identificado como prospecto potencial
  Cycle: Nuevo → En contacto → Propuesta → Cerrado
  Responsabilidad: Ejecutivo de ventas asignado

PIPELINE
  Definición: Visualización Kanban del progreso de leads
  Componentes: 4 columnas (estados del proceso)
  Métrica: Refleja salud del proceso comercial

ESTADO (Status)
  Definición: Posición actual del lead en el pipeline
  Tipos: Nuevo, En contacto, Propuesta, Cerrado
  Cambio: Vía drag-drop (user-initiated)

FUENTE (Source)
  Definición: Origen de adquisición del lead
  Ejemplos: Referencia, Inbound, Campaña, etc.
  Uso: Análisis de eficiencia de canales

PRIORIDAD (Priority)
  Definición: Urgencia de seguimiento del lead
  Niveles: Baja, Media, Alta, Urgente
  Impacto: Determina secuencia de contacto

MONTO ESTIMADO (Opportunity Value)
  Definición: Valor potencial de la transacción
  Formato: USD con 2 decimales
  Uso: Cálculo de value at risk del pipeline

ASIGNADO A (Owner)
  Definición: Ejecutivo responsable del lead
  Auto-assign: Al creador del lead
  Reasignación: Solo por coordinador/admin

AUDITORÍA (Audit Trail)
  Definición: Registro histórico de cambios
  Captura: Quién, qué, cuándo, valor anterior/nuevo
  Compliance: Requerido para trazabilidad

DÍAS EN ESTADO (Days in Stage)
  Definición: Tiempo transcurrido desde última transición
  Cálculo: NOW() - fecha_cambio_estado
  Alerta: Si excede threshold por estado

VERSIÓN (Version)
  Definición: Número de revisión del lead (optimistic locking)
  Uso: Detectar conflictos de edición simultánea
  Incremento: +1 en cada UPDATE exitoso
```

---

## 12. Checklist para Freya (UX Designer)

### 12.1 Entregables UX Esperados

```
☐ WIREFRAMES
  ☐ Layout del pipeline Kanban (4 columnas)
  ☐ Tarjeta de lead (información, acciones)
  ☐ Formulario de creación
  ☐ Formulario de edición
  ☐ Barra de búsqueda + filtros
  ☐ Panel de métricas
  ☐ Modal de confirmación de transición

☐ FLUJOS DE USUARIO
  ☐ Happy path: crear → mover → editar
  ☐ Error path: email duplicado
  ☐ Error path: transición inválida
  ☐ Validación en tiempo real

☐ COMPONENTES DE UI
  ☐ Botón "Crear Lead"
  ☐ Tarjeta de lead (con estados)
  ☐ Input de búsqueda
  ☐ Checkbox de filtros
  ☐ Toast de notificación
  ☐ Error alert
  ☐ Spinner de carga

☐ ESPECIFICACIÓN DE ESTADOS
  ☐ Estado normal
  ☐ Estado hover
  ☐ Estado focus
  ☐ Estado disabled
  ☐ Estado error

☐ DISEÑO SYSTEM TOKENS
  ☐ Colores por estado (Nuevo=Azul, etc.)
  ☐ Tipografía (heading, body, caption)
  ☐ Espaciado (padding, margin)
  ☐ Bordes y radios
  ☐ Sombras

☐ ACCESSIBILITY (A11Y)
  ☐ Contraste WCAG AAA
  ☐ Etiquetas para screen readers
  ☐ Tab order lógico
  ☐ Focus indicators claros
  ☐ Mensajes de error programáticos

☐ RESPONSIVE DESIGN
  ☐ Desktop (1920px, 1366px)
  ☐ Tablet (768px)
  ☐ Mobile (375px) - si aplica
```

---

## 13. Checklist para Developer (Mimir)

### 13.1 Tareas de Implementación

```
DATABASE & SCHEMA
  ☐ Crear tabla `leads` con todas las columnas
  ☐ Crear tabla `leads_audit` para auditoría
  ☐ Índices en email, estado, asignado_a, fecha_creacion
  ☐ Constraint UNIQUE en email
  ☐ Constraint CHECK para monto >= 0
  ☐ Foreign key en asignado_a → users
  ☐ Triggers para fecha_actualizacion automática

API ENDPOINTS
  ☐ POST /api/leads (crear lead)
  ☐ GET /api/leads (listar con paginación)
  ☐ GET /api/leads/{id} (obtener uno)
  ☐ PATCH /api/leads/{id} (editar)
  ☐ PATCH /api/leads/{id}/estado (cambiar estado)
  ☐ DELETE /api/leads/{id} (soft delete)
  ☐ GET /api/leads/search?q=... (búsqueda)
  ☐ GET /api/leads/check-email?email=... (validación unique)
  ☐ GET /api/leads/{id}/audit (audit trail)
  ☐ GET /api/metrics/pipeline (métricas)

VALIDACIÓN
  ☐ Validación campos entrada (servidor)
  ☐ Email único (check before insert)
  ☐ Transiciones de estado válidas
  ☐ Optimistic locking (versionado)
  ☐ Manejo de race conditions

SEGURIDAD
  ☐ Autenticación requerida en todos endpoints
  ☐ RBAC: ejecutivo ve solo sus leads
  ☐ SQL injection prevention (prepared statements)
  ☐ Rate limiting en búsqueda
  ☐ Audit logging completo

TESTING
  ☐ Unit tests: validadores, transiciones
  ☐ Integration tests: CRUD operations
  ☐ E2E tests: flujos completos (ver sección 8)
  ☐ Load test: 50 usuarios concurrentes
  ☐ Concurrency test: race conditions

DEPLOYMENT
  ☐ Migrations de BD versionadas
  ☐ Seeding de datos de prueba
  ☐ Documentation de API (OpenAPI/Swagger)
  ☐ Error handling y logging
  ☐ Monitoring y alertas
```

---

**Documento Preparado por:** Saga, Analista Estratégico BMAD  
**Versión:** 1.0  
**Fecha:** 2026-06-07  
**Status:** ✅ LISTO PARA IMPLEMENTACIÓN
