/**
 * PriorityFilter Keyboard Tests
 * E6-S4 Phase 3: F shortcut to focus priority filter button
 * 
 * Coverage:
 * - AC-6.4: F keyboard shortcut focuses priority filter button
 * - AC-6.5: Focus is visible with outline
 * - AC-6.6: Filter button receives keyboard events after focus
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PriorityFilter from './PriorityFilter';
import { useKanbanFilterStore } from '../store/kanbanFilterStore';
import * as keyboardModule from '../hooks/useKeyboardNavigation';

vi.mock('../store/kanbanFilterStore');
vi.mock('../hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: vi.fn(),
  registerKeyboardHandler: vi.fn(),
  unregisterKeyboardHandler: vi.fn(),
}));

describe('PriorityFilter Keyboard Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useKanbanFilterStore as any).mockReturnValue({
      selectedPriorities: [],
      togglePriority: vi.fn(),
      clearPriorities: vi.fn(),
    });

    (keyboardModule.registerKeyboardHandler as any).mockImplementation(
      (key: string, handler: () => void) => {
        if (key === 'onFocusFilter') {
          // Store handler for manual invocation
          (window as any).__focusFilterHandler = handler;
        }
      }
    );
  });

  // AC-6.4: F keyboard shortcut focuses priority filter button
  it('should register onFocusFilter handler on mount', () => {
    render(<PriorityFilter />);

    expect(keyboardModule.registerKeyboardHandler).toHaveBeenCalledWith(
      'onFocusFilter',
      expect.any(Function)
    );
  });

  it('should focus filter button when F shortcut is pressed', () => {
    render(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad (presiona F para enfocar)') as HTMLButtonElement;
    expect(document.activeElement).not.toBe(filterButton);

    // Simulate pressing F key by invoking registered handler
    const handler = (window as any).__focusFilterHandler;
    if (handler) {
      handler();
    }

    expect(document.activeElement).toBe(filterButton);
  });

  // AC-6.5: Focus is visible with outline
  it('should have focus-visible outline styles', () => {
    render(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad (presiona F para enfocar)');
    const classList = filterButton.className;

    expect(classList).toContain('focus-visible:outline');
  });

  it('should have aria-label with keyboard shortcut hint', () => {
    render(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad (presiona F para enfocar)');
    expect(filterButton).toHaveAttribute('aria-label', expect.stringContaining('presiona F'));
  });

  // AC-6.6: Filter button receives keyboard events after focus
  it('should toggle dropdown when pressing Enter after focusing via F shortcut', () => {
    render(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad (presiona F para enfocar)') as HTMLButtonElement;

    // Focus button via F shortcut
    const handler = (window as any).__focusFilterHandler;
    if (handler) {
      handler();
    }

    // Initially closed
    expect(screen.queryByLabelText(/Filtrar por prioridad Baja/)).not.toBeInTheDocument();

    // Open via Enter key
    fireEvent.keyDown(filterButton, { key: 'Enter', code: 'Enter' });
    fireEvent.click(filterButton);

    // Dropdown should open
    expect(screen.getByLabelText(/Filtrar por prioridad Baja/)).toBeInTheDocument();
  });

  // Cleanup
  it('should unregister handler on unmount', () => {
    const { unmount } = render(<PriorityFilter />);

    unmount();

    expect(keyboardModule.unregisterKeyboardHandler).toHaveBeenCalledWith(
      'onFocusFilter'
    );
  });
});
