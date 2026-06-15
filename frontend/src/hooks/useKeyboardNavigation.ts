import { useEffect, useCallback, useRef } from 'react'
import { KEYBOARD_SHORTCUTS, matchesShortcut } from '../utils/keyboardConfig'

/**
 * Keyboard Navigation Event Handlers
 * 
 * Each handler corresponds to a keyboard shortcut action.
 * Components register callbacks that will be invoked when shortcuts are pressed.
 */
export interface KeyboardNavigationHandlers {
  onOpenCreateModal?: () => void
  onOpenNotesList?: () => void
  onChangeStatus?: () => void
  onFocusSearch?: () => void
  onFocusFilter?: () => void
  onToggleRiskWidget?: () => void
  onOpenHelpModal?: () => void
  onCloseModal?: () => void
  onNavigateUp?: () => void
  onNavigateDown?: () => void
  onNavigateLeft?: () => void
  onNavigateRight?: () => void
  onOpenDetails?: () => void
}

/**
 * Global keyboard navigation state management
 * Stores all registered callbacks for keyboard shortcuts
 */
const keyboardHandlers: KeyboardNavigationHandlers = {}

/**
 * Register a keyboard handler
 * 
 * @param key Key of the handler (e.g., 'onOpenCreateModal')
 * @param handler Callback function to execute when shortcut is pressed
 */
export function registerKeyboardHandler(key: keyof KeyboardNavigationHandlers, handler: () => void) {
  keyboardHandlers[key] = handler
}

/**
 * Unregister a keyboard handler
 * 
 * @param key Key of the handler to remove
 */
export function unregisterKeyboardHandler(key: keyof KeyboardNavigationHandlers) {
  delete keyboardHandlers[key]
}

/**
 * Hook: Global keyboard navigation listener
 * 
 * Sets up global keyboard event listener for all shortcuts.
 * Components register handlers via registerKeyboardHandler() function.
 * 
 * Usage:
 * ```tsx
 * function App() {
 *   useKeyboardNavigation()
 *   return <KanbanBoard />
 * }
 * 
 * function CreateButton() {
 *   useEffect(() => {
 *     registerKeyboardHandler('onOpenCreateModal', () => {
 *       setModalOpen(true)
 *     })
 *     return () => unregisterKeyboardHandler('onOpenCreateModal')
 *   }, [])
 * }
 * ```
 */
export function useKeyboardNavigation(): KeyboardNavigationHandlers {
  const handlersRef = useRef<KeyboardNavigationHandlers>({
    onOpenCreateModal: () => keyboardHandlers.onOpenCreateModal?.(),
    onOpenNotesList: () => keyboardHandlers.onOpenNotesList?.(),
    onChangeStatus: () => keyboardHandlers.onChangeStatus?.(),
    onFocusSearch: () => keyboardHandlers.onFocusSearch?.(),
    onFocusFilter: () => keyboardHandlers.onFocusFilter?.(),
    onToggleRiskWidget: () => keyboardHandlers.onToggleRiskWidget?.(),
    onOpenHelpModal: () => keyboardHandlers.onOpenHelpModal?.(),
    onCloseModal: () => keyboardHandlers.onCloseModal?.(),
    onNavigateUp: () => keyboardHandlers.onNavigateUp?.(),
    onNavigateDown: () => keyboardHandlers.onNavigateDown?.(),
    onNavigateLeft: () => keyboardHandlers.onNavigateLeft?.(),
    onNavigateRight: () => keyboardHandlers.onNavigateRight?.(),
    onOpenDetails: () => keyboardHandlers.onOpenDetails?.(),
  })

  // Global keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't intercept if user is typing in an input/textarea
    const target = event.target as HTMLElement
    const isTypingContext =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.contentEditable === 'true'

    // Always allow Escape (closes modals)
    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.escape)) {
      event.preventDefault()
      keyboardHandlers.onCloseModal?.()
      return
    }

    // Always allow Enter and Space (open details)
    if (
      matchesShortcut(event, KEYBOARD_SHORTCUTS.enter) ||
      matchesShortcut(event, KEYBOARD_SHORTCUTS.space)
    ) {
      // Only prevent default if not in text input (Enter in textarea should create newline)
      if (target?.tagName !== 'TEXTAREA') {
        event.preventDefault()
        keyboardHandlers.onOpenDetails?.()
      }
      return
    }

    // Allow arrow keys in typing context (for text field navigation)
    if (
      isTypingContext &&
      (matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowUp) ||
        matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowDown) ||
        matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowLeft) ||
        matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowRight))
    ) {
      // Allow native text field arrow key behavior
      return
    }

    // For arrow keys, dispatch navigation events
    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowUp)) {
      event.preventDefault()
      keyboardHandlers.onNavigateUp?.()
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowDown)) {
      event.preventDefault()
      keyboardHandlers.onNavigateDown?.()
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowLeft)) {
      event.preventDefault()
      keyboardHandlers.onNavigateLeft?.()
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowRight)) {
      event.preventDefault()
      keyboardHandlers.onNavigateRight?.()
      return
    }

    // Don't intercept shortcuts while typing in text fields (except for special keys)
    if (isTypingContext) {
      // Allow '/' in search input, '?' for help anywhere
      if (
        !(
          (matchesShortcut(event, KEYBOARD_SHORTCUTS.search) &&
            target?.getAttribute('role') === 'searchbox') ||
          matchesShortcut(event, KEYBOARD_SHORTCUTS.help)
        )
      ) {
        return
      }
    }

    // Single-letter shortcuts (C, N, S, F, R, /, ?)
    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.create)) {
      event.preventDefault()
      keyboardHandlers.onOpenCreateModal?.()
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.notes)) {
      event.preventDefault()
      keyboardHandlers.onOpenNotesList?.()
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.status)) {
      event.preventDefault()
      keyboardHandlers.onChangeStatus?.()
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.search)) {
      event.preventDefault()
      keyboardHandlers.onFocusSearch?.()
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.filter)) {
      event.preventDefault()
      keyboardHandlers.onFocusFilter?.()
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.riskWidget)) {
      event.preventDefault()
      keyboardHandlers.onToggleRiskWidget?.()
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.help)) {
      event.preventDefault()
      keyboardHandlers.onOpenHelpModal?.()
      return
    }
  }, [])

  useEffect(() => {
    // Register global keyboard listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return handlersRef.current
}

export default useKeyboardNavigation
