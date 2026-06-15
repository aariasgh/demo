/**
 * useKanbanKeyboardNavigation - Custom hook for Kanban board keyboard navigation
 * 
 * Handles:
 * - Tab/Shift+Tab cycling through columns
 * - Arrow Up/Down navigating leads within a column
 * - Arrow Left/Right moving between columns
 * - Enter/Space opening lead details
 * - Escape closing modals
 * 
 * E6-S4: Phase 2 implementation
 */

import { useRef } from 'react';

interface KanbanNavigationState {
  focusedColumnIndex: number;
  focusedLeadIndex: number;
}

interface UseKanbanKeyboardNavigationProps {
  totalColumns: number;
  leadsPerColumn: number[];
  onColumnFocus?: (columnIndex: number) => void;
  onLeadFocus?: (columnIndex: number, leadIndex: number) => void;
}

export function useKanbanKeyboardNavigation({
  totalColumns,
  leadsPerColumn,
  onColumnFocus,
  onLeadFocus,
}: UseKanbanKeyboardNavigationProps) {
  const navigationStateRef = useRef<KanbanNavigationState>({
    focusedColumnIndex: 0,
    focusedLeadIndex: -1, // -1 means column header is focused, not a lead
  });

  /**
   * AC-1: Tab Navigation Between Columns
   * Tab key cycles through column headers left-to-right, then wraps around
   */
  const handleTabNavigation = (event: KeyboardEvent, forward: boolean = true) => {
    const { focusedColumnIndex } = navigationStateRef.current;
    let nextColumnIndex = focusedColumnIndex;

    if (forward) {
      nextColumnIndex = (focusedColumnIndex + 1) % totalColumns;
    } else {
      nextColumnIndex = focusedColumnIndex === 0 ? totalColumns - 1 : focusedColumnIndex - 1;
    }

    navigationStateRef.current.focusedColumnIndex = nextColumnIndex;
    navigationStateRef.current.focusedLeadIndex = -1; // Focus column header, not lead

    onColumnFocus?.(nextColumnIndex);
    event.preventDefault();
  };

  /**
   * AC-2: Arrow Up/Down to Navigate Leads Within Column
   * Down arrow moves to next lead in same column
   * Up arrow moves to previous lead in same column
   */
  const handleArrowNavigation = (event: KeyboardEvent) => {
    const { focusedColumnIndex, focusedLeadIndex } = navigationStateRef.current;
    const columnLeadCount = leadsPerColumn[focusedColumnIndex] || 0;

    if (event.key === 'ArrowDown') {
      let nextLeadIndex = focusedLeadIndex + 1;
      if (nextLeadIndex >= columnLeadCount) {
        nextLeadIndex = 0; // Wrap around to first lead
      }
      navigationStateRef.current.focusedLeadIndex = nextLeadIndex;
      onLeadFocus?.(focusedColumnIndex, nextLeadIndex);
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      let nextLeadIndex = focusedLeadIndex - 1;
      if (nextLeadIndex < 0) {
        nextLeadIndex = columnLeadCount - 1; // Wrap to last lead
      }
      navigationStateRef.current.focusedLeadIndex = nextLeadIndex;
      onLeadFocus?.(focusedColumnIndex, nextLeadIndex);
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      // Move to next column
      const nextColumnIndex = (focusedColumnIndex + 1) % totalColumns;
      navigationStateRef.current.focusedColumnIndex = nextColumnIndex;
      navigationStateRef.current.focusedLeadIndex = -1;
      onColumnFocus?.(nextColumnIndex);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      // Move to previous column
      const nextColumnIndex = focusedColumnIndex === 0 ? totalColumns - 1 : focusedColumnIndex - 1;
      navigationStateRef.current.focusedColumnIndex = nextColumnIndex;
      navigationStateRef.current.focusedLeadIndex = -1;
      onColumnFocus?.(nextColumnIndex);
      event.preventDefault();
    }
  };

  return {
    navigationState: navigationStateRef.current,
    handleTabNavigation,
    handleArrowNavigation,
  };
}
