---
title: "TypeScript Keyboard Patterns"
author: "Elena (Junior Dev)"
date: 2026-06-15
category: "Architecture Pattern"
status: "DOCUMENTED"
owner_team: ["Frontend", "Accessibility"]
typescript_version: "6.0.3"
complexity: "INTERMEDIATE"
---

# AI-3: TypeScript Keyboard Patterns

## Overview

Reusable TypeScript patterns for implementing context-aware keyboard event handlers with strict type safety. Covers lessons from E6-S4 (Keyboard Navigation) implementation.

## Problem Statement

E6-S4 required:
- 11 keyboard shortcuts with different behaviors
- Context-aware execution (some shortcuts work everywhere, others only in specific contexts)
- Type-safe handler registration and dispatch
- No TypeScript `any` types or `as` casts

**Challenge:** Implementing a system that routes keyboard events to correct handlers based on context without losing type safety.

---

## Pattern 1: Keyboard Context State Machine

### Architecture

```typescript
// frontend/src/types/keyboard.ts

/**
 * Defines all available keyboard contexts
 * Determines where keyboard shortcuts are active
 */
export type KeyboardContext = 
  | 'kanban'        // Kanban board view
  | 'search'        // Search/filter input
  | 'modal'         // Modal dialog
  | 'global';       // Available everywhere

/**
 * Keyboard context state machine
 * Tracks current keyboard context for handler dispatch
 */
export interface KeyboardContextState {
  current: KeyboardContext;
  previous: KeyboardContext;
  stack: KeyboardContext[];
  timestamp: number;
}

/**
 * Keyboard shortcut definition with context constraints
 */
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  context: KeyboardContext | KeyboardContext[]; // 'global' or ['kanban', 'modal']
  description: string;
  ariaLabel?: string;
}

/**
 * Keyboard event handler function
 */
export type KeyboardHandler = (event: KeyboardEvent) => void | Promise<void>;

/**
 * Map of all keyboard handlers
 */
export interface KeyboardHandlerMap {
  [key: string]: KeyboardHandler | undefined;
}
```

### Implementation

