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
