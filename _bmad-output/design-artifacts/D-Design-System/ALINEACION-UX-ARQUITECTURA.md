# 🔗 Alineación UX ↔ Arquitectura — Mini CRM

**Documento:** Preguntas Críticas para Winston (Architect)  
**De:** Sally (UX Designer)  
**Para:** Winston (System Architect)  
**Fecha:** 2026-06-07  
**Audiencia:** Architect + Dev Lead  
**Estado:** Listo para Revisión Arquitectónica  

---

## 📌 Contexto

Sally ha definido especificaciones UX detalladas que **requieren decisiones arquitectónicas** antes de que Amelia (Dev) comience a codificar. Este documento mapea tensiones UX → decisiones de arquitectura.

**Objetivo:** Que Winston responda estas preguntas para validar que la arquitectura puede entregar la experiencia que Sally diseñó.

---

## 🔴 Pregunta Crítica #1: Estrategia de Actualización en Tiempo Real

### El Requerimiento UX

**De la PRD y specs:**
- "Cambios se reflejan en tiempo real sin recargar la página"
- "Movimiento de lead entre columnas: actualización inmediata en UI, sync en <1s"
- "Si falla: se revierte visualmente, toast de error"
- "Búsqueda en tiempo real (debounce 300ms): resultados en <500ms"

### La Tensión

```
UX quiere:           Arquitectura necesita decidir:
─────────────────────────────────────────────────────
Inmediato visual → ¿Optimistic update? (asume éxito antes de servidor)
                  vs. 
                  ¿Backend-first? (espera confirmación)
                  
Rollback smooth  → ¿Cómo sincroniza estado si falla?
Sync en <1s      → ¿Qué arquitectura de API lo permite?
```

### Preguntas para Winston

#### Q1.1: Optimistic Update Strategy

**Pregunta:**
> El usuario arrastra un lead de "Nuevo" a "En contacto". Mi UX especifica:
> - Card se actualiza visualmente al soltar (INMEDIATO)
> - Sistema envía POST /leads/{id}/state al backend
> - Si éxito (200): Nada. UI ya está correcta.
> - Si error (500): Card regresa a estado original con toast "Error"
>
> **¿La arquitectura soporta esto?** ¿O espera confirmación del server antes de actualizar UI?

**Contexto que Winston necesita:**
- Número máximo de leads esperado en demo: ~50-100
- Velocidad de red esperada: Office LAN (~10ms latency) o internet (~50-100ms)
- Tasa de cambios simultáneos: 1 usuario (demo), pero podría ser 5-10 en producción

**Implicaciones si dice "Optimistic":**
- Frontend necesita state manager (Redux, Zustand, Jotai, etc.)
- Backend es "single source of truth" pero UI es temporalmente independiente
- Necesitamos conflict resolution si dos cambios colisionan

**Implicaciones si dice "Backend-first":**
- UI espera respuesta del servidor antes de actualizar
- Más lento (latencia + procesamiento), pero más seguro
- Inconsistencia usuario-backend es imposible

**Sally's UX Opinion:** Optimistic update es mejor UX. Pero necesito que Winston confirme que puede hacerlo sin bugs.

---

#### Q1.2: Sincronización en <1s

**Pregunta:**
> Mi spec dice: "Movimiento de lead entre columnas: actualización inmediata en UI, sync en <1s"
>
> **¿Qué significa "sync en <1s" desde la perspectiva del backend?**
> - ¿Es p95 (95% de requests en <1s)?
> - ¿Incluye latencia de red + procesamiento?
> - ¿Qué haces si la operación tarda más (ej: validación compleja)?

**Implicaciones:**
- Base de datos: ¿Qué índices aseguran que un UPDATE lead tarda <100ms?
- API: ¿Qué validaciones corres en cada request? (Si son muchas, excedes 1s)
- Network: ¿Asumimos LAN o internet?)

