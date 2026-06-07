# 🧩 UX-03: Especificaciones de Componentes — Mini CRM

**Documento:** Component Specifications & Props Matrix  
**Versión:** 1.0  
**Fecha:** 2026-06-07  
**Audiencia:** Desarrolladores, QA, Product Team  
**Estado:** Listo para Implementación  

---

## 📑 Tabla de Contenidos

1. [Lead Card (Componente Draggable)](#lead-card-componente-draggable)
2. [Kanban Column (Componente Droppable)](#kanban-column-componente-droppable)
3. [Lead Form Modal](#lead-form-modal)
4. [State Badge](#state-badge)
5. [Button Component](#button-component)
6. [Input Component](#input-component)
7. [Toast Notification](#toast-notification)
8. [Matriz de Estados de Componentes](#matriz-de-estados-de-componentes)
9. [Matriz de Validación](#matriz-de-validación)

---

## Lead Card (Componente Draggable)

### Descripción

Card que representa un lead individual. Es draggable para mover entre columnas. Muestra información condensada del lead.

### Props

```typescript
interface LeadCardProps {
  // Datos del lead
  leadId: string;                    // UUID del lead
  name: string;                      // Nombre completo
  company: string;                   // Empresa
  email: string;                     // Email
  
  // Estado de UI
  isLoading?: boolean;               // True durante operación
  isDragging?: boolean;              // True mientras se arrastra
  isDragOver?: boolean;              // True cuando está sobre dropzone
  
  // Callbacks
  onEdit: (leadId: string) => void;  // Click en editar
  onDelete?: (leadId: string) => void; // Click en opciones
  onDragStart: (leadId: string) => void;
  onDragEnd: () => void;
  
  // Estilos opcionales
  className?: string;
  variant?: 'default' | 'loading' | 'dragging';
}
```

### Estados

#### 1. Default (Normal)

```
┌────────────────────────────────────────┐
│ 👤 Juan García García       [✏️] [⋯]   │
│                                        │
│ TechCorp Inc                           │
│ juan.garcia@techcorp.com               │
└────────────────────────────────────────┘
```

**Propiedades:**
- Fondo: Blanco (#FFFFFF)
- Border: 1px solid #D1D5DB
- Sombra: 0px 2px 8px rgba(0,0,0,0.06)
- Padding: 12px
- Cursor: Default

#### 2. Hover State

```
┌────────────────────────────────────────┐
│ 👤 Juan García García       [✏️] [⋯]   │
│                                        │
│ TechCorp Inc                           │
│ juan.garcia@techcorp.com               │
│                                        │
│ [Editar] [Mover a...]                 │
└────────────────────────────────────────┘
```

**Propiedades:**
- Fondo: Blanco
- Border: 2px solid #3B82F6
- Sombra: 0px 4px 12px rgba(0,0,0,0.12)
- Transición: 150ms ease-out
- Cursor: grab

**Comportamiento:**
- Botones de acción visibles
- Sombra más pronunciada
- Border más oscuro

#### 3. Dragging State

```
┌────────────────────────────────────────┐
│ 👤 Juan García García       [✏️] [⋯]   │
│                                        │
│ TechCorp Inc                           │
│ juan.garcia@techcorp.com               │
│                                        │
│    (semi-transparente, elevado)        │
└────────────────────────────────────────┘
```

**Propiedades:**
- Opacidad: 0.7
- Transform: rotate(2deg) scale(1.02)
- Sombra: 0px 12px 24px rgba(0,0,0,0.15)
- Z-index: 1000
- Cursor: grabbing

**Comportamiento:**
- Sigue cursor del mouse
- Sombra grande
- Levemente rotado

#### 4. Loading State

```
┌────────────────────────────────────────┐
│ ████████████████████████████████████   │
│ ████████████████████  (shimmer)     │
│ ████████████████████████████████████   │
└────────────────────────────────────────┘
```

**Propiedades:**
- Skeleton screen con shimmer
- Altura: Auto (min 120px)
- Animación: Shimmer left-to-right 1.5s
- Opacidad: 0.6

### Métodos

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `click()` | — | void | Triggers hover state |
| `drag()` | leadId | void | Inicia drag |
| `drop()` | leadId | void | Completa drop |
| `showMenu()` | — | void | Abre menú opciones |

### Eventos

| Evento | Payload | Cuándo |
|--------|---------|--------|
| `edit` | leadId | Click en botón editar |
| `dragstart` | leadId | Inicia arrastre |
| `dragend` | — | Termina arrastre |
| `drop` | (leadId, newState) | Drop exitoso |
| `error` | (leadId, error) | Error durante operación |

---

## Kanban Column (Componente Droppable)

### Descripción

Columna del Kanban que agrupa leads por estado. Es droppable para recibir cards draggables.

### Props

```typescript
interface KanbanColumnProps {
  // Datos de columna
  state: LeadState;                    // 'Nuevo', 'En contacto', etc
  leads: Lead[];                       // Array de leads en esta columna
  leadCount: number;                   // Total de leads
  
  // Estados
  isDropActive?: boolean;              // True cuando hay drag over
  isLoading?: boolean;                 // True durante operaciones
  isDragSource?: boolean;              // True si drag comenzó aquí
  
  // Callbacks
  onDrop: (leadId: string, newState: LeadState) => void;
  onEditLead: (leadId: string) => void;
  onDeleteLead: (leadId: string) => void;
  
  // Estilos
  className?: string;
  color?: string;                      // Color del estado
  icon?: string;                       // Icono del estado
}
```

### Estados

#### 1. Default (Normal)

```
┌──────────────────────────────────────────┐
│ 🔵 NUEVO                  12 leads       │
├──────────────────────────────────────────┤
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Lead Card 1                        │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Lead Card 2                        │   │
│ └────────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

**Propiedades:**
- Fondo: Gris claro #F3F4F6
- Border: 1px solid #E5E7EB
- Border-radius: 8px
- Padding: 16px
- Sombra: Sutil 2px 4px 12px rgba(0,0,0,0.08)

#### 2. Drop Active (Drag Over)

```
┌──────────────────────────────────────────┐
│ 🔵 NUEVO                  12 leads       │
├──────────────────────────────────────────┤
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Lead Card 1                        │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│ │ Drop zone activa                  │   │
│ └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Lead Card 2                        │   │
│ └────────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

**Propiedades:**
- Border: 3px dashed #3B82F6
- Fondo: Azul muy claro #EFF6FF
- Border-bottom: Destaca zona de drop
- Transición: 100ms ease-out

**Comportamiento:**
- Se destaca cuando hay drag over
- Indica zona de drop válida

#### 3. Empty State

```
┌──────────────────────────────────────────┐
│ 🔵 NUEVO                   0 leads       │
├──────────────────────────────────────────┤
│                                          │
│              👋 Vacío                    │
│           No hay leads aún               │
│                                          │
│         [+ Crear Lead aquí]              │
│                                          │
└──────────────────────────────────────────┘
```

**Propiedades:**
- Altura mínima: 300px
- Texto: Gris #6B7280
- Botón CTA: Primario

#### 4. Loading State

```
┌──────────────────────────────────────────┐
│ 🔵 NUEVO                  12 leads ⏳    │
├──────────────────────────────────────────┤
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ ████████████ Loading...          │   │
│ └────────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

**Propiedades:**
- Icono loading en header
- Spinner o shimmer en card
- Opacidad reducida

### Métodos

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `accept()` | leadId | void | Acepta drop |
| `reject()` | leadId | void | Rechaza drop |
| `scroll()` | direction | void | Scroll vertical |
| `refresh()` | — | void | Actualiza leads |

---

## Lead Form Modal

### Descripción

Modal que contiene formulario para crear o editar leads. Reutilizable para ambos casos de uso.

### Props

```typescript
interface LeadFormModalProps {
  // Modo de operación
  mode: 'create' | 'edit';
  
  // Datos iniciales (solo para edit)
  initialData?: Lead;
  
  // Estados
  isOpen: boolean;
  isLoading?: boolean;
  
  // Callbacks
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel: () => void;
  onClose: () => void;
  
  // Estilos
  className?: string;
}

interface LeadFormData {
  name: string;
  company: string;
  email: string;
  phone?: string;
  notes?: string;
  newState?: LeadState;        // Solo en edit
}
```

### Campos del Formulario

| Campo | Tipo | Requerido | Validación | Placeholder |
|-------|------|-----------|-----------|-------------|
| Nombre | Text | ✅ | >= 2 caracteres | "Nombre Apellido" |
| Empresa | Text | ✅ | >= 2 caracteres | "Nombre Empresa" |
| Email | Email | ✅ | Formato + Único | "usuario@empresa.com" |
| Teléfono | Tel | ❌ | Formato si existe | "+34 91 123 4567" |
| Notas | Textarea | ❌ | Max 1000 char | "Notas del lead..." |
| Nuevo Estado | Select | ❌ (edit only) | Estados válidos | "Selecciona estado" |

### Estados del Modal

#### 1. Abierto - Crear

```
┌─────────────────────────────────────────────┐
│ Nuevo Lead                              [X] │
├─────────────────────────────────────────────┤
│ Nombre Completo *                          │
│ ┌───────────────────────────────────────┐   │
│ │                                       │   │
│ └───────────────────────────────────────┘   │
│                                            │
│ Empresa *                                  │
│ ┌───────────────────────────────────────┐   │
│ │                                       │   │
│ └───────────────────────────────────────┘   │
│                                            │
│ Email *                                    │
│ ┌───────────────────────────────────────┐   │
│ │                                       │   │
│ └───────────────────────────────────────┘   │
│                                            │
│ ┌──────────────┐  ┌──────────────────┐    │
│ │ Crear Lead   │  │ Cancelar        │    │
│ └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────┘
```

#### 2. Abierto - Editar

```
┌─────────────────────────────────────────────┐
│ Editar Lead                             [X] │
├─────────────────────────────────────────────┤
│ Nombre Completo *                          │
│ ┌───────────────────────────────────────┐   │
│ │ Juan García García                    │   │
│ └───────────────────────────────────────┘   │
│                                            │
│ Estado Actual: [🔵 Nuevo]  (Read-only)    │
│ Mover a:                                   │
│ ┌───────────────────────────────────────┐   │
│ │ En contacto                       ▼   │   │
│ └───────────────────────────────────────┘   │
│                                            │
│ ┌──────────────┐  ┌──────────────────┐    │
│ │ Guardar      │  │ Cancelar        │    │
│ └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────┘
```

#### 3. Loading / Enviando

```
┌─────────────────────────────────────────────┐
│ Nuevo Lead                              [X] │
├─────────────────────────────────────────────┤
│                                            │
│ ⏳ Guardando lead...                       │
│                                            │
│ [████████████████ 50%]                     │
│                                            │
└─────────────────────────────────────────────┘
```

---

## State Badge

### Descripción

Badge visual que muestra el estado actual de un lead con color e icono.

### Props

```typescript
interface StateBadgeProps {
  state: LeadState;              // Estado del lead
  count?: number;                // Número de leads (opcional)
  size?: 'sm' | 'md' | 'lg';    // Tamaño del badge
  variant?: 'fill' | 'outline'; // Estilo
}

type LeadState = 'Nuevo' | 'En contacto' | 'Propuesta enviada' | 'Cerrado';
```

### Estados y Estilos

| Estado | Color | Icono | Código Color |
|--------|-------|-------|--------------|
| Nuevo | Azul | 🔵 | #3B82F6 |
| En contacto | Naranja | 🟠 | #F59E0B |
| Propuesta | Púrpura | 🟣 | #A855F7 |
| Cerrado | Verde | 🟢 | #10B981 |

### Variantes

#### 1. Fill (Relleno sólido)

```
┌─────────────────┐
│ 🔵 Nuevo (12)   │
└─────────────────┘
```

**Propiedades:**
- Fondo: Color del estado
- Texto: Blanco
- Padding: 4px 12px (sm), 8px 16px (md), 12px 20px (lg)
- Border-radius: 12px

#### 2. Outline (Contorno)

```
┌─────────────────┐
│ 🔵 Nuevo (12)   │
└─────────────────┘
```

**Propiedades:**
- Fondo: Transparente
- Border: 1px solid [color estado]
- Texto: [color estado]
- Padding: 4px 12px (sm), 8px 16px (md), 12px 20px (lg)

---

## Button Component

### Descripción

Botón reutilizable con diferentes variantes y tamaños.

### Props

```typescript
interface ButtonProps {
  // Contenido
  label: string;
  icon?: string;                  // Icono opcional
  iconPosition?: 'left' | 'right';
  
  // Comportamiento
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  
  // Estilo
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  
  // Tipos
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

### Variantes

#### 1. Primary (CTA Principal)

```
┌──────────────────┐
│ + Nuevo Lead     │
└──────────────────┘
```

**Propiedades:**
- Fondo: Azul #3B82F6
- Texto: Blanco
- Hover: Azul oscuro #2563EB
- Active: Azul más oscuro #1D4ED8

#### 2. Secondary

```
┌──────────────────┐
│ Editar           │
└──────────────────┘
```

**Propiedades:**
- Fondo: Gris #F3F4F6
- Texto: Negro #1F2937
- Hover: Gris oscuro #E5E7EB
- Active: Gris más oscuro #D1D5DB

#### 3. Tertiary (Link)

```
Ver lead existente
```

**Propiedades:**
- Fondo: Transparente
- Texto: Azul #3B82F6
- Hover: Azul oscuro #2563EB
- Underline: On hover

#### 4. Danger (Destructivo)

```
┌──────────────────┐
│ Eliminar Lead    │
└──────────────────┘
```

**Propiedades:**
- Fondo: Rojo #EF4444
- Texto: Blanco
- Hover: Rojo oscuro #DC2626
- Active: Rojo más oscuro #B91C1C

### Tamaños

| Tamaño | Padding | Font-size | Height |
|--------|---------|-----------|--------|
| sm | 6px 12px | 12px | 32px |
| md | 10px 24px | 14px | 40px |
| lg | 12px 32px | 16px | 48px |

### Estados

| Estado | Cursor | Opacidad | Sombra |
|--------|--------|----------|--------|
| Default | pointer | 1.0 | Normal |
| Hover | pointer | 1.0 | Más pronunciada |
| Active | pointer | 0.95 | Reducida |
| Disabled | not-allowed | 0.6 | Ninguna |
| Loading | wait | 1.0 | Normal |

---

## Input Component

### Descripción

Campo input reutilizable con validaciones y estados.

### Props

```typescript
interface InputProps {
  // Datos
  value: string;
  placeholder?: string;
  
  // Validación
  type?: 'text' | 'email' | 'tel' | 'number';
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  
  // Estados
  isLoading?: boolean;
  isDisabled?: boolean;
  isError?: boolean;
  errorMessage?: string;
  helperText?: string;
  
  // Callbacks
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  
  // Label
  label?: string;
  showRequired?: boolean;
}
```

### Estados Visuales

#### 1. Default (Empty)

```
Nombre Completo *
┌─────────────────────────────────────┐
│ Ej: Nombre Apellido                 │
└─────────────────────────────────────┘
```

#### 2. Filled (Con Valor)

```
Nombre Completo *
┌─────────────────────────────────────┐
│ Juan García García                  │
└─────────────────────────────────────┘
```

#### 3. Focus

```
Nombre Completo *
┌─────────────────────────────────────┐ ← Border azul
│ Juan García García                  │
└─────────────────────────────────────┘
```

**Propiedades:**
- Border: 2px solid #3B82F6
- Box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)

#### 4. Error

```
Nombre Completo *
┌─────────────────────────────────────┐ ← Border rojo
│ Juan                                │
└─────────────────────────────────────┘
⚠️ Mínimo 2 caracteres
```

**Propiedades:**
- Border: 2px solid #DC2626
- Texto error: Rojo #7F1D1D

#### 5. Success

```
Nombre Completo *
┌─────────────────────────────────────┐ ← Border verde
│ Juan García García                  │ ✅
└─────────────────────────────────────┘
```

#### 6. Disabled

```
Nombre Completo
┌─────────────────────────────────────┐
│ (valor deshabilitado)               │
└─────────────────────────────────────┘
```

**Propiedades:**
- Fondo: Gris #F3F4F6
- Opacidad: 0.6
- Cursor: not-allowed

---

## Toast Notification

### Descripción

Notificación temporal que aparece en la esquina inferior derecha.

### Props

```typescript
interface ToastProps {
  // Contenido
  message: string;
  description?: string;
  icon?: string;
  
  // Tipo
  type: 'success' | 'error' | 'info' | 'warning';
  
  // Comportamiento
  duration?: number;              // ms, 0 = indefinido
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
  
  // Posición
  position?: 'top-right' | 'bottom-right' | 'bottom-center';
}
```

### Tipos de Toast

#### 1. Success

```
┌──────────────────────────────────────┐
│ ✅ Lead creado exitosamente          │ 🕐 3s
└──────────────────────────────────────┘
```

- Fondo: Verde claro #D1FAE5
- Texto: Verde oscuro #065F46
- Duración: 3 segundos

#### 2. Error

```
┌──────────────────────────────────────┐
│ ❌ Error: No se pudo guardar         │ 🕐 5s
│ Verifica tu conexión                 │
└──────────────────────────────────────┘
```

- Fondo: Rojo claro #FEE2E2
- Texto: Rojo oscuro #7F1D1D
- Duración: 5 segundos

#### 3. Info

```
┌──────────────────────────────────────┐
│ ℹ️ Búsqueda completada: 5 resultados  │ 🕐 4s
└──────────────────────────────────────┘
```

- Fondo: Azul claro #DBEAFE
- Texto: Azul oscuro #1E40AF
- Duración: 4 segundos

#### 4. Warning

```
┌──────────────────────────────────────┐
│ ⚠️ Email ya registrado               │ 🕐 5s
│ [Ver lead] [Otro email]              │
└──────────────────────────────────────┘
```

- Fondo: Ámbar claro #FEF3C7
- Texto: Ámbar oscuro #78350F
- Duración: 5 segundos

---

## Matriz de Estados de Componentes

### Estados Soportados por Componente

| Componente | Default | Hover | Active | Loading | Error | Disabled | Readonly |
|------------|---------|-------|--------|---------|-------|----------|----------|
| Lead Card | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Column | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Modal | ✅ | N/A | ✅ | ✅ | ✅ | N/A | N/A |
| Badge | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Button | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Input | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Toast | ✅ | N/A | N/A | N/A | ✅ | N/A | N/A |

---

## Matriz de Validación

### Validaciones por Campo

| Campo | Tipo | Validación | Error Message | Timing |
|-------|------|-----------|---------------|--------|
| Nombre | Text | >= 2, <= 100 char | "Mínimo 2 caracteres" | On blur |
| Empresa | Text | >= 2, <= 100 char | "Mínimo 2 caracteres" | On blur |
| Email | Email | RFC 5322 + Único | "Email inválido" o "Ya existe" | On blur |
| Teléfono | Tel | +XX format | "Formato inválido" | On blur |
| Notas | Textarea | <= 1000 char | "Máximo 1000 caracteres" | On change |
| Estado | Select | En estados válidos | "Estado inválido" | On change |

---

## Notas de Implementación

1. **Props por defecto**: Siempre proporcionar defaults sensatos
2. **TypeScript**: Usar interfaces tipadas para todas las props
3. **Eventos**: Implementar debounce en búsqueda (300ms)
4. **Accesibilidad**: ARIA labels, roles, keyboard navigation
5. **Animaciones**: Usar CSS transitions, max 200ms
6. **Responsive**: Mobile first, breakpoints 640px y 1024px
7. **Testing**: 100% cobertura de estados principales
8. **Documentación**: Storybook para cada componente

