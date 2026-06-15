/**
 * SearchFilterHeader Keyboard Tests
 * E6-S4 Phase 3: / shortcut to focus search input
 * 
 * Coverage:
 * - AC-6.1: / keyboard shortcut focuses search-input
 * - AC-6.2: Focus is visible with outline
 * - AC-6.3: Search input receives keyboard events after focus
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SearchFilterHeader from './SearchFilterHeader';
import { useKanbanFilterStore } from '../store/kanbanFilterStore';
import * as keyboardModule from '../hooks/useKeyboardNavigation';

vi.mock('../store/kanbanFilterStore');
vi.mock('../hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: vi.fn(),
  registerKeyboardHandler: vi.fn(),
  unregisterKeyboardHandler: vi.fn(),
}));

describe('SearchFilterHeader Keyboard Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useKanbanFilterStore as any).mockReturnValue({
      searchQuery: '',
      setSearchQuery: vi.fn(),
      clearSearch: vi.fn(),
      selectedPriorities: [],
      hasActiveFilters: () => false,
    });

    (keyboardModule.registerKeyboardHandler as any).mockImplementation(
      (key: string, handler: () => void) => {
        if (key === 'onFocusSearch') {
          // Store handler for manual invocation
          (window as any).__focusSearchHandler = handler;
        }
      }
    );
  });

  // AC-6.1: / keyboard shortcut focuses search-input
  it('should register onFocusSearch handler on mount', () => {
    render(<SearchFilterHeader />);

    expect(keyboardModule.registerKeyboardHandler).toHaveBeenCalledWith(
      'onFocusSearch',
      expect.any(Function)
    );
  });

  it('should focus search input when / shortcut is pressed', () => {
    render(<SearchFilterHeader />);

    const searchInput = screen.getByTestId('search-input') as HTMLInputElement;
    expect(document.activeElement).not.toBe(searchInput);

    // Simulate pressing / key by invoking registered handler
    const handler = (window as any).__focusSearchHandler;
    if (handler) {
      handler();
    }

    expect(document.activeElement).toBe(searchInput);
  });

  // AC-6.2: Focus is visible with outline
  it('should have focus-visible outline styles', () => {
    render(<SearchFilterHeader />);

    const searchInput = screen.getByTestId('search-input') as HTMLInputElement;
    const classList = searchInput.className;

    expect(classList).toContain('focus:outline');
  });

  it('should have aria-label with keyboard shortcut hint', () => {
    render(<SearchFilterHeader />);

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveAttribute('aria-label', expect.stringContaining('presiona /'));
  });

  // AC-6.3: Search input receives keyboard events after focus
  it('should accept typed text after focusing via keyboard shortcut', () => {
    const mockSetSearchQuery = vi.fn();
    (useKanbanFilterStore as any).mockReturnValue({
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      clearSearch: vi.fn(),
      selectedPriorities: [],
      hasActiveFilters: () => false,
    });

    render(<SearchFilterHeader />);

    const searchInput = screen.getByTestId('search-input') as HTMLInputElement;

    // Focus input via / shortcut
    const handler = (window as any).__focusSearchHandler;
    if (handler) {
      handler();
    }

    // Type text
    fireEvent.change(searchInput, { target: { value: 'test lead' } });

    expect(searchInput.value).toBe('test lead');
  });

  // Cleanup
  it('should unregister handler on unmount', () => {
    const { unmount } = render(<SearchFilterHeader />);

    unmount();

    expect(keyboardModule.unregisterKeyboardHandler).toHaveBeenCalledWith(
      'onFocusSearch'
    );
  });
});
