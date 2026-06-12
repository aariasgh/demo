/**
 * Kanban Filter Store Tests
 * Tests for Zustand state management of search and priority filters
 * 
 * Coverage:
 * - AC-3.3: Filter persists in session
 * - AC-3.4: Reset works
 * - AC-2.3: Clear search works
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useKanbanFilterStore } from './kanbanFilterStore';

describe('kanbanFilterStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useKanbanFilterStore.getState();
    store.clearAllFilters();
  });

  describe('Search State', () => {
    it('should initialize with empty search query', () => {
      const { searchQuery } = useKanbanFilterStore.getState();
      expect(searchQuery).toBe('');
    });

    it('should set search query', () => {
      const { setSearchQuery } = useKanbanFilterStore.getState();
      setSearchQuery('juan');
      const { searchQuery } = useKanbanFilterStore.getState();
      expect(searchQuery).toBe('juan');
    });

    it('should clear search query', () => {
      const { setSearchQuery, clearSearch } = useKanbanFilterStore.getState();
      setSearchQuery('juan');
      clearSearch();
      const { searchQuery } = useKanbanFilterStore.getState();
      expect(searchQuery).toBe('');
    });
  });

  describe('Priority Filter State', () => {
    it('should initialize with empty priority selection', () => {
      const { selectedPriorities } = useKanbanFilterStore.getState();
      expect(selectedPriorities).toEqual([]);
    });

    it('should add priority to selection', () => {
      const { setPriorities } = useKanbanFilterStore.getState();
      setPriorities(['Alta']);
      const { selectedPriorities } = useKanbanFilterStore.getState();
      expect(selectedPriorities).toEqual(['Alta']);
    });

    it('should set multiple priorities', () => {
      const { setPriorities } = useKanbanFilterStore.getState();
      setPriorities(['Alta', 'Urgente']);
      const { selectedPriorities } = useKanbanFilterStore.getState();
      expect(selectedPriorities).toEqual(['Alta', 'Urgente']);
    });

    it('should toggle priority on/off', () => {
      const { togglePriority } = useKanbanFilterStore.getState();
      
      togglePriority('Alta');
      let { selectedPriorities } = useKanbanFilterStore.getState();
      expect(selectedPriorities).toEqual(['Alta']);
      
      togglePriority('Urgente');
      ({ selectedPriorities } = useKanbanFilterStore.getState());
      expect(selectedPriorities).toEqual(['Alta', 'Urgente']);
      
      togglePriority('Alta');
      ({ selectedPriorities } = useKanbanFilterStore.getState());
      expect(selectedPriorities).toEqual(['Urgente']);
    });

    it('should clear all priorities', () => {
      const { setPriorities, clearPriorities } = useKanbanFilterStore.getState();
      setPriorities(['Alta', 'Media', 'Urgente']);
      clearPriorities();
      const { selectedPriorities } = useKanbanFilterStore.getState();
      expect(selectedPriorities).toEqual([]);
    });
  });

  describe('Combined Filter State', () => {
    it('should maintain search and priority independently', () => {
      const { setSearchQuery, togglePriority, clearSearch } = useKanbanFilterStore.getState();
      
      setSearchQuery('juan');
      togglePriority('Alta');
      
      let state = useKanbanFilterStore.getState();
      expect(state.searchQuery).toBe('juan');
      expect(state.selectedPriorities).toEqual(['Alta']);
      
      // Clear search but keep priority
      clearSearch();
      state = useKanbanFilterStore.getState();
      expect(state.searchQuery).toBe('');
      expect(state.selectedPriorities).toEqual(['Alta']); // AC-4.2: Filter persists
    });

    it('should clear all filters at once', () => {
      const { setSearchQuery, setPriorities, clearAllFilters } = useKanbanFilterStore.getState();
      
      setSearchQuery('juan');
      setPriorities(['Alta', 'Urgente']);
      
      clearAllFilters();
      
      const state = useKanbanFilterStore.getState();
      expect(state.searchQuery).toBe('');
      expect(state.selectedPriorities).toEqual([]);
    });
  });

  describe('Computed Helpers', () => {
    it('should return true when search is active', () => {
      const { setSearchQuery, hasActiveFilters } = useKanbanFilterStore.getState();
      setSearchQuery('juan');
      expect(hasActiveFilters()).toBe(true);
    });

    it('should return true when priority filter is active', () => {
      const { togglePriority, hasActiveFilters } = useKanbanFilterStore.getState();
      togglePriority('Alta');
      expect(hasActiveFilters()).toBe(true);
    });

    it('should return false when no filters active', () => {
      const { hasActiveFilters } = useKanbanFilterStore.getState();
      expect(hasActiveFilters()).toBe(false);
    });

    it('should return true when both search and filter active', () => {
      const { setSearchQuery, togglePriority, hasActiveFilters } = useKanbanFilterStore.getState();
      setSearchQuery('juan');
      togglePriority('Alta');
      expect(hasActiveFilters()).toBe(true);
    });
  });

  describe('Session Persistence', () => {
    it('should persist filter state across store subscriptions', () => {
      const store1 = useKanbanFilterStore.getState();
      store1.setSearchQuery('juan');
      store1.togglePriority('Alta');

      // New reference to same store (simulating different component)
      const store2 = useKanbanFilterStore.getState();
      expect(store2.searchQuery).toBe('juan'); // AC-3.3: Persists
      expect(store2.selectedPriorities).toEqual(['Alta']);
    });
  });
});

// ============================================================
// E4-S3: Status Filter State Tests
// ============================================================

describe('kanbanFilterStore - Status Filter (E4-S3)', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useKanbanFilterStore.getState();
    store.clearAllFilters();
    store.resetStatusFilter?.(); // Reset status if method exists
  });

  describe('Setting selected status', () => {
    it('should set selectedStatus to a valid status (Nuevo)', () => {
      const store = useKanbanFilterStore.getState();
      store.setSelectedStatus('Nuevo');
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Nuevo');
    });

    it('should set selectedStatus to "all"', () => {
      const store = useKanbanFilterStore.getState();
      store.setSelectedStatus('Propuesta enviada');
      store.setSelectedStatus('all');
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('all');
    });

    it('should handle multiple status changes', () => {
      const store = useKanbanFilterStore.getState();
      
      store.setSelectedStatus('Nuevo');
      let { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Nuevo');
      
      store.setSelectedStatus('En contacto');
      ({ selectedStatus } = useKanbanFilterStore.getState());
      expect(selectedStatus).toBe('En contacto');
      
      store.setSelectedStatus('Propuesta enviada');
      ({ selectedStatus } = useKanbanFilterStore.getState());
      expect(selectedStatus).toBe('Propuesta enviada');
    });
  });

  describe('Computing visible columns', () => {
    it('should return all 4 statuses when selectedStatus is "all"', () => {
      const store = useKanbanFilterStore.getState();
      store.setSelectedStatus('all');
      
      const { getVisibleColumns } = useKanbanFilterStore.getState();
      const visible = getVisibleColumns();
      expect(visible).toEqual(['Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado']);
      expect(visible.length).toBe(4);
    });

    it('should return only "Nuevo" when selectedStatus is "Nuevo"', () => {
      const store = useKanbanFilterStore.getState();
      store.setSelectedStatus('Nuevo');
      
      const { getVisibleColumns } = useKanbanFilterStore.getState();
      const visible = getVisibleColumns();
      expect(visible).toEqual(['Nuevo']);
      expect(visible.length).toBe(1);
    });

    it('should return only "Propuesta enviada" when selectedStatus is "Propuesta enviada"', () => {
      const store = useKanbanFilterStore.getState();
      store.setSelectedStatus('Propuesta enviada');
      
      const { getVisibleColumns } = useKanbanFilterStore.getState();
      const visible = getVisibleColumns();
      expect(visible).toEqual(['Propuesta enviada']);
      expect(visible.length).toBe(1);
    });
  });

  describe('Status filter persistence', () => {
    it('should persist selectedStatus across search changes (AC-2.4)', () => {
      const store = useKanbanFilterStore.getState();
      
      store.setSelectedStatus('Propuesta enviada');
      store.setSearchQuery('juan');
      store.setSearchQuery('maria');
      store.clearSearch();
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Propuesta enviada');
    });

    it('should not affect search query when status changes', () => {
      const store = useKanbanFilterStore.getState();
      
      store.setSearchQuery('juan');
      store.setSelectedStatus('Propuesta enviada');
      
      const { searchQuery, selectedStatus } = useKanbanFilterStore.getState();
      expect(searchQuery).toBe('juan');
      expect(selectedStatus).toBe('Propuesta enviada');
    });

    it('should not affect priority filters when status changes', () => {
      const store = useKanbanFilterStore.getState();
      
      store.setPriorities(['Alta']);
      store.setSelectedStatus('Propuesta enviada');
      
      const { selectedPriorities, selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedPriorities).toEqual(['Alta']);
      expect(selectedStatus).toBe('Propuesta enviada');
    });
  });

  describe('Triple filter combination', () => {
    it('should work with search + priority + status filters (AC-3.2)', () => {
      const store = useKanbanFilterStore.getState();
      
      store.setSearchQuery('juan');
      store.setPriorities(['Alta']);
      store.setSelectedStatus('Propuesta enviada');
      
      const { searchQuery, selectedPriorities, selectedStatus } = useKanbanFilterStore.getState();
      expect(searchQuery).toBe('juan');
      expect(selectedPriorities).toEqual(['Alta']);
      expect(selectedStatus).toBe('Propuesta enviada');
    });
  });
});
