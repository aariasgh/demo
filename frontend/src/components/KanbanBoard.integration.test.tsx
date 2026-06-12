/**
 * KanbanBoard Integration Tests — E4-S3 Status Filter
 * 
 * Tests for status filter integration with KanbanBoard:
 * - Status tabs render and filter columns
 * - Status filter combines with search + priority (AND logic)
 * - Column visibility updates when status changes
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useKanbanFilterStore } from '../store/kanbanFilterStore';

// Mock component for testing filtering logic without full KanbanBoard complexity
function FilteringTestComponent() {
  const { selectedStatus, searchQuery, selectedPriorities, getVisibleColumns, setSelectedStatus, setSearchQuery, setPriorities } = useKanbanFilterStore();

  const mockLeads = [
    { id: 1, name: 'juan', status: 'Nuevo' as const, priority: 'Alta' },
    { id: 2, name: 'maria', status: 'En contacto' as const, priority: 'Media' },
    { id: 3, name: 'juan', status: 'Propuesta' as const, priority: 'Alta' },
    { id: 4, name: 'carlos', status: 'Propuesta' as const, priority: 'Urgente' },
    { id: 5, name: 'juan', status: 'Cerrado' as const, priority: 'Baja' },
  ];

  // Filter leads by all 3 criteria (search AND priority AND status)
  const visibleColumns = getVisibleColumns();
  const filteredLeads = mockLeads.filter(lead => {
    // Search filter
    const searchMatch = searchQuery === '' || lead.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Priority filter
    const priorityMatch = selectedPriorities.length === 0 || selectedPriorities.includes(lead.priority);
    
    // Status filter - column must be visible
    const statusMatch = visibleColumns.includes(lead.status);
    
    return searchMatch && priorityMatch && statusMatch;
  });

  return (
    <div>
      {/* Status Filter Tabs */}
      <div role="tablist" aria-label="Filter by status">
        {(['all', 'Nuevo', 'En contacto', 'Propuesta', 'Cerrado'] as const).map((status) => (
          <button
            key={status}
            role="tab"
            aria-pressed={selectedStatus === status}
            onClick={() => setSelectedStatus(status)}
            data-testid={`status-tab-${status}`}
          >
            {status === 'all' ? 'Todos' : status}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        data-testid="search-input"
      />

      {/* Priority Filter */}
      {(['Baja', 'Media', 'Alta', 'Urgente'] as const).map((priority) => (
        <label key={priority}>
          <input
            type="checkbox"
            checked={selectedPriorities.includes(priority)}
            onChange={(e) => {
              if (e.target.checked) {
                setPriorities([...selectedPriorities, priority]);
              } else {
                setPriorities(selectedPriorities.filter(p => p !== priority));
              }
            }}
            data-testid={`priority-${priority}`}
          />
          {priority}
        </label>
      ))}

      {/* Results */}
      <div data-testid="filtered-results">
        <div data-testid="visible-columns">{visibleColumns.join(', ')}</div>
        <div data-testid="result-count">{filteredLeads.length}</div>
        <ul data-testid="leads-list">
          {filteredLeads.map(lead => (
            <li key={lead.id} data-testid={`lead-${lead.id}`}>
              {lead.name} - {lead.status} - {lead.priority}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

describe('KanbanBoard Integration - E4-S3 Status Filter', () => {
  beforeEach(() => {
    useKanbanFilterStore.getState().clearAllFilters();
  });

  describe('AC-2.1: Status Filter Shows Single Column', () => {
    it('should show only Nuevo column when Nuevo tab is selected', () => {
      render(<FilteringTestComponent />);
      
      fireEvent.click(screen.getByTestId('status-tab-Nuevo'));
      
      const visibleColumns = screen.getByTestId('visible-columns');
      expect(visibleColumns).toHaveTextContent('Nuevo');
      expect(visibleColumns.textContent).not.toContain('En contacto');
      expect(visibleColumns.textContent).not.toContain('Propuesta');
      expect(visibleColumns.textContent).not.toContain('Cerrado');
    });

    it('should show only Propuesta column when Propuesta tab is selected', () => {
      render(<FilteringTestComponent />);
      
      fireEvent.click(screen.getByTestId('status-tab-Propuesta'));
      
      const visibleColumns = screen.getByTestId('visible-columns');
      expect(visibleColumns).toHaveTextContent('Propuesta');
    });
  });

  describe('AC-2.2: Status Filter Shows All Columns', () => {
    it('should show all 4 columns when Todos tab is selected', () => {
      render(<FilteringTestComponent />);
      
      // Select single status first
      fireEvent.click(screen.getByTestId('status-tab-Nuevo'));
      
      // Then click Todos to show all
      fireEvent.click(screen.getByTestId('status-tab-all'));
      
      const visibleColumns = screen.getByTestId('visible-columns');
      expect(visibleColumns.textContent).toContain('Nuevo');
      expect(visibleColumns.textContent).toContain('En contacto');
      expect(visibleColumns.textContent).toContain('Propuesta');
      expect(visibleColumns.textContent).toContain('Cerrado');
    });
  });

  describe('AC-3.1: Status Filter + Search (AND Logic)', () => {
    it('should combine status filter with search (AND logic)', () => {
      render(<FilteringTestComponent />);
      
      // Filter by status "Propuesta"
      fireEvent.click(screen.getByTestId('status-tab-Propuesta'));
      
      // Search for "juan"
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'juan' } });
      
      // Should show only juan's leads that are in Propuesta status (1 result: Lead 3)
      const resultCount = screen.getByTestId('result-count');
      expect(resultCount).toHaveTextContent('1');
      
      // Verify lead is juan in Propuesta
      expect(screen.getByTestId('lead-3')).toHaveTextContent('juan - Propuesta');
      expect(screen.queryByTestId('lead-1')).not.toBeInTheDocument(); // juan in Nuevo not shown
      expect(screen.queryByTestId('lead-5')).not.toBeInTheDocument(); // juan in Cerrado not shown
    });
  });

  describe('AC-3.2: Status Filter + Priority (AND Logic)', () => {
    it('should combine status filter with priority filter (AND logic)', () => {
      render(<FilteringTestComponent />);
      
      // Filter by status "Propuesta"
      fireEvent.click(screen.getByTestId('status-tab-Propuesta'));
      
      // Filter by priority "Alta"
      fireEvent.click(screen.getByTestId('priority-Alta'));
      
      // Should show only leads in Propuesta with Alta priority (1 result: Lead 3)
      const resultCount = screen.getByTestId('result-count');
      expect(resultCount).toHaveTextContent('1');
      
      // Verify lead is in Propuesta with Alta priority
      expect(screen.getByTestId('lead-3')).toHaveTextContent('juan - Propuesta - Alta');
      expect(screen.queryByTestId('lead-4')).not.toBeInTheDocument(); // Propuesta but Urgente, not Alta
    });
  });

  describe('AC-3.2: Triple Filter (Search + Priority + Status)', () => {
    it('should combine all three filters (AND logic)', () => {
      render(<FilteringTestComponent />);
      
      // Filter by status "Propuesta"
      fireEvent.click(screen.getByTestId('status-tab-Propuesta'));
      
      // Search for "juan"
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'juan' } });
      
      // Filter by priority "Alta"
      fireEvent.click(screen.getByTestId('priority-Alta'));
      
      // Should show only juan's leads in Propuesta with Alta priority (1 result: Lead 3)
      const resultCount = screen.getByTestId('result-count');
      expect(resultCount).toHaveTextContent('1');
      
      expect(screen.getByTestId('lead-3')).toHaveTextContent('juan - Propuesta - Alta');
    });

    it('should return 0 results when filters have no intersection', () => {
      render(<FilteringTestComponent />);
      
      // Filter by status "Nuevo"
      fireEvent.click(screen.getByTestId('status-tab-Nuevo'));
      
      // Search for "carlos" (who is only in Propuesta, not Nuevo)
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'carlos' } });
      
      // Should show 0 results
      const resultCount = screen.getByTestId('result-count');
      expect(resultCount).toHaveTextContent('0');
      
      const leadsList = screen.getByTestId('leads-list');
      expect(leadsList.children.length).toBe(0);
    });
  });

  describe('AC-2.4: Status Filter Persistence', () => {
    it('should persist status filter when search changes', () => {
      render(<FilteringTestComponent />);
      
      // Select "Propuesta" status
      fireEvent.click(screen.getByTestId('status-tab-Propuesta'));
      
      // Change search
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } });
      
      // Status should still be "Propuesta"
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Propuesta');
      
      // Clear search
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: '' } });
      
      // Status should still be "Propuesta"
      const updatedState = useKanbanFilterStore.getState();
      expect(updatedState.selectedStatus).toBe('Propuesta');
    });
  });

  describe('AC-4.2: Touch Support', () => {
    it('should handle click events on tabs (simulating touch)', () => {
      render(<FilteringTestComponent />);
      
      const nuevoTab = screen.getByTestId('status-tab-Nuevo');
      fireEvent.click(nuevoTab);
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Nuevo');
    });
  });

  describe('AC-5.1: Empty Results Display', () => {
    it('should show 0 results when filters result in no matches', () => {
      render(<FilteringTestComponent />);
      
      // Filter by status "En contacto" (only maria is there)
      fireEvent.click(screen.getByTestId('status-tab-En contacto'));
      
      // Search for "john" (doesn't exist)
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'john' } });
      
      // Should show 0 results
      const resultCount = screen.getByTestId('result-count');
      expect(resultCount).toHaveTextContent('0');
    });
  });
});