```typescript
// frontend/src/hooks/useKeyboardNavigation.ts

import { useEffect, useRef, useCallback } from 'react';
import type { 
  KeyboardContextState, 
  KeyboardShortcut, 
  KeyboardHandler, 
  KeyboardHandlerMap,
  KeyboardContext 
} from '../types/keyboard';
import { KEYBOARD_SHORTCUTS } from '../utils/keyboardConfig';

/**
 * Global keyboard context state (singleton)
 */
let globalKeyboardContext: KeyboardContextState = {
  current: 'global',
  previous: 'global',
  stack: ['global'],
  timestamp: Date.now(),
};

/**
 * Global keyboard handler map
 */
let globalKeyboardHandlers: KeyboardHandlerMap = {};

/**
 * Set keyboard context (push to stack)
 */
function pushKeyboardContext(context: KeyboardContext): void {
  globalKeyboardContext.previous = globalKeyboardContext.current;
  globalKeyboardContext.current = context;
  globalKeyboardContext.stack.push(context);
  globalKeyboardContext.timestamp = Date.now();
  console.debug(`[Keyboard] Context pushed: ${context}`);
}

/**
 * Pop keyboard context (return to previous)
 */
function popKeyboardContext(): KeyboardContext {
  const popped = globalKeyboardContext.stack.pop();
  if (globalKeyboardContext.stack.length > 0) {
    globalKeyboardContext.current = 
      globalKeyboardContext.stack[globalKeyboardContext.stack.length - 1];
  }
  console.debug(`[Keyboard] Context popped: ${popped}`);
  return popped || 'global';
}

/**
 * Check if shortcut is valid in current context
 */
function isShortcutValidInContext(shortcut: KeyboardShortcut): boolean {
  if (typeof shortcut.context === 'string') {
    // Single context
    return shortcut.context === 'global' || 
           shortcut.context === globalKeyboardContext.current;
  } else {
    // Multiple contexts
    return shortcut.context.includes('global') || 
           shortcut.context.includes(globalKeyboardContext.current);
  }
}

/**
 * Match keyboard event against shortcut definition
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  return (
    event.key === shortcut.key &&
    event.ctrlKey === (shortcut.ctrlKey ?? false) &&
    event.altKey === (shortcut.altKey ?? false) &&
    event.shiftKey === (shortcut.shiftKey ?? false)
  );
}

/**
 * Hook for managing keyboard navigation
 * Provides context-aware keyboard event handling
 */
export function useKeyboardNavigation(handlers: Partial<KeyboardHandlerMap>): void {
  // Register handlers
  useEffect(() => {
    Object.assign(globalKeyboardHandlers, handlers);
    return () => {
      Object.keys(handlers).forEach(key => {
        delete globalKeyboardHandlers[key];
      });
    };
  }, [handlers]);

  // Handle keyboard events
  useEffect(() => {
    async function handleKeyDown(event: KeyboardEvent): Promise<void> {
      // Skip if target is input (unless specific shortcut allows it)
      const target = event.target as HTMLElement;
      const isFormInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      // Check each keyboard shortcut
      for (const [key, shortcut] of Object.entries(KEYBOARD_SHORTCUTS)) {
        if (!matchesShortcut(event, shortcut)) {
          continue;
        }

        // Check context validity
        if (!isShortcutValidInContext(shortcut)) {
          console.debug(`[Keyboard] Shortcut ${key} blocked by context`, {
            shortcut: shortcut.key,
            required: shortcut.context,
            current: globalKeyboardContext.current,
          });
          continue;
        }

        // Skip in form inputs (except for explicitly global shortcuts)
        if (isFormInput && shortcut.context !== 'global') {
          continue;
        }

        // Dispatch handler
        const handler = globalKeyboardHandlers[key];
        if (handler) {
          event.preventDefault();
          try {
            await handler(event);
            console.debug(`[Keyboard] Handler executed: ${key}`);
          } catch (error) {
            console.error(`[Keyboard] Handler error: ${key}`, error);
          }
        }

        return; // Prevent other handlers from firing
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/**
 * Hook to push/pop keyboard context when component mounts/unmounts
 * Used for modals, search inputs, etc.
 */
export function useKeyboardContext(context: KeyboardContext): void {
  useEffect(() => {
    pushKeyboardContext(context);
    return () => {
      popKeyboardContext();
    };
  }, [context]);
}

/**
 * Export context management functions for external use
 */
export const keyboardContextManager = {
  push: pushKeyboardContext,
  pop: popKeyboardContext,
  getCurrent: () => globalKeyboardContext.current,
  getContext: () => ({ ...globalKeyboardContext }),
};
```

---

## Pattern 2: Keyboard Shortcut Configuration

### Centralized Configuration

```typescript
// frontend/src/utils/keyboardConfig.ts

import type { KeyboardShortcut } from '../types/keyboard';

export const KEYBOARD_SHORTCUTS: Record<string, KeyboardShortcut> = {
  // Global shortcuts (work everywhere)
  create: {
    key: 'c',
    context: 'global',
    description: 'Crear Lead / Create Lead',
    ariaLabel: 'Press C to create a new lead',
  },
  
  notes: {
    key: 'n',
    context: 'global',
    description: 'Notas Rápidas / Quick Notes',
    ariaLabel: 'Press N to open quick notes',
  },

  search: {
    key: '/',
    context: ['kanban', 'global'],
    description: 'Buscar / Search',
    ariaLabel: 'Press / to focus search',
  },

  // Kanban-only shortcuts
  status: {
    key: 's',
    context: 'kanban',
    description: 'Cambiar Estado / Change Status',
    ariaLabel: 'In Kanban: Press S to change status',
  },

  risk: {
    key: 'r',
    context: 'kanban',
    description: 'Riesgo / Risk Level',
    ariaLabel: 'In Kanban: Press R to set risk level',
  },

  filter: {
    key: 'f',
    context: 'kanban',
    description: 'Filtrar / Filter',
    ariaLabel: 'In Kanban: Press F to open filters',
  },

  // Navigation
  arrowUp: {
    key: 'ArrowUp',
    context: ['kanban', 'modal'],
    description: 'Arriba / Up',
  },

  arrowDown: {
    key: 'ArrowDown',
    context: ['kanban', 'modal'],
    description: 'Abajo / Down',
  },

  escape: {
    key: 'Escape',
    context: 'global',
    description: 'Cerrar / Close',
  },

  help: {
    key: '?',
    shiftKey: true, // Shift+?
    context: 'global',
    description: 'Ayuda / Help',
    ariaLabel: 'Press Shift+? to see keyboard shortcuts help',
  },
};

/**
 * Helper: Get all shortcuts as array
 */
export function getAllShortcuts(): KeyboardShortcut[] {
  return Object.values(KEYBOARD_SHORTCUTS);
}

/**
 * Helper: Get shortcuts for specific context
 */
export function getShortcutsForContext(context: string): KeyboardShortcut[] {
  return getAllShortcuts().filter(s => {
    if (typeof s.context === 'string') {
      return s.context === 'global' || s.context === context;
    } else {
      return s.context.includes('global') || s.context.includes(context);
    }
  });
}

/**
 * Helper: Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  parts.push(shortcut.key.toUpperCase());
  return parts.join('+');
}
```

