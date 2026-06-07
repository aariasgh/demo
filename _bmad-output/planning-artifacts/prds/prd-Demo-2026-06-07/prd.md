---
title: "Mini CRM de Seguimiento de Clientes Potenciales — PRD"
status: draft
created: 2026-06-07
updated: 2026-06-07
document_type: "Product Requirements Document"
audience: "Development Team + Partners Demo"
project_code: "MINI-CRM-V1"
---

# Mini CRM de Seguimiento de Clientes Potenciales — PRD

## Visión

**En 48 horas, transformar un requerimiento de negocio en un sistema funcional, documentado y escalable — demostrando que BMAD no promete, *entrega*.**

El Mini CRM centraliza el ciclo de vida del lead en una única fuente de verdad, permitiendo que equipos de venta pequeños capturen, rastreen y cierren oportunidades sin fricción. Es tanto un producto operacional como una prueba viva de rigor: documentación estructurada, código limpio, tests automáticos, Docker ready.

---

## El Problema

### La Realidad Actual

Hoy, cuando un lead llega a un ejecutivo de venta:

1. **Fragmentación operacional:** Notas dispersas en OneNote, emails perdidos, llamadas sin registro
2. **Seguimiento errático:** Sin sistema centralizado, el follow-up es manual y falla frecuentemente
3. **Pérdida de oportunidades:** El 65% de los leads potenciales se pierden en la grieta de la falta de orden operacional
4. **Frustración del equipo:** Ejecutivos gastando energía en administración, no en ventas

### Impacto

- **Revenue predecible desaparece:** Leads sin seguimiento = sin cierre
- **Escalabilidad bloqueada:** Sin proceso, el equipo no puede crecer sin duplicar fricción
- **Confianza en operaciones:** Incertidumbre sobre qué leads están activos, en qué estado realmente están

---

## La Solución

### Overview (V1)

**Un CRM focado, reducido pero completo:** Centralización de leads con visualización Kanban, timeline de actividad, y alertas automáticas de riesgo — sin distracciones.

#### Pilares de Diseño

| Pilar | Descripción |
|-------|-------------|
| **Centralización** | Un lead = un registro único, toda su historia en un lugar |
| **Visibilidad** | Pipeline Kanban muestra estado en tiempo real, sin fricción |
| **Automatización Esencial** | Alertas de leads en riesgo (>7 días sin contacto) — el sistema advierte, el usuario actúa |
| **Transferibilidad** | Código profesional, documentado, testeable — no un prototipo |

---

## Usuarios & Casos de Uso

### Usuario Primario: Ejecutivo de Venta (Pequeño Equipo)

**Rol:** Captura leads, ejecuta seguimiento, cierra oportunidades  
**Contexto:** Flujo laboral diario — mañana: revisar leads en riesgo, contactar; tarde: registrar interacciones, mover leads  
**Necesidades Clave:**
- Crear un lead en <30 segundos (nombre, empresa, contacto)
- Ver el estado actual de cada lead sin ambigüedad
- Recibir alerta automática sobre leads que necesitan atención (>7 días sin contacto)
- Acceder al timeline completo de actividad de un lead para contextualizar

### Usuario Secundario: Partner / Decisor

**Rol:** Evalúa que BMAD entrega disciplina, no magia  
**Contexto:** Demostración / presentación (8 de junio)  
**Necesidades Clave:**
- Entender la arquitectura sin necesidad de explicación (está documentada)
- Creer que el código es escalable, transferible, profesional
- Ejecutar el sistema en cualquier máquina (`docker-compose up`)

---

## Requerimientos Funcionales (FRs)

### FR-1: Visualización de Pipeline (Kanban)

**ID:** FR-1  
**Título:** Dashboard Kanban con 4 Columnas de Estado

**Descripción:**
El usuario ve un layout Kanban horizontal con 4 columnas que representan estados del pipeline:
- **Nuevo:** Lead recién capturado, sin contacto
- **En contacto:** Lead contactado, en conversación
- **Propuesta enviada:** Propuesta/oferta en mano del cliente
- **Cerrado:** Oportunidad ganada o perdida

