/**
 * SearchFilterHeader Component — Search Box + Priority Filter
 * Sticky header above Kanban for filtering leads in real-time
 * 
 * Features:
 * - Search box with 300ms debounce (3 fields: name, company, email)
 * - Priority filter dropdown (multi-select: Baja, Media, Alta, Urgente)
 * - Clear buttons (X for search, "Mostrar todo" for filter)
 * - Case-insensitive search
 * - Responsive design (mobile-first)
 * 
 * AC Coverage:
 * - AC-1.1 to AC-1.6: Search Box functionality
 * - AC-3.1 to AC-3.5: Priority Filter functionality
 * - AC-5.2: Smooth typing (no lag)
 */

import { useState, useEffect, useRef } from 'react';
import { useKanbanFilterStore } from '../store/kanbanFilterStore';
import { registerKeyboardHandler, unregisterKeyboardHandler } from '../hooks/useKeyboardNavigation';
import PriorityFilter from './PriorityFilter';

export default function SearchFilterHeader() {
  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    selectedPriorities,
    hasActiveFilters,
  } = useKanbanFilterStore();

  // E6-S4 Phase 3: Ref for keyboard focus (/ shortcut)
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Local input state for immediate UI feedback
  const [inputValue, setInputValue] = useState(searchQuery);

  // Debounce timer: local input → store (unidirectional)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300); // 300ms debounce per AC-1.5

    return () => clearTimeout(timer);
  }, [inputValue, setSearchQuery]);

  // E6-S4 Phase 3: Register "/" keyboard shortcut for search focus
  useEffect(() => {
    registerKeyboardHandler('onFocusSearch', () => {
      searchInputRef.current?.focus();
    });

    return () => {
      unregisterKeyboardHandler('onFocusSearch');
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // E4-S1 FIX: Trim whitespace to avoid silent filtering when user types spaces
    setInputValue(e.currentTarget.value.trim());
  };

  const handleClearSearch = () => {
    setInputValue('');
    clearSearch();
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm" role="region" aria-label="Barra de búsqueda y filtros">
      <div className="px-4 md:px-6 py-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center">
          {/* Search Box — AC-1.1: Sticky header, AC-1.2: Placeholder */}
          <div className="flex-1 relative">
            <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar leads
            </label>
            <input
              ref={searchInputRef}
              id="search-input"
              type="text"
              placeholder="Nombre, empresa o email..."
              value={inputValue}
              onChange={handleInputChange}
              data-testid="search-input"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 focus:border-transparent transition-all"
              aria-label="Buscar leads por nombre, empresa o email (presiona / para enfocar)"
              aria-describedby="search-description"
            />
            <p id="search-description" className="text-xs text-gray-500 mt-1">
              Busca en nombre, empresa o email (en tiempo real)
            </p>
            {/* Clear Button — AC-2.3: Clear button (X) */}
            {inputValue && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 focus:outline-2 focus:outline-blue-500 rounded"
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
                type="button"
              >
                ✕
              </button>
            )}
          </div>

          {/* Priority Filter — AC-3.1 to AC-3.5 */}
          <PriorityFilter />
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters() && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              {selectedPriorities.length > 0 && (
                <span>{selectedPriorities.length} prioridad{selectedPriorities.length !== 1 ? 'es' : ''}</span>
              )}
              {searchQuery && (
                <span className="ml-2">
                  Búsqueda: "{searchQuery}"
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