**Sally's Necesidad:** Si no puedes garantizar <1s, debo ajustar la UX expectation en el diseño (ej: mostrar loading spinner más largo).

---

#### Q1.3: Recuperación de Errores (Rollback)

**Pregunta:**
> Si el usuario mueve un lead, UI se actualiza, pero el backend retorna 500:
> 
> **¿Cómo y cuándo revierte el cambio?**
> 1. Inmediatamente (al recibir error)
> 2. Después de X intentos de retry automático
> 3. Solo si el usuario hace click en "Undo"
> 4. Otra estrategia

**Implicaciones:**
- Frontend necesita logging de todas las operaciones fallidas
- Backend necesita idempotency keys (si frontend retenta, no duplicamos)
- UX debe mostrar claramente que algo falló sin perder datos

**Sally's Necesidad:** Quiero que la recuperación sea transparente, no un ritual de clics.

---

## 🔴 Pregunta Crítica #2: Búsqueda en Tiempo Real

### El Requerimiento UX

**De la spec:**
- Input búsqueda: usuario escribe "Juan"
- Debounce 300ms (no bombardea backend)
- Resultados en <500ms desde el debounce
- Filtrado en cliente (nombre, empresa, email) — búsqueda "OR"

### La Tensión

```
UX quiere:           Arquitectura decide:
─────────────────────────────────────────
Resultados en 300ms  → ¿Full-text search en BD? (PostgreSQL)
+ debounce           vs. ¿In-memory filtrado en frontend?

Filtrado en 3 campos → ¿Índices en name, company, email?
Búsqueda "OR"        → ¿Cómo de compleja es la query?
```

### Preguntas para Winston

#### Q2.1: Búsqueda Backend vs. Frontend

**Pregunta:**
> **¿Dónde ocurre la búsqueda?**
> 
> Opción A: Frontend
> - Traigo todos los leads (GET /leads) una sola vez
> - JavaScript filtra en cliente (name, company, email con 'OR')
> - Ventaja: Sin red delay adicional, responsive
> - Desventaja: Si hay 1000 leads, descargo todo al inicio
>
> Opción B: Backend (cada keystroke)
> - Frontend envía (debounce 300ms) GET /leads/search?q=Juan
> - Backend retorna solo coincidencias
> - Ventaja: Escalable (no descargas 1000 leads)
> - Desventaja: Red latency + procesamiento = más lento

**Sally's Context:** Demo tiene ~50 leads. Producción podría tener 1000+. ¿Qué diseñamos para?

---

#### Q2.2: Índices y Rendimiento de Búsqueda

**Pregunta:**
> Si búsqueda es en backend:
> 
> **¿Qué índices en PostgreSQL?**
> - Índice simple en `name`, `company`, `email`?
> - FULL TEXT SEARCH (más potente pero más lento)?
> - GiST / GIN indexes?
> 
> **¿Tiempo de query esperado para 1000 leads?**
> - Necesito <500ms garantizado

---

## 🔴 Pregunta Crítica #3: Validación de Email "Único"

### El Requerimiento UX

**De la spec (FR-2):**
- Email: "required, válido, debe ser único en el sistema"
- Si duplicado: error inmediato "Este email ya está registrado"

### La Tensión

```
UX quiere:           Arquitectura decide:
──────────────────────────────────────────
Email único          → ¿Validamos inline (cada keystroke)?
validación rápida    → vs. ¿Post-submit?

Error claro          → ¿Query a BD en cada keystroke es OK?
                      (Performance, race conditions)
```

### Preguntas para Winston

#### Q3.1: Validación Inline vs. Post-Submit

**Pregunta:**
> **¿Cuándo validamos "email único"?**
> 
> Opción A: Inline (mientras usuario escribe)
> - Cada 300ms (debounce), query: SELECT * FROM leads WHERE email = ?
> - Usuario ve ✅ o ❌ al soltar de escribir
> - Ventaja: Feedback rápido
> - Desventaja: Muchas queries a BD, race conditions si dos usuarios crean mismo email
>
> Opción B: Post-submit (al click "Crear Lead")
> - Backend hace UNIQUE constraint check
> - Si error: retorna 409 Conflict con mensaje claro
> - Ventaja: Menos queries, ACID garantizado
> - Desventaja: Usuario descubre el error recién al submit