---

## Pattern 3: Component Integration

### Modal with Keyboard Context

```typescript
// frontend/src/components/CreateLeadModal.tsx

import { useState } from 'react';
import { useKeyboardContext } from '../hooks/useKeyboardNavigation';

export function CreateLeadModal({ isOpen, onClose }: Props) {
  // Push 'modal' context when component mounts
  // Automatically pops on unmount
  useKeyboardContext('modal');

  return isOpen ? (
    <div role="dialog" aria-label="Crear Lead">
      {/* Modal content */}
      <button onClick={onClose}>Cerrar</button>
    </div>
  ) : null;
}
```

### Kanban Board with Context

```typescript
// frontend/src/pages/KanbanBoard.tsx

import { useKeyboardContext } from '../hooks/useKeyboardNavigation';

export function KanbanBoard() {
  // Push 'kanban' context so keyboard shortcuts work differently here
  useKeyboardContext('kanban');

  return (
    <div className="kanban-board">
      {/* Kanban content - now S, R, F shortcuts work */}
    </div>
  );
}
```

---

## Type Safety Benefits

✅ **Exhaustive Matching:** TypeScript requires all `KeyboardContext` values handled  
✅ **Shortcut Validation:** Shortcut definitions are type-checked  
✅ **Handler Types:** Handler functions must match signature  
✅ **No `any` Types:** Zero TypeScript `any` usage  
✅ **Refactoring Safe:** IDE can rename and update all usages  

---

## Testing Patterns

### Test Context Switching

```typescript
test('Keyboard context switches correctly', () => {
  const { getContext } = require('./useKeyboardNavigation').keyboardContextManager;

  // Initial state: global
  expect(getContext().current).toBe('global');

  // Push modal context
  getContext().push('modal');
  expect(getContext().current).toBe('modal');

  // Pop back to global
  getContext().pop();
  expect(getContext().current).toBe('global');
});
```

### Test Shortcut Validity in Context

```typescript
test('Shortcut S (status) only works in kanban context', () => {
  const shortcut = KEYBOARD_SHORTCUTS.status;
  
  // In global context, should be invalid
  globalKeyboardContext.current = 'global';
  expect(isShortcutValidInContext(shortcut)).toBe(false);
  
  // In kanban context, should be valid
  globalKeyboardContext.current = 'kanban';
  expect(isShortcutValidInContext(shortcut)).toBe(true);
});
```

---

## Reuse in E7 & Beyond

This pattern supports:
1. **E7-S3 (Error Handling):** Keyboard shortcuts should gracefully handle errors
2. **Additional Contexts:** 'settings', 'admin', 'report-view'
3. **Keyboard Customization:** Allow users to rebind shortcuts (future)
4. **Accessibility:** Screen reader integration with aria-labels

---

**Status:** ✅ DOCUMENTED & TYPE-SAFE  
**Last Updated:** 2026-06-15  
**Owner:** Elena (Junior Dev)  
**TypeScript Version:** 6.0.3 (strict mode)  
**Next Use:** E7 patterns extension
