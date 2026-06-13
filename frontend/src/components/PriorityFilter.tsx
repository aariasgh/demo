/**
 * PriorityFilter Component — Multi-Select Priority Dropdown
 * 
 * Features:
 * - Dropdown with 4 checkbox options (Baja, Media, Alta, Urgente)
 * - Multi-select: can choose 2+ priorities
 * - Session persistence (Zustand store)
 * - "Mostrar todo" button to reset filter
 * 
 * AC Coverage:
 * - AC-3.1: 4 options displayed
 * - AC-3.2: Multiple selection works
 * - AC-3.3: Filter persists in session
 * - AC-3.4: "Mostrar todo" resets filter
 */

import { useRef, useState } from 'react';
import { useKanbanFilterStore, type LeadPriority } from '../store/kanbanFilterStore';

const PRIORITY_OPTIONS: LeadPriority[] = ['Baja', 'Media', 'Alta', 'Urgente'];

const PRIORITY_COLORS: Record<LeadPriority, string> = {
  'Baja': '#10B981',     // Green
  'Media': '#F59E0B',    // Amber
  'Alta': '#EF4444',     // Red
  'Urgente': '#8B5CF6',  // Purple
};

export default function PriorityFilter() {
  const { selectedPriorities, togglePriority, clearPriorities } = useKanbanFilterStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handlePriorityToggle = (priority: LeadPriority) => {
    togglePriority(priority);
  };

  const handleShowAll = () => {
    clearPriorities();
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef} onClick={handleClickOutside}>
      {/* Filter Button — AC-3.1: Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
        data-testid="priority-filter-button"
        aria-label="Abrir filtro de prioridad"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm font-medium">
          {selectedPriorities.length > 0
            ? `Prioridad (${selectedPriorities.length})`
            : 'Prioridad'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {/* Dropdown Menu — AC-3.1: 4 checkbox options */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Options */}
          <div className="p-4 space-y-3">
            {PRIORITY_OPTIONS.map((priority) => (
              <label key={priority} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors" data-testid={`priority-${priority.toLowerCase()}`}>
                <input
                  type="checkbox"
                  checked={selectedPriorities.includes(priority)}
                  onChange={() => handlePriorityToggle(priority)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                  aria-label={`Filtrar por prioridad ${priority}`}
                />
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: PRIORITY_COLORS[priority] }}
                    aria-hidden="true"
                  ></div>
                  <span className="text-sm font-medium">{priority}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* "Mostrar todo" Button — AC-3.4: Reset filter */}
          <button
            onClick={handleShowAll}
            className="w-full px-4 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors rounded-b-lg"
            role="menuitem"
            aria-label="Mostrar todas las prioridades"
          >
            Mostrar todo
          </button>
        </div>
      )}
    </div>
  );
}
