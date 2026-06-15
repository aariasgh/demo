import { describe, it, expect } from 'vitest'
import { KEYBOARD_SHORTCUTS } from '../keyboardConfig'

describe('keyboardConfig', () => {
  it('should export KEYBOARD_SHORTCUTS object', () => {
    expect(KEYBOARD_SHORTCUTS).toBeDefined()
    expect(typeof KEYBOARD_SHORTCUTS).toBe('object')
  })

  it('should have create shortcut with key "c"', () => {
    expect(KEYBOARD_SHORTCUTS.create).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.create.key).toBe('c')
    expect(KEYBOARD_SHORTCUTS.create.description).toBeDefined()
  })

  it('should have notes shortcut with key "n"', () => {
    expect(KEYBOARD_SHORTCUTS.notes).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.notes.key).toBe('n')
    expect(KEYBOARD_SHORTCUTS.notes.description).toBeDefined()
  })

  it('should have status shortcut with key "s"', () => {
    expect(KEYBOARD_SHORTCUTS.status).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.status.key).toBe('s')
    expect(KEYBOARD_SHORTCUTS.status.description).toBeDefined()
  })

  it('should have search shortcut with key "/"', () => {
    expect(KEYBOARD_SHORTCUTS.search).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.search.key).toBe('/')
    expect(KEYBOARD_SHORTCUTS.search.description).toBeDefined()
  })

  it('should have filter shortcut with key "f"', () => {
    expect(KEYBOARD_SHORTCUTS.filter).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.filter.key).toBe('f')
    expect(KEYBOARD_SHORTCUTS.filter.description).toBeDefined()
  })

  it('should have riskWidget shortcut with key "r"', () => {
    expect(KEYBOARD_SHORTCUTS.riskWidget).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.riskWidget.key).toBe('r')
    expect(KEYBOARD_SHORTCUTS.riskWidget.description).toBeDefined()
  })

  it('should have help shortcut with key "?"', () => {
    expect(KEYBOARD_SHORTCUTS.help).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.help.key).toBe('?')
    expect(KEYBOARD_SHORTCUTS.help.description).toBeDefined()
  })

  it('should have escape shortcut with key "Escape"', () => {
    expect(KEYBOARD_SHORTCUTS.escape).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.escape.key).toBe('Escape')
    expect(KEYBOARD_SHORTCUTS.escape.description).toBeDefined()
  })

  it('should have enter shortcut with key "Enter"', () => {
    expect(KEYBOARD_SHORTCUTS.enter).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.enter.key).toBe('Enter')
    expect(KEYBOARD_SHORTCUTS.enter.description).toBeDefined()
  })

  it('should have space shortcut with key " "', () => {
    expect(KEYBOARD_SHORTCUTS.space).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.space.key).toBe(' ')
    expect(KEYBOARD_SHORTCUTS.space.description).toBeDefined()
  })

  it('should have tab shortcuts for navigation', () => {
    expect(KEYBOARD_SHORTCUTS.tabNext).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.tabNext.key).toBe('Tab')
    expect(KEYBOARD_SHORTCUTS.tabNext.shiftKey).toBe(false)
    expect(KEYBOARD_SHORTCUTS.tabPrev).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.tabPrev.key).toBe('Tab')
    expect(KEYBOARD_SHORTCUTS.tabPrev.shiftKey).toBe(true)
  })

  it('should have arrow shortcuts for navigation', () => {
    expect(KEYBOARD_SHORTCUTS.arrowUp).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.arrowUp.key).toBe('ArrowUp')
    expect(KEYBOARD_SHORTCUTS.arrowDown).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.arrowDown.key).toBe('ArrowDown')
    expect(KEYBOARD_SHORTCUTS.arrowLeft).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.arrowLeft.key).toBe('ArrowLeft')
    expect(KEYBOARD_SHORTCUTS.arrowRight).toBeDefined()
    expect(KEYBOARD_SHORTCUTS.arrowRight.key).toBe('ArrowRight')
  })

  it('should have single-letter shortcuts without Ctrl/Alt by default', () => {
    const singleLetterShortcuts = ['create', 'notes', 'status', 'search', 'filter', 'riskWidget', 'help']
    singleLetterShortcuts.forEach(name => {
      const shortcut = KEYBOARD_SHORTCUTS[name]
      expect(shortcut.ctrlKey).toBe(false)
      expect(shortcut.altKey).toBe(false)
    })
  })
})
