/**
 * Kanban Filter Store — Search + Priority Filter State
 * Manages search query and priority filter selection
 * Persists filter selection in session (not localStorage to avoid stale data)
 * 
 * State:
 * - searchQuery: Current search text (debounced externally)
 * - selectedPriorities: Array of selected priority filters
 * 
 * E4-S1 Implementation for Search Box + Priority Filter functionality
 */

import { create } from 'zustand';

export type LeadPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';

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

  // Combined reset
  clearAllFilters: () => void;

  // Computed: Check if any filter is active
  hasActiveFilters: () => boolean;
}

export const useKanbanFilterStore = create<KanbanFilterState>((set, get) => ({
  // Initial state
  searchQuery: '',
  selectedPriorities: [],

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

  // Combined reset
  clearAllFilters: () =>
    set({ searchQuery: '', selectedPriorities: [] }),

  // Computed helpers
  hasActiveFilters: () => {
    const state = get();
    return state.searchQuery !== '' || state.selectedPriorities.length > 0;
  },
}));