**Especificaciones:**
- Cada columna muestra: título + cantidad de leads (contador)
- Los leads aparecen como tarjetas dentro de cada columna
- Cada tarjeta muestra: nombre, empresa, última interacción (fecha), estado visual (badge)
- Las columnas son scrollables verticalmente; el layout es responsive (mobile 320px, tablet 768px, desktop 1200px+)
- Transiciones suave al mover tarjetas entre columnas

**Criterios de Aceptación:**
- [ ] 4 columnas visibles sin scroll horizontal en desktop
- [ ] Contador de leads por columna es exacto y actualiza en tiempo real
- [ ] Tarjetas muestran información legible
- [ ] Responsive funciona en mobile (columnas stackeadas verticalmente o scrollable)
- [ ] Animaciones de reorden son suave (no jarring)

---

### FR-2: Crear Lead (Modal)

**ID:** FR-2  
**Título:** Modal de Creación Rápida de Lead

**Descripción:**
El usuario hace click en "+ Nuevo Lead" y se abre un modal con un formulario para capturar:
- **Nombre** (required, >= 2 caracteres)
- **Empresa** (required, >= 2 caracteres)
- **Email** (required, válido, debe ser único en el sistema)
- **Teléfono** (optional, formato internacional permitido)
- **Notas** (optional, máx 1000 caracteres)

**Validaciones:**
- Nombre y Empresa: no vacías, >= 2 caracteres
- Email: formato válido + único (error si duplicado)
- Teléfono: si se ingresa, validar formato básico (números + caracteres internacionales)
- Notas: máx 1000 caracteres

**Comportamiento:**
- El botón "Crear Lead" está deshabilitado hasta que todos los campos required sean válidos
- Validaciones inline: mientras el usuario escribe, se muestran errores en tiempo real
- Al enviar: modal muestra loading, luego confirma con toast
- Si error: modal retiene datos, muestra el error, usuario puede reintentar
- Si éxito: modal cierra, nuevo lead aparece en columna "Nuevo" automáticamente

**Criterios de Aceptación:**
- [ ] Modal abre/cierra sin fricción
- [ ] Validaciones inline funcionan (error visible mientras escribes)
- [ ] Botón deshabilitado hasta todo valid
- [ ] Toast de éxito/error aparece
- [ ] Nuevo lead visible en Kanban inmediatamente después de crear
- [ ] Si email duplicado, error claro: "Este email ya está registrado"

---

### FR-3: Cambiar Estado de Lead

**ID:** FR-3  
**Título:** Transicionar Lead entre Estados

**Descripción:**
El usuario puede mover un lead entre estados. El movimiento puede ser:
- **Drag & Drop:** Arrastra una tarjeta de una columna a otra (visual intuitivo)
- **Click en tarjeta + selector:** Abre modal del lead, usuario selecciona nuevo estado desde dropdown

**Transiciones Válidas:**
```
Nuevo → En contacto → Propuesta enviada → Cerrado
   ↓        ↓             ↓
(cualquier estado anterior permitido si es necesario retroceder)
```

**Comportamiento:**
- El cambio es inmediato en UI (optimistic update)
- Se sincroniza con el backend sin recargar la página
- Si falla: se revierte visualmente, toast de error
- Timestamp de cambio se registra automáticamente (auditoria)

**Criterios de Aceptación:**
- [ ] Drag & drop funciona entre columnas
- [ ] Estados se actualizan en tiempo real sin recargar
- [ ] Timestamp de cambio está registrado en la BD
- [ ] Si falla, UI revierte y muestra error

---

### FR-4: Timeline de Actividad por Lead

**ID:** FR-4  
**Título:** Historial Completo de Interacciones

**Descripción:**
Al hacer click en una tarjeta de lead, se abre un modal/drawer que muestra:
- Información básica del lead (nombre, empresa, email, teléfono)
- **Timeline vertical** de eventos:
  - Creación del lead
  - Cambios de estado (con timestamp)
  - Notas agregadas
  - Cualquier otra interacción registrada

**Especificaciones:**
- Timeline es cronológica (más reciente arriba)
- Cada evento muestra: tipo (creación, cambio de estado, nota), descripción, timestamp, usuario
- Usuario puede agregar una nota directamente desde este modal

