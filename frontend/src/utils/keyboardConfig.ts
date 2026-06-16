/**
 * Centralized keyboard shortcut configuration
 * 
 * All keyboard shortcuts are defined here for easy maintenance and conflict avoidance.
 * Used by useKeyboardNavigation hook to register global listeners.
 */

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  description: string
}

/**
 * KEYBOARD_SHORTCUTS: Master configuration for all keyboard shortcuts
 * 
 * Each shortcut includes:
 * - key: The keyboard key to listen for
 * - ctrlKey/altKey/shiftKey: Modifiers (optional, default false)
 * - description: User-friendly description for help modal
 */
export const KEYBOARD_SHORTCUTS: Record<string, KeyboardShortcut> = {
  // Lead & CRM Shortcuts
  create: {
    key: 'c',
    ctrlKey: false,
    altKey: false,
    description: 'Crear nuevo Lead (Create new lead)',
  },
  notes: {
    key: 'n',
    ctrlKey: false,
    altKey: false,
    description: 'Agregar notas (Add notes to lead)',
  },
  status: {
    key: 's',
    ctrlKey: false,
    altKey: false,
    description: 'Cambiar estado (Change lead status)',
  },

  // Navigation Shortcuts
  search: {
    key: '/',
    ctrlKey: false,
    altKey: false,
    description: 'Buscar Leads (Search/Filter leads)',
  },
  filter: {
    key: 'f',
    ctrlKey: false,
    altKey: false,
    description: 'Filtro de Prioridad (Priority filter)',
  },
  riskWidget: {
    key: 'r',
    ctrlKey: false,
    altKey: false,
    description: 'Leads en Riesgo (At-risk leads panel)',
  },
  help: {
    key: '?',
    ctrlKey: false,
    altKey: false,
    shiftKey: true,  // Shift+? to open help (? = Shift+/)
    description: 'Ayuda de Atajos (Keyboard shortcuts help)',
  },

  // Standard Navigation Keys
  escape: {
    key: 'Escape',
    description: 'Cerrar modal o cancelar (Close modal/Cancel)',
  },
  enter: {
    key: 'Enter',
    description: 'Abrir detalles o confirmar (Open details/Confirm)',
  },
  space: {
    key: ' ',
    description: 'Abrir detalles o alternar (Open details/Toggle)',
  },

  // Tab Navigation
  tabNext: {
    key: 'Tab',
    ctrlKey: false,
    shiftKey: false,
    description: 'Siguiente elemento (Next element)',
  },
  tabPrev: {
    key: 'Tab',
    ctrlKey: false,
    shiftKey: true,
    description: 'Elemento anterior (Previous element)',
  },

  // Arrow Navigation
  arrowUp: {
    key: 'ArrowUp',
    description: 'Elemento anterior en columna (Previous item in column)',
  },
  arrowDown: {
    key: 'ArrowDown',
    description: 'Siguiente elemento en columna (Next item in column)',
  },
  arrowLeft: {
    key: 'ArrowLeft',
    description: 'Columna anterior (Previous column)',
  },
  arrowRight: {
    key: 'ArrowRight',
    description: 'Siguiente columna (Next column)',
  },
}

/**
 * Helper: Check if a keyboard event matches a shortcut configuration
 * 
 * @param event KeyboardEvent to check
 * @param shortcut KeyboardShortcut config to match against
 * @returns true if event matches shortcut exactly
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  // For single letter keys, compare case-insensitively
  let keyMatch = event.key === shortcut.key
  if (shortcut.key.length === 1 && shortcut.key.match(/[a-z]/i)) {
    keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
  }
  
  return (
    keyMatch &&
    event.ctrlKey === (shortcut.ctrlKey ?? false) &&
    event.altKey === (shortcut.altKey ?? false) &&
    event.shiftKey === (shortcut.shiftKey ?? false)
  )
}

/**
 * Helper: Get shortcut description for display in help modal or aria-labels
 * 
 * @param shortcutName Key from KEYBOARD_SHORTCUTS (e.g., 'create', 'search')
 * @returns Description text or empty string if not found
 */
export function getShortcutDescription(shortcutName: string): string {
  return KEYBOARD_SHORTCUTS[shortcutName]?.description ?? ''
}

/**
 * Helper: Get shortcut display string for UI (e.g., "C", "Ctrl+S", "Shift+Tab")
 * 
 * @param shortcut KeyboardShortcut config
 * @returns Display string like "C", "Ctrl+/", "Alt+S"
 */
export function getShortcutDisplayString(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.altKey) parts.push('Alt')
  if (shortcut.shiftKey) parts.push('Shift')

  // Format special keys
  let keyDisplay = shortcut.key
  switch (shortcut.key) {
    case 'Escape':
      keyDisplay = 'Esc'
      break
    case 'Enter':
      keyDisplay = '↵'
      break
    case ' ':
      keyDisplay = 'Espacio'
      break
    case 'ArrowUp':
      keyDisplay = '↑'
      break
    case 'ArrowDown':
      keyDisplay = '↓'
      break
    case 'ArrowLeft':
      keyDisplay = '←'
      break
    case 'ArrowRight':
      keyDisplay = '→'
      break
    case 'Tab':
      keyDisplay = 'Tab'
      break
    default:
      keyDisplay = shortcut.key.toUpperCase()
  }

  parts.push(keyDisplay)
  return parts.join('+')
}

/**
 * Helper: Get all shortcuts as array for rendering help modal
 * 
 * @returns Array of [name, shortcut] tuples
 */
export function getAllShortcuts(): Array<[string, KeyboardShortcut]> {
  return Object.entries(KEYBOARD_SHORTCUTS)
}

/**
 * ARIA Label Helper: Build accessible aria-label for interactive elements with keyboard hints
 * 
 * @param elementName Name or label of the element
 * @param shortcuts Array of shortcut names that activate this element
 * @param additionalInfo Optional additional description
 * @returns Full aria-label string in Spanish
 * 
 * Example: ariaLabelWithShortcuts('Juan García', ['enter', 'space'])
 * Returns: "Juan García de TechCorp. Presiona Enter o Espacio para abrir. S para cambiar estado."
 */
export function ariaLabelWithShortcuts(
  elementName: string,
  shortcuts: string[],
  additionalInfo?: string,
): string {
  const shortcutTexts = shortcuts
    .map(name => {
      const shortcut = KEYBOARD_SHORTCUTS[name]
      if (!shortcut) return ''
      const display = getShortcutDisplayString(shortcut)
      return `${display}`
    })
    .filter(Boolean)

  let label = elementName
  if (shortcutTexts.length > 0) {
    label += `. Presiona ${shortcutTexts.join(' o ')}`
  }
  if (additionalInfo) {
    label += `. ${additionalInfo}`
  }

  return label
}
