import { useEffect, useCallback, useRef } from 'react'
import type { KeyboardContextState } from '../utils/keyboardStateMachine'
import { keyboardContextStateMachine } from '../utils/keyboardStateMachine'
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
 * Export context state machine for use in components
 */
export function pushKeyboardContext(state: KeyboardContextState): void {
  keyboardContextStateMachine.pushState(state)
}

export function popKeyboardContext(): KeyboardContextState {
  return keyboardContextStateMachine.popState()
}

export function getKeyboardContext(): KeyboardContextState {
  return keyboardContextStateMachine.getState()
}

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
 * Context-aware handler execution
 * Only executes handler if we're in the correct keyboard context
 */
function executeContextAwareHandler(
  handler: (() => void) | undefined,
  allowedContexts: KeyboardContextState[]
): void {
  if (!handler) return
  
  const currentContext = keyboardContextStateMachine.getState()
  if (allowedContexts.includes(currentContext)) {
    handler()
  } else if (import.meta.env.DEV) {
    console.debug(
      `[Keyboard] Handler blocked: context "${currentContext}" not in allowed contexts [${allowedContexts.join(', ')}]`
    )
  }
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

  // Global keyboard event handler with context awareness
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const currentContext = keyboardContextStateMachine.getState()
    
    // Don't intercept if user is typing in an input/textarea
    const target = event.target as HTMLElement
    const isTypingContext =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.contentEditable === 'true'

    // Always allow Escape (closes modals) - works in MODAL context
    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.escape)) {
      event.preventDefault()
      if (currentContext === 'MODAL' || currentContext === 'SEARCH') {
        keyboardHandlers.onCloseModal?.()
      }
      return
    }

    // Always allow Enter and Space (open details) - works in KANBAN context
    if (
      matchesShortcut(event, KEYBOARD_SHORTCUTS.enter) ||
      matchesShortcut(event, KEYBOARD_SHORTCUTS.space)
    ) {
      // Only prevent default if not in text input (Enter in textarea should create newline)
      if (target?.tagName !== 'TEXTAREA') {
        event.preventDefault()
        executeContextAwareHandler(keyboardHandlers.onOpenDetails, ['KANBAN', 'MODAL'])
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

    // For arrow keys - work in KANBAN and MODAL contexts
    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowUp)) {
      event.preventDefault()
      executeContextAwareHandler(keyboardHandlers.onNavigateUp, ['KANBAN', 'MODAL'])
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowDown)) {
      event.preventDefault()
      executeContextAwareHandler(keyboardHandlers.onNavigateDown, ['KANBAN', 'MODAL'])
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowLeft)) {
      event.preventDefault()
      executeContextAwareHandler(keyboardHandlers.onNavigateLeft, ['KANBAN', 'MODAL'])
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.arrowRight)) {
      event.preventDefault()
      executeContextAwareHandler(keyboardHandlers.onNavigateRight, ['KANBAN', 'MODAL'])
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

    // Single-letter shortcuts (C, N, S, F, R, /, ?) - only work in KANBAN context
    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.create)) {
      event.preventDefault()
      executeContextAwareHandler(keyboardHandlers.onOpenCreateModal, ['KANBAN'])
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.notes)) {
      event.preventDefault()
      executeContextAwareHandler(keyboardHandlers.onOpenNotesList, ['KANBAN'])
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.status)) {
      event.preventDefault()
      executeContextAwareHandler(keyboardHandlers.onChangeStatus, ['KANBAN'])
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.search)) {
      event.preventDefault()
      executeContextAwareHandler(keyboardHandlers.onFocusSearch, ['KANBAN'])
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.filter)) {
      event.preventDefault()
      executeContextAwareHandler(keyboardHandlers.onFocusFilter, ['KANBAN'])
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.riskWidget)) {
      event.preventDefault()
      executeContextAwareHandler(keyboardHandlers.onToggleRiskWidget, ['KANBAN'])
      return
    }

    if (matchesShortcut(event, KEYBOARD_SHORTCUTS.help)) {
      event.preventDefault()
      // Help works in any context
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