**Criterios de Aceptación:**
- [ ] Modal muestra info básica correcta
- [ ] Timeline completo visible (todos los eventos desde creación)
- [ ] Timestamps exactos
- [ ] Usuario puede agregar nota desde el modal
- [ ] Nueva nota aparece en timeline inmediatamente

---

### FR-5: Widget "Leads en Riesgo"

**ID:** FR-5  
**Título:** Alerta Automática de Leads sin Contacto (>7 días)

**Descripción:**
En el header del dashboard, hay un widget que muestra:
- Un contador de "Leads en Riesgo" (leads que no han tenido cambio de estado en los últimos 7 días)
- Un badge visual (ej: rojo si hay alertas activas)
- Un link clickeable que filtra automáticamente el Kanban mostrando solo esos leads

**Lógica:**
- Se calcula automáticamente: lead en riesgo = último cambio fue hace >7 días
- Se actualiza en tiempo real cuando un lead es contactado (desaparece de riesgo)
- No requiere refresh manual

**Comportamiento:**
- Si hay 0 leads en riesgo: widget muestra "0 en Riesgo" (neutral)
- Si hay N leads en riesgo: widget muestra "N en Riesgo" (alerta roja/naranja)
- Click en el widget: Kanban se filtra, muestra solo leads en riesgo
- Click en "Ver todos" o similar: vuelve a mostrar todos

**Criterios de Aceptación:**
- [ ] Widget calcula leads en riesgo (>7 días sin cambio)
- [ ] Badge es visual y claro
- [ ] Click en widget filtra Kanban correctamente
- [ ] Recuento es exacto, actualiza en tiempo real
- [ ] Desaparece cuando lead es actualizado

---

### FR-6: Búsqueda y Filtro

**ID:** FR-6  
**Título:** Buscar Leads por Nombre, Empresa, Email

**Descripción:**
En el header, hay un input de búsqueda que filtra los leads en tiempo real:
- Búsqueda por nombre (parcial, case-insensitive)
- Búsqueda por empresa (parcial, case-insensitive)
- Búsqueda por email (parcial, case-insensitive)

**Especificaciones:**
- Búsqueda es "OR": si coincide nombre O empresa O email, el lead aparece
- Debounce de 300ms para no saturar el backend
- Placeholder claro: "Buscar leads por nombre, empresa, email..."
- Botón para limpiar búsqueda (X)

**Criterios de Aceptación:**
- [ ] Búsqueda funciona mientras escribes
- [ ] Filtrado es case-insensitive
- [ ] Debounce previene requests excesivos
- [ ] Botón limpiar restaura vista completa

---

### FR-7: Editar Lead

**ID:** FR-7  
**Título:** Actualizar Información del Lead

**Descripción:**
El usuario puede editar los datos de un lead (nombre, empresa, email, teléfono, notas) desde el modal de timeline. Los cambios se guardan inmediatamente (o con un botón "Guardar" explícito).

**Especificaciones:**
- Same validations as FR-2 (email único, formato válido, etc.)
- Cambios se registran como evento en el timeline (auditoria)
- Email no puede cambiar a uno duplicado

**Criterios de Aceptación:**
- [ ] Usuario puede editar campos del lead
- [ ] Validaciones se aplican igual que en creación
- [ ] Email duplicado no es permitido
- [ ] Cambios se guardan y se registran en timeline

---

## Requerimientos No-Funcionales (NFRs)

### NFR-1: Performance

| Métrica | Target |
|---------|--------|
| Carga inicial de Kanban (con 100 leads) | <2 segundos |
| Búsqueda en tiempo real (debounce 300ms) | Resultados en <500ms |
| Movimiento de lead entre columnas | Actualización inmediata en UI, sync en <1s |
| Tiempo de respuesta API (p95) | <300ms |

---

### NFR-2: Disponibilidad

- Uptime en demo: 99.5% (tolerancia 1-2 minutos downtime durante 72h)
- Base de datos no debe perder datos (ACID compliance, backups)
- Recuperación de fallos: si backend cae, UI muestra error claro (no infinite spinner)

---

### NFR-3: Seguridad

- **Autenticación:** Login hardcoded (un usuario demo: `user: demo, password: demo123`)  
- [ASSUMPTION] Sin autenticación multifactor; para demo es suficiente
- **Validación de Input:** Todos los inputs sanitizados contra SQL injection, XSS
- **HTTPS opcional para demo** (HTTP es ok para localhost)
- **Error messages no revelan internals** (no stack traces en UI)

