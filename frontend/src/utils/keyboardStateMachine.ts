/**
 * Keyboard Context State Machine
 * 
 * Manages keyboard event routing based on current application context.
 * Prevents handler conflicts between modals, search, and kanban board.
 * 
 * States:
 * - KANBAN: Default state, keyboard events affect kanban navigation
 * - MODAL: Modal is open, keyboard events handled by modal
 * - SEARCH: Search input is focused, keyboard events for search input
 */

export type KeyboardContextState = 'KANBAN' | 'MODAL' | 'SEARCH'

export interface KeyboardContextTransition {
  from: KeyboardContextState
  to: KeyboardContextState
  trigger: string
}

/**
 * Keyboard Context State Machine
 */
export class KeyboardContextStateMachine {
  private currentState: KeyboardContextState = 'KANBAN'
  private stateStack: KeyboardContextState[] = ['KANBAN']
  private listeners: Set<(state: KeyboardContextState) => void> = new Set()

  /**
   * Get current keyboard context state
   */
  getState(): KeyboardContextState {
    return this.currentState
  }

  /**
   * Push a new context state (useful for nested modals)
   */
  pushState(newState: KeyboardContextState): void {
    if (newState === this.currentState) return

    this.stateStack.push(newState)
    this.setState(newState)
  }

  /**
   * Pop back to previous context state
   */
  popState(): KeyboardContextState {
    if (this.stateStack.length <= 1) {
      console.warn('[KeyboardStateMachine] Cannot pop below root state (KANBAN)')
      return this.currentState
    }

    this.stateStack.pop()
    const previousState = this.stateStack[this.stateStack.length - 1]
    this.setState(previousState)
    return previousState
  }

  /**
   * Set state directly (for single-level contexts)
   */
  setState(newState: KeyboardContextState): void {
    if (newState === this.currentState) return

    const oldState = this.currentState
    this.currentState = newState

    // Log state transition in development
    if (import.meta.env.DEV) {
      console.log(`[KeyboardStateMachine] Transition: ${oldState} → ${newState}`)
    }

    // Notify all listeners
    this.listeners.forEach((listener) => listener(newState))
  }

  /**
   * Reset to default KANBAN state
   */
  reset(): void {
    this.stateStack = ['KANBAN']
    this.setState('KANBAN')
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: KeyboardContextState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Check if currently in a specific state
   */
  isInState(state: KeyboardContextState): boolean {
    return this.currentState === state
  }

  /**
   * Check if any of the given states is active
   */
  isInAnyState(...states: KeyboardContextState[]): boolean {
    return states.includes(this.currentState)
  }

  /**
   * Get state stack for debugging
   */
  getStateStack(): KeyboardContextState[] {
    return [...this.stateStack]
  }

  /**
   * Clear all listeners (for cleanup)
   */
  clearListeners(): void {
    this.listeners.clear()
  }
}

/**
 * Singleton instance
 */
export const keyboardContextStateMachine = new KeyboardContextStateMachine()

/**
 * Helper hook to use keyboard context state machine
 * Usage:
 * ```tsx
 * const context = useKeyboardContext()
 * useEffect(() => {
 *   context.pushState('MODAL')
 *   return () => context.popState()
 * }, [])
 * ```
 */
export function useKeyboardContextAPI() {
  return keyboardContextStateMachine
}
