# ⚡ UX-04: Especificaciones de Interacción — Mini CRM

**Documento:** Interaction Patterns & Animations  
**Versión:** 1.0  
**Fecha:** 2026-06-07  
**Audiencia:** Desarrolladores, QA, Product Team  
**Estado:** Listo para Implementación  

---

## 📑 Tabla de Contenidos

1. [Drag & Drop Avanzado](#drag--drop-avanzado)
2. [Validación en Tiempo Real](#validación-en-tiempo-real)
3. [Búsqueda con Debounce](#búsqueda-con-debounce)
4. [Confirmaciones Destructivas](#confirmaciones-destructivas)
5. [Transiciones de Estado](#transiciones-de-estado)
6. [Animaciones](#animaciones)
7. [Keyboard Navigation](#keyboard-navigation)
8. [Accesibilidad](#accesibilidad)
9. [Matriz de Timing](#matriz-de-timing)

---

## Drag & Drop Avanzado

### 1.1 Ciclo Completo de Drag & Drop

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: PREPARACIÓN (On Hover)                              │
│                                                             │
│ Usuario mueve mouse sobre Lead Card                         │
│ ↓                                                           │
│ Cursor cambia a "grab"                                      │
│ ↓                                                           │
│ Card muestra borderShadow más pronunciada                  │
│ ↓                                                           │
│ Botones de acción aparecen (Editar, Opciones)             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FASE 2: INICIACIÓN (Hold ≥ 200ms)                          │
│                                                             │
│ Usuario hace click + hold en Lead Card                      │
│ ↓                                                           │
│ Hold 200ms sin mover                                       │
│ ↓                                                           │
│ Card entra dragging state:                                │
│   - Opacidad: 0.7                                          │
│   - Transform: rotate(2deg) scale(1.02)                   │
│   - Sombra: Grande (0px 12px 24px)                        │
│   - Z-index: 1000 (sobre otros elementos)                │
│ ↓                                                           │
│ Cursor cambia a "grabbing"                                │
│ ↓                                                           │
│ Sistema prepara optimistic update                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FASE 3: MOVIMIENTO (Dragging)                              │
│                                                             │
│ Usuario mueve mouse mientras mantiene hold                 │
│ ↓                                                           │
│ Card sigue cursor del mouse                               │
│ ↓                                                           │
│ Sistema detecta dropzone bajo cursor                       │
│ ↓                                                           │
│ Dropzone activa: Border dashed + fondo azul claro          │
│ ↓                                                           │
│ Dropzone inactiva: Revertir a estado normal                │
│ ↓                                                           │
│ Toast provisional: "Mover a [Estado]?"                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FASE 4: LIBERACIÓN (Drop)                                   │
│                                                             │
│ Usuario suelta el mouse (mouseup)                           │
│ ↓                                                           │
│ Sistema valida drop:                                        │
│   - ¿Es la misma columna? → Cancelar                      │
│   - ¿Es estado válido? → Proceder                          │
│   - ¿Dentro de dropzone? → Proceder                        │
│ ↓                                                           │
│ Si inválido:                                               │
│   - Card regresa a posición original (200ms)              │
│   - Toast: "No se puede mover a ese estado"               │
│ ↓                                                           │
│ Si válido:                                                 │
│   - Card entra loading state (skeleton)                   │
│   - Toast provisional cierra                              │
│   - Optimistic update: Mueve card en UI                   │
│   - Envía request a servidor                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FASE 5: CONFIRMACIÓN (Server Response)                     │
│                                                             │
│ Esperar respuesta del servidor (timeout: 5s)               │
│ ↓                                                           │
│ Si éxito:                                                  │
│   - Card actualiza datos en nueva columna                 │
│   - Loading state → Card normal (200ms fade-in)           │
│   - Toast verde: "Lead movido a [Estado]" (3s)            │
│   - Estado del lead persiste en BD                        │
│ ↓                                                           │
│ Si error/timeout:                                          │
│   - Card regresa a columna original (200ms)              │
│   - Loading state se remueve                              │
│   - Toast rojo: "Error al mover. Intenta de nuevo" (5s)   │
│   - Datos originales se restauran en UI                   │
│ ↓                                                           │
│ FINAL: Card en estado normal (grab ready)                 │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Dropzone Detection Algorithm

```javascript
/**
 * Detectar si el punto (x, y) está dentro de una dropzone válida
 * Retorna: { isValid: boolean, dropzoneId: string | null, columnState: LeadState | null }
 */
function detectDropzone(x, y) {
  const dropzones = document.querySelectorAll('[data-dropzone]');
  
  for (let dropzone of dropzones) {
    const rect = dropzone.getBoundingClientRect();
    
    // Verificar si está dentro del área
    if (x >= rect.left && x <= rect.right &&
        y >= rect.top && y <= rect.bottom) {
      
      const columnState = dropzone.dataset.state;
      const currentState = draggedElement.dataset.state;
      
      // Validar transición de estado
      const isValidTransition = isValidStateTransition(currentState, columnState);
      
      return {
        isValid: isValidTransition,
        dropzoneId: dropzone.id,
        columnState: columnState
      };
    }
  }
  
  return { isValid: false, dropzoneId: null, columnState: null };
}

/**
 * Validar si la transición de estado es permitida
 */
function isValidStateTransition(from, to) {
  if (from === to) return false; // Misma columna
  
  const validTransitions = {
    'Nuevo': ['En contacto', 'Propuesta enviada'],
    'En contacto': ['Propuesta enviada', 'Cerrado'],
    'Propuesta enviada': ['En contacto', 'Cerrado'],
    'Cerrado': [] // Terminal state
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}
```

### 1.3 Optimistic Update

**Estrategia:**

```
1. Usuario suelta card en dropzone válida
2. INMEDIATAMENTE (sin esperar servidor):
   - Move card a nueva columna en UI
   - Actualiza contador de columnas
   - Muestra skeleton loading
3. En paralelo:
   - Envía request PATCH /leads/{id} { estado: nuevoEstado }
4. Servidor responde:
   - Si éxito: Confirma cambio (UI ya está actualizada)
   - Si error: ROLLBACK (regresa a original, muestra error)
```

**Código:**

```javascript
async function handleDrop(leadId, targetState) {
  const lead = getLeadById(leadId);
  const currentState = lead.estado;
  
  // Validación previa
  if (!isValidStateTransition(currentState, targetState)) {
    showErrorToast('No se puede mover a ese estado');
    return;
  }
  
  // 1. Optimistic Update (inmediato)
  moveCardInUI(leadId, currentState, targetState);
  showSkeletonLoading(leadId);
  
  try {
    // 2. Enviar a servidor
    const response = await api.patch(`/leads/${leadId}`, {
      estado: targetState
    }, { timeout: 5000 });
    
    // 3. Éxito: Confirmar y mostrar feedback
    updateCardUI(leadId, response.data);
    removeSkeletonLoading(leadId);
    showSuccessToast(`Lead movido a ${targetState}`);
    
  } catch (error) {
    // 4. Error: Rollback inmediato
    moveCardInUI(leadId, targetState, currentState); // Regresa
    removeSkeletonLoading(leadId);
    showErrorToast('Error al mover. Intenta de nuevo');
  }
}
```

---

## Validación en Tiempo Real

### 2.1 Estrategia de Validación

| Campo | Trigger | Validación | Feedback | Velocidad |
|-------|---------|-----------|----------|-----------|
| Nombre | On blur | >= 2 caracteres | Inline error | Inmediato |
| Empresa | On blur | >= 2 caracteres | Inline error | Inmediato |
| Email | On blur | Formato + Único | Inline error | 500ms (API async) |
| Teléfono | On blur | Formato si existe | Inline warning | Inmediato |
| Notas | On change | Max 1000 caracteres | Contador vivo | Inmediato |
| Estado | On change | En transiciones válidas | Disable si inválido | Inmediato |

### 2.2 Email Validation (Async)

```javascript
/**
 * Validar email: formato + unicidad en base de datos
 * Debounce: 500ms para no sobrecargar servidor
 */
const validateEmail = debounce(async (email, excludeId = null) => {
  // 1. Validar formato regex (rápido)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Email inválido'
    };
  }
  
  try {
    // 2. Validar unicidad en servidor (lento)
    const response = await api.get('/leads/check-email', {
      params: { email, excludeId }
    });
    
    if (response.data.exists) {
      return {
        isValid: false,
        error: 'El email ya está registrado'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    // Si falla validación en servidor, permitir (mejor UX)
    return { isValid: true };
  }
}, 500);
```

### 2.3 Visual Feedback

```
ANTES: (vacío)
┌────────────────────────────┐
│ Email                      │
├────────────────────────────┤
│                            │ ← Sin validación
└────────────────────────────┘

DURANTE: (tipiendo)
┌────────────────────────────┐
│ Email                      │
├────────────────────────────┤
│ usuario@empresa.com        │ ⏳ (validando...)
└────────────────────────────┘

DESPUÉS - VÁLIDO:
┌────────────────────────────┐
│ Email                      │
├────────────────────────────┤
│ usuario@empresa.com        │ ✅
└────────────────────────────┘

DESPUÉS - INVÁLIDO:
┌────────────────────────────┐
│ Email                      │
├────────────────────────────┤
│ usuario@empresa.com        │ ❌
└────────────────────────────┘
⚠️ El email ya está registrado
```

---

## Búsqueda con Debounce

### 3.1 Implementación

```javascript
/**
 * Búsqueda con debounce 300ms
 * Evita hacer queries al servidor por cada keystroke
 */
const handleSearch = debounce(async (query) => {
  if (!query.trim()) {
    // Búsqueda vacía: mostrar todos
    setFilteredLeads(allLeads);
    return;
  }
  
  // Búsqueda en cliente (rápido)
  const localResults = allLeads.filter(lead =>
    lead.name.toLowerCase().includes(query.toLowerCase()) ||
    lead.company.toLowerCase().includes(query.toLowerCase()) ||
    lead.email.toLowerCase().includes(query.toLowerCase()) ||
    lead.notes?.toLowerCase().includes(query.toLowerCase())
  );
  
  setFilteredLeads(localResults);
  
  // Opcional: buscar en servidor si resulta en muchos
  if (localResults.length > 50) {
    try {
      const serverResults = await api.get('/leads/search', {
        params: { q: query }
      });
      setFilteredLeads(serverResults.data);
    } catch (error) {
      // Mantener resultados locales si falla servidor
    }
  }
}, 300);
```

### 3.2 Visual Feedback

```
ESTADO 1: Sin búsqueda
┌──────────────────────────────┐
│ 🔍 Buscar leads...           │ ← Placeholder
└──────────────────────────────┘
Mostrando: 28 leads en total

ESTADO 2: Tipiendo
┌──────────────────────────────┐
│ 🔍 Juan               [×]    │ ← Botón limpiar
└──────────────────────────────┘
⏳ Buscando...

ESTADO 3: Con resultados
┌──────────────────────────────┐
│ 🔍 Juan               [×]    │
└──────────────────────────────┘
Mostrando: 3 resultados (Nuevo: 1, En contacto: 2)

ESTADO 4: Sin resultados
┌──────────────────────────────┐
│ 🔍 xyz123            [×]    │
└──────────────────────────────┘
👋 0 resultados encontrados
Intenta con otro término o [Crear Lead]
```

### 3.3 Performance Optimizations

| Optimización | Implementación | Beneficio |
|--------------|-----------------|-----------|
| Debounce | 300ms | Reduce API calls |
| Búsqueda local primero | Filter array en cliente | Respuesta inmediata |
| Memoización resultados | useMemo() | Evita re-renders innecesarios |
| Virtual scrolling | Windowing library | Soporta miles de leads |
| Índices en BD | PostgreSQL GiST/GIN | Búsqueda rápida en servidor |

---

## Confirmaciones Destructivas

### 4.1 Acciones que Requieren Confirmación

| Acción | Riesgo | Modal Confirmación |
|--------|--------|-------------------|
| Editar Email | Cambiar identidad | Sí, con verificación |
| Cambiar a Cerrado | Terminal state | Sí, con resumen |
| Eliminar Lead | Irrecuperable | Sí, con confirmación 2-paso |
| Cambiar Estado (backward) | Pérdida de datos | No (forward only) |

### 4.2 Modal Confirmación - Cambio de Email

```
┌─────────────────────────────────────────┐
│ ⚠️ Cambiar Email                    [X] │
├─────────────────────────────────────────┤
│                                         │
│ Estás a punto de cambiar el email de:   │
│ Juan García García                      │
│                                         │
│ De: juan.garcia@techcorp.com ✓         │
│ A:  juan.g@techcorp.com                │
│                                         │
│ Esto requerirá verificación por email.  │
│ Se enviará enlace de confirmación.      │
│                                         │
│ ┌──────────────────┐  ┌──────────────┐ │
│ │ Cambiar Email    │  │ Cancelar     │ │
│ └──────────────────┘  └──────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Lógica:**

1. Usuario click "Guardar" con email diferente
2. Sistema muestra modal confirmación
3. Usuario confirma → Envía cambio
4. Sistema muestra "Verificación pendiente"
5. Email de verificación se envía
6. Usuario verifica en email → Cambio confirmado

### 4.3 Modal Confirmación - Cambio a Cerrado (Terminal)

```
┌─────────────────────────────────────────┐
│ 🎯 Cerrar Oportunidad                [X]│
├─────────────────────────────────────────┤
│                                         │
│ Marcar como CERRADO es irreversible     │
│                                         │
│ Lead actual: Juan García (Propuesta)    │
│ Nuevo estado: 🟢 Cerrado                │
│                                         │
│ ✓ Esta acción no se puede deshacer      │
│ ✓ Se registrará en auditoría            │
│                                         │
│ ¿Estás seguro?                          │
│                                         │
│ ┌──────────────────┐  ┌──────────────┐ │
│ │ Sí, Cerrar       │  │ Cancelar     │ │
│ └──────────────────┘  └──────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Validación:**

```javascript
function handleCloseOpportunity(leadId) {
  // Mostrar confirmación modal
  showConfirmationModal({
    title: '🎯 Cerrar Oportunidad',
    message: 'Marcar como CERRADO es irreversible',
    dangerZone: true,
    confirmLabel: 'Sí, Cerrar',
    onConfirm: async () => {
      // Enviar cambio
      const response = await api.patch(`/leads/${leadId}`, {
        estado: 'Cerrado'
      });
      
      showSuccessToast('Oportunidad cerrada');
      moveCardInUI(leadId, 'Propuesta enviada', 'Cerrado');
    }
  });
}
```

---

## Transiciones de Estado

### 5.1 Animaciones de Transición

**State Change Animation (200ms):**

```
Card original
    ↓ (fade-out 100ms)
Card desaparece (opacidad 0)
    ↓ (move 100ms)
Nuevo estado aparece
    ↓ (fade-in 100ms)
Card en nuevo estado (opacidad 1)
```

**Código CSS:**

```css
@keyframes stateChange {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  50% {
    opacity: 0;
    transform: translateX(-8px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.card {
  animation: stateChange 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 5.2 Ciclo Completo

```
ANTES:
┌──────────────────────────────────────┐
│ Columna: Nuevo (12 leads)            │
├──────────────────────────────────────┤
│ ┌────────────────────────────────┐   │
│ │ Juan García García             │   │
│ │ TechCorp Inc                   │   │
│ │ juan.garcia@techcorp.com       │ ← Draggable
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘

DURANTE DRAG:
┌──────────────────────────────────────┐
│ Columna: Nuevo (11 leads)            │ ← Contador actualiza
├──────────────────────────────────────┤
│ ┌────────────────────────────────┐   │
│ │ ████████ Loading...           │   │ ← Skeleton
│ │ ████████                       │   │
│ └────────────────────────────────┘   │
│                                      │
│  [Card flotando sobre cursor]        │ ← Z-index 1000
└──────────────────────────────────────┘

DESPUÉS DROP (Éxito):
┌──────────────────────────────────────┐
│ Columna: En contacto (9 leads)       │
├──────────────────────────────────────┤
│ ┌────────────────────────────────┐   │
│ │ Juan García García             │   │ ← Fade-in 200ms
│ │ TechCorp Inc                   │   │
│ │ juan.garcia@techcorp.com       │   │
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘

🎉 Toast: "Lead movido a En contacto"
```

---

## Animaciones

### 6.1 Timing y Easing

| Animación | Duración | Easing | Uso |
|-----------|----------|--------|-----|
| Fade-in | 150ms | ease-out | Aparición suave |
| Fade-out | 100ms | ease-in | Desaparición suave |
| Slide-in | 200ms | cubic-bezier(0.4, 0, 0.2, 1) | Entrada cards |
| Bounce | 300ms | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Confirmación |
| Shimmer | 1500ms | linear | Skeleton loading |
| Rotate | 200ms | ease-out | Drag visual |

### 6.2 Animaciones Específicas

**Hover Card:**

```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: all 150ms ease-out;
}
```

**Skeleton Shimmer:**

```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #e5e7eb 0%,
    #f3f4f6 50%,
    #e5e7eb 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

**Toast Appearance:**

```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast {
  animation: slideInUp 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Keyboard Navigation

### 7.1 Teclas Soportadas

| Tecla | Contexto | Acción |
|-------|----------|--------|
| Tab | Formulario | Navega entre campos |
| Shift+Tab | Formulario | Navega hacia atrás |
| Enter | Modal | Submit formulario |
| Escape | Modal | Cierra modal |
| Escape | Drag | Cancela arrastre |
| Escape | Búsqueda | Limpia búsqueda |

### 7.2 Ejemplos

**Cerrar Modal con Escape:**

```javascript
useEffect(() => {
  const handleEscape = (event) => {
    if (event.key === 'Escape' && isModalOpen) {
      if (hasUnsavedChanges) {
        showConfirmationModal({
          message: '¿Abandonar sin guardar?',
          onConfirm: closeModal
        });
      } else {
        closeModal();
      }
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isModalOpen, hasUnsavedChanges]);
```

**Cancel Drag con Escape:**

```javascript
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isDragging) {
    cancelDrag();
    showInfoToast('Arrastre cancelado');
  }
});
```

---

## Accesibilidad

### 8.1 ARIA Roles y Labels

| Elemento | ARIA Role | ARIA Label |
|----------|-----------|-----------|
| Lead Card | `role="button"` | `aria-label="Lead: Juan García"` |
| Kanban Column | `role="region"` | `aria-label="Columna: Nuevo (12 leads)"` |
| Modal | `role="dialog"` | `aria-labelledby="modal-title"` |
| Toast | `role="alert"` | `aria-live="polite"` |
| Button | `button` | `aria-label="..."` |
| Input | `textbox` | `aria-label="..."` |

### 8.2 Screen Reader Announcements

```html
<!-- Lead Card -->
<div
  role="button"
  tabindex="0"
  aria-label="Lead: Juan García de TechCorp Inc, estado: Nuevo"
  aria-describedby="card-description"
>
  ...
</div>

<!-- Kanban Column -->
<section
  role="region"
  aria-label="Columna: Nuevo con 12 leads"
  aria-live="polite"
>
  ...
</section>

<!-- Toast -->
<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>
  ✅ Lead creado exitosamente
</div>
```

### 8.3 Focus Management

```javascript
// Después de crear lead, focus en nueva card
useEffect(() => {
  if (leadCreated) {
    const newCard = document.querySelector(`[data-lead-id="${leadCreated.id}"]`);
    newCard?.focus();
    announceToScreenReader(`Lead ${leadCreated.name} creado`);
  }
}, [leadCreated]);
```

---

## Matriz de Timing

| Operación | Timing | Fase |
|-----------|--------|------|
| Hold para drag | 200ms | Detección |
| Drag delay | 0ms | Movimiento |
| Drop animation | 200ms | Validación |
| API timeout | 5000ms | Server |
| Toast auto-dismiss | 3000ms (éxito), 5000ms (error) | Feedback |
| Debounce búsqueda | 300ms | Input |
| Debounce validación email | 500ms | Async |
| Loading skeleton | Indefinida (hasta 5s) | Async |
| Fade-in/out | 150ms | Animation |
| Page transition | 300ms | Navigation |

---

## Casos Edge

### 9.1 Múltiples Usuarios

**Escenario:** Usuario A mueve lead, Usuario B intenta moverlo al mismo tiempo

**Solución:**

1. El que hace drop primero gana (optimistic lock)
2. El segundo recibe error: "Lead fue modificado por otro usuario"
3. Se recarga el lead desde servidor
4. Usuario puede reintentar

### 9.2 Conexión Inestable

**Escenario:** Usuario arrastra lead pero pierde conexión

**Solución:**

1. Drop → Optimistic update en UI
2. API request falla (timeout 5s)
3. Card regresa a original automáticamente
4. Toast: "Error de conexión. Verifica tu internet"
5. Usuario puede reintentar

### 9.3 Búsqueda Simultánea

**Escenario:** Usuario busca mientras se está creando lead

**Solución:**

1. Nueva búsqueda invalida anteriores
2. Resultados se actualizan con nuevo lead
3. Loading state se mantiene
4. Toast confirma creación