---

### NFR-4: Escalabilidad (Out of Scope V1, pero arquitectura-ready)

- Base de datos estructurada para crecer (índices en email, timestamps)
- API stateless para poder replicar
- Frontend bundle <2MB (lazy loading para futura expansión)

---

### NFR-5: Confiabilidad

- **API documentada:** OpenAPI/Swagger disponible
- **Manejo de errores exhaustivo:** Validaciones, timeouts, fallos de BD retornan HTTP status + mensaje claro
- **Auditoria:** Cada cambio de estado registra timestamp + usuario (preparación para multi-user)

---

## Especificación del Sistema

### Stack Técnico (Locked)

| Componente | Tecnología | Justificación |
|------------|-----------|---------------|
| **Frontend** | React + Next.js | Velocidad, SSR-ready para demo, component ecosystem |
| **Styling** | Tailwind CSS | Utility-first, responsive out-of-box, rápido |
| **Backend** | Python + FastAPI | Async-first, type-safe, OpenAPI automático |
| **Base de Datos** | PostgreSQL | Confiable, ACID, migraciones claras (Alembic) |
| **Deployment** | Docker + Docker Compose | Reproducible, multi-contenedor, "funciona en mi máquina" solved |
| **Testing** | pytest (backend) + [ASSUMPTION: Playwright e2e] | Cobertura real, testing visible durante la demo |

---

### Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  (Kanban UI, Modals, Real-time updates via API polling/WS)     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    (REST API / OpenAPI)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   BACKEND (FastAPI)                             │
│  ├─ /api/leads (CRUD)                                           │
│  ├─ /api/leads/{id}/timeline                                   │
│  ├─ /api/leads/risk (Leads en Riesgo)                          │
│  ├─ /api/auth (login hardcoded)                                │
│  └─ /api/docs (Swagger)                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                   (Async Pool / Alembic)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                          │
│  ├─ leads (id, name, company, email, phone, status, ...)       │
│  ├─ timeline_events (lead_id, event_type, timestamp, ...)      │
│  └─ Índices en email, status, updated_at                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### API Overview (Contrato Técnico)

#### Endpoints Principales

```
POST   /api/auth/login              → Token
POST   /api/leads                   → Create Lead
GET    /api/leads                   → List All Leads (con filtro/búsqueda)
GET    /api/leads/{id}              → Get Lead Detail
PUT    /api/leads/{id}              → Update Lead
PUT    /api/leads/{id}/status       → Change State
GET    /api/leads/{id}/timeline     → Get Timeline
POST   /api/leads/{id}/notes        → Add Note
GET    /api/leads/risk              → Get Leads in Risk (>7 days)
GET    /api/docs                    → Swagger UI
```

**Response Format:** JSON con estructura consistente:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

**Error Handling:**
- 400 Bad Request: validación fallida (detalles del error)
- 401 Unauthorized: no autenticado o token inválido
- 404 Not Found: recurso no existe
- 500 Internal Server Error: error del servidor (log, no reveal)

---

## Criterios de Éxito

### Ejecución Demo (8 de Junio)

| Criterio | Métrica | Estado |
|----------|---------|--------|
| **Interfaz fluida** | Kanban sin lag, modals responden <100ms | ✅ Non-blocker |
| **Datos persisten** | Crear 5 leads, recargar página, ¿siguen ahí? | ✅ Critical |
| **Estados cambian** | Drag & drop funciona, se refleja en tiempo real | ✅ Critical |
| **Leads en Riesgo** | Widget muestra N en riesgo, filtro funciona | ✅ Important |
| **API documentada** | Swagger accesible, endpoints claros | ✅ Important |
| **Tests pasan** | `pytest` ejecuta, >70% cobertura | ✅ Important |
| **Docker Compose** | `docker-compose up` levanta stack sin errores | ✅ Critical |

### Señales de Usuario

- Ejecutivo crea 10 leads en <2 minutos
- Ejecutivo ve timeline completo de actividad sin perder contexto
- Ejecutivo recibe alerta visual de lead en riesgo sin acción manual