**Sally's UX Preference:** Idealmente A (mejor UX), pero B es más robusto. ¿Podemos hacer A + UNIQUE constraint en BD como fallback?

---

#### Q3.2: Race Condition Prevention

**Pregunta:**
> Si dos usuarios crean un lead con email "juan@techcorp.com" al mismo tiempo:
>
> **¿Cómo previene duplicados?**
> - UNIQUE constraint en tabla leads(email)?
> - Aplicación-level check primero?
> - Transacción con SERIALIZABLE isolation?

---

## 🔴 Pregunta Crítica #4: Timeline de Actividad (Auditoría)

### El Requerimiento UX

**De la spec (FR-4):**
- Timeline muestra: creación, cambios de estado, notas, interacciones
- Cada evento: tipo, descripción, timestamp, usuario
- Orden cronológico (más reciente primero)

### La Tensión

```
UX quiere:           Arquitectura decide:
──────────────────────────────────────────
Timeline completo    → ¿Tabla audit_log separada?
de cada lead         vs. ¿JSONB en leads table?
                     vs. ¿Event sourcing?

"Interacciones"      → ¿Qué registramos exactamente?
es vago              → Cada keystroke? Solo cambios "materiales"?
```

### Preguntas para Winston

#### Q4.1: Estructura de Auditoría

**Pregunta:**
> **¿Cómo almacenamos el timeline?**
> 
> Opción A: Tabla separada `lead_events`
> - Rows: {lead_id, event_type, data, timestamp, user_id, ...}
> - Ventaja: Limpio, escalable, queryable
> - Desventaja: Join necesario en cada read
>
> Opción B: JSONB en leads table
> - Columna: `activity_log` contiene array de eventos
> - Ventaja: Todo en un row, no joins
> - Desventaja: No queryable sin parsing JSONB
>
> Opción C: Event Sourcing (experimental)
> - Cada cambio es un evento inmutable
> - Reconstruimos estado desde eventos
> - Ventaja: Auditoría perfecta, time-travel
> - Desventaja: Complejidad arquitectónica

**Sally's Context:** Para demo, limpieza + queryable es más importante que experimentos. Recomiendo A o B. ¿Cuál elige Winston?

---

#### Q4.2: Granularidad de Registro

**Pregunta:**
> **Qué exactamente registramos en el timeline?**
> 
> Registramos SIEMPRE:
> - ✅ Lead creado
> - ✅ Lead movido entre estados
> - ✅ Nota agregada
>
> ¿Y para edición de campos?
> - ❓ Opción A: Cada keystroke (Juan → Jua → Jua... muy ruidoso)
> - ❓ Opción B: Solo cambios finales (usuario termina edición, guardamos delta)
> - ❓ Opción C: Cada cambio de campo, pero solo si valor final es diferente

**Sally's Recommendation:** Opción B o C. A es demasiado ruido.

---

## 🟢 Pregunta Importante #5: Escala y Performance

### El Requerimiento UX

**De la PRD (NFRs):**
- Carga inicial Kanban (~100 leads): <2s
- Búsqueda (debounce 300ms): <500ms
- Movimiento lead: <1s
- API p95: <300ms

### Preguntas para Winston

#### Q5.1: Database Schema y Índices

**Pregunta:**
> **¿Cuál es el schema de la tabla `leads`?**
> 
> Campos mínimos que necesito (para UX):
> - id (PK)
> - name
> - company
> - email (UNIQUE)
> - phone
> - notes
> - status (enum: NEW, IN_CONTACT, PROPOSAL_SENT, CLOSED)
> - created_at
> - updated_at
> - created_by (user_id para auditoría)
>
> **¿Qué índices para performance?**
> - CREATE INDEX idx_status ON leads(status) — para filtrar por columna Kanban
> - CREATE INDEX idx_email ON leads(email) — para validar unique
> - CREATE INDEX idx_created_at ON leads(created_at DESC) — para timeline
> 
> ¿Hay otros?

