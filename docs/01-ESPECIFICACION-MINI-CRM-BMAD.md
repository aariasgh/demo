# 📋 Especificación Funcional Detallada — Mini CRM de Seguimiento de Leads
## BMAD Precision Level - Especificación Quirúrgica para Implementación

**Documento:** Especificación Funcional Mini CRM  
**Versión:** 1.0 — Precisión BMAD  
**Fecha:** 2026-06-07  
**Audiencia:** Desarrolladores, Diseñadores UX, Product Managers  
**Estado:** Fuente de Verdad (Single Source of Truth)  

---

## 📖 Tabla de Contenidos

1. [Contexto Estratégico](#contexto-estratégico)
2. [Modelo de Datos Completo](#modelo-de-datos-completo)
3. [Casos de Uso Detallados](#casos-de-uso-detallados)
4. [Flujos de Usuario Paso a Paso](#flujos-de-usuario-paso-a-paso)
5. [Estados y Transiciones](#estados-y-transiciones)
6. [Validaciones y Restricciones](#validaciones-y-restricciones)
7. [Reglas de Negocio](#reglas-de-negocio)
8. [Manejo de Errores](#manejo-de-errores)
9. [Casos Edge y Excepciones](#casos-edge-y-excepciones)
10. [Métricas y Reportes](#métricas-y-reportes)
11. [Criterios de Aceptación del MVP](#criterios-de-aceptación-del-mvp)
12. [Casos de Prueba Básicos](#casos-de-prueba-básicos)

---

## Contexto Estratégico

### Problema de Negocio

**Síntoma:** Los equipos de ventas carecen de visibilidad clara del estado de sus clientes potenciales.

**Consecuencias:**
- Pérdida de oportunidades por falta de seguimiento
- Seguimiento inconsistente entre miembros del equipo
- Ineficiencia en la priorización de esfuerzos
- Baja tasa de conversión leads → clientes
- Desorden en la gestión de contactos

**Impacto Medible:**
- Tiempo desperdido buscando información de leads
- Duplicación accidental de contactos
- Falta de trazabilidad del estado comercial

### Propuesta de Valor

**Para:** Ejecutivos de ventas y coordinadores comerciales

**Ofrece:** Una interfaz Kanban intuitiva y simple que proporciona:
1. Seguimiento estructurado de leads en tiempo real
2. Visualización clara del pipeline comercial por estado
3. Priorización automática de esfuerzos de venta
4. Trazabilidad completa del estado de cada oportunidad

**Resultado Clave:** Mayor visibilidad = mejor toma de decisiones = tasas de conversión mejoradas

### Usuarios Objetivo

**Perfil 1: Ejecutivo de Ventas (Senior Sales Executive)**
- Rol: Vende soluciones, cierra tratos
- Frecuencia: Usa diariamente, 20+ veces/día
- Objetivo: Gestionar su cartera de leads activos
- Pain point: Perder leads de vista, olvidar seguimientos

**Perfil 2: Coordinador Comercial (Sales Coordinator)**
- Rol: Administra leads, coordina seguimientos, reporta
- Frecuencia: Usa durante todo el día
- Objetivo: Mantener el pipeline actualizado y sincronizado
- Pain point: Información desactualizada, inconsistencia entre equipos

### Contexto de Uso

- **Ambiente:** Oficina, móvil (inicio de sesión desde smartphone durante viajes)
- **Conexión:** Internet confiable (suposición inicial)
- **Dispositivos:** Desktop primario, mobile secundario
- **Horario:** Horario comercial estándar (8 AM - 8 PM)

### Métrica de Éxito del MVP

| Métrica | Target | Cómo Se Mide |
|---------|--------|-------------|
| Tiempo para crear lead | < 30 segundos | Cronómetro, observación de usuario |
| Leads visibles sin scroll | 15+ | Conteo en estado "Nuevo" |
| Tiempo de búsqueda de lead | < 10 segundos | Búsqueda por nombre, empresa |
| Tasa de adopción | 80%+ | Frecuencia de uso semanal |
| Satisfacción de usuario | 4+/5 | Encuesta post-sesión |

---

## Modelo de Datos Completo

### 2.1 Entidad LEAD

**Tabla:** `leads`  
**Descripción:** Almacena todos los clientes potenciales del sistema

#### Estructura de Campos

| # | Campo | Tipo de Dato | Requerido | Restricción | Valor Por Defecto | Descripción |
|---|-------|--------------|-----------|-------------|-------------------|-------------|
| 1 | `id_lead` | UUID / INT (Auto) | ✅ | PRIMARY KEY, UNIQUE | Auto-generado | Identificador único del lead |
| 2 | `nombre` | VARCHAR(100) | ✅ | NOT NULL | — | Nombre completo del contacto |
| 3 | `empresa` | VARCHAR(100) | ✅ | NOT NULL | — | Nombre de la empresa del lead |
| 4 | `email` | VARCHAR(120) | ✅ | NOT NULL, UNIQUE | — | Email del contacto (verificado después) |
| 5 | `telefono` | VARCHAR(20) | ❌ | OPTIONAL | NULL | Teléfono de contacto (formato internacional) |
| 6 | `estado` | ENUM | ✅ | NOT NULL | "Nuevo" | Estado actual en el pipeline |
| 7 | `fuente` | ENUM | ❌ | OPTIONAL | "Otra" | Cómo se originó el lead |
| 8 | `monto_estimado` | DECIMAL(12,2) | ❌ | OPTIONAL, >= 0 | NULL | Valor potencial estimado en USD |
| 9 | `fecha_creacion` | TIMESTAMP | ✅ | NOT NULL, AUTO | NOW() | Cuándo se creó el lead (timestamp del servidor) |
| 10 | `fecha_actualizacion` | TIMESTAMP | ✅ | NOT NULL, AUTO | NOW() | Última vez que se modificó el registro |
| 11 | `fecha_proximo_contacto` | DATE | ❌ | OPTIONAL, >= HOY | NULL | Fecha programada del próximo follow-up |
| 12 | `notas` | TEXT | ❌ | OPTIONAL, MAX 1000 | NULL | Notas libres del ejecutivo de ventas |
| 13 | `asignado_a` | UUID / VARCHAR(50) | ❌ | OPTIONAL, FK a usuarios | NULL | ID del usuario responsable del lead |
| 14 | `prioridad` | ENUM | ❌ | OPTIONAL | "Media" | Prioridad comercial del lead |
| 15 | `dias_en_estado` | INT | 🔄 | COMPUTED | — | Días desde la última transición de estado (cálculo: HOY - fecha_cambio_estado) |

#### Enums Válidos

**Estado (estado):**
```
"Nuevo"                  // Lead recién ingresado, sin contacto aún
"En contacto"            // Se ha establecido comunicación inicial
"Propuesta enviada"      // Se compartió una propuesta comercial
"Cerrado"                // Transacción completada (ganado o perdido)
```

**Fuente (fuente):**
```
"Referencia"             // Referencia de cliente existente
"Inbound"                // Lead que se contactó a nosotros
"Campaña"                // De una campaña de marketing
"Red Social"             // Proviene de redes sociales
"Evento"                 // De un evento, conferencia, etc.
"Otra"                   // No se especifica / otro origen
```

**Prioridad (prioridad):**
```
"Baja"                   // Seguimiento después de otras oportunidades
"Media"                  // Prioridad estándar
"Alta"                   // Requiere seguimiento urgente
"Urgente"                // Contacto inmediato necesario
```

### 2.2 Auditoría (Opcional pero Recomendada)

**Tabla:** `leads_audit`  
**Descripción:** Registro histórico de cambios para trazabilidad completa

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `audit_id` | UUID | Identificador único del evento de auditoría |
| `lead_id` | UUID | FK referencia a `leads.id_lead` |
| `campo_modificado` | VARCHAR(50) | Nombre del campo que cambió |
| `valor_anterior` | TEXT | Valor antes del cambio |
| `valor_nuevo` | TEXT | Valor después del cambio |
| `usuario_id` | VARCHAR(50) | Quién hizo el cambio |
| `timestamp` | TIMESTAMP | Cuándo ocurrió el cambio |
| `accion` | ENUM | CREATE, UPDATE, DELETE, MOVE |

---

## Casos de Uso Detallados

### CU-01: Crear Lead

#### 1.1 Descripción

Permite a un usuario del sistema ingresar un nuevo cliente potencial en el pipeline, registrando sus datos básicos e iniciando el seguimiento comercial.

#### 1.2 Actores

- **Actor Primario:** Ejecutivo de Ventas, Coordinador Comercial
- **Actores Secundarios:** Sistema (persistencia), Base de Datos

#### 1.3 Precondiciones

1. El usuario debe estar autenticado en el sistema
2. El usuario debe tener rol "Vendedor" o "Coordinador"
3. La conexión a la base de datos es estable
4. El email del lead no existe ya en el sistema

#### 1.4 Flujo Principal (Happy Path)

| Paso | Actor | Acción | Respuesta del Sistema |
|------|-------|--------|----------------------|
| 1 | Usuario | Hace clic en botón "Crear Lead" o "Nuevo Lead" | Se abre formulario de creación con campos vacíos |
| 2 | Usuario | Ingresa nombre completo (requerido) | Campo se valida en tiempo real (>= 2 caracteres) |
| 3 | Usuario | Ingresa empresa (requerido) | Campo se valida (>= 2 caracteres) |
| 4 | Usuario | Ingresa email (requerido) | Se valida formato email (regex estándar), verifica unicidad |
| 5 | Usuario | Ingresa teléfono (opcional) | Se valida formato teléfono si se proporciona |
| 6 | Usuario | Selecciona fuente (opcional) | Dropdown con opciones predefinidas |
| 7 | Usuario | Agrega monto estimado (opcional) | Se valida numérico, >= 0 |
| 8 | Usuario | Agregar notas (opcional) | Campo texto libre, máx 1000 caracteres |
| 9 | Usuario | Hace clic en "Guardar" o "Crear Lead" | Sistema valida todos los campos |
| 10 | Sistema | Valida datos | Si todo es válido, continúa paso 11; si hay errores, va a 1.5.1 |
| 11 | Sistema | Genera UUID único para `id_lead` | ID se asigna automáticamente |
| 12 | Sistema | Asigna `estado = "Nuevo"` por defecto | Estado inicial fijo |
| 13 | Sistema | Asigna `fecha_creacion = NOW()` | Timestamp del servidor |
| 14 | Sistema | Asigna `asignado_a = usuario_actual.id` | Lead se asigna al usuario que lo crea |
| 15 | Sistema | Inserta registro en tabla `leads` | Transacción atómica |
| 16 | Sistema | Crea entrada en tabla `leads_audit` | Acción: CREATE |
| 17 | Sistema | Responde al usuario | Mostrará toast/notificación "Lead creado exitosamente" + cierra formulario |
| 18 | Sistema | Actualiza vista del pipeline | Nuevo lead aparece en columna "Nuevo" |

#### 1.5 Flujos Alternativos

**1.5.1: Validación Fallida — Campos Requeridos Vacíos**

| Paso | Acción |
|------|--------|
| En paso 9 | Usuario hace clic en "Guardar" con campos requeridos vacíos |
| Sistema | Identifica campos vacíos |
| Sistema | Muestra error: "Los campos [nombre, empresa, email] son requeridos" |
| Sistema | Resalta campos vacíos con borde rojo |
| Sistema | NO guarda el lead |
| Usuario | Completa campos faltantes y reintenta |

**1.5.2: Email Duplicado**

| Paso | Acción |
|------|--------|
| En paso 9 | Sistema valida email y encuentra que `email` ya existe |
| Sistema | Muestra error: "El email [correo] ya está registrado. ¿Deseas editar el lead existente?" |
| Usuario | Opción A: Cancela y elige otro email; Opción B: Ver lead existente |

**1.5.3: Formato de Email Inválido**

| Paso | Acción |
|------|--------|
| En paso 4 | Usuario ingresa "juan.com" (sin @) |
| Sistema | Muestra error inmediato: "Email inválido. Formato: nombre@empresa.com" |
| Usuario | Corrige formato y sistema acepta |

**1.5.4: Timeout de Conexión**

| Paso | Acción |
|------|--------|
| En paso 15 | Falla la conexión a base de datos durante INSERT |
| Sistema | Muestra error: "Error al guardar. Intenta nuevamente" |
| Sistema | Mantiene datos en formulario (no limpia) |
| Usuario | Verifica conexión y reintenta |

**1.5.5: Teléfono Formato Inválido**

| Paso | Acción |
|------|--------|
| En paso 5 | Usuario ingresa "abc123xyz" |
| Sistema | Valida y muestra advertencia: "Teléfono inválido. Ejemplo: +34 91 123 4567 o 912345678" |
| Usuario | Opción A: Corrige; Opción B: Continúa sin teléfono (es opcional) |

#### 1.6 Postcondiciones

✅ Si tiene éxito:
- Se crea nuevo registro en tabla `leads` con todos los datos ingresados
- El lead obtiene `estado = "Nuevo"` automáticamente
- El lead es asignable al usuario actual
- El lead es visible inmediatamente en la columna "Nuevo" del pipeline
- Se genera entrada en tabla `leads_audit`

❌ Si falla:
- NO se crea registro en base de datos
- Usuario ve mensaje de error específico
- Formulario retiene los datos ingresados para corrección
- Se registra el error en logs del sistema

#### 1.7 Criterios de Aceptación

| # | Criterio | Verificable | Prioritario |
|---|----------|------------|-------------|
| AC-1.1 | El formulario exige: nombre, empresa, email (requeridos) | Test: intentar guardar vacío → error | ✅ CRÍTICO |
| AC-1.2 | El formulario acepta: teléfono, fuente, monto, notas (opcionales) | Test: guardar sin estos campos → éxito | ✅ CRÍTICO |
| AC-1.3 | Email debe ser único en todo el sistema | Test: intentar crear 2 leads con mismo email → error en segundo | ✅ CRÍTICO |
| AC-1.4 | Email debe validarse con formato correcto (regex) | Test: "usuario@dominio.com" ✅, "usuariodominio" ❌ | ✅ CRÍTICO |
| AC-1.5 | Lead nuevo tiene estado "Nuevo" por defecto | Test: crear lead → verificar estado en base de datos | ✅ CRÍTICO |
| AC-1.6 | Lead se asigna automáticamente al usuario que lo crea | Test: usuario A crea lead → `asignado_a = usuario_A.id` | ✅ CRÍTICO |
| AC-1.7 | Nuevo lead aparece en columna "Nuevo" del pipeline | Test: crear lead → verificar aparece en UI sin refresh | ✅ CRÍTICO |
| AC-1.8 | Hora de creación usa timestamp del servidor (no del cliente) | Test: crear lead → verificar `fecha_creacion` es correcta | ✅ CRÍTICO |
| AC-1.9 | Se registra auditoría completa de creación | Test: verificar entrada en `leads_audit` con acción CREATE | ✅ IMPORTANTE |
| AC-1.10 | Mensajes de error son claros y específicos | Test: validaciones fallidas → error describe exactamente qué falta | ✅ IMPORTANTE |

---

### CU-02: Actualizar Estado del Lead

#### 2.1 Descripción

Permite cambiar el estado de un lead a través del pipeline Kanban, reflejando el progreso comercial. Es la operación más frecuente del sistema.

#### 2.2 Actores

- **Actor Primario:** Ejecutivo de Ventas, Coordinador Comercial
- **Actores Secundarios:** Sistema, Base de Datos

#### 2.3 Precondiciones

1. El usuario debe estar autenticado
2. El lead debe existir y ser visible para el usuario (asignado a él)
3. El lead debe tener un estado actual válido
4. No debe haber cambio simultáneo de otro usuario (evitar race condition)

#### 2.4 Flujo Principal — Método Drag & Drop

| Paso | Actor | Acción | Respuesta del Sistema |
|------|-------|--------|----------------------|
| 1 | Usuario | Visualiza el pipeline con 4 columnas de estado | Columnas: "Nuevo", "En contacto", "Propuesta enviada", "Cerrado" |
| 2 | Usuario | Identifica tarjeta de lead que desea mover | Lead es identificable por nombre + empresa (máx 40 caracteres) |
| 3 | Usuario | Hace click y drag sobre tarjeta del lead | UI muestra indicador visual (opacidad, overlay) |
| 4 | Usuario | Arrastra hacia columna destino | Columna destino se resalta con border punteado |
| 5 | Usuario | Suelta la tarjeta en columna de destino | Sistema captura evento drop |
| 6 | Sistema | Valida que la transición es permitida | Verifica reglas de transición (ver sección 3.3) |
| 7 | Sistema | Si válida, actualiza `estado` del lead | UPDATE leads SET estado = '...' WHERE id_lead = ... |
| 8 | Sistema | Actualiza `fecha_actualizacion = NOW()` | Timestamp del servidor |
| 9 | Sistema | Crea entrada en tabla `leads_audit` | Acción: UPDATE, campo: "estado", valor anterior/nuevo |
| 10 | Sistema | Actualiza UI sin refresh | Tarjeta se mueve suavemente a nueva columna con animación |
| 11 | Sistema | Muestra confirmación visual | Toast: "Lead movido a [estado nuevo]" |

#### 2.5 Flujo Alternativo — Actualización por Formulario

**Descripción:** Si el usuario prefiere no hacer drag-drop, puede editar directamente desde el formulario de edición del lead.

| Paso | Acción |
|------|--------|
| 1 | Usuario hace clic en tarjeta del lead (o ícono editar) |
| 2 | Sistema abre modal/panel de edición del lead |
| 3 | Usuario ve dropdown "Estado actual" con opciones permitidas |
| 4 | Usuario selecciona nuevo estado |
| 5 | Usuario hace clic en "Guardar" |
| 6 | Sistema ejecuta validación y guardado igual al flujo principal |
| 7 | Sistema cierra modal y actualiza vista |

#### 2.6 Validaciones de Transición

**Matriz de Transiciones Permitidas:**

| Estado Actual | → Nuevo | → En contacto | → Propuesta | → Cerrado | Permitido hacia atrás? |
|---------------|---------|---------------|-------------|-----------|----------------------|
| **Nuevo** | — | ✅ | ❌ (debe ser En contacto primero) | ❌ | — |
| **En contacto** | ✅ (retroceso) | — | ✅ | ❌ (debe enviar propuesta primero) | ✅ PERMITIDO |
| **Propuesta enviada** | ✅ (retroceso) | ✅ (retroceso) | — | ✅ | ✅ PERMITIDO |
| **Cerrado** | ❌ NO retroceso | ❌ NO retroceso | ❌ NO retroceso | — | ❌ FINAL |

**Reglas:**
- Un lead puede retroceder hasta "En contacto"
- Un lead NO puede retroceder desde "Cerrado" (es estado final)
- Un lead NO puede avanzar más de un estado en un movimiento (excepto: Nuevo → Cerrado se rechaza)

#### 2.7 Criterios de Aceptación

| # | Criterio | Verificable |
|---|----------|------------|
| AC-2.1 | Drag-drop mueve lead entre columnas correctamente | Test: arrastrar tarjeta → verifica `estado` en BD |
| AC-2.2 | Transiciones prohibidas generan error ("No se puede mover a ese estado") | Test: Nuevo → Propuesta directa → error |
| AC-2.3 | Lead cerrado no puede retroceder | Test: Cerrado → En contacto → rechazo |
| AC-2.4 | Cambio de estado se registra en auditoría con timestamp exacto | Test: verificar `leads_audit` con acción UPDATE |
| AC-2.5 | UI muestra feedback visual inmediato al mover | Test: drag-drop → animación visible |
| AC-2.6 | Dos usuarios moviendo mismo lead simultáneamente → último cambio gana | Test: race condition con timestamp |
| AC-2.7 | Cambio de estado actualiza fecha_actualizacion | Test: crear lead → esperar → mover → fecha_actualizacion es reciente |

---

### CU-03: Editar Datos del Lead

#### 3.1 Descripción

Permite al usuario modificar datos de un lead existente (nombre, empresa, email, teléfono, notas, monto, etc.) excepto el ID y fechas de sistema.

#### 3.2 Flujo Principal

| Paso | Acción |
|------|--------|
| 1 | Usuario hace clic en lead (tarjeta o fila en tabla) |
| 2 | Sistema abre panel lateral o modal de edición |
| 3 | Panel muestra todos los campos del lead |
| 4 | Usuario modifica uno o más campos |
| 5 | Usuario hace clic en "Guardar cambios" |
| 6 | Sistema valida datos (igual a CU-01 rules) |
| 7 | Si válido: actualiza registro en tabla `leads` |
| 8 | Si válido: registra cambio en `leads_audit` |
| 9 | Sistema muestra confirmación: "Cambios guardados" |
| 10 | Panel se cierra y vista se actualiza |

#### 3.3 Campos Editables vs. Solo Lectura

**Editables:**
- `nombre` — permite cambio completo
- `empresa` — permite cambio completo
- `email` — permite cambio si nuevo email es único
- `telefono` — permite cambio
- `fuente` — permite cambio
- `monto_estimado` — permite cambio
- `notas` — permite cambio
- `prioridad` — permite cambio
- `fecha_proximo_contacto` — permite cambio
- `asignado_a` — permite reasignar a otro vendedor (solo admin/manager)

**Solo Lectura:**
- `id_lead` — identificador único
- `estado` — cambiar vía CU-02 (Actualizar Estado), no desde aquí
- `fecha_creacion` — creada por sistema
- `fecha_actualizacion` — actualizada automáticamente
- `dias_en_estado` — calculado automáticamente

#### 3.4 Criterios de Aceptación

| # | Criterio | Verificable |
|---|----------|------------|
| AC-3.1 | Se pueden editar todos los campos editables | Test: cambiar cada uno → verifica en BD |
| AC-3.2 | Email duplicado en edición → error | Test: cambiar email a uno existente → rechazo |
| AC-3.3 | Email único es permitido | Test: cambiar a email no existente → aceptado |
| AC-3.4 | Notas se limitan a 1000 caracteres | Test: pegar 1001 caracteres → error o trunca con warning |
| AC-3.5 | Campo estado NO es editable desde este formulario | Test: verificar que dropdown estado está deshabilitado |
| AC-3.6 | Todos los cambios se registran en auditoría | Test: editar 3 campos → 3 entradas en `leads_audit` |

---

### CU-04: Visualizar Pipeline

#### 4.1 Descripción

Permite visualizar todos los leads del usuario organizados en un tablero Kanban con 4 columnas correspondientes a los 4 estados.

#### 4.2 Flujo Principal

| Paso | Acción |
|------|--------|
| 1 | Usuario accede a la aplicación (autenticado) |
| 2 | Sistema carga lista de leads asignados al usuario |
| 3 | Sistema organiza leads por estado en 4 columnas |
| 4 | Cada columna muestra tarjetas de lead con: nombre, empresa, fecha |
| 5 | Usuario visualiza el estado general del pipeline |
| 6 | Usuario puede filtrar/buscar leads (CU-04b) |
| 7 | Usuario puede hacer drag-drop para cambiar estado (CU-02) |

#### 4.3 Estructura de Visualización

**Columnas del Kanban:**

| Columna | Estado | Descripción | Color |
|---------|--------|-------------|-------|
| 1 | Nuevo | Leads recién creados sin contacto | Azul (#3B82F6) |
| 2 | En contacto | Contacto establecido, conversación iniciada | Amarillo (#F59E0B) |
| 3 | Propuesta enviada | Se compartió propuesta comercial | Púrpura (#A855F7) |
| 4 | Cerrado | Transacción completada (ganada o perdida) | Verde (#10B981) |

**Contenido de Tarjeta de Lead:**

```
┌─────────────────────────┐
│ [Prioridad] Nombre      │  ← Nombre del lead (30 chars máx)
│ Empresa Ltda.           │  ← Nombre empresa (30 chars máx)
│                         │
│ 📧 email@empresa.com    │  ← Email truncado
│ 📞 +34 91 123 4567      │  ← Teléfono (si existe)
│                         │
│ Monto: $50.000 USD      │  ← Si existe monto estimado
│ 3 días en estado        │  ← Tiempo en estado actual
│                         │
│ [Editar] [Más...]       │  ← Acciones rápidas
└─────────────────────────┘
```

#### 4.4 Información Mostrada por Columna

**Para cada lead visible:**

| Campo | Mostrado | Truncado | Tooltip |
|-------|----------|----------|---------|
| Nombre | Sí | 30 chars | Full name |
| Empresa | Sí | 30 chars | Full company |
| Email | Sí | 25 chars | Full email |
| Teléfono | Condicional | — | Completo |
| Monto | Condicional | — | Formateado USD |
| Prioridad | Badge | — | Baja/Media/Alta/Urgente |
| Días en estado | Sí | — | "3 días", "Hoy", "23 horas" |
| Fecha próximo contacto | Badge rojo si cercana | — | Si <= 2 días |

#### 4.4 Subcase: Buscar Lead (CU-04a)

**Trigger:** Usuario escribe en campo de búsqueda

| Paso | Acción |
|------|--------|
| 1 | Usuario ve campo "Buscar lead..." en la parte superior |
| 2 | Usuario escribe nombre, empresa o email |
| 3 | Sistema filtra leads EN TIEMPO REAL |
| 4 | Búsqueda es case-insensitive y busca en: nombre, empresa, email |
| 5 | Resultados se muestran en las columnas con solo leads coincidentes |
| 6 | Si no hay resultados: "No hay leads que coincidan con '[criterio]'" |
| 7 | Usuario puede limpiar búsqueda (X button) para volver a ver todos |

#### 4.5 Subcase: Filtrar por Prioridad (CU-04b)

**Opciones de filtro:**

```
☐ Baja
☐ Media (pre-seleccionado)
☐ Alta
☐ Urgente
[Mostrar todo]
```

**Comportamiento:**
- Múltiple selección permitida
- Muestra solo leads con prioridades seleccionadas
- Estado de filtro se recuerda en la sesión

#### 4.6 Criterios de Aceptación

| # | Criterio | Verificable |
|---|----------|------------|
| AC-4.1 | Pipeline Kanban muestra 4 columnas | Test: verificar 4 columnas visibles |
| AC-4.2 | Cada lead aparece en la columna correcta según estado | Test: crear lead estado "Nuevo" → aparece en columna 1 |
| AC-4.3 | Leads son movibles por drag-drop | Test: arrastrar lead entre columnas |
| AC-4.4 | Búsqueda filtra en tiempo real | Test: escribir "juan" → muestra solo leads con juan en nombre |
| AC-4.5 | Búsqueda es case-insensitive | Test: buscar "JUAN" = "juan" = "Juan" |
| AC-4.6 | Filtro de prioridad funciona | Test: seleccionar "Alta" → solo muestra leads Alta |
| AC-4.7 | Counts en columna encabezado (ej: "Nuevo (5)") | Test: crear 5 leads → encabezado muestra número |
| AC-4.8 | Tarjeta de lead es clickeable para editar | Test: hacer clic → abre panel edición |

---

### CU-05: Editar Estado Masivo (Opcional - Future)

**Nota:** Para esta especificación MVP, se excluye. Si se agrega después:
- Checkbox en tarjeta de lead
- Seleccionar múltiples → botón "Cambiar estado a..."
- Validaciones se aplican a cada uno

---

## Flujos de Usuario Paso a Paso

### Flujo 1: Día Típico de Ejecutivo de Ventas

```
MAÑANA (9:00 AM)
├─ Abre aplicación
├─ Ve pipeline: 3 Nuevo, 2 En contacto, 1 Propuesta, 0 Cerrado
├─ Crea 2 nuevos leads (de llamadas de inbound)
│  └─ CU-01: Crear Lead x2
├─ Revisa sus 3 leads "Urgente" (filtro)
└─ Planifica llamadas de seguimiento

TARDE (2:00 PM)
├─ Llama al lead "Empresa XYZ" (estado: Nuevo)
├─ Mueve a "En contacto" (drag-drop)
│  └─ CU-02: Cambiar Estado
├─ Toma notas: "Interesado, seguimiento miércoles"
│  └─ CU-03: Editar Lead (actualizar notas)
├─ Programa fecha de próximo contacto: 2026-06-09

ANTES DE TERMINAR (5:00 PM)
├─ Revisa estado actual del pipeline
├─ Ve que tiene 2 leads sin mover en 5 días
├─ Prioriza estos para mañana
└─ Cierra la sesión
```

### Flujo 2: Día de Coordinador Comercial

```
MAÑANA (8:30 AM)
├─ Abre aplicación
├─ Revisa estado de TODOS los equipos (si tiene permisos de admin)
├─ Crea 5 leads de base de datos importada
│  └─ Bulk: CU-01 x5
├─ Asigna leads a ejecutivos disponibles
│  └─ Editar `asignado_a` en cada lead
│
TARDE
├─ Genera reporte: estado actual del pipeline
├─ Busca lead "Cliente VIP" (búsqueda CU-04a)
├─ Edita datos: actualiza teléfono
└─ Notifica al ejecutivo sobre cambio
```

### Flujo 3: Gestión de Error — Email Duplicado

```
1. Usuario intenta crear lead "juan@empresa.com"
2. Sistema rechaza: "Email ya registrado"
3. Usuario elige ver el lead existente
4. Verifica: es el mismo contacto, diferente empresa
5. Usuario corrige email a "juan.lopez@empresa.com"
6. Sistema acepta y crea lead
```

---

## Estados y Transiciones

### 3.1 Diagrama de Máquina de Estados

```
┌─────────────────────────────────────────────────────────┐
│                    PIPELINE DE ESTADOS                  │
└─────────────────────────────────────────────────────────┘

    ┌──────────┐
    │  NUEVO   │  ← Estado inicial para todos los leads
    └────┬─────┘
         │
         │ [Llamada/Email establecido]
         ▼
    ┌──────────────────┐
    │  EN CONTACTO     │  ← Comunicación iniciada
    └─┬──────────┬────┘
      │          │
      │ (👈 retroceso permitido)
      │          │ [Se comparte propuesta]
      │          ▼
      │     ┌──────────────────┐
      │     │ PROPUESTA ENVIADA │  ← Presupuesto/oferta compartida
      │     └─┬──────────┬─────┘
      │       │          │
      │       │ (👈 retroceso)
      │       │          │ [Lead cierra (gana/pierde)]
      │       │          ▼
      │       │     ┌──────────┐
      │       │     │ CERRADO  │  ← FINAL, sin retroceso
      │       │     └──────────┘
      │       │
      └───────┴──→ [Retroceso permitido hasta En contacto]
```

### 3.2 Definición de Estados

| Estado | Significado | Acciones Permitidas | Restricciones |
|--------|------------|-------------------|---------------|
| **Nuevo** | Lead recién ingresado, sin contacto establecido | • Avanzar a "En contacto" • Editar datos • Ver notas • Contactar | • No puede saltarse a "Propuesta" • No puede ir a "Cerrado" directo |
| **En Contacto** | Se ha establecido comunicación, conversación iniciada | • Retroceder a "Nuevo" • Avanzar a "Propuesta" • Editar datos • Agregar notas | • No puede saltarse a "Cerrado" directo |
| **Propuesta Enviada** | Se compartió propuesta/presupuesto comercial | • Retroceder a "En contacto" • Retroceder a "Nuevo" • Avanzar a "Cerrado" • Editar datos | • No puede regresarse de "Cerrado" |
| **Cerrado** | Transacción completada (ganada o perdida) | • Ver datos • Ver histórico • Generar reporte | • ⛔ NO puede cambiar a otro estado • ⛔ NO editable excepto notas | 
| **Eliminado** (Soft Delete) | Lead marcado como borrado lógicamente | • Recuperable por admin | • No visible en pipeline normal | 

### 3.3 Reglas de Transición

**Matriz de Validación Estricta:**

```
SI estado_actual == "Nuevo"
  ENTONCES permite transición a: "En contacto"
  NIEGA transición a: "Propuesta", "Cerrado"

SI estado_actual == "En contacto"
  ENTONCES permite transición a: "Nuevo", "Propuesta"
  NIEGA transición a: "Cerrado"

SI estado_actual == "Propuesta enviada"
  ENTONCES permite transición a: "En contacto", "Nuevo", "Cerrado"

SI estado_actual == "Cerrado"
  ENTONCES BLOQUEA todas las transiciones
  Mensaje: "No se puede cambiar un lead cerrado"
```

### 3.4 Tiempo Permitido en Cada Estado

| Estado | Recomendación | Alerta Si > | Acción |
|--------|---------------|-----------|--------|
| Nuevo | 1-2 días | 7 días | Notificar coordinador |
| En contacto | 3-5 días | 14 días | Notificar para seguimiento |
| Propuesta | 5-10 días | 21 días | Notificar para cierre o retroceso |
| Cerrado | — | — | Histórico |

**Nota:** Los "días en estado" se calculan automáticamente y se muestran en tarjeta.

---

## Validaciones y Restricciones

### 4.1 Matriz de Validación de Campos

| Campo | Tipo | Requerido | Min | Max | Validación | Mensaje Error |
|-------|------|-----------|-----|-----|-----------|---------------|
| **nombre** | VARCHAR | ✅ YES | 2 | 100 | Texto alfanumérico, sin caracteres especiales peligrosos | "Nombre debe tener 2-100 caracteres" |
| **empresa** | VARCHAR | ✅ YES | 2 | 100 | Texto alfanumérico | "Empresa debe tener 2-100 caracteres" |
| **email** | VARCHAR | ✅ YES | 5 | 120 | Regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` | "Email inválido. Ej: user@empresa.com" |
| **email** | VARCHAR | ✅ UNIQUE | — | — | Verificar que no exista otro lead con mismo email | "Email ya está registrado" |
| **telefono** | VARCHAR | ❌ OPT | 7 | 20 | Regex: `^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$` | "Teléfono inválido. Ej: +34 91 123 4567" |
| **monto_estimado** | DECIMAL | ❌ OPT | 0 | 999999.99 | Numérico, >= 0, máx 2 decimales | "Monto debe ser un número positivo" |
| **notas** | TEXT | ❌ OPT | 0 | 1000 | Texto libre, sin límite de caracteres en entrada pero guardamos 1000 | "Notas no pueden exceder 1000 caracteres" |
| **fecha_proximo_contacto** | DATE | ❌ OPT | Hoy | +365 días | Debe ser futuro | "Fecha debe ser futura" |
| **estado** | ENUM | ✅ YES | — | — | Uno de: Nuevo, En contacto, Propuesta, Cerrado | "Estado inválido" |
| **prioridad** | ENUM | ❌ OPT | — | — | Uno de: Baja, Media, Alta, Urgente | "Prioridad inválida" |
| **fuente** | ENUM | ❌ OPT | — | — | Uno de: Referencia, Inbound, Campaña, Red Social, Evento, Otra | "Fuente inválida" |

### 4.2 Validaciones de Lógica de Negocio

**Validación 1: No Crear Duplicate**
```
SI EXISTE otro lead con:
  MISMO email Y
  MISMO nombre
ENTONCES rechazar: "Este lead probablemente ya existe"
```

**Validación 2: Transiciones de Estado Válidas**
```
SI usuario intenta mover lead de estado_A a estado_B
  Y NO existe transición válida de A → B
ENTONCES rechazar: "No se puede mover de [A] a [B]"
```

**Validación 3: Lead Cerrado es Inmutable (excepto notas)**
```
SI estado == "Cerrado"
  Y usuario intenta cambiar campo != notas
ENTONCES rechazar: "No se pueden editar leads cerrados"
Excepción: Permitir editar solo `notas`
```

**Validación 4: Email Único en el Tiempo**
```
SI usuario edita email de lead_A a "nuevo@email.com"
  Y EXISTE otro lead_B con "nuevo@email.com"
ENTONCES rechazar: "Email ya está en uso"
```

### 4.3 Validación en Cliente vs Servidor

| Validación | Cliente | Servidor | Prioridad |
|-----------|---------|----------|-----------|
| Campos requeridos no vacíos | ✅ Feedback inmediato | ✅ Validar también | CRÍTICA |
| Formato email | ✅ Regex en tiempo real | ✅ Validar doble | CRÍTICA |
| Email único | ❌ No (requiere BD) | ✅ MUST | CRÍTICA |
| Rango numérico | ✅ Min/Max | ✅ Validar | IMPORTANTE |
| Longitud máxima | ✅ Counter | ✅ Truncar/rechazar | IMPORTANTE |
| Transición válida | ❌ No (lógica compleja) | ✅ MUST | CRÍTICA |
| Teléfono formato | ✅ Sugerencia | ✅ Flexible | BAJA |

---

## Reglas de Negocio

### Numeradas y Explícitas

**RN-001: Estado Inicial**
- TODO lead nuevo tiene estado = "Nuevo"
- No existe excepción
- No puede crearse lead con otro estado

**RN-002: Unicidad de Email**
- Cada email en el sistema debe ser único
- No pueden coexistir dos leads con mismo email
- Si se detecta: mostrar error y ofrecermerge/edición

**RN-003: Asignación de Lead**
- Lead creado por usuario X se asigna automáticamente a usuario X
- Un admin/manager puede reasignar a otro usuario
- Un ejecutivo solo puede ver sus leads (salvo permisos especiales)

**RN-004: Progresión Lineal**
- Lead debe progresar en orden: Nuevo → En contacto → Propuesta → Cerrado
- Puede retroceder entre estados EXCEPTO desde Cerrado
- No hay saltos: Nuevo → Propuesta es rechazado

**RN-005: Auditibilidad Completa**
- TODO cambio se registra con: usuario, timestamp, valor anterior/nuevo
- Se mantiene histórico en tabla `leads_audit`
- Accesible para compliance/investigación

**RN-006: Campos de Sistema**
- Los campos: `id_lead`, `fecha_creacion`, `fecha_actualizacion`, `dias_en_estado` son generados por el sistema
- NO pueden ser editados por usuario
- Son solo lectura

**RN-007: Lead Cerrado es Final**
- Estado "Cerrado" es terminal
- NO puede retroceder
- NO puede editar campos excepto `notas`
- Mensaje al intentar: "Este lead está cerrado. Solo puedes agregar notas."

**RN-008: Limpieza de Datos**
- Todos los campos de texto se trimean (elimina espacios al inicio/final)
- Email se convierte a minúsculas antes de verificar unicidad
- Nombres y empresas pueden contener acentos y caracteres latinos

**RN-009: Timestamps de Servidor**
- SIEMPRE se usan timestamps del servidor, NUNCA del cliente
- Zona horaria: UTC (se convierte a hora local solo en visualización)
- Previene inconsistencias por relojes de cliente desincronizados

**RN-010: Notas Históricas**
- Notas siempre se AGREGAN, no reemplazan (append-only)
- Formato: "[2026-06-07 14:30] usuario: texto de nota\n"
- Límite: 1000 caracteres por entrada, histórico ilimitado

**RN-011: Visibilidad por Roles**
- Ejecutivo ve solo SUS leads
- Coordinador/Admin ve leads de todo el equipo
- No hay compartición cruzada (ejecutivo A no ve leads de ejecutivo B)

**RN-012: Validez de Monto Estimado**
- Debe ser >= 0
- Máximo 999,999.99 USD
- NULL si no se especifica
- Usable para reportes de value at risk

---

## Manejo de Errores

### 5.1 Categorías de Error

#### Categoría 1: Validación de Entrada (400 Bad Request)

| Error | Causa | Mensaje Usuario | Acción del Sistema |
|-------|-------|-----------------|-------------------|
| Campo requerido vacío | Usuario no completa nombre/empresa/email | "Por favor completa: [nombre, empresa, email]" | Marca campos en rojo, focus en primero vacío |
| Email inválido | "juan@com", "juan@empresa" | "Email inválido. Ej: juan@empresa.com" | Resalta campo, sugerencia |
| Email duplicado | Mismo email existe | "Este email ya está registrado. ¿Ver lead?" | Botón: Ver | Editar |
| Teléfono inválido | "abc123" | "Teléfono inválido. Ej: +34 91 1234567" | Campo marca error (warning) |
| Monto negativo | "-100" | "Monto debe ser positivo" | Input rechaza valor |
| Notas exceden límite | 1001+ caracteres | "Notas limitadas a 1000 caracteres (1050 escritos)" | Muestra contador |
| Transición inválida | Nuevo → Cerrado | "No se puede mover de Nuevo a Cerrado directamente" | Resalta botón "X", tooltip con transiciones válidas |

#### Categoría 2: Conflicto de Datos (409 Conflict)

| Error | Causa | Mensaje Usuario | Acción |
|-------|-------|-----------------|--------|
| Edición simultánea | Dos usuarios editan mismo lead | "Este lead fue modificado recientemente. ¿Recargar?" | Botón: Recargar (pierde cambios) \| Merge (avanzado) |
| Race condition en estado | Dos usuarios movearon simultáneamente | "El estado cambió. Estado actual: [X]. ¿Actualizar?" | Recarga y muestra estado real |

#### Categoría 3: Error de Servidor (500 Internal Error)

| Error | Causa | Mensaje Usuario | Acción del Sistema |
|-------|-------|-----------------|-------------------|
| Timeout BD | Conexión lenta/perdida | "Temporalmente no disponible. Intenta en unos segundos." | Reintento automático (3x), después permite manual |
| Error BD | Query fall | "Error al guardar. Contacta a soporte si persiste." | Log detallado en backend, ticket automático |
| Error interno | Bug en código | "Algo salió mal. Recarga la página." | Error tracking (Sentry), notificación a dev team |

#### Categoría 4: Permisos (403 Forbidden)

| Error | Causa | Mensaje Usuario |
|-------|-------|-----------------|
| Sin acceso a lead | Usuario A intenta ver lead de Usuario B | "No tienes permiso para acceder a este lead." |
| Sin rol | Usuario estándar intenta reasignar | "Solo administradores pueden reasignar." |
| Sesión expirada | Token caducó | "Tu sesión expiró. Por favor inicia sesión nuevamente." |

### 5.2 Estados HTTP y Mensajes

| Status | Escenario | Respuesta JSON |
|--------|-----------|----------------|
| 200 OK | Operación exitosa | `{ "status": "success", "message": "Lead guardado", "data": {...} }` |
| 201 Created | Lead creado | `{ "status": "created", "id": "uuid123", "data": {...} }` |
| 400 Bad Request | Validación fallida | `{ "status": "error", "message": "Email inválido", "field": "email" }` |
| 409 Conflict | Duplicado o race condition | `{ "status": "conflict", "message": "Email existe", "suggestion": "Ver lead..." }` |
| 403 Forbidden | Sin permiso | `{ "status": "forbidden", "message": "No autorizad" }` |
| 500 Internal Error | Error servidor | `{ "status": "error", "message": "Error interno" }` |

### 5.3 Notificaciones del Usuario (Toast/Alert)

**Toast Success (Verde, 3 seg):**
```
✅ Lead creado exitosamente
✅ Cambios guardados
✅ Lead movido a [Estado]
```

**Toast Warning (Amarillo, 5 seg):**
```
⚠️ Teléfono inválido (pero se guardó)
⚠️ Email ya existe — ver lead existente
⚠️ Tienes 5 leads sin contactar hace > 7 días
```

**Alert Error (Rojo, persistent):**
```
❌ Error al guardar: [detalles técnicos]
[Reintentar] [Contactar Soporte] [Descartar]
```

---

## Casos Edge y Excepciones

### 6.1 Casos Edge Detallados

#### Edge 1: Email Duplicado en Creación

**Escenario:**
```
Usuario 1: Crea lead "juan@empresa.com" a las 14:00
Usuario 1: Crea OTRO lead "juan@empresa.com" a las 14:05
```

**Validación:**
- La segunda creación es rechazada
- Sistema busca primer lead con email en BD
- Ofrece opciones: "Este email existe. ¿Editar el existente?"

**Implementación:**
```sql
BEFORE INSERT ON leads
  CHECK IF EXISTS (SELECT 1 FROM leads WHERE email = NEW.email)
  IF EXISTS → RAISE ERROR 'Email duplicado'
```

#### Edge 2: Timeout de Conexión durante Guardado

**Escenario:**
```
Usuario hace clic "Guardar" → se interrumpe conexión → timeout después de 30 segundos
```

**Comportamiento:**
- UI muestra: "Conectando..." (spinner)
- Después de 30s: "Error de conexión. ¿Reintentar?"
- Si reintenta: verifica si fue guardado (idempotencia)
  - Si SÍ fue guardado: "Ya fue guardado. Cargando..."
  - Si NO: intenta guardar nuevamente
- Datos en formulario se RETIENEN (no limpian)

**Prevención:**
```
- Usar request IDs únicos (idempotency keys)
- Antes de reintentar, buscar en BD si lead existe
- Si existe: devolver success silenciosamente
```

#### Edge 3: Dos Usuarios Editan Simultáneamente el Mismo Lead

**Escenario:**
```
Tiempo 14:00:00 - Usuario A lee lead: nombre = "Juan"
Tiempo 14:00:05 - Usuario B lee lead: nombre = "Juan"
Tiempo 14:00:10 - Usuario A cambia a: nombre = "Juan López", guarda
Tiempo 14:00:15 - Usuario B cambia a: nombre = "Juan García", guarda
```

**Resultado actual (sin manejo):**
- Cambio de B sobrescribe cambio de A
- Nombre final: "Juan García" (pierde "López")

**Solución Optimista (Usar Versioning):**
```
1. Cada lead tiene campo "version" (INTEGER)
2. Usuario A lee: version = 5
3. Usuario B lee: version = 5
4. Usuario A guarda con: WHERE id = X AND version = 5 → version incrementa a 6
5. Usuario B intenta guardar con: WHERE id = X AND version = 5 → FAIL (version ya es 6)
6. Sistema notifica: "El lead fue modificado. ¿Recargar?"
```

**Mensaje al usuario:**
```
⚠️ Este lead fue modificado por otro usuario hace 5 segundos.
Cambios actuales: Nombre = "Juan López"
¿Recargar? [Recargar] [Descartar mis cambios]
```

#### Edge 4: Lead Borrado Mientras Usuario lo Edita

**Escenario:**
```
Usuario A: Abre lead para editar → formulario cargado
Usuario B: Borra lead (soft delete)
Usuario A: Hace clic Guardar
```

**Respuesta Sistema:**
- Búsqueda UPDATE no encuentra registro
- Devuelve error: "Este lead no existe (fue eliminado)"
- Opción: "Ver leads disponibles"

#### Edge 5: Crear Lead con Nombre/Email Idénticos a Otro Existente

**Escenario:**
```
Lead 1: Juan García, juan@empresa.com
Usuario intenta crear: Juan García, juan.garcia@empresa.com (diferente empresa)
```

**Resultado:**
- Sistema PERMITE (email es diferente)
- Validación solo verifica email único, no nombre+empresa

**Nota:** Si se requiere unicidad nombre+empresa, agregar constraint:
```sql
UNIQUE(nombre, empresa)
```

#### Edge 6: Búsqueda de Lead No Retorna Resultados

**Escenario:**
```
Usuario busca: "XYZ Corporation"
No hay leads con ese nombre
```

**Mostrar:**
```
🔍 No hay leads que coincidan con "XYZ Corporation"

[Crear nuevo lead "XYZ Corporation"]
[Limpiar búsqueda]
```

#### Edge 7: Teléfono con Espacios/Caracteres Especiales

**Escenario:**
```
Usuario ingresa: "+34 - (91) 123-4567"
```

**Validación:**
- Regex flexible para permitir espacios, guiones, paréntesis
- Almacenamiento: Se limpia pero se mantiene formato original
- Visualización: Formateado estándar

#### Edge 8: Notas Muy Largas (Edge de Campo TEXT)

**Escenario:**
```
Usuario copia 5000 caracteres en campo notas
```

**Comportamiento:**
- Frontend limita input a 1000 caracteres máximo
- Si se pega texto largo: muestra contador "5000/1000 caracteres (exceso de 4000)"
- Desactiva botón Guardar hasta estar dentro del límite

#### Edge 9: Monto Estimado Muy Alto

**Escenario:**
```
Usuario ingresa: "999999999" (9 dígitos)
```

**Validación:**
- Máximo permitido: 999,999.99 (6 dígitos enteros, 2 decimales)
- Sistema rechaza: "Monto máximo es $999,999.99 USD"

#### Edge 10: Estado "Cerrado" sin "Propuesta Enviada"

**Escenario:**
```
Lead está en estado "En contacto"
Usuario intenta ir directamente a "Cerrado"
```

**Resultado:**
- Transición rechazada: "No se puede ir directamente a Cerrado. Primero envía propuesta."
- Opciones permitidas mostradas en UI: [Nuevo] [Propuesta]

### 6.2 Condiciones de Race Condition Críticas

| # | Condition | Risk | Mitigation |
|---|-----------|------|------------|
| RC-1 | Dos usuarios crean lead mismo email al mismo tiempo | Email duplicado en BD | UNIQUE constraint + retry logic |
| RC-2 | Dos usuarios mueven lead simultáneamente a estados diferentes | Estado inconsistente | Optimistic locking (version field) |
| RC-3 | Usuario edita mientras admin lo borra | Guardar en registro fantasma | Soft delete + transactional check |
| RC-4 | Admin reasigna lead mientras ejecutivo lo edita | Asignación inconsistente | Lock breve en reasignación |

### 6.3 Escenarios de Recuperación

| Escenario | Acción Usuario | Sistema Intenta | Si Falla |
|-----------|----------------|-----------------|---------|
| Conexión perdida | Click "Guardar" | Reintenta 3x cada 5s | Muestra: "Fuera de línea. Datos guardados localmente" |
| Sesión expirada | Click "Guardar" | Requiere reautenticación | Redirige a login, formula se preserva |
| Navegador cierra | Datos en formulario | Local Storage preserva datos | Aviso: "Datos no guardados. ¿Recuperar?" |

---

## Métricas y Reportes

### 7.1 Métricas Obligatorias (MVP)

**Métrica 1: Total de Leads por Estado**
```
Panel: Resumen de Pipeline

Nuevo:              12 leads
En contacto:         8 leads
Propuesta enviada:   5 leads
Cerrado:             3 leads
─────────────────────
TOTAL:              28 leads

% en cada estado:
Nuevo:        42.9%
En contacto:  28.6%
Propuesta:    17.9%
Cerrado:       10.7%
```

**Métrica 2: Tasa de Conversión Básica**
```
Total entrados este mes: 12 leads
Total cerrados este mes: 2 leads

Tasa de conversión: 2/12 = 16.7%
Meta: 20% → ⚠️ Por debajo
```

**Métrica 3: Tiempo Promedio en Cada Estado**
```
Nuevo:              2.3 días
En contacto:        6.1 días
Propuesta:          8.7 días
TOTAL (fin a fin):  17.1 días
```

**Métrica 4: Leads Atrasados (Alerta)**
```
Leads en "Nuevo" hace > 7 días:      3 leads ⚠️
Leads en "Propuesta" hace > 14 días: 1 lead ⚠️

Acción recomendada: Hacer seguimiento urgente
```

**Métrica 5: Actividad Diaria**
```
Leads creados hoy:      4
Leads movidos hoy:      6
Estados actualizados:   2

Estado del día: Normal
```

### 7.2 Reportes Disponibles

| Reporte | Frecuencia | Datos | Formato |
|---------|-----------|-------|---------|
| Pipeline Summary | Real-time | Counts por estado | Widget/Dashboard |
| Conversion Funnel | Diario | Leads por etapa + conversion % | Gráfico embudo |
| Aging Report | Semanal | Leads atrasados por estado | Tabla con alertas |
| Team Performance | Mensual | Conversión por ejecutivo | Comparativo |
| Lead Source Analysis | Mensual | Conversión por fuente (Ref/Inbound/etc) | Gráfico pie |

### 7.3 Dashboard Principal (MVP)

```
┌─────────────────────────────────────────────────────────┐
│  🎯 PIPELINE ACTUAL                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Nuevo      En contacto    Propuesta    Cerrado        │
│   12 (42%)    8 (28%)        5 (18%)     3 (10%)      │
│                                                         │
│  ⚠️ Leads atrasados: 4 en Nuevo hace >7 días            │
│  ⚠️ 1 lead en Propuesta hace >14 días                   │
│                                                         │
│  📊 Tasa de conversión: 16.7% (Meta: 20%)             │
│  ⏱️  Tiempo promedio: 17.1 días (Nuevo → Cerrado)      │
│                                                         │
│  [Ver Reporte Completo] [Exportar CSV]                 │
└─────────────────────────────────────────────────────────┘
```

---

## Criterios de Aceptación del MVP

### Criterios Globales del Proyecto

| # | Criterio | Verificable | ¿Crítico? |
|---|----------|------------|----------|
| **Funcionalidad** | | |
| AC-MVP-F1 | Sistema crea leads sin fricción (< 30 segundos) | Cronómetro: crear lead → verificar en BD | ✅ CRÍTICO |
| AC-MVP-F2 | Sistema permite cambiar estado por drag-drop | Arrastrar tarjeta → verifica cambio en BD | ✅ CRÍTICO |
| AC-MVP-F3 | Pipeline Kanban visualiza todos los leads | Crear 20 leads → verificar aparecen en columnas | ✅ CRÍTICO |
| AC-MVP-F4 | Sistema valida emails únicos | Crear 2 leads mismo email → rechazo en segundo | ✅ CRÍTICO |
| **Confiabilidad** | | |
| AC-MVP-R1 | Ningún lead se pierde si falla conexión | Crear lead, cortar internet → recuperarse → lead existe | ✅ CRÍTICO |
| AC-MVP-R2 | Dos usuarios simultáneos no crean inconsistencias | Race condition test → datos consistentes | ✅ CRÍTICO |
| AC-MVP-R3 | Auditoria completa de cambios | Editar lead → verificar `leads_audit` | ✅ IMPORTANTE |
| **Usabilidad** | | |
| AC-MVP-U1 | Usuario sin capacitación puede usar en < 5 minutos | Test con usuario nuevo → crear/mover lead | ✅ CRÍTICO |
| AC-MVP-U2 | Mensajes de error son claros y accionables | Errores de validación describen problema + solución | ✅ IMPORTANTE |
| AC-MVP-U3 | Búsqueda filtra en tiempo real | Escribir "juan" → filtra instantáneamente | ✅ IMPORTANTE |
| **Performance** | | |
| AC-MVP-P1 | Pipeline carga en < 2 segundos (25 leads) | Load test: medir tiempo hasta render | ✅ IMPORTANTE |
| AC-MVP-P2 | Drag-drop es suave sin lag perceptible | Animar drop → medir frame rate | ✅ IMPORTANTE |
| **Data Integrity** | | |
| AC-MVP-D1 | Todos los campos se guardan con valores correctos | Crear lead → SQL query → verificar exactitud | ✅ CRÍTICO |
| AC-MVP-D2 | Campos requeridos NUNCA son NULL en BD | Test: intentar guardar sin campo requerido → rechaza | ✅ CRÍTICO |

### Criterios Específicos por Caso de Uso

**CU-01 — Crear Lead:**
- ✅ Formulario completo con validación en tiempo real
- ✅ Mensaje error específico para cada validación fallida
- ✅ Email verificado como único antes de guardar
- ✅ Lead nuevo aparece en columna "Nuevo" sin refresh
- ✅ Lead asignado automáticamente al usuario que lo crea

**CU-02 — Cambiar Estado:**
- ✅ Drag-drop funciona entre todas las columnas permitidas
- ✅ Transiciones inválidas son rechazadas silenciosamente (no mueve)
- ✅ Tooltip muestra estados permitidos si arrastras a inválido
- ✅ Estado cambia en BD y se refleja en UI < 500ms

**CU-03 — Editar Lead:**
- ✅ Todos los campos editables son accesibles
- ✅ Campo estado NO es editable desde aquí
- ✅ Cambios se guardan atómicamente
- ✅ Auditoría registra cada cambio

**CU-04 — Visualizar Pipeline:**
- ✅ 4 columnas visibles sin scroll horizontal
- ✅ Leads agrupados correctamente por estado
- ✅ Tarjeta de lead muestra: nombre, empresa, email, estado
- ✅ Búsqueda filtra en tiempo real
- ✅ Count de leads por estado es preciso

---

## Casos de Prueba Básicos

### 8.1 Suite de Pruebas Manuales (Smoke Test)

#### Test Suite: Creación de Lead

```gherkin
FEATURE: Crear Lead
  SCENARIO: Crear lead válido
    GIVEN: Usuario autenticado en sistema
    WHEN: Abre formulario de creación
    AND: Ingresa nombre "Juan García"
    AND: Ingresa empresa "Tech Corp"
    AND: Ingresa email "juan@techcorp.com"
    AND: Hace clic "Guardar"
    THEN: Lead se crea exitosamente
    AND: Aparece en columna "Nuevo"
    AND: Mensaje: "Lead creado"

  SCENARIO: Rechazar email duplicado
    GIVEN: Lead con email "juan@techcorp.com" ya existe
    WHEN: Usuario intenta crear otro lead con mismo email
    THEN: Sistema rechaza
    AND: Mensaje: "Email ya registrado"

  SCENARIO: Rechazar nombre vacío
    GIVEN: Formulario abierto
    WHEN: Deja campo nombre vacío
    AND: Hace clic "Guardar"
    THEN: Error: "Nombre es requerido"
    AND: Campo resaltado en rojo
```

#### Test Suite: Cambiar Estado

```gherkin
FEATURE: Cambiar Estado del Lead

  SCENARIO: Mover lead de Nuevo a En contacto
    GIVEN: Lead en estado "Nuevo"
    WHEN: Arrastra tarjeta hacia columna "En contacto"
    AND: Suelta tarjeta
    THEN: Estado cambia a "En contacto"
    AND: Mensaje: "Lead movido a En contacto"

  SCENARIO: Rechazar movimiento de Nuevo a Propuesta
    GIVEN: Lead en estado "Nuevo"
    WHEN: Intenta arrastrar a "Propuesta enviada"
    THEN: Movimiento es rechazado silenciosamente
    AND: Tarjeta regresa a columna original
    AND: Tooltip: "Primero mueve a 'En contacto'"

  SCENARIO: Bloquear cambios desde Cerrado
    GIVEN: Lead en estado "Cerrado"
    WHEN: Intenta arrastrar a otro estado
    THEN: No permite movimiento
    AND: Tooltip: "Lead cerrado no se puede cambiar"
```

#### Test Suite: Edición de Lead

```gherkin
FEATURE: Editar Datos del Lead

  SCENARIO: Editar nombre
    GIVEN: Panel de edición abierto
    WHEN: Cambia nombre a "Juan Carlos García"
    AND: Hace clic "Guardar"
    THEN: Nombre se actualiza en BD
    AND: Tarjeta muestra nuevo nombre

  SCENARIO: Rechazar cambio a email duplicado
    GIVEN: Email "new@corp.com" ya existe
    WHEN: Usuario edita lead intenta cambiar a "new@corp.com"
    THEN: Error: "Email ya en uso"

  SCENARIO: Campo estado NO editable
    GIVEN: Panel de edición abierto
    THEN: Campo estado está DISABLED (deshabilitado)
    AND: Nota: "Cambiar estado con drag-drop"
```

#### Test Suite: Visualización del Pipeline

```gherkin
FEATURE: Visualizar Pipeline

  SCENARIO: Pipeline muestra 4 columnas
    GIVEN: Usuario accede a la app
    THEN: Ve 4 columnas: Nuevo, En contacto, Propuesta, Cerrado
    AND: Cada columna tiene encabezado con count
    AND: Ej: "Nuevo (5)"

  SCENARIO: Búsqueda filtra en tiempo real
    GIVEN: Pipeline visible con 20 leads
    WHEN: Escribe "Google" en búsqueda
    THEN: Leads se filtran instantáneamente
    AND: Solo muestra leads con "Google" en nombre/empresa
    AND: Count actualiza

  SCENARIO: Limpiar búsqueda restaura todos los leads
    GIVEN: Búsqueda activa mostrando 3 leads
    WHEN: Hace clic "X" para limpiar búsqueda
    THEN: Todos los 20 leads vuelven a aparecer
```

### 8.2 Suite de Pruebas Automatizadas (E2E con Playwright/Cypress)

```typescript
// create-lead.spec.ts
describe("Create Lead", () => {
  
  it("should create a valid lead and appear in Nuevo column", async () => {
    await page.goto("/pipeline");
    await page.click('button:has-text("Crear Lead")');
    
    await page.fill('input[name="nombre"]', "Juan García");
    await page.fill('input[name="empresa"]', "Tech Corp");
    await page.fill('input[name="email"]', "juan@techcorp.com");
    
    await page.click('button:has-text("Guardar")');
    
    // Verify toast notification
    await expect(page.locator("text=Lead creado")).toBeVisible();
    
    // Verify lead appears in Nuevo column
    const nuevoColumn = page.locator("[data-state='Nuevo']");
    await expect(nuevoColumn).toContainText("Juan García");
    
    // Verify in database
    const leadFromDb = await db.query(
      `SELECT * FROM leads WHERE email = $1`,
      ["juan@techcorp.com"]
    );
    expect(leadFromDb.rows[0].estado).toBe("Nuevo");
  });

  it("should reject duplicate email", async () => {
    await page.goto("/pipeline");
    
    // First creation succeeds
    await createLead("Juan", "Corp", "test@test.com");
    
    // Second creation with same email
    await page.click('button:has-text("Crear Lead")');
    await page.fill('input[name="nombre"]', "Pedro");
    await page.fill('input[name="empresa"]', "Corp2");
    await page.fill('input[name="email"]', "test@test.com");
    await page.click('button:has-text("Guardar")');
    
    // Verify error
    await expect(page.locator("text=Email ya registrado")).toBeVisible();
  });
});

// update-state.spec.ts
describe("Update Lead State", () => {
  
  it("should move lead between columns via drag-drop", async () => {
    await page.goto("/pipeline");
    
    // Find card in Nuevo column
    const card = page.locator("[data-state='Nuevo']").first();
    
    // Drag to "En contacto" column
    const targetColumn = page.locator("[data-state='En contacto']");
    await card.dragTo(targetColumn);
    
    // Verify moved
    await expect(targetColumn).toContainText(card.textContent());
    
    // Verify in database
    const leadId = await card.getAttribute("data-lead-id");
    const result = await db.query(
      `SELECT estado FROM leads WHERE id_lead = $1`,
      [leadId]
    );
    expect(result.rows[0].estado).toBe("En contacto");
  });

  it("should reject invalid transitions", async () => {
    await page.goto("/pipeline");
    
    // Try to move Nuevo → Propuesta (skip En contacto)
    const card = page.locator("[data-state='Nuevo']").first();
    const invalidTarget = page.locator("[data-state='Propuesta enviada']");
    
    await card.dragTo(invalidTarget);
    
    // Should stay in original column
    const nuevoColumn = page.locator("[data-state='Nuevo']");
    await expect(nuevoColumn).toContainText(await card.textContent());
  });
});

// visualization.spec.ts
describe("Pipeline Visualization", () => {
  
  it("should display 4 columns with correct leads", async () => {
    // Create test data
    await seedDatabase({
      leads: [
        { estado: "Nuevo", nombre: "Lead1" },
        { estado: "En contacto", nombre: "Lead2" },
        { estado: "Propuesta", nombre: "Lead3" },
        { estado: "Cerrado", nombre: "Lead4" }
      ]
    });
    
    await page.goto("/pipeline");
    
    // Verify 4 columns
    const columns = page.locator("[role='columnheader']");
    await expect(columns).toHaveCount(4);
    
    // Verify leads in correct columns
    await expect(page.locator("[data-state='Nuevo']")).toContainText("Lead1");
    await expect(page.locator("[data-state='En contacto']")).toContainText("Lead2");
    await expect(page.locator("[data-state='Propuesta']")).toContainText("Lead3");
    await expect(page.locator("[data-state='Cerrado']")).toContainText("Lead4");
  });

  it("should filter leads in real-time", async () => {
    await page.goto("/pipeline");
    
    // Search for "Google"
    await page.fill('input[name="search"]', "Google");
    
    // Verify only leads with "Google" appear
    const visibleLeads = page.locator("[role='card']");
    const googleLeads = await visibleLeads.allTextContents();
    
    for (const lead of googleLeads) {
      expect(lead).toContain("Google");
    }
  });
});
```

### 8.3 Pruebas de Carga (Load Testing)

```yaml
# load-test-config.yaml
test_name: "Mini CRM MVP Load Test"
duration: 5 minutes
virtual_users: 50 # Simulando 50 usuarios concurrentes

scenarios:
  - name: "Create Leads"
    weight: 30%
    steps:
      - POST /api/leads
        payload: |
          {
            "nombre": "Random Name",
            "empresa": "Random Corp",
            "email": "random-{timestamp}@test.com"
          }
        expect_status: 201

  - name: "Move Leads"
    weight: 40%
    steps:
      - PATCH /api/leads/{lead_id}/estado
        payload:
          new_estado: "En contacto"
        expect_status: 200

  - name: "View Pipeline"
    weight: 30%
    steps:
      - GET /api/leads?limit=50
        expect_status: 200
        expect_response_time: < 2000ms

thresholds:
  error_rate: < 1%
  p95_response_time: < 5000ms
  p99_response_time: < 10000ms
```

---

## Resumen de Reglas Globales

### Tabla de Referencia Rápida

| Aspecto | Regla |
|--------|-------|
| **Estados** | Nuevo → En contacto → Propuesta → Cerrado |
| **Transiciones Válidas** | Progresión lineal + retroceso permitido (excepto Cerrado) |
| **Email** | Único, requerido, validado |
| **Lead Cerrado** | Inmutable excepto notas |
| **Asignación** | Auto-asigna a usuario que crea |
| **Auditoría** | Todo cambio se registra |
| **Validación** | Cliente para UX, servidor para seguridad |
| **Timestamps** | Siempre servidor, zona UTC |
| **Permisos** | Usuario ve solo sus leads (ejecutivo), admin ve todos |
| **Race Conditions** | Usar versionado optimista |

---

## Conclusión

Esta especificación es la **fuente única de verdad (SSOT)** para el Mini CRM. Contiene:

✅ **Precisión Quirúrgica:** Cada caso de uso, transición, validación está explícita  
✅ **Implementabilidad:** Desarrollador puede construir sin hacer preguntas  
✅ **Diseñabilidad:** Freya (UX) tiene todo lo que necesita para UI/UX  
✅ **Testabilidad:** Criterios de aceptación son verificables  
✅ **Mantenibilidad:** Reglas de negocio numeradas y claras  

**Próximos Pasos:**
1. ✅ Esta especificación está **LISTA** para que Freya cree UX Design Specs
2. ✅ Esta especificación está **LISTA** para implementación de desarrollo
3. ✅ Esta especificación está **LISTA** para QA escriba casos de prueba

**Preguntas Frecuentes del Desarrollador Resolvidas:**
- ¿Qué campos son requeridos? → Ver sección 2.1, Tabla de Campos
- ¿Cuáles son las transiciones válidas? → Ver sección 3.3
- ¿Cómo manejar email duplicado? → Ver sección 4.1 + Edge Cases 6.1
- ¿Qué pasa con race conditions? → Ver sección 6.2
- ¿Cuál es el formato de error? → Ver sección 5.2

---

**Documento Preparado por:** Saga, Analista Estratégico BMAD  
**Para Presentación:** Mini CRM - Demo BMAD (2026-06-07)  
**Status:** ✅ LISTO PARA PRODUCCIÓN
