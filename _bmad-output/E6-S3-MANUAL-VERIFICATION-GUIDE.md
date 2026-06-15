# E6-S3 Manual Verification Guide: WCAG AA Accessibility Testing

**Purpose**: Visual and functional verification of WCAG AA accessibility compliance in browser  
**Duration**: ~30 minutes  
**Requirements**: Chrome/Edge with DevTools, keyboard, screen reader (optional)

---

## Pre-Test Setup

### 1. Start Development Server
```bash
cd c:\SDD\Demo
docker-compose up -d
pnpm --filter=frontend run dev
# Navigate to http://localhost:3001
```

### 2. Browser Setup
- Use Chrome or Edge (latest version)
- Open DevTools (F12)
- Go to "Elements" tab for HTML inspection

### 3. Accessibility Tools (Optional)
- **axe DevTools**: [Chrome Extension](https://chrome.google.com/webstore/detail/axe-devtools)
- **Wave**: [Chrome Extension](https://chrome.google.com/webstore/detail/wave-evaluation-tool)
- **Lighthouse**: Built into Chrome DevTools (Audits tab)

---

## Test Cases

### AC-1: Focus Management

#### AC-1.1: Tab Navigation Works
**Steps**:
1. Open app at http://localhost:3001
2. Press **Tab** repeatedly
3. Verify focus moves through:
   - Search input
   - Priority filter button
   - Kanban cards
   - Edit/Delete buttons on cards

**Expected**: Focus visible as blue outline (outline-2, outline-blue-500)

**Pass/Fail**: ☐

---

#### AC-1.2: Focus Outline Visible
**Steps**:
1. Click any button (e.g., "Crear Lead")
2. Verify blue outline appears around button
3. Outline should be **2px**, **blue**, with **2px offset**

**Expected**: Outline is visible, not subtle

**Pass/Fail**: ☐

---

#### AC-1.3: Focus Trap in Modal
**Steps**:
1. Click "Crear Lead" button → Modal opens
2. Press **Tab** multiple times
3. Focus should cycle through:
   - Name input → Company input → Email input → Phone input → Notes → Create button → Cancel button → back to Name input
4. Focus should NOT escape modal to page background

**Expected**: Tab navigation stays within modal

**Pass/Fail**: ☐

---

#### AC-1.4: Escape Closes Modal
**Steps**:
1. Click "Crear Lead" button → Modal opens
2. Press **Escape**

**Expected**: Modal closes immediately

**Pass/Fail**: ☐

---

### AC-2: Keyboard Navigation

#### AC-2.1: All Buttons Keyboard Accessible
**Steps**:
1. Tab to each button (search, create, priority filter, edit, delete, close, etc.)
2. Press **Enter** or **Space** to activate

**Expected**: Button activates (either via Enter or Space, not both required)

**Pass/Fail**: ☐

---

#### AC-2.2: Tab Order is Logical
**Steps**:
1. Press Tab through entire page
2. Verify order matches visual left-to-right, top-to-bottom

**Example Order**:
```
1. Search input
2. Priority filter
3. Kanban columns (one per column)
4. Cards within each column
5. Action buttons on cards
```

**Expected**: Natural reading order, no random jumps

**Pass/Fail**: ☐

---

#### AC-2.3: No Keyboard Traps
**Steps**:
1. Tab through entire page
2. Verify you can **always** move focus forward and backward
3. Test on modal → press Tab/Shift+Tab → focus should cycle within modal

**Expected**: No elements where Tab gets "stuck"

**Pass/Fail**: ☐

---

### AC-3: ARIA Attributes

#### AC-3.1: Search Input has Label
**Steps**:
1. Click on search input area
2. In DevTools → Elements, inspect the input
3. Look for: `<label htmlFor="search-input">Buscar leads</label>`

**Expected**: Label element exists with proper htmlFor attribute

**Inspect**: ☐

**HTML Example**:
```html
<label htmlFor="search-input">Buscar leads</label>
<input id="search-input" placeholder="Nombre, empresa o email..." />
```

---

#### AC-3.2: Modal has ARIA Attributes
**Steps**:
1. Click "Crear Lead" → Modal opens
2. In DevTools → Elements, find the modal div
3. Look for:
   - `role="dialog"`
   - `aria-modal="true"`
   - `aria-labelledby="modal-title"`

**Expected**: All three attributes present

**Inspect**: ☐

**HTML Example**:
```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Crear Nuevo Lead</h2>
  ...
</div>
```

---

#### AC-3.3: Interactive Elements have aria-label
**Steps**:
1. Right-click on any button without visible text (e.g., close button on modal)
2. Inspect element
3. Verify `aria-label` attribute exists with descriptive text

**Expected**: aria-label describes button purpose

**Examples**:
```html
<button aria-label="Cerrar modal">×</button>
<button aria-label="Editar lead Juan García">✏️</button>
<button aria-label="Eliminar lead Juan García">🗑️</button>
```

**Inspect**: ☐

---

#### AC-3.4: ARIA Live Regions for Updates
**Steps**:
1. In DevTools → Elements, search for `aria-live`
2. Find Kanban columns
3. Verify: `aria-live="polite"` on column

**Expected**: aria-live attribute present for dynamic content

**Inspect**: ☐

**HTML Example**:
```html
<section role="region" aria-live="polite" aria-label="Columna Nuevo, 5 leads">
  ...
</section>
```

---

### AC-4: Semantic HTML

#### AC-4.1: Page has Proper Header Structure
**Steps**:
1. In DevTools → Elements, look at `<header>` tag
2. Verify: `<header role="banner">`

**Expected**: Header with role="banner"

**Inspect**: ☐

**HTML Example**:
```html
<header role="banner" aria-label="Encabezado de la aplicación">
  <h1>Mini CRM de Seguimiento de Leads</h1>
  <p>Gestiona tu pipeline de ventas</p>
</header>
```

---

#### AC-4.2: Page has Proper Main Content Structure
**Steps**:
1. In DevTools → Elements, look for `<main>` tag
2. Verify: `<main role="main">`

**Expected**: Main tag present with proper role

**Inspect**: ☐

**HTML Example**:
```html
<main role="main" aria-label="Área principal del panel de Kanban">
  ...
</main>
```

---

#### AC-4.3: Kanban Columns are Proper Sections
**Steps**:
1. In DevTools → Elements, find each Kanban column
2. Verify each is: `<section role="region">`
3. Check for: `aria-label="Columna [Status], [Count] leads"`

**Expected**: Section tag with region role and descriptive aria-label

**Inspect**: ☐

**HTML Example**:
```html
<section role="region" aria-live="polite" aria-label="Columna Nuevo, 3 leads">
  ...
</section>
```

---

#### AC-4.4: Lead Cards are Proper Articles
**Steps**:
1. In DevTools → Elements, find any lead card
2. Verify: `<article role="listitem">`
3. Check for: `aria-label="[Name] de [Company], estado [Status]"`

**Expected**: Article tag with listitem role

**Inspect**: ☐

**HTML Example**:
```html
<article role="listitem" aria-label="Juan García de Acme Corp, estado Nuevo">
  <h3>Juan García</h3>
  <p>Acme Corp</p>
  ...
</article>
```

---

### AC-5: Touch Targets

#### AC-5.1: Buttons are At Least 44px High
**Steps**:
1. Open DevTools → Inspect any button
2. Look at "Computed" tab → find `height` property
3. Verify minimum 44px (Tailwind typically: py-2 = 0.5rem = ~8px padding × 2 = ~16px height minimum)
4. For larger buttons: py-3 or py-4

**Expected**: Height ≥ 44px for all buttons and interactive elements

**Measure**: ☐

**Tailwind Classes Used**:
- `py-2` = ~32px
- `py-3` = ~40px  
- `py-4` = ~48px ✅
- `h-12` = 48px ✅

---

#### AC-5.2: Input Fields are At Least 44px High
**Steps**:
1. Click search input
2. Inspect in DevTools
3. Check height ≥ 44px

**Expected**: Input field easily clickable on mobile (44-48px standard)

**Measure**: ☐

---

### AC-6: Visual Design & Motion

#### AC-6.1: Color Contrast Ratio
**Steps**:
1. Open axe DevTools → Scan page
2. Look for "Color contrast" section
3. All text should show ≥ 4.5:1 (WCAG AA normal) or ≥ 3:1 (WCAG AA large)

**Expected**: No contrast warnings

**Scan**: ☐

**Manual Check**:
- Dark blue text (focus outline): outline-blue-500
- Should have sufficient contrast with white background

---

#### AC-6.2: Prefers Reduced Motion Respected
**Steps**:
1. On Mac: System Preferences → Accessibility → Display → Reduce motion
2. On Windows: Settings → Ease of Access → Display → Turn on Reduce motion
3. Reload page at http://localhost:3001
4. Verify animations are removed or significantly slowed

**Expected**: No jarring animations when reduce motion is enabled

**Test**: ☐

**Note**: May require screen recording to verify

---

### AC-7: Placeholder Text (Updated)

#### AC-7.1: Search Input Placeholder Updated
**Steps**:
1. Look at search input
2. Verify placeholder text is: "Nombre, empresa o email..."
3. NOT the old text: "Buscar: nombre, empresa, email..."

**Expected**: New placeholder visible

**Visual Check**: ☐

---

## Screen Reader Testing (Advanced)

### Setup
- **Windows**: Use Narrator (Windows + Ctrl + N) or NVDA (free, more feature-rich)
- **Mac**: Use VoiceOver (Cmd + F5)

### Test: Announce Page Structure
**Steps**:
1. Enable screen reader
2. Press Page Down to read main content
3. Screen reader should announce:
   - "Banner" - for header
   - "Main content" - for main area
   - "Region: Columna Nuevo" - for each column
   - Button names and roles

**Expected**: Clear navigation and element announcement

**Result**: ☐

---

## Automated Accessibility Scan

### Using Lighthouse (Built-in)
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Accessibility"
4. Click "Analyze page load"
5. Review report

**Expected Score**: ≥ 90/100 for E6-S3 changes

**Score**: ___/100 ☐

---

## Spanish Localization Verification

### AC-8: Spanish Formatting

#### AC-8.1: Dates Display in Spanish Format
**Steps**:
1. Open console (F12 → Console)
2. Run: `new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())`
3. Should display: **14/06/2026** (or current date in dd/mm/yyyy)

**Expected**: Date in Spanish format

**Result**: ___/___/___ ☐

---

#### AC-8.2: Currency Displays in Spanish Format
**Steps**:
1. In console, run: `new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(1234.56)`
2. Should display: **€ 1.234,56** (not $1,234.56)

**Expected**: Euro symbol, dot separator for thousands, comma for decimals

**Result**: ☐

---

#### AC-8.3: Numbers Display in Spanish Format
**Steps**:
1. In console, run: `new Intl.NumberFormat('es-ES').format(1000)`
2. Should display: **1.000** (dot as thousands separator)

**Expected**: Dot for thousands, not comma

**Result**: ☐

---

## Final Verification Checklist

| AC | Test | Pass/Fail |
|----|----|-----------|
| AC-1.1 | Tab navigation | ☐ |
| AC-1.2 | Focus outline visible | ☐ |
| AC-1.3 | Focus trap in modal | ☐ |
| AC-1.4 | Escape closes modal | ☐ |
| AC-2.1 | Buttons keyboard accessible | ☐ |
| AC-2.2 | Tab order logical | ☐ |
| AC-2.3 | No keyboard traps | ☐ |
| AC-3.1 | Label on input | ☐ |
| AC-3.2 | Modal ARIA attributes | ☐ |
| AC-3.3 | Interactive element aria-labels | ☐ |
| AC-3.4 | ARIA live regions | ☐ |
| AC-4.1 | Header semantic | ☐ |
| AC-4.2 | Main semantic | ☐ |
| AC-4.3 | Sections semantic | ☐ |
| AC-4.4 | Articles semantic | ☐ |
| AC-5.1 | Button height ≥ 44px | ☐ |
| AC-5.2 | Input height ≥ 44px | ☐ |
| AC-6.1 | Color contrast | ☐ |
| AC-6.2 | Reduced motion respected | ☐ |
| AC-7.1 | Placeholder updated | ☐ |
| AC-8.1 | Date Spanish format | ☐ |
| AC-8.2 | Currency Spanish format | ☐ |
| AC-8.3 | Number Spanish format | ☐ |

**Total**: ___/23 Passed

---

## Troubleshooting

### Issue: Focus outline not visible
**Solution**: 
- Check that CSS classes include: `focus:outline-2 focus:outline-blue-500 focus:outline-offset-2`
- Ensure browser zoom is 100%
- Try different browser (Chrome vs Edge)

### Issue: Modal doesn't have focus trap
**Solution**:
- Verify CreateLeadModal.tsx has onKeyDown handler for Tab key
- Check console for JavaScript errors

### Issue: Screen reader not announcing properly
**Solution**:
- Verify aria-label attributes on all interactive elements
- Check for proper heading hierarchy (h1 → h2 → h3)
- Ensure role attributes are correct

### Issue: Dates showing in wrong format
**Solution**:
- Clear browser cache (Ctrl+Shift+Delete)
- Reload page (F5)
- Check browser locale is set to Spanish (es-ES)

---

## Documentation

- **Full Completion Report**: [E6-S3-COMPLETION-SUMMARY.md](E6-S3-COMPLETION-SUMMARY.md)
- **Code Changes**: Modified 6 files + Created 4 new files
- **Test Results**: 45/45 core tests passing
- **Build Status**: ✅ Production build verified (146.42 kB gzip)

---

## Sign-Off

| Item | Verified | Date | Signature |
|------|----------|------|-----------|
| All manual tests passed | ☐ | _______ | __________ |
| Lighthouse score ≥ 90 | ☐ | _______ | __________ |
| Screen reader compatible | ☐ | _______ | __________ |
| Spanish formatting correct | ☐ | _______ | __________ |
| Ready for production | ☐ | _______ | __________ |

---

**Testing Completed**: _____________  
**Tested By**: _____________  
**Approved For Production**: ☐
