/**
 * Keyboard Shortcut Validator
 * 
 * Detects and reports keyboard shortcut conflicts at application startup.
 * Ensures no duplicate shortcuts are registered and validates configuration.
 */

import type { KeyboardShortcut } from './keyboardConfig'
import { KEYBOARD_SHORTCUTS } from './keyboardConfig'

export interface ShortcutConflict {
  shortcut1: string
  shortcut2: string
  key: string
  modifiers: string
}

export interface ValidationResult {
  valid: boolean
  conflicts: ShortcutConflict[]
  warnings: string[]
  summary: string
}

/**
 * Convert shortcut to normalized key string for comparison
 */
function normalizeShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.altKey) parts.push('Alt')
  if (shortcut.shiftKey) parts.push('Shift')

  parts.push(shortcut.key)

  return parts.join('+').toLowerCase()
}

/**
 * Main validation function
 */
export function validateKeyboardShortcuts(): ValidationResult {
  const conflicts: ShortcutConflict[] = []
  const warnings: string[] = []
  const shortcutMap = new Map<string, string[]>()

  // Build map of normalized keys to shortcut names
  Object.entries(KEYBOARD_SHORTCUTS).forEach(([name, shortcut]) => {
    const normalized = normalizeShortcutKey(shortcut)
    const existing = shortcutMap.get(normalized) || []
    shortcutMap.set(normalized, [...existing, name])
  })

  // Detect conflicts (same key used by multiple shortcuts)
  shortcutMap.forEach((names, key) => {
    if (names.length > 1) {
      for (let i = 0; i < names.length - 1; i++) {
        conflicts.push({
          shortcut1: names[i],
          shortcut2: names[i + 1],
          key: key,
          modifiers: key.split('+').slice(0, -1).join('+') || 'none',
        })
      }
    }
  })

  // Validate individual shortcuts
  Object.entries(KEYBOARD_SHORTCUTS).forEach(([name, shortcut]) => {
    // Warn about single-character shortcuts that might conflict with typing
    if (shortcut.key.length === 1 && !shortcut.ctrlKey && !shortcut.altKey && !shortcut.shiftKey) {
      if (/[a-z]/.test(shortcut.key.toLowerCase())) {
        // This is expected behavior for single-char shortcuts in this app
        // No warning needed
      }
    }

    // Warn about modifiers consistency
    if (!shortcut.description) {
      warnings.push(`Shortcut "${name}" missing description`)
    }
  })

  const valid = conflicts.length === 0
  const summary = valid
    ? `✓ Keyboard shortcuts validated: ${Object.keys(KEYBOARD_SHORTCUTS).length} shortcuts, 0 conflicts`
    : `✗ Found ${conflicts.length} keyboard shortcut conflict(s)`

  return {
    valid,
    conflicts,
    warnings,
    summary,
  }
}

/**
 * Log validation results (for startup debugging)
 */
export function logKeyboardValidation(): void {
  const result = validateKeyboardShortcuts()

  console.group('🎹 Keyboard Shortcut Validation')

  // Log summary
  console.log(`%c${result.summary}`, result.valid ? 'color: green; font-weight: bold' : 'color: red; font-weight: bold')

  // Log conflicts if any
  if (result.conflicts.length > 0) {
    console.error('Conflicts detected:')
    result.conflicts.forEach((conflict) => {
      console.error(
        `  ⚠️ "${conflict.shortcut1}" and "${conflict.shortcut2}" both use ${conflict.key}`
      )
    })
  }

  // Log warnings if any
  if (result.warnings.length > 0) {
    console.warn('Warnings:')
    result.warnings.forEach((warning) => {
      console.warn(`  ⚠️ ${warning}`)
    })
  }

  // Log all shortcuts in table format (development only)
  if (import.meta.env.DEV) {
    const shortcuts = Object.entries(KEYBOARD_SHORTCUTS).map(([name, shortcut]) => ({
      Name: name,
      Key: normalizeShortcutKey(shortcut),
      Description: shortcut.description,
    }))
    console.table(shortcuts)
  }

  console.groupEnd()
}

/**
 * Assert no conflicts exist (throws error if conflicts found)
 */
export function assertNoKeyboardConflicts(): void {
  const result = validateKeyboardShortcuts()

  if (!result.valid) {
    const conflictDetails = result.conflicts
      .map((c) => `${c.shortcut1} <> ${c.shortcut2} (${c.key})`)
      .join(', ')

    throw new Error(
      `Keyboard shortcut conflicts detected: ${conflictDetails}. Please fix keyboardConfig.ts`
    )
  }
}