---

#### Q5.2: API Response Time (p95 < 300ms)

**Pregunta:**
> **¿Cómo garantizamos p95 < 300ms?**
> 
> Análisis:
> - Network latency (LAN): ~10ms
> - API processing: ? ms
> - DB query: ? ms
> - Total: <300ms
>
> **¿Qué queries específicas corre cada endpoint?**
> 
> POST /leads (crear) — query count?
> GET /leads (listar para Kanban) — query count?
> PATCH /leads/{id}/status (mover) — query count?
> GET /leads/search?q=X (buscar) — query count?

**Sally's Need:** Si alguno excede 300ms, necesito conocer para ajustar la UX (ej: mostrar loading spinner, reducir frecuencia de requests).

---

## 🟡 Pregunta Nice-to-Have #6: Offline & Sync

### El Requerimiento (Futuro)

**De la PRD — Nota:** "Producción: TBD"

**Pero para robustez de demo:**
> Si el usuario pierde conexión mientras edita un lead, ¿qué pasa?

### Preguntas para Winston

#### Q6.1: Offline Handling

**Pregunta:**
> **¿La arquitectura soporta offline-first?**
> 
> Escenarios:
> 1. Usuario está escribiendo, red cae
>    - ¿Se guardan borradores en localStorage?
>    - ¿Se sincronizan automáticamente al volver online?
> 
> 2. Usuario está viendo Kanban, red cae
>    - ¿Sigue siendo visible o muestra "Offline"?
>    - ¿Se cachea el estado último?
>
> Para MVP demo, probablemente no necesitamos, pero me gustaría saber si es posible.

---

## 📋 Matriz de Decisiones Clave

| # | Pregunta | Opciones | Decision | Implicación UX |
|---|----------|----------|----------|----------------|
| 1.1 | Optimistic update? | A: Sí (UI primero) / B: No (Server primero) | ? | A = mejor UX pero complejo; B = más lento |
| 1.2 | Sync time SLA | <500ms / <1s / <2s | ? | Afecta feedback visual |
| 1.3 | Error recovery | Inmediato / Retry automático / Manual undo | ? | Transparencia vs. control |
| 2.1 | Búsqueda | Frontend (todo de una) / Backend (cada query) | ? | Escala vs. latencia |
| 3.1 | Email validación | Inline (cada keystroke) / Post-submit | ? | Feedback vs. performance |
| 4.1 | Auditoría | Tabla separada / JSONB / Event sourcing | ? | Complejidad vs. queryabilidad |
| 4.2 | Granularidad | Keystroke / Final / Delta | ? | Detalle vs. ruido |
| 5.1 | Índices | Minimal / Optimized / Over-indexed | ? | Performance vs. storage |

---

## 🎯 Siguiente Paso

**Sally propone:** Que Winston llene esta matriz y responda las preguntas en prioridad:
1. **Crítica:** Q1, Q2, Q3, Q4 (bloquean desarrollo)
2. **Importante:** Q5 (performance validation)
3. **Nice-to-have:** Q6 (futuro)

**Formato de respuesta recomendado:**

```markdown
## Winston's Respuestas

### Q1.1: Optimistic Update Strategy
**Decision:** [A / B]
**Razón:** [Explicar por qué]
**Implicaciones Code:** [Qué necesita Amelia conocer]
**Implicaciones UX:** [Qué ajusta Sally]

[... continuar para cada pregunta ...]
```

---

**Documento creado por:** Sally (UX Designer)  
**Fecha:** 2026-06-07  
**Versión:** 1.0  
**Estado:** Listo para review con Winston
