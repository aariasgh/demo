/**
 * PriorityFilter Tests
 * Tests for priority filter dropdown with multi-select
 * 
 * Coverage:
 * - AC-3.1: 4 options displayed (Baja, Media, Alta, Urgente)
 * - AC-3.2: Multiple selection works
 * - AC-3.3: Filter persists in session
 * - AC-3.4: "Mostrar todo" resets filter
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PriorityFilter from './PriorityFilter';
import { useKanbanFilterStore } from '../store/kanbanFilterStore';

vi.mock('../store/kanbanFilterStore');

describe('PriorityFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useKanbanFilterStore as any).mockReturnValue({
      selectedPriorities: [],
      togglePriority: vi.fn(),
      clearPriorities: vi.fn(),
    });
  });

  // AC-3.1: 4 options displayed
  it('should display all 4 priority options when dropdown opened', () => {
    render(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad');
    fireEvent.click(filterButton);

    expect(screen.getByLabelText(/Filtrar por prioridad Baja/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filtrar por prioridad Media/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filtrar por prioridad Alta/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filtrar por prioridad Urgente/)).toBeInTheDocument();
  });

  // AC-3.2: Multiple selection works
  it('should toggle priority selection on checkbox click', () => {
    const mockToggle = vi.fn();
    (useKanbanFilterStore as any).mockReturnValue({
      selectedPriorities: [],
      togglePriority: mockToggle,
      clearPriorities: vi.fn(),
    });

    render(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad');
    fireEvent.click(filterButton);

    const altaCheckbox = screen.getByLabelText(/Filtrar por prioridad Alta/) as HTMLInputElement;
    fireEvent.click(altaCheckbox);

    expect(mockToggle).toHaveBeenCalledWith('Alta');
  });

  // AC-3.2: Multiple selection
  it('should allow multiple priority selections', () => {
    (useKanbanFilterStore as any).mockReturnValue({
      selectedPriorities: ['Alta', 'Urgente'],
      togglePriority: vi.fn(),
      clearPriorities: vi.fn(),
    });

    render(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad');
    fireEvent.click(filterButton);

    // Both should be checked
    expect((screen.getByLabelText(/Filtrar por prioridad Alta/) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Filtrar por prioridad Urgente/) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Filtrar por prioridad Media/) as HTMLInputElement).checked).toBe(false);
  });

  // AC-3.3: Filter persists in session (store)
  it('should maintain selected priorities in Zustand store', () => {
    const mockToggle = vi.fn();
    const { rerender } = render(<PriorityFilter />);

    // Simulate store update
    (useKanbanFilterStore as any).mockReturnValue({
      selectedPriorities: ['Alta'],
      togglePriority: mockToggle,
      clearPriorities: vi.fn(),
    });

    rerender(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad');
    fireEvent.click(filterButton);

    expect((screen.getByLabelText(/Filtrar por prioridad Alta/) as HTMLInputElement).checked).toBe(true);
  });

  // AC-3.4: "Mostrar todo" resets filter
  it('should clear all priorities when "Mostrar todo" clicked', () => {
    const mockClear = vi.fn();
    (useKanbanFilterStore as any).mockReturnValue({
      selectedPriorities: ['Alta', 'Urgente'],
      togglePriority: vi.fn(),
      clearPriorities: mockClear,
    });

    render(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad');
    fireEvent.click(filterButton);

    const mostrarTodoButton = screen.getByLabelText('Mostrar todas las prioridades');
    fireEvent.click(mostrarTodoButton);

    expect(mockClear).toHaveBeenCalled();
  });

  // UI: Filter button shows count
  it('should display count of selected priorities in button', () => {
    (useKanbanFilterStore as any).mockReturnValue({
      selectedPriorities: ['Alta', 'Urgente'],
      togglePriority: vi.fn(),
      clearPriorities: vi.fn(),
    });

    render(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad');
    expect(filterButton).toHaveTextContent('Prioridad (2)');
  });

  // UI: Dropdown toggle
  it('should open and close dropdown on button click', () => {
    render(<PriorityFilter />);

    const filterButton = screen.getByLabelText('Abrir filtro de prioridad');

    // Initially closed
    expect(screen.queryByLabelText(/Filtrar por prioridad Baja/)).not.toBeInTheDocument();

    // Open
    fireEvent.click(filterButton);
    expect(screen.getByLabelText(/Filtrar por prioridad Baja/)).toBeInTheDocument();

    // Close
    fireEvent.click(filterButton);
    expect(screen.queryByLabelText(/Filtrar por prioridad Baja/)).not.toBeInTheDocument();
  });
});
