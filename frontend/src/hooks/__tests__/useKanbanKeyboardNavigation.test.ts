/**
 * useKanbanKeyboardNavigation hook tests
 * Tests arrow key navigation and tab cycling through columns
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKanbanKeyboardNavigation } from '../useKanbanKeyboardNavigation';

describe('useKanbanKeyboardNavigation Hook', () => {
  let mockOnColumnFocus: any;
  let mockOnLeadFocus: any;

  beforeEach(() => {
    mockOnColumnFocus = vi.fn();
    mockOnLeadFocus = vi.fn();
  });

  describe('Tab Navigation Between Columns', () => {
    it('should cycle to next column on Tab', () => {
      const { result } = renderHook(() =>
        useKanbanKeyboardNavigation({
          totalColumns: 4,
          leadsPerColumn: [2, 1, 0, 0],
          onColumnFocus: mockOnColumnFocus,
        })
      );

      act(() => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        result.current.handleTabNavigation(mockEvent, true);
      });

      expect(result.current.navigationState.focusedColumnIndex).toBe(1);
      expect(mockOnColumnFocus).toHaveBeenCalledWith(1);
    });

    it('should wrap around to first column after last column', () => {
      const { result } = renderHook(() =>
        useKanbanKeyboardNavigation({
          totalColumns: 4,
          leadsPerColumn: [2, 1, 0, 0],
          onColumnFocus: mockOnColumnFocus,
        })
      );

      // Simulate being on last column (index 3)
      act(() => {
        result.current.navigationState.focusedColumnIndex = 3;
        const mockEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        result.current.handleTabNavigation(mockEvent, true);
      });

      expect(result.current.navigationState.focusedColumnIndex).toBe(0);
    });

    it('should go to previous column on Shift+Tab', () => {
      const { result } = renderHook(() =>
        useKanbanKeyboardNavigation({
          totalColumns: 4,
          leadsPerColumn: [2, 1, 0, 0],
          onColumnFocus: mockOnColumnFocus,
        })
      );

      // Start at column 2
      act(() => {
        result.current.navigationState.focusedColumnIndex = 2;
        const mockEvent = new KeyboardEvent('keydown', { key: 'Shift+Tab' });
        result.current.handleTabNavigation(mockEvent, false);
      });

      expect(result.current.navigationState.focusedColumnIndex).toBe(1);
    });
  });

  describe('Arrow Key Navigation Within Columns', () => {
    it('should navigate down to next lead in column', () => {
      const { result } = renderHook(() =>
        useKanbanKeyboardNavigation({
          totalColumns: 4,
          leadsPerColumn: [3, 1, 0, 0],
          onLeadFocus: mockOnLeadFocus,
        })
      );

      act(() => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        mockEvent.preventDefault = vi.fn();
        result.current.handleArrowNavigation(mockEvent);
      });

      expect(result.current.navigationState.focusedLeadIndex).toBe(0);
      expect(mockOnLeadFocus).toHaveBeenCalledWith(0, 0);
    });

    it('should navigate up to previous lead in column', () => {
      const { result } = renderHook(() =>
        useKanbanKeyboardNavigation({
          totalColumns: 4,
          leadsPerColumn: [3, 1, 0, 0],
          onLeadFocus: mockOnLeadFocus,
        })
      );

      act(() => {
        result.current.navigationState.focusedLeadIndex = 1;
        const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        mockEvent.preventDefault = vi.fn();
        result.current.handleArrowNavigation(mockEvent);
      });

      expect(result.current.navigationState.focusedLeadIndex).toBe(0);
    });

    it('should wrap around to last lead when going up from first lead', () => {
      const { result } = renderHook(() =>
        useKanbanKeyboardNavigation({
          totalColumns: 4,
          leadsPerColumn: [3, 1, 0, 0],
          onLeadFocus: mockOnLeadFocus,
        })
      );

      act(() => {
        result.current.navigationState.focusedLeadIndex = 0;
        const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        mockEvent.preventDefault = vi.fn();
        result.current.handleArrowNavigation(mockEvent);
      });

      expect(result.current.navigationState.focusedLeadIndex).toBe(2); // Last lead in column with 3 leads
    });

    it('should move to next column on ArrowRight', () => {
      const { result } = renderHook(() =>
        useKanbanKeyboardNavigation({
          totalColumns: 4,
          leadsPerColumn: [2, 1, 0, 0],
          onColumnFocus: mockOnColumnFocus,
        })
      );

      act(() => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        mockEvent.preventDefault = vi.fn();
        result.current.handleArrowNavigation(mockEvent);
      });

      expect(result.current.navigationState.focusedColumnIndex).toBe(1);
      expect(result.current.navigationState.focusedLeadIndex).toBe(-1);
    });

    it('should move to previous column on ArrowLeft', () => {
      const { result } = renderHook(() =>
        useKanbanKeyboardNavigation({
          totalColumns: 4,
          leadsPerColumn: [2, 1, 0, 0],
          onColumnFocus: mockOnColumnFocus,
        })
      );

      act(() => {
        result.current.navigationState.focusedColumnIndex = 2;
        const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        mockEvent.preventDefault = vi.fn();
        result.current.handleArrowNavigation(mockEvent);
      });

      expect(result.current.navigationState.focusedColumnIndex).toBe(1);
    });
  });

  describe('Navigation State Management', () => {
    it('should track focused column and lead indices', () => {
      const { result } = renderHook(() =>
        useKanbanKeyboardNavigation({
          totalColumns: 4,
          leadsPerColumn: [2, 1, 0, 0],
        })
      );

      expect(result.current.navigationState.focusedColumnIndex).toBe(0);
      expect(result.current.navigationState.focusedLeadIndex).toBe(-1);
    });

    it('should reset lead focus to -1 when changing columns', () => {
      const { result } = renderHook(() =>
        useKanbanKeyboardNavigation({
          totalColumns: 4,
          leadsPerColumn: [2, 1, 0, 0],
          onColumnFocus: mockOnColumnFocus,
        })
      );

      act(() => {
        result.current.navigationState.focusedLeadIndex = 1;
        const mockEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        result.current.handleTabNavigation(mockEvent, true);
      });

      // After tab, lead focus should be reset
      expect(result.current.navigationState.focusedLeadIndex).toBe(-1);
    });
  });
});