### Señales de Partner

- Partner observa que la arquitectura es clara, profesional
- Partner ejecuta `docker-compose up` y funciona a la primera
- Partner pregunta "¿Cuánto tiempo tardó?" y le sorprende la respuesta

---

## Scope

### In Scope (V1 / Demo)

✅ CRUD de leads (crear, leer, actualizar, cambiar estado)  
✅ Pipeline Kanban (4 columnas, drag & drop)  
✅ Timeline de actividad por lead  
✅ Widget "Leads en Riesgo" con auto-cálculo  
✅ Búsqueda y filtro por nombre, empresa, email  
✅ Login hardcoded (usuario demo)  
✅ Validaciones de input exhaustivas  
✅ API REST con OpenAPI/Swagger  
✅ Tests e2e + unitarios (>70% cobertura)  
✅ Docker Compose (dev + demo-ready)  
✅ Documentación técnica (SPEC, ER diagram, API)  
✅ Error handling visible y claro  
✅ UI responsive (mobile 320px, desktop 1200px)  

### Out Scope (No V1)

❌ Reportes avanzados (pipeline analytics, forecasting)  
❌ Integraciones email/calendario  
❌ Sistema de equipos/permisos complejos  
❌ Mobile app nativa  
❌ Importación masiva (CSV)  
❌ Autenticación multifactor  
❌ WebSockets (polling es suficiente para demo)  
❌ Notificaciones push  

---

## Dependencias & Supuestos

### [ASSUMPTION] Autenticación Hardcoded
Se implementa login simple con credencial hardcoded (`demo/demo123`) para demo. Después de 8 junio, si escala, se reemplaza por sistema real.

### [ASSUMPTION] Sin Multi-User Real
Todos los usuarios conectados ven los mismos datos. Cambios realizados por uno aparecen en otros (no hay permisos ni aislamiento). Esto es ok para demo, pero arqueo para soporte multi-user después.

### [ASSUMPTION] Polling en Lugar de WebSockets
Frontend hace polling al backend cada 2-3 segundos para sincronizar cambios (ej: si otro usuario movió un lead). Para demo, es suficiente. WebSockets es overkill.

### [ASSUMPTION] Timestamps en UTC
Todos los timestamps se guardan en UTC en BD. Frontend los convierte a zona horaria local al mostrar.

### [ASSUMPTION] Email Único pero No Validado
Email debe ser único pero no se valida que sea "real" (sin envío de confirmación).

---

## Timeline & Hitos

| Hito | Fecha | Dueño | Status |
|------|-------|-------|--------|
| **PRD Aprobado** | 2026-06-07 | John (PM) | ✅ Hoy |
| **Desarrollo Core** | 2026-06-07 → 2026-06-08 (24h) | Dev Team | 🔄 In Progress |
| **Tests e2e Completos** | 2026-06-08 | QA | 🔄 In Progress |
| **Docker Compose Ready** | 2026-06-08 | DevOps/Dev | 🔄 In Progress |
| **Demo Ejecutiva** | 2026-06-08 09:00 | PM + Dev | ⏳ Upcoming |

---

## Siguiente Pasos

1. ✅ **PRD Aprobado** (hoy)
2. ⏳ **Crear Épicas y Historias de Usuario** (bmad-create-epics-and-stories)
3. ⏳ **Crear Arquitectura Técnica Detallada** (bmad-create-architecture)
4. ⏳ **Validar Alineación** (bmad-check-implementation-readiness)

---

## Anexos & Referencias

- **Brief Original:** `_bmad-output/planning-artifacts/briefs/brief-Demo-2026-06-07/brief.md`
- **Wireframes Detallados:** `_bmad-output/design-artifacts/D-Design-System/UX-01-WIREFRAMES-DETALLADOS.md`
- **Flujos de Usuario:** `_bmad-output/design-artifacts/D-Design-System/UX-02-FLUJOS-DE-USUARIO.md`
- **Especificaciones de Componentes:** `_bmad-output/design-artifacts/D-Design-System/UX-03-ESPECIFICACIONES-COMPONENTES.md`

---

**Documento generado:** 2026-06-07  
**Versión:** Draft 1.0  
**Responsable:** John, Product Manager (BMAD)
