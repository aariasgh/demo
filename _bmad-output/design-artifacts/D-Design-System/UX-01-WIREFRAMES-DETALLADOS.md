# 🎨 UX-01: Wireframes Detallados — Mini CRM Pipeline Kanban

**Documento:** Especificaciones de Wireframes  
**Versión:** 1.0  
**Fecha:** 2026-06-07  
**Audiencia:** Desarrolladores, QA, Product Team  
**Estado:** Listo para Implementación  

---

## 📑 Tabla de Contenidos

1. [Panorama General](#panorama-general)
2. [Pantalla 1: Dashboard Kanban Principal](#pantalla-1-dashboard-kanban-principal)
3. [Pantalla 2: Modal Crear Lead](#pantalla-2-modal-crear-lead)
4. [Pantalla 3: Modal Editar Lead](#pantalla-3-modal-editar-lead)
5. [Pantalla 4: Estados Loading y Error](#pantalla-4-estados-loading-y-error)
6. [Pantalla 5: Empty States](#pantalla-5-empty-states)
7. [Especificaciones de Espaciado y Dimensiones](#especificaciones-de-espaciado-y-dimensiones)
8. [Criterios de Aceptación](#criterios-de-aceptación)

---

## Panorama General

El Mini CRM de Seguimiento de Leads es una interfaz Kanban de **4 columnas** que representa los estados del pipeline comercial. Los leads fluyen horizontalmente entre estados según el progreso comercial.

### Arquitectura de Pantalla

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER (Navbar)                                                    │
│  ┌─────────┐  ┌────────────────────────┐  ┌──────────────────────┐ │
│  │ Titolo  │  │ Búsqueda / Filtro      │  │ Botón "+ Nuevo Lead" │ │
│  └─────────┘  └────────────────────────┘  └──────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  KANBAN BOARD (Scrollable Horizontally)                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ Nuevo        │ │ En contacto  │ │ Propuesta    │ │ Cerrado    │ │
│  │ (12 leads)   │ │ (8 leads)    │ │ (5 leads)    │ │ (3 leads)  │ │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤ ├────────────┤ │
│  │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │ │┌────────┐ │ │
│  │ │ Card 1   │ │ │ │ Card 2   │ │ │ │ Card 3   │ │ ││Card 4  │ │ │
│  │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │ │└────────┘ │ │
│  │ ┌──────────┐ │ │ ┌──────────┐ │ │              │ │            │ │
│  │ │ Card 5   │ │ │ │ Card 6   │ │ │              │ │            │ │
│  │ └──────────┘ │ │ └──────────┘ │ │              │ │            │ │
│  │ ┌──────────┐ │ │              │ │              │ │            │ │
│  │ │ Card 7   │ │ │              │ │              │ │            │ │
│  │ └──────────┘ │ │              │ │              │ │            │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 1: Dashboard Kanban Principal

### 1.1 Estructura General

**Resolución:** Responsive (Mobile 320px, Tablet 768px, Desktop 1200px+)  
**Layout:** Grid 4 columnas (equally distributed)  
**Scroll:** Horizontal en pantallas pequeñas, vertical para cards en cualquier pantalla  

### 1.2 Secciones

#### HEADER / NAVBAR

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏢 Mini CRM    │ 🔍 Buscar leads...     │      ┌──────────────────┐│
│                │                        │      │ + Nuevo Lead     ││
│                │                        │      └──────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- **Logo / Título**: "Mini CRM" (left-aligned)
- **Búsqueda**: Input con placeholder "Buscar leads por nombre, empresa..."
- **Botón Nuevo Lead**: CTA primaria (Botón azul, fondo sólido)

**Comportamiento:**
- Navbar sticky en desktop (fixed top)
- Navbar collapsible en mobile
- Búsqueda con debounce 300ms
- Focus outline visible para accesibilidad

#### COLUMNAS KANBAN

```
Cada columna tiene:
┌────────────────────────────────────────────┐
│  🔵 NUEVO              12 leads            │
├────────────────────────────────────────────┤
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ Lead Card #1                       │   │
│  │ Juan García García                 │   │
│  │ Empresa: TechCorp Inc              │   │
│  │ juan.garcia@techcorp.com           │   │
│  │ 📌 Mover a...                      │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ Lead Card #2                       │   │
│  │ María López                        │   │
│  │ Empresa: StartUp XYZ              │   │
│  │ maria@startupxyz.com               │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ Lead Card #3                       │   │
│  │ ...                                │   │
│  └────────────────────────────────────┘   │
│                                            │
└────────────────────────────────────────────┘
```

**Propiedades de Columna:**

| Propiedad | Valor |
|-----------|-------|
| Ancho | 100% / 4 en desktop; scroll horizontal en mobile |
| Altura | Min 600px, max viewport - header |
| Fondo | Gris claro (#F3F4F6) |
| Border | 1px solid #E5E7EB |
| Padding | 16px |
| Border-radius | 8px |
| Sombra | Subtle (2px 4px 12px rgba(0,0,0,0.08)) |

**Encabezado de Columna:**

```
┌────────────────────────────────────┐
│ 🔵 NUEVO          12 leads    ⋯    │
└────────────────────────────────────┘
```

- **Icono**: Círculo de color según estado
  - Nuevo: Azul #3B82F6
  - En contacto: Naranja #F59E0B
  - Propuesta: Púrpura #A855F7
  - Cerrado: Verde #10B981

- **Etiqueta**: Nombre del estado (bold, 14px)
- **Contador**: Badge con número de leads (gris, 12px)
- **Menú**: Icono ⋯ con opciones (hover visible)

#### LEAD CARD (Componente Principal)

```
┌──────────────────────────────────────────┐
│ 👤 Juan García García          [☰] [×]   │
│                                          │
│ TechCorp Inc                             │
│ juan.garcia@techcorp.com                 │
│                                          │
│ ┌─────────────┐ ┌──────────────────────┐│
│ │ Editar      │ │ Mover a otra columna ││
│ └─────────────┘ └──────────────────────┘│
└──────────────────────────────────────────┘
```

**Dimensiones:**
- Ancho: 100% (dentro de columna)
- Altura: Auto (min 120px)
- Padding: 12px
- Margin-bottom: 12px
- Border-radius: 6px
- Fondo: Blanco (#FFFFFF)
- Border: 1px solid #D1D5DB
- Sombra: 0px 2px 8px rgba(0,0,0,0.06)

**Contenido:**

| Elemento | Tipo | Ejemplo |
|----------|------|---------|
| Nombre | Texto (Bold, 14px) | Juan García García |
| Empresa | Texto (Regular, 12px, #6B7280) | TechCorp Inc |
| Email | Texto (Regular, 11px, #9CA3AF) | juan.garcia@techcorp.com |
| Icono Drag | Visual (↕️) | Visible en hover |
| Botones | Editar (secundario), Opciones (⋯) | Hover visible |

**Estados del Card:**

1. **Normal**
   - Fondo: Blanco
   - Border: Gris claro
   - Sombra: Sutil

2. **Hover**
   - Fondo: Blanco (sin cambio)
   - Border: Azul #3B82F6
   - Sombra: Más prominente (0px 4px 12px rgba(0,0,0,0.12))
   - Cursor: grab (para drag)

3. **Dragging**
   - Opacidad: 0.7
   - Sombra: Grande (0px 12px 24px rgba(0,0,0,0.15))
   - Z-index: 1000
   - Transform: rotate(2deg) (levemente rotado)

4. **Dropzone Active**
   - Border-bottom: 3px dashed #3B82F6
   - Fondo: #EFF6FF (azul muy claro)

5. **Loading**
   - Skeleton screen (ver sección 4)

**Interacción Drag & Drop:**

- **Inicio**: Click y hold ≥ 200ms
- **Durante**: Visual feedback (sombra, rotación)
- **Drop**: Transición suave (200ms) a nueva columna
- **Feedback**: Toast "Lead movido a [Estado]"
- **Rollback**: Si falla, regresa a posición original con error toast

---

## Pantalla 2: Modal Crear Lead

### 2.1 Estructura General

```
┌─────────────────────────────────────────────────────────┐
│  Nuevo Lead                                    [✕]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Nombre Completo *                                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Juan García García                               │   │
│  └──────────────────────────────────────────────────┘   │
│  Ej: Nombre Apellido                                    │
│                                                         │
│  Empresa *                                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ TechCorp Inc                                     │   │
│  └──────────────────────────────────────────────────┘   │
│  Ej: Nombre de la Empresa                               │
│                                                         │
│  Teléfono                                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ +34 91 123 4567                                  │   │
│  └──────────────────────────────────────────────────┘   │
│  Formato: +34 91 123 4567 o 912345678                   │
│                                                         │
│  Email *                                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ juan.garcia@techcorp.com                         │   │
│  └──────────────────────────────────────────────────┘   │
│  Ej: usuario@empresa.com                                │
│                                                         │
│  Notas                                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Interesado en plan empresarial. Presupuesto      │   │
│  │ aprobado para Q3.                                │   │
│  └──────────────────────────────────────────────────┘   │
│  Max 1000 caracteres (250 restantes)                    │
│                                                         │
│                ┌─────────────┐  ┌──────────┐           │
│                │ Crear Lead  │  │ Cancelar │           │
│                └─────────────┘  └──────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Especificaciones

**Modal:**
- Ancho: 90% (mobile), 500px (desktop)
- Padding: 24px
- Background: Blanco
- Border-radius: 12px
- Sombra: 0px 20px 60px rgba(0,0,0,0.15)
- Overlay: rgba(0,0,0,0.5)

**Campo Requerido (*):**

```
┌─────────────────────────────┐
│ Nombre Completo *           │
├─────────────────────────────┤
│ Label (12px, #374151)       │
│ Asterisco rojo (#EF4444)    │
│                             │
│ Input field (14px)          │
│ Height: 40px                │
│ Padding: 12px 16px          │
│ Border: 1px solid #D1D5DB   │
│ Focus: Border #3B82F6       │
│ Focus: Box-shadow azul      │
│                             │
│ Helper text (11px, #6B7280)│
└─────────────────────────────┘
```

**Campo Opcional:**

```
┌─────────────────────────────┐
│ Teléfono                    │
├─────────────────────────────┤
│ Sin asterisco               │
│ Same styling as required    │
│ Placeholder: "+34 91 123..." │
└─────────────────────────────┘
```

**Validaciones Inline:**

| Campo | Validación | Error | Timing |
|-------|-----------|-------|--------|
| Nombre | >= 2 caracteres | "Mínimo 2 caracteres" | On blur |
| Empresa | >= 2 caracteres | "Mínimo 2 caracteres" | On blur |
| Email | Formato válido + único | "Email inválido" o "Email ya existe" | On blur |
| Teléfono | Formato válido si existe | "Formato inválido" | On blur |
| Notas | Max 1000 caracteres | "Máximo 1000 caracteres" | On change (contador) |

**Estados de Validación Visual:**

1. **Input Válido**
   ```
   ┌──────────────────────────────┐
   │ Juan García García           │ ✅
   └──────────────────────────────┘
   ```

2. **Input Con Error**
   ```
   ┌──────────────────────────────┐
   │ Juan                         │ ❌
   └──────────────────────────────┘
   ⚠️ Mínimo 2 caracteres
   ```

3. **Campo Requerido Vacío (on blur)**
   ```
   ┌──────────────────────────────┐
   │                              │ ❌
   └──────────────────────────────┘
   ⚠️ Este campo es requerido
   ```

**Botones:**

```
┌──────────────┐  ┌──────────┐
│ Crear Lead   │  │ Cancelar │
└──────────────┘  └──────────┘
```

| Propiedad | Primario (Crear) | Secundario (Cancelar) |
|-----------|-----------------|----------------------|
| Fondo | Azul #3B82F6 | Gris #F3F4F6 |
| Texto | Blanco | Negro #1F2937 |
| Padding | 10px 24px | 10px 24px |
| Height | 40px | 40px |
| Border-radius | 6px | 6px |
| Font-weight | 600 | 500 |
| Cursor | pointer | pointer |
| Hover | Azul oscuro #2563EB | Gris oscuro #E5E7EB |
| Active | Azul más oscuro #1D4ED8 | Gris más oscuro #D1D5DB |
| Disabled | Gris #D1D5DB, opacity 0.6 | — |

**Comportamiento:**

- **Crear Lead**: Disabled hasta que nombre, empresa y email sean válidos
- **Cancelar**: Siempre habilitado
- **Cerrar (X)**: Cierra modal si no hay cambios; confirma si hay cambios sin guardar
- **Escape Key**: Cierra modal (mismo comportamiento que cerrar X)

---

## Pantalla 3: Modal Editar Lead

### 3.1 Estructura General

```
┌─────────────────────────────────────────────────────────┐
│  Editar Lead                                   [✕]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Nombre Completo *                                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Juan García García                               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Empresa *                                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ TechCorp Inc                                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Email *                                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ juan.garcia@techcorp.com                         │   │
│  └──────────────────────────────────────────────────┘   │
│  (Cambiar email requiere confirmación)                  │
│                                                         │
│  Teléfono                                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ +34 91 123 4567                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Notas                                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Interesado en plan empresarial.                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Estado Actual: [🔵 Nuevo]  (Read-only)                │
│  Mover a: [Selector dropdown]                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ En contacto ▼                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│            ┌──────────────┐  ┌──────────┐              │
│            │ Guardar      │  │ Cancelar │              │
│            └──────────────┘  └──────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Diferencias con Modal Crear

| Aspecto | Crear | Editar |
|--------|-------|--------|
| Título | "Nuevo Lead" | "Editar Lead" |
| Email | Editable normalmente | Editable pero requiere confirmación |
| Estado | No presente | Selector dropdown (opcional mover) |
| Botón Principal | "Crear Lead" | "Guardar" |
| Comportamiento | Crea nuevo registro | Actualiza registro existente |
| Validaciones | Standard | Standard + email único excepto el actual |

**Campo Email (Editar):**

```
┌────────────────────────────────────┐
│ Email *                            │
├────────────────────────────────────┤
│ juan.garcia@techcorp.com   [✏️]    │
└────────────────────────────────────┘
ℹ️ Cambiar email requiere verificación
```

- Icono editar (✏️) indica que puede cambiar
- Warning texto: "Cambiar email requiere verificación por enlace"
- Validación: Email nuevo debe ser único (excepto el actual)

**Selector Estado Actual:**

```
┌──────────────────────┐
│ 🔵 Nuevo (Read-only) │
└──────────────────────┘
```

- Badge con icono y color según estado actual
- Read-only (información)
- Muestra estado claramente

**Selector Mover a Estado (Opcional):**

```
┌──────────────────────────────────────────┐
│ Mover a (opcional):                      │
├──────────────────────────────────────────┤
│ ┌────────────────────────────────────┐   │
│ │ En contacto                    ▼   │   │
│ └────────────────────────────────────┘   │
│                                          │
│ Opciones:                                │
│ ◯ En contacto                            │
│ ◯ Propuesta enviada                      │
│ ◯ Cerrado                                │
└──────────────────────────────────────────┘
```

- Dropdown con opciones válidas (estados siguientes al actual)
- Opcional (no obliga a cambiar estado)
- Si selecciona estado, muestra confirmación

---

## Pantalla 4: Estados Loading y Error

### 4.1 Skeleton Screen (Loading State)

**Durante operaciones asincrónicas (crear, mover, editar):**

```
┌──────────────────────────────────────────┐
│ ┌─ 10px ─┐  ┌─ 20px ─┐                  │
│ │ [████]  │ Loading...                   │
│ └────────┘                               │
│                                          │
│ En columna Kanban:                       │
│ ┌──────────────────────────────────────┐ │
│ │ ┌──────────────────────────────────┐ │ │
│ │ │ ████████████████████████████████ │ │ │
│ │ │ ████████████████  (shimmer)   │ │ │
│ │ │ ████████████████████████████████ │ │ │
│ │ └──────────────────────────────────┘ │ │
│ └──────────────────────────────────────┘ │
```

**Especificaciones:**

- Duración: Indefinida hasta completar o error (máx 5 segundos, timeout)
- Animación: Shimmer left-to-right, repeat 1.5s
- Color base: #E5E7EB
- Color shimmer: #F3F4F6
- Opacity: 0.6 - 1.0 (pulse)

**Comportamiento:**

- Lead en skeleton mientras se mueve
- Card original desaparece y aparece skeleton en destino
- Si falla: regresa a original, muestra error toast

### 4.2 Toast Notifications

**Toast de Éxito:**

```
┌─────────────────────────────────────┐
│ ✅ Lead movido a En contacto        │ 🕐 3s
└─────────────────────────────────────┘
```

**Toast de Error:**

```
┌─────────────────────────────────────┐
│ ❌ Error: No se pudo guardar        │ 🕐 5s
│    Verifica tu conexión              │
└─────────────────────────────────────┘
```

**Toast de Información:**

```
┌─────────────────────────────────────┐
│ ℹ️ Lead creado exitosamente         │ 🕐 3s
└─────────────────────────────────────┘
```

**Especificaciones:**

| Propiedad | Éxito | Error | Info |
|-----------|-------|-------|------|
| Fondo | Verde #D1FAE5 | Rojo #FEE2E2 | Azul #DBEAFE |
| Texto | Verde #065F46 | Rojo #7F1D1D | Azul #1E40AF |
| Icono | ✅ | ❌ | ℹ️ |
| Duración | 3s | 5s | 4s |
| Position | Bottom-right | Bottom-right | Bottom-right |
| Margin | 16px from bottom/right | 16px from bottom/right | 16px from bottom/right |
| Z-index | 9999 | 9999 | 9999 |

**Comportamiento:**

- Stack múltiples toasts (máx 3, luego desaparecen los más antiguos)
- Click X cierra toast
- Auto-dismiss después de duración
- Accessible: ARIA roles, screen reader announce

### 4.3 Errores Específicos

**Email Duplicado (en Crear):**

```
┌──────────────────────────────────────┐
│ Email *                              │
├──────────────────────────────────────┤
│ juan.garcia@techcorp.com             │ ❌
└──────────────────────────────────────┘
⚠️ El email ya está registrado.
   [Ver lead existente] o [Usar otro email]
```

**Validación Fallida (Crear):**

```
❌ Por favor completa los campos requeridos:
   - Nombre (mínimo 2 caracteres)
   - Empresa (mínimo 2 caracteres)
   - Email (formato válido)
```

**Timeout / No Conectividad:**

```
┌──────────────────────────────────────┐
│ ❌ Error de Conexión                 │
│                                      │
│ No se puede conectar al servidor.    │
│ Verifica tu internet y reintenta.    │
│                                      │
│  [Reintentar] [Cancelar]             │
└──────────────────────────────────────┘
```

---

## Pantalla 5: Empty States

### 5.1 Sin Leads en Sistema

```
┌─────────────────────────────────────────────────────────┐
│  KANBAN (vacío)                                         │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ Nuevo        │ │ En contacto  │ │ Propuesta    │    │
│  │ (0 leads)    │ │ (0 leads)    │ │ (0 leads)    │    │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤    │
│  │              │ │              │ │              │    │
│  │   👋 ¡Hola!  │ │              │ │              │    │
│  │              │ │  Vacío       │ │  Vacío       │    │
│  │ No hay leads │ │              │ │              │    │
│  │ aún.         │ │              │ │              │    │
│  │              │ │              │ │              │    │
│  │ [+ Crear]    │ │              │ │              │    │
│  │              │ │              │ │              │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                         │
│  ┌──────────────┐                                       │
│  │ Cerrado      │                                       │
│  │ (0 leads)    │                                       │
│  ├──────────────┤                                       │
│  │              │                                       │
│  │   Vacío      │                                       │
│  │              │                                       │
│  └──────────────┘                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Especificaciones:**

- Icono: Emoji 👋 o SVG genérico
- Texto: "No hay leads aún"
- Botón CTA: "+ Crear Lead" (enlace a modal crear)
- Texto secundario: "Comienza creando un nuevo lead"
- Altura mínima columna: 300px

### 5.2 Sin Resultados de Búsqueda

```
┌─────────────────────────────────────┐
│ 🔍 Búsqueda: "xxxxxx"               │
│                                     │
│ 0 resultados encontrados            │
│                                     │
│ ¿Qué buscabas?                      │
│ ┌─────────────────────────────────┐ │
│ │ Nuevo (0)                       │ │
│ │ En contacto (0)                 │ │
│ │ Propuesta (0)                   │ │
│ │ Cerrado (0)                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Limpiar búsqueda] [Crear Lead]     │
└─────────────────────────────────────┘
```

---

## Especificaciones de Espaciado y Dimensiones

### Spacing Scale (8px Base Unit)

```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 48px
```

### Grid & Breakpoints

| Device | Breakpoint | Columnas Kanban | Ancho Card |
|--------|-----------|-----------------|-----------|
| Mobile | < 640px | 1 (horizontal scroll) | 100% |
| Tablet | 640px - 1024px | 2 | 48% |
| Desktop | ≥ 1024px | 4 | 24% |

### Component Sizes

**Header Height:**
- Desktop: 64px
- Mobile: 56px

**Card Height:**
- Min: 120px
- Max: Auto

**Modal:**
- Mobile: 90vw, max-height 90vh
- Desktop: 500px, max-height 80vh

---

## Criterios de Aceptación

| # | Criterio | Verificable | Prioritario |
|---|----------|------------|-------------|
| AC-W1 | Kanban muestra 4 columnas con leads | Visual | ✅ CRÍTICO |
| AC-W2 | Lead Card muestra nombre, empresa, email | Visual | ✅ CRÍTICO |
| AC-W3 | Botón "+ Nuevo Lead" abre modal crear | Funcional | ✅ CRÍTICO |
| AC-W4 | Cards son draggables entre columnas | Interacción | ✅ CRÍTICO |
| AC-W5 | Búsqueda filtra leads en tiempo real | Funcional | ✅ CRÍTICO |
| AC-W6 | Modal crear tiene validaciones inline | Funcional | ✅ CRÍTICO |
| AC-W7 | Toast notifications muestran mensajes | Visual | ✅ IMPORTANTE |
| AC-W8 | Empty state se muestra cuando no hay leads | Visual | ✅ IMPORTANTE |
| AC-W9 | Skeleton screens aparecen durante loading | Visual | ✅ IMPORTANTE |
| AC-W10 | Responsive layout en mobile/tablet/desktop | Visual | ✅ IMPORTANTE |

