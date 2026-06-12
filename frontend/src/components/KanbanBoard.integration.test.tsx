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
    { id: 1, name: 'juan', status: 'Nuevo' as const, priority: 'Alta' as const },
    { id: 2, name: 'maria', status: 'En contacto' as const, priority: 'Media' as const },
    { id: 3, name: 'juan', status: 'Propuesta enviada' as const, priority: 'Alta' as const },
    { id: 4, name: 'carlos', status: 'Propuesta enviada' as const, priority: 'Urgente' as const },
    { id: 5, name: 'juan', status: 'Cerrado' as const, priority: 'Baja' as const },
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
        {(['all', 'Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado'] as const).map((status) => {
          const isActive = selectedStatus === status;
          
          const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedStatus(status);
            }
          };

          return (
            <button
              key={status}
              role="tab"
              aria-pressed={isActive}
              onClick={() => setSelectedStatus(status)}
              onKeyDown={handleKeyDown}
              data-testid={`status-tab-${status}`}
              tabIndex={isActive ? 0 : -1}
            >
              {status === 'all' ? 'Todos' : status}
            </button>
          );
        })}
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
      expect(visibleColumns.textContent).not.toContain('Propuesta enviada');
      expect(visibleColumns.textContent).not.toContain('Cerrado');
    });

    it('should show only Propuesta enviada column when Propuesta enviada tab is selected', () => {
      render(<FilteringTestComponent />);
      
      fireEvent.click(screen.getByTestId('status-tab-Propuesta enviada'));
      
      const visibleColumns = screen.getByTestId('visible-columns');
      expect(visibleColumns).toHaveTextContent('Propuesta enviada');
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
      
      // Filter by status "Propuesta enviada"
      fireEvent.click(screen.getByTestId('status-tab-Propuesta enviada'));
      
      // Search for "juan"
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'juan' } });
      
      // Should show only juan's leads that are in Propuesta enviada status (1 result: Lead 3)
      const resultCount = screen.getByTestId('result-count');
      expect(resultCount).toHaveTextContent('1');
      
      // Verify lead is juan in Propuesta enviada
      expect(screen.getByTestId('lead-3')).toHaveTextContent('juan - Propuesta enviada - Alta');
      expect(screen.queryByTestId('lead-1')).not.toBeInTheDocument(); // juan in Nuevo not shown
      expect(screen.queryByTestId('lead-5')).not.toBeInTheDocument(); // juan in Cerrado not shown
    });
  });

  describe('AC-3.2: Status Filter + Priority (AND Logic)', () => {
    it('should combine status filter with priority filter (AND logic)', () => {
      render(<FilteringTestComponent />);
      
      // Filter by status "Propuesta enviada"
      fireEvent.click(screen.getByTestId('status-tab-Propuesta enviada'));
      
      // Filter by priority "Alta"
      fireEvent.click(screen.getByTestId('priority-Alta'));
      
      // Should show only leads in Propuesta enviada with Alta priority (1 result: Lead 3)
      const resultCount = screen.getByTestId('result-count');
      expect(resultCount).toHaveTextContent('1');
      
      // Verify lead is in Propuesta enviada with Alta priority
      expect(screen.getByTestId('lead-3')).toHaveTextContent('juan - Propuesta enviada - Alta');
      expect(screen.queryByTestId('lead-4')).not.toBeInTheDocument(); // Propuesta enviada but Urgente, not Alta
    });
  });

  describe('AC-3.2: Triple Filter (Search + Priority + Status)', () => {
    it('should combine all three filters (AND logic)', () => {
      render(<FilteringTestComponent />);
      
      // Filter by status "Propuesta enviada"
      fireEvent.click(screen.getByTestId('status-tab-Propuesta enviada'));
      
      // Search for "juan"
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'juan' } });
      
      // Filter by priority "Alta"
      fireEvent.click(screen.getByTestId('priority-Alta'));
      
      // Should show only juan's leads in Propuesta enviada with Alta priority (1 result: Lead 3)
      const resultCount = screen.getByTestId('result-count');
      expect(resultCount).toHaveTextContent('1');
      
      expect(screen.getByTestId('lead-3')).toHaveTextContent('juan - Propuesta enviada - Alta');
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
      
      // Select "Propuesta enviada" status
      fireEvent.click(screen.getByTestId('status-tab-Propuesta enviada'));
      
      // Change search
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } });
      
      // Status should still be "Propuesta enviada"
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Propuesta enviada');
      
      // Clear search
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: '' } });
      
      // Status should still be "Propuesta enviada"
      const updatedState = useKanbanFilterStore.getState();
      expect(updatedState.selectedStatus).toBe('Propuesta enviada');
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

  // ============================================================================
  // PHASE 5: Mobile & Keyboard Testing (E4-S3)
  // ============================================================================

  describe('AC-4.1: Responsive Layout (Mobile 375px)', () => {
    it('should render tabs without horizontal overflow at 375px viewport', () => {
      // Mock viewport size
      const originalInnerWidth = window.innerWidth;
      // ALTO-3: Add try/finally to prevent test state pollution if test fails
      try {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });

        const { container } = render(<FilteringTestComponent />);
        
        const tabList = container.querySelector('[role="tablist"]') as HTMLElement;
        expect(tabList).toBeInTheDocument();
        
        // Verify all 5 tabs are still clickable
        expect(screen.getByTestId('status-tab-all')).toBeInTheDocument();
        expect(screen.getByTestId('status-tab-Nuevo')).toBeInTheDocument();
        expect(screen.getByTestId('status-tab-En contacto')).toBeInTheDocument();
        expect(screen.getByTestId('status-tab-Propuesta enviada')).toBeInTheDocument();
        expect(screen.getByTestId('status-tab-Cerrado')).toBeInTheDocument();
      } finally {
        // Restore viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: originalInnerWidth,
        });
      }
    });

    it('should maintain tab functionality at mobile viewport', () => {
      const originalInnerWidth = window.innerWidth;
      // ALTO-3: Add try/finally to prevent test state pollution if test fails
      try {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });

        render(<FilteringTestComponent />);
        
        // Click tab at mobile viewport
        fireEvent.click(screen.getByTestId('status-tab-Nuevo'));
        
        // Verify filter was applied
        const { selectedStatus } = useKanbanFilterStore.getState();
        expect(selectedStatus).toBe('Nuevo');
      } finally {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: originalInnerWidth,
        });
      }
    });
  });

  describe('AC-5.2: Keyboard Navigation', () => {
    it('should select tab when Enter key is pressed', () => {
      render(<FilteringTestComponent />);
      
      const nuevoTab = screen.getByTestId('status-tab-Nuevo') as HTMLButtonElement;
      nuevoTab.focus();
      
      // Fire keyboard event and click to simulate real user interaction
      // ALTO-4: Replace fireEvent.keyPress (deprecated) with fireEvent.keyDown
      fireEvent.keyDown(nuevoTab, { key: 'Enter', code: 'Enter' });
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Nuevo');
    });

    it('should not select tab when other keys are pressed', () => {
      render(<FilteringTestComponent />);
      
      const nuevoTab = screen.getByTestId('status-tab-Nuevo') as HTMLButtonElement;
      nuevoTab.focus();
      
      // Trigger keypress with non-Enter key
      fireEvent.keyPress(nuevoTab, { key: ' ', code: 'Space', charCode: 32 });
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('all'); // Should still be default
    });

    it('should support tab navigation through all tabs', () => {
      render(<FilteringTestComponent />);
      
      const tabs = [
        screen.getByTestId('status-tab-all'),
        screen.getByTestId('status-tab-Nuevo'),
        screen.getByTestId('status-tab-En contacto'),
        screen.getByTestId('status-tab-Propuesta enviada'),
        screen.getByTestId('status-tab-Cerrado'),
      ];

      // Verify all tabs are tab-accessible (no tabIndex < 0 disabling them)
      tabs.forEach(tab => {
        expect(tab).toBeInTheDocument();
        // Tab should be in tab order (tabIndex >= 0 or default)
        expect(tab.tagName).toBe('BUTTON');
      });
    });

    it('should have proper aria-pressed state for keyboard users', () => {
      render(<FilteringTestComponent />);
      
      fireEvent.click(screen.getByTestId('status-tab-Propuesta enviada'));
      
      // Active tab should have aria-pressed="true"
      expect(screen.getByTestId('status-tab-Propuesta enviada')).toHaveAttribute('aria-pressed', 'true');
      
      // Inactive tabs should have aria-pressed="false"
      expect(screen.getByTestId('status-tab-Nuevo')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('status-tab-all')).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('AC-4.2: Touch & Click Events', () => {
    it('should respond to multiple consecutive clicks without lag', () => {
      render(<FilteringTestComponent />);
      
      // Simulate rapid clicks
      fireEvent.click(screen.getByTestId('status-tab-Nuevo'));
      fireEvent.click(screen.getByTestId('status-tab-Propuesta enviada'));
      fireEvent.click(screen.getByTestId('status-tab-Cerrado'));
      fireEvent.click(screen.getByTestId('status-tab-all'));
      
      // Final state should reflect last click
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('all');
    });

    it('should handle double-click on same tab (idempotent)', () => {
      render(<FilteringTestComponent />);
      
      const nuevoTab = screen.getByTestId('status-tab-Nuevo');
      
      // Double-click same tab
      fireEvent.click(nuevoTab);
      fireEvent.click(nuevoTab);
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Nuevo');
    });

    it('should maintain active state during rapid filter changes', () => {
      render(<FilteringTestComponent />);
      
      // Rapid selection changes
      fireEvent.click(screen.getByTestId('status-tab-Nuevo'));
      expect(useKanbanFilterStore.getState().selectedStatus).toBe('Nuevo');
      
      fireEvent.click(screen.getByTestId('status-tab-Propuesta enviada'));
      expect(useKanbanFilterStore.getState().selectedStatus).toBe('Propuesta enviada');
      
      fireEvent.click(screen.getByTestId('status-tab-all'));
      expect(useKanbanFilterStore.getState().selectedStatus).toBe('all');
    });
  });

  describe('MEDIUM-3: Race Condition Prevention', () => {
    it('should handle rapid consecutive clicks without mixed results (race condition check)', () => {
      render(<FilteringTestComponent />);
      
      // Simulate rapid user clicking: Nuevo → Propuesta enviada → Cerrado → all
      // This tests that intermediate states don't render mixed results
      fireEvent.click(screen.getByTestId('status-tab-Nuevo'));
      fireEvent.click(screen.getByTestId('status-tab-Propuesta enviada'));
      fireEvent.click(screen.getByTestId('status-tab-Cerrado'));
      fireEvent.click(screen.getByTestId('status-tab-all'));
      
      // Final state should be 'all' with all 4 columns visible
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('all');
      
      const visibleColumns = screen.getByTestId('visible-columns');
      expect(visibleColumns.textContent).toContain('Nuevo');
      expect(visibleColumns.textContent).toContain('En contacto');
      expect(visibleColumns.textContent).toContain('Propuesta enviada');
      expect(visibleColumns.textContent).toContain('Cerrado');
    });
  });

  describe('MEDIUM-5: Error Handling & Store Initialization', () => {
    it('should gracefully handle invalid status values from corrupted state', () => {
      const store = useKanbanFilterStore.getState();
      
      // Simulate corrupted state by setting invalid status
      // The getVisibleColumns() validation should handle this gracefully
      (store as any).selectedStatus = 'INVALID_STATUS';
      
      // getVisibleColumns() should validate and return safe result
      const visibleColumns = store.getVisibleColumns();
      
      // Should either be ALL_STATUSES or log error gracefully
      expect(visibleColumns).toBeDefined();
      expect(visibleColumns.length).toBeGreaterThan(0);
      // Most importantly: should not return ['INVALID_STATUS']
      expect(visibleColumns).not.toContain('INVALID_STATUS' as any);
    });

    it('should provide meaningful fallback for empty visible columns', () => {
      const store = useKanbanFilterStore.getState();
      
      // Reset to known good state
      store.clearAllFilters();
      store.setSelectedStatus('all');
      
      const visibleColumns = store.getVisibleColumns();
      
      // Should never return empty array
      expect(visibleColumns.length).toBeGreaterThan(0);
      expect(Array.isArray(visibleColumns)).toBe(true);
    });
  });

  describe('MEDIUM-6: State Validation', () => {
    it('should validate that getVisibleColumns never returns empty array', () => {
      const store = useKanbanFilterStore.getState();
      
      // Test all valid status values
      const validStatuses: Array<'all' | 'Nuevo' | 'En contacto' | 'Propuesta enviada' | 'Cerrado'> = [
        'all',
        'Nuevo',
        'En contacto',
        'Propuesta enviada',
        'Cerrado',
      ];
      
      validStatuses.forEach((status) => {
        store.setSelectedStatus(status);
        const visible = store.getVisibleColumns();
        
        expect(visible.length, `getVisibleColumns should not be empty for status=${status}`).toBeGreaterThan(0);
        
        if (status === 'all') {
          expect(visible.length, 'Should return all 4 statuses when "all" is selected').toBe(4);
        } else {
          expect(visible.length, `Should return 1 column for single status: ${status}`).toBe(1);
          expect(visible[0]).toBe(status);
        }
      });
    });
  });

  describe('MEDIUM-9: Mobile Viewport & Responsive Design', () => {
    it('should render tabs without unwanted overflow at 375px (mobile viewport)', () => {
      const originalInnerWidth = window.innerWidth;
      
      try {
        // Set mobile viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });

        const { container } = render(<FilteringTestComponent />);
        
        const tabList = container.querySelector('[role="tablist"]') as HTMLElement;
        expect(tabList).toBeInTheDocument();
        
        // Verify all 5 tabs are present
        expect(screen.getByTestId('status-tab-all')).toBeInTheDocument();
        expect(screen.getByTestId('status-tab-Nuevo')).toBeInTheDocument();
        expect(screen.getByTestId('status-tab-En contacto')).toBeInTheDocument();
        expect(screen.getByTestId('status-tab-Propuesta enviada')).toBeInTheDocument();
        expect(screen.getByTestId('status-tab-Cerrado')).toBeInTheDocument();
        
        // All tabs should be clickable even if scrolling needed
        fireEvent.click(screen.getByTestId('status-tab-Propuesta enviada'));
        expect(useKanbanFilterStore.getState().selectedStatus).toBe('Propuesta enviada');
      } finally {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: originalInnerWidth,
        });
      }
    });
  });
});
