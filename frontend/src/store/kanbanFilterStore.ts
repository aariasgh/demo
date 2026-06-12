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
import type { LeadStatus, LeadPriority } from '../types/lead';

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

const ALL_STATUSES: LeadStatus[] = ['Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado'];

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
    // CRÍTICO-3: Add validation to prevent silent failures from corrupted state
    if (state.selectedStatus !== 'all' && !ALL_STATUSES.includes(state.selectedStatus)) {
      console.error(`[KanbanFilterStore] Invalid selectedStatus: "${state.selectedStatus}". Falling back to "all".`);
      return ALL_STATUSES;
    }
    if (state.selectedStatus === 'all') {
      return ALL_STATUSES;
    }
    return [state.selectedStatus];
  },

  /**
   * MEDIUM-7: Reset status filter only (clears status tab selection)
   * 
   * Use case: User clicks "Clear Status Filter" button while keeping search/priority active
   * Difference from clearAllFilters():
   *   - resetStatusFilter() → Only sets selectedStatus='all', preserves search & priority
   *   - clearAllFilters() → Clears ALL filters (search, priority, status)
   * 
   * @example
   * // User has: search="juan" + priority=["Alta"] + status="Nuevo"
   * store.resetStatusFilter();
   * // Result: search="juan" + priority=["Alta"] + status="all"
   */
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

// Re-export types for convenience
export type { LeadPriority, LeadStatus };
