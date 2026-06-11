/**
 * SearchFilterHeader Tests
 * Tests for search box functionality with debounce
 * 
 * Coverage:
 * - AC-1.1: Sticky header above Kanban
 * - AC-1.2: Placeholder text
 * - AC-1.5: Debounce 300ms
 * - AC-1.6: Empty search shows all leads
 * - AC-2.3: Clear button (X)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import SearchFilterHeader from './SearchFilterHeader';
import { useKanbanFilterStore } from '../store/kanbanFilterStore';

// Mock the Zustand store
vi.mock('../store/kanbanFilterStore');

describe('SearchFilterHeader', () => {
  beforeEach(() => {
    // Reset store mocks
    vi.clearAllMocks();
    
    (useKanbanFilterStore as any).mockReturnValue({
      searchQuery: '',
      setSearchQuery: vi.fn(),
      clearSearch: vi.fn(),
      selectedPriorities: [],
      hasActiveFilters: () => false,
    });
  });

  // AC-1.2: Placeholder text
  it('should display placeholder text "Buscar: nombre, empresa, email..."', () => {
    render(<SearchFilterHeader />);
    const input = screen.getByPlaceholderText('Buscar: nombre, empresa, email...');
    expect(input).toBeInTheDocument();
  });

  // AC-1.1: Sticky header
  it('should render with sticky positioning', () => {
    render(<SearchFilterHeader />);
    const input = screen.getByPlaceholderText('Buscar: nombre, empresa, email...');
    const header = input.closest('div')?.parentElement;
    expect(header).toHaveClass('sticky');
  });

  // AC-1.5: Debounce 300ms
  it('should debounce search input by 300ms', async () => {
    const mockSetSearchQuery = vi.fn();
    (useKanbanFilterStore as any).mockReturnValue({
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      clearSearch: vi.fn(),
      selectedPriorities: [],
      hasActiveFilters: () => false,
    });

    render(<SearchFilterHeader />);
    const input = screen.getByPlaceholderText('Buscar: nombre, empresa, email...');

    // Type rapidly
    fireEvent.change(input, { target: { value: 'j' } });
    fireEvent.change(input, { target: { value: 'ju' } });
    fireEvent.change(input, { target: { value: 'jua' } });
    fireEvent.change(input, { target: { value: 'juan' } });

    // Should not have called setSearchQuery yet (within 300ms)
    expect(mockSetSearchQuery).not.toHaveBeenCalled();

    // Wait for debounce to trigger
    await waitFor(
      () => {
        expect(mockSetSearchQuery).toHaveBeenCalledWith('juan');
      },
      { timeout: 400 }
    );

    // Should only be called once (debounce working)
    expect(mockSetSearchQuery).toHaveBeenCalledTimes(1);
  });

  // AC-2.3: Clear button
  it('should clear search input when X button clicked', async () => {
    const mockClearSearch = vi.fn();
    (useKanbanFilterStore as any).mockReturnValue({
      searchQuery: 'juan',
      setSearchQuery: vi.fn(),
      clearSearch: mockClearSearch,
      selectedPriorities: [],
      hasActiveFilters: () => true,
    });

    const { rerender } = render(<SearchFilterHeader />);
    
    // Clear button should appear when input has value
    const clearButton = screen.getByLabelText('Limpiar búsqueda');
    fireEvent.click(clearButton);

    expect(mockClearSearch).toHaveBeenCalled();

    // Update component with cleared state
    (useKanbanFilterStore as any).mockReturnValue({
      searchQuery: '',
      setSearchQuery: vi.fn(),
      clearSearch: mockClearSearch,
      selectedPriorities: [],
      hasActiveFilters: () => false,
    });

    rerender(<SearchFilterHeader />);

    // Clear button should disappear
    expect(screen.queryByLabelText('Limpiar búsqueda')).not.toBeInTheDocument();
  });

  // AC-1.6: Empty search shows all
  it('should show active filters indicator when filters applied', () => {
    (useKanbanFilterStore as any).mockReturnValue({
      searchQuery: 'juan',
      setSearchQuery: vi.fn(),
      clearSearch: vi.fn(),
      selectedPriorities: ['Alta', 'Urgente'],
      hasActiveFilters: () => true,
    });

    render(<SearchFilterHeader />);
    
    // Should show filters indicator
    expect(screen.getByText(/Búsqueda: "juan"/)).toBeInTheDocument();
    expect(screen.getByText(/prioridad/i)).toBeInTheDocument();
  });

  // E4-S1 FIX: Whitespace trimming (AC-6.3)
  it('should trim whitespace from search input', async () => {
    const mockSetSearchQuery = vi.fn();
    (useKanbanFilterStore as any).mockReturnValue({
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      clearSearch: vi.fn(),
      selectedPriorities: [],
      hasActiveFilters: () => false,
    });

    render(<SearchFilterHeader />);
    const input = screen.getByPlaceholderText('Buscar: nombre, empresa, email...') as HTMLInputElement;

    // Type spaces and whitespace
    fireEvent.change(input, { target: { value: '   juan   ' } });
    
    // Input should show with spaces (immediate UI feedback)
    expect(input.value).toBe('juan'); // Trimmed immediately due to .trim() in handler

    // Wait for debounce to trigger
    await waitFor(
      () => {
        // setSearchQuery should be called with trimmed value
        expect(mockSetSearchQuery).toHaveBeenCalledWith('juan');
      },
      { timeout: 400 }
    );
  });
});
