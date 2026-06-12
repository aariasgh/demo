/**
 * Kanban Filter Store — Search + Priority Filter + Status Filter State
 * Manages search query, priority filter, and status filter selection
 * Persists filter selection in session (not localStorage to avoid stale data)
 * 
 * State:
 * - searchQuery: Current search text (debounced externally)
 * - selectedPriorities: Array of selected priority filters
 * - selectedStatus: Current status filter (E4-S3 implementation)
 * 
 * E4-S1 Implementation: Search Box + Priority Filter functionality
 * E4-S3 Implementation: Status Filter Tabs functionality
 */

import { create } from 'zustand';

export type LeadPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';
export type LeadStatus = 'Nuevo' | 'En contacto' | 'Propuesta' | 'Cerrado';

interface KanbanFilterState {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Priority filter state
  selectedPriorities: LeadPriority[];
  setPriorities: (priorities: LeadPriority[]) => void;
  togglePriority: (priority: LeadPriority) => void;
  clearPriorities: () => void;

  // Status filter state (E4-S3)
  selectedStatus: LeadStatus | 'all';
  setSelectedStatus: (status: LeadStatus | 'all') => void;
  getVisibleColumns: () => LeadStatus[];
  resetStatusFilter: () => void;

  // Combined reset
  clearAllFilters: () => void;

  // Computed: Check if any filter is active
  hasActiveFilters: () => boolean;
}

const ALL_STATUSES: LeadStatus[] = ['Nuevo', 'En contacto', 'Propuesta', 'Cerrado'];

export const useKanbanFilterStore = create<KanbanFilterState>((set, get) => ({
  // Initial state
  searchQuery: '',
  selectedPriorities: [],
  selectedStatus: 'all',  // E4-S3: Start with "all" (show all columns)

  // Search actions
  setSearchQuery: (query: string) =>
    set({ searchQuery: query }),

  clearSearch: () =>
    set({ searchQuery: '' }),

  // Priority filter actions
  setPriorities: (priorities: LeadPriority[]) =>
    set({ selectedPriorities: priorities }),

  togglePriority: (priority: LeadPriority) =>
    set((state) => {
      const isSelected = state.selectedPriorities.includes(priority);
      return {
        selectedPriorities: isSelected
          ? state.selectedPriorities.filter((p) => p !== priority)
          : [...state.selectedPriorities, priority],
      };
    }),

  clearPriorities: () =>
    set({ selectedPriorities: [] }),

  // Status filter actions (E4-S3)
  setSelectedStatus: (status: LeadStatus | 'all') =>
    set({ selectedStatus: status }),

  getVisibleColumns: () => {
    const state = get();
    if (state.selectedStatus === 'all') {
      return ALL_STATUSES;
    }
    return [state.selectedStatus];
  },

  resetStatusFilter: () =>
    set({ selectedStatus: 'all' }),

  // Combined reset
  clearAllFilters: () =>
    set({ 
      searchQuery: '', 
      selectedPriorities: [],
      selectedStatus: 'all'  // E4-S3: Reset status filter too
    }),

  // Computed helpers
  hasActiveFilters: () => {
    const state = get();
    return (
      state.searchQuery !== '' || 
      state.selectedPriorities.length > 0 ||
      state.selectedStatus !== 'all'  // E4-S3: Check if status filter is active
    );
  },
}));
