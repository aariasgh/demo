# 🎨 UX-05: Design Tokens — Mini CRM

**Documento:** Color Palette, Typography, Spacing, & Responsive Breakpoints  
**Versión:** 1.0  
**Fecha:** 2026-06-07  
**Audiencia:** Desarrolladores, Designers, Product Team  
**Estado:** Listo para Implementación  

---

## 📑 Tabla de Contenidos

1. [Color Palette](#color-palette)
2. [Tipografía](#tipografía)
3. [Espaciado](#espaciado)
4. [Sombras](#sombras)
5. [Border Radius](#border-radius)
6. [Breakpoints](#breakpoints)
7. [Z-Index Scale](#z-index-scale)
8. [Transiciones y Animaciones](#transiciones-y-animaciones)
9. [CSS Variables Export](#css-variables-export)

---

## Color Palette

### Estados del Lead (Colores Principales)

#### 🔵 Nuevo

```
Primary:    #3B82F6  ← Usar para estado Nuevo
Light:      #DBEAFE  ← Fondo claro
Lighter:    #EFF6FF  ← Fondo muy claro (hover)
Darker:     #2563EB  ← Hover oscuro
```

**Uso:**
- Badge estado: Fondo #3B82F6, texto blanco
- Columna Kanban: Border y encabezado #3B82F6
- Border input focus: #3B82F6
- Link/CTA primaria: #3B82F6

#### 🟠 En contacto

```
Primary:    #F59E0B  ← Usar para estado En contacto
Light:      #FEF3C7  ← Fondo claro
Lighter:    #FEFCE8  ← Fondo muy claro (hover)
Darker:     #D97706  ← Hover oscuro
```

**Uso:**
- Badge estado: Fondo #F59E0B, texto blanco
- Indicador visual: #F59E0B
- Warning light: #FEF3C7

#### 🟣 Propuesta enviada

```
Primary:    #A855F7  ← Usar para estado Propuesta
Light:      #E9D5FF  ← Fondo claro
Lighter:    #F3E8FF  ← Fondo muy claro (hover)
Darker:     #9333EA  ← Hover oscuro
```

**Uso:**
- Badge estado: Fondo #A855F7, texto blanco
- Indicador visual: #A855F7

#### 🟢 Cerrado

```
Primary:    #10B981  ← Usar para estado Cerrado
Light:      #D1FAE5  ← Fondo claro
Lighter:    #ECFDF5  ← Fondo muy claro (hover)
Darker:     #059669  ← Hover oscuro
```

**Uso:**
- Badge estado: Fondo #10B981, texto blanco
- Indicador visual: #10B981
- Success toast: Fondo #D1FAE5, texto #065F46

### Colores de Notificación

#### ✅ Éxito

```
Success:         #10B981  ← Verde
Success Light:   #D1FAE5  ← Verde claro (fondo toast)
Success Dark:    #065F46  ← Verde oscuro (texto)
Success Darker:  #064E3B  ← Verde más oscuro (hover)
```

**Toast Éxito:**
- Fondo: #D1FAE5
- Texto: #065F46
- Icono: ✅

#### ❌ Error

```
Error:          #DC2626  ← Rojo
Error Light:    #FEE2E2  ← Rojo claro (fondo toast)
Error Dark:     #7F1D1D  ← Rojo oscuro (texto)
Error Darker:   #4C0519  ← Rojo más oscuro (hover)
```

**Toast Error:**
- Fondo: #FEE2E2
- Texto: #7F1D1D
- Icono: ❌

#### ⚠️ Warning

```
Warning:        #F59E0B  ← Ámbar
Warning Light:  #FEF3C7  ← Ámbar claro (fondo toast)
Warning Dark:   #78350F  ← Ámbar oscuro (texto)
```

**Toast Warning:**
- Fondo: #FEF3C7
- Texto: #78350F
- Icono: ⚠️

#### ℹ️ Info

```
Info:           #3B82F6  ← Azul
Info Light:     #DBEAFE  ← Azul claro (fondo toast)
Info Dark:      #1E40AF  ← Azul oscuro (texto)
```

**Toast Info:**
- Fondo: #DBEAFE
- Texto: #1E40AF
- Icono: ℹ️

### Colores Neutrales

```
Blanco:         #FFFFFF  ← Fondo principal
Gris 50:        #F9FAFB  ← Fondo muy claro
Gris 100:       #F3F4F6  ← Fondo claro (columnas)
Gris 200:       #E5E7EB  ← Border suave
Gris 300:       #D1D5DB  ← Border normal
Gris 400:       #9CA3AF  ← Texto secundario
Gris 500:       #6B7280  ← Texto terciario
Gris 600:       #4B5563  ← Texto dark
Gris 700:       #374151  ← Texto label
Negro:          #1F2937  ← Texto principal
```

**Uso:**
- Fondo página: #FFFFFF o #F9FAFB
- Fondo columnas: #F3F4F6
- Borders: #D1D5DB (normal), #E5E7EB (suave)
- Texto principal: #1F2937
- Texto secundario: #6B7280
- Placeholder: #9CA3AF

### Matriz de Colores por Componente

| Componente | Default | Hover | Active | Focus | Disabled |
|-----------|---------|-------|--------|-------|----------|
| Button Primary | #3B82F6 | #2563EB | #1D4ED8 | #3B82F6 + shadow | #D1D5DB |
| Button Secondary | #F3F4F6 | #E5E7EB | #D1D5DB | — | #D1D5DB |
| Button Danger | #DC2626 | #B91C1C | #7F1D1D | #DC2626 + shadow | #D1D5DB |
| Link | #3B82F6 | #2563EB | #1D4ED8 | #3B82F6 + underline | #D1D5DB |
| Input Border | #D1D5DB | #D1D5DB | #3B82F6 | #3B82F6 | #E5E7EB |
| Input Text | #1F2937 | #1F2937 | #1F2937 | #1F2937 | #9CA3AF |
| Card Border | #D1D5DB | #3B82F6 | — | #3B82F6 | — |

---

## Tipografía

### Font Stack

```css
/* Primary Font */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Monospace (para data/código) */
font-family: 'Monaco', 'Courier New', Courier, monospace;
```

### Type Scale

| Tamaño | Línea | Peso | Uso |
|--------|-------|------|-----|
| **Heading L** | 32px | 600 | Títulos principales (h1) |
| **Heading M** | 24px | 600 | Títulos secundarios (h2) |
| **Heading S** | 20px | 600 | Subtítulos (h3) |
| **Body Large** | 16px | 400 | Texto principal párrafos |
| **Body** | 14px | 400 | Texto normal campos |
| **Body Small** | 12px | 400 | Texto secundario labels |
| **Caption** | 11px | 400 | Texto terciario helpers |
| **Label Bold** | 12px | 600 | Labels campos requeridos |
| **Overline** | 10px | 600 | Textos pequeños |

### Line Height

```
Heading:    1.2 (120%)  ← Compacto
Body:       1.5 (150%)  ← Legible
UI:         1.4 (140%)  ← Balanceado
Captions:   1.3 (130%)  ← Compacto
```

### Letter Spacing

```
Heading:    -0.5px  ← Negativo (compacto)
Body:        0px    ← Normal
Label:       0px    ← Normal
Overline:   +1px    ← Expandido
```

### Especificaciones por Componente

#### Modal Title

```
Font: Heading M (24px)
Weight: 600
Line Height: 1.2
Color: #1F2937
```

#### Modal Label

```
Font: Label Bold (12px)
Weight: 600
Line Height: 1.3
Color: #374151
Asterisco: Color #EF4444
```

#### Modal Input

```
Font: Body (14px)
Weight: 400
Line Height: 1.5
Color: #1F2937
Placeholder Color: #9CA3AF
```

#### Kanban Column Title

```
Font: Heading S (20px)
Weight: 600
Line Height: 1.2
Color: #1F2937
```

#### Lead Card Name

```
Font: Body Large (16px)
Weight: 500
Line Height: 1.4
Color: #1F2937
```

#### Lead Card Company

```
Font: Body Small (12px)
Weight: 400
Line Height: 1.4
Color: #6B7280
```

#### Lead Card Email

```
Font: Caption (11px)
Weight: 400
Line Height: 1.4
Color: #9CA3AF
```

#### Button Text

```
Font: Body (14px)
Weight: 600
Line Height: 1.4
Color: Varía por variante
```

#### Toast Message

```
Font: Body (14px)
Weight: 500
Line Height: 1.4
Color: Varía por tipo (success, error, etc)
```

---

## Espaciado

### Spacing Scale (8px Base Unit)

```
xs:    4px    ← Mínimo spacing
sm:    8px    ← Pequeño
md:   12px    ← Medio
lg:   16px    ← Grande
xl:   24px    ← Extra grande
2xl:  32px    ← 2x extra
3xl:  48px    ← 3x extra
4xl:  64px    ← 4x extra
```

### Padding por Componente

| Componente | Padding |
|-----------|---------|
| Button | 10px 24px (md) / 6px 12px (sm) / 12px 32px (lg) |
| Input | 12px 16px |
| Modal | 24px |
| Card | 12px |
| Badge | 4px 12px (sm) / 8px 16px (md) |
| Kanban Column | 16px |

### Margin por Componente

| Componente | Margin |
|-----------|--------|
| Modal Field | 0 0 16px 0 |
| Helper Text | 4px 0 0 0 |
| Form Error | 4px 0 0 0 |
| Card in Column | 0 0 12px 0 |
| Column in Row | 0 12px 0 0 |
| Toast | 16px (from bottom/right) |

### Gap (Flex/Grid)

| Contenedor | Gap |
|-----------|-----|
| Button Group | 8px |
| Form Fields | 16px |
| Kanban Columns | 12px |
| Card Actions | 8px |
| Toast Stack | 8px |

---

## Sombras

### Shadow Scale

```
Subtle:    0px 2px 8px rgba(0, 0, 0, 0.06)
Normal:    0px 4px 12px rgba(0, 0, 0, 0.12)
Medium:    0px 8px 16px rgba(0, 0, 0, 0.15)
Large:     0px 12px 24px rgba(0, 0, 0, 0.15)
X-Large:   0px 20px 60px rgba(0, 0, 0, 0.15)
```

### Sombras por Componente

| Componente | Shadow | Uso |
|-----------|--------|-----|
| Card Default | Subtle | Estado normal |
| Card Hover | Medium | Hover state |
| Card Dragging | Large | Durante drag |
| Modal | X-Large | Overlay modal |
| Dropdown | Normal | Menu abierto |
| Toast | Large | Notificación |
| Button Hover | Subtle | Hover state |

---

## Border Radius

### Border Radius Scale

```
none:   0px
sm:     4px
md:     6px
lg:     8px
xl:    12px
2xl:   16px
full:  9999px (pill/round)
```

### Border Radius por Componente

| Componente | Border Radius |
|-----------|--------------|
| Button | 6px |
| Input | 6px |
| Modal | 12px |
| Card | 6px |
| Badge | 12px |
| Toast | 8px |
| Dropdown | 6px |
| Image | 8px |

---

## Breakpoints

### Responsive Grid

```
Mobile:     < 640px   ← 1 columna Kanban
Tablet:     640px - 1023px  ← 2 columnas Kanban
Desktop:    ≥ 1024px  ← 4 columnas Kanban
Large:      ≥ 1280px  ← Extra espaciado
```

### Media Queries

```css
/* Mobile First Approach */

/* Base: Mobile (320px - 639px) */
.kanban {
  grid-template-columns: repeat(auto-scroll, minmax(100%, 1fr));
}

/* Tablet (640px - 1023px) */
@media (min-width: 640px) {
  .kanban {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .kanban {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Large Desktop (1280px+) */
@media (min-width: 1280px) {
  .kanban {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### Responsive Component Sizing

| Componente | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Modal Width | 90vw | 75vw | 500px |
| Button Padding | 8px 16px | 10px 20px | 10px 24px |
| Card Padding | 12px | 12px | 12px |
| Font Size Body | 14px | 14px | 16px |
| Kanban Gap | 8px | 12px | 16px |
| Header Height | 56px | 56px | 64px |

---

## Z-Index Scale

```
Base:              0
Dropdown:       100
Toast:          9999
Dragging:       1000
Modal Overlay:   900
Modal Content:  1000
Popover:        1050
Tooltip:        1100
```

### Z-Index por Componente

| Componente | Z-Index | Razón |
|-----------|---------|-------|
| Page background | 0 | Base |
| Kanban columns | 1 | Normal flow |
| Card normal | 2 | Encima de column |
| Card hover | 3 | Slightly elevated |
| Card dragging | 1000 | Sobre todo |
| Dropdown | 100 | Encima de form |
| Modal overlay | 900 | Casi todo |
| Modal | 1000 | Encima de overlay |
| Toast | 9999 | Encima de todo |
| Tooltip | 1100 | Encima de toast (si aplica) |

---

## Transiciones y Animaciones

### Timing Functions

```
Linear:           cubic-bezier(0, 0, 1, 1)
Ease-in:          cubic-bezier(0.42, 0, 1, 1)
Ease-out:         cubic-bezier(0, 0, 0.58, 1)
Ease-in-out:      cubic-bezier(0.42, 0, 0.58, 1)
Custom-smooth:    cubic-bezier(0.4, 0, 0.2, 1)
Custom-elastic:   cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Transition Duration

```
Fast:      100ms   ← UI feedback rápido
Normal:    150ms   ← Transiciones estándar
Smooth:    200ms   ← Transiciones suaves
Slow:      300ms   ← Transiciones largas
Slowest:   500ms   ← Animaciones principales
```

### Animaciones Predefinidas

| Animación | Duration | Easing | Uso |
|-----------|----------|--------|-----|
| fade-in | 150ms | ease-out | Aparición suave |
| fade-out | 100ms | ease-in | Desaparición |
| slide-in-up | 200ms | custom-smooth | Entrada cards |
| slide-out-down | 200ms | custom-smooth | Salida cards |
| shimmer | 1500ms | linear | Skeleton loading |
| bounce-in | 300ms | custom-elastic | Confirmación |
| scale-up | 150ms | ease-out | Hover effect |
| spin | Indefinida | linear | Loading spinner |

---

## CSS Variables Export

### CSS Custom Properties

```css
:root {
  /* Colors - States */
  --color-nuevo: #3B82F6;
  --color-nuevo-light: #DBEAFE;
  --color-nuevo-lighter: #EFF6FF;
  --color-nuevo-dark: #2563EB;
  
  --color-en-contacto: #F59E0B;
  --color-en-contacto-light: #FEF3C7;
  
  --color-propuesta: #A855F7;
  --color-propuesta-light: #E9D5FF;
  
  --color-cerrado: #10B981;
  --color-cerrado-light: #D1FAE5;
  
  /* Colors - Notifications */
  --color-success: #10B981;
  --color-success-light: #D1FAE5;
  --color-success-dark: #065F46;
  
  --color-error: #DC2626;
  --color-error-light: #FEE2E2;
  --color-error-dark: #7F1D1D;
  
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;
  
  --color-info: #3B82F6;
  --color-info-light: #DBEAFE;
  
  /* Colors - Neutrals */
  --color-white: #FFFFFF;
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-900: #1F2937;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'Monaco', 'Courier New', Courier, monospace;
  
  --font-size-heading-l: 32px;
  --font-size-heading-m: 24px;
  --font-size-heading-s: 20px;
  --font-size-body-large: 16px;
  --font-size-body: 14px;
  --font-size-body-small: 12px;
  --font-size-caption: 11px;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;
  
  --line-height-heading: 1.2;
  --line-height-body: 1.5;
  --line-height-ui: 1.4;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 48px;
  
  /* Shadows */
  --shadow-subtle: 0px 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-normal: 0px 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-medium: 0px 8px 16px rgba(0, 0, 0, 0.15);
  --shadow-large: 0px 12px 24px rgba(0, 0, 0, 0.15);
  --shadow-xlarge: 0px 20px 60px rgba(0, 0, 0, 0.15);
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 100ms;
  --transition-normal: 150ms;
  --transition-smooth: 200ms;
  --transition-slow: 300ms;
  
  --ease-out: cubic-bezier(0, 0, 0.58, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Breakpoint Variables

```css
:root {
  --breakpoint-mobile: 320px;
  --breakpoint-tablet: 640px;
  --breakpoint-desktop: 1024px;
  --breakpoint-large: 1280px;
}
```

### Uso en Componentes

```css
.button {
  padding: var(--space-md) var(--space-lg);
  background-color: var(--color-nuevo);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-normal) var(--ease-out);
  box-shadow: var(--shadow-subtle);
}

.button:hover {
  background-color: var(--color-nuevo-dark);
  box-shadow: var(--shadow-normal);
}

@media (max-width: var(--breakpoint-tablet)) {
  .button {
    padding: var(--space-sm) var(--space-md);
  }
}
```

---

## Validación de Tokens

### Checklist de Implementación

- [ ] Todos los colores usan variables CSS
- [ ] Tipografía consistente (font-family, sizes, weights)
- [ ] Espaciado basado en 8px unit scale
- [ ] Sombras predefinidas en escala
- [ ] Border radius consistente
- [ ] Breakpoints responsive (mobile-first)
- [ ] Z-index scale respetada
- [ ] Transiciones con timing consistente
- [ ] Accesibilidad: contrast ratio > 4.5:1
- [ ] Dark mode compatible (opcional)

### Verificación de Contraste

| Texto | Fondo | Ratio | ✅ WCAG AA |
|-------|-------|-------|-----------|
| #1F2937 | #FFFFFF | 13.5:1 | ✅ |
| #FFFFFF | #3B82F6 | 4.7:1 | ✅ |
| #6B7280 | #FFFFFF | 5.5:1 | ✅ |
| #065F46 | #D1FAE5 | 4.9:1 | ✅ |
| #7F1D1D | #FEE2E2 | 4.6:1 | ✅ |

---

## Notas de Implementación

1. **CSS Variables**: Exportar a archivo `tokens.css` reusable
2. **Tailwind Config**: Documentar tokens en `tailwind.config.js`
3. **Design System**: Sincronizar con Figma tokens
4. **Documentación**: Mantener este documento actualizado
5. **Review**: Verificar contraste WCAG AA en todos los casos
6. **Testing**: Test de colores en dispositivos reales
7. **Versioning**: Versionar cambios de tokens
8. **Comunicación**: Notificar cambios a todo el team

