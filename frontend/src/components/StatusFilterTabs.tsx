/**
 * StatusFilterTabs Component
 * E4-S3: Filtro por Status en Kanban Frontend
 * 
 * Renders 5 status filter tabs: [Todos] [Nuevo] [En contacto] [Propuesta] [Cerrado]
 * - AC-1.1: Tabs appear in Kanban header (sticky)
 * - AC-1.2: 5 tabs for all statuses
 * - AC-1.3: "Todos" pre-selected by default
 * - AC-1.4: Active tab has visual indicator (underline + color)
 * - AC-2.1-2.4: Click filtering + idempotency
 * - AC-4.2: Touch support via React onClick
 * - BAJO-13: Tab descriptions for screen readers
 */

import { useKanbanFilterStore, type LeadStatus } from '../store/kanbanFilterStore';

const TABS = [
  { value: 'all' as const, label: 'Todos', index: 0, description: 'Mostrar todos los leads sin filtrar' },
  { value: 'Nuevo' as const, label: 'Nuevo', index: 1, description: 'Mostrar solo leads en estado Nuevo' },
  { value: 'En contacto' as const, label: 'En contacto', index: 2, description: 'Mostrar solo leads en estado En contacto' },
  { value: 'Propuesta enviada' as const, label: 'Propuesta', index: 3, description: 'Mostrar solo leads en estado Propuesta enviada' },  // CRÍTICO-2: Fixed backend mismatch ('Propuesta enviada')
  { value: 'Cerrado' as const, label: 'Cerrado', index: 4, description: 'Mostrar solo leads en estado Cerrado' },
];

export default function StatusFilterTabs() {
  const { selectedStatus, setSelectedStatus } = useKanbanFilterStore();

  // AC-2.1: Handle tab click (idempotent - clicking active tab does nothing)
  // BAJO-14: Track filter usage analytics
  const handleTabClick = (status: LeadStatus | 'all') => {
    setSelectedStatus(status);
    // Optional: Track analytics event (future implementation)
    // analytics?.event('filter_status_changed', { status, timestamp: new Date().toISOString() });
  };

  // AC-5.1: Keyboard navigation - Enter, Space, Arrow keys support
  // CRÍTICO-1: Implement Arrow key navigation (LEFT/RIGHT with wrapping)
  // ALTO-1: Replace onKeyPress (deprecated) with onKeyDown
  // ALTO-6: Add Space key support for standard button behavior
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tab: typeof TABS[0]) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedStatus(tab.value);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (tab.index + 1) % TABS.length;
      setSelectedStatus(TABS[nextIndex].value);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (tab.index - 1 + TABS.length) % TABS.length;
      setSelectedStatus(TABS[prevIndex].value);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSelectedStatus(TABS[0].value);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSelectedStatus(TABS[TABS.length - 1].value);
    }
  };

  return (
    <div
      className="flex gap-2 pb-4 border-b border-gray-200 overflow-x-auto sticky top-16 bg-white z-10 md:gap-3"
      data-testid="status-filter-tabs"
      role="tablist"
      aria-label="Filtrar leads por estado"
    >
      {/* Render all 5 tabs */}
      {TABS.map((tab) => {
        const isActive = selectedStatus === tab.value;

        return (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, tab)}
            role="tab"
            aria-pressed={isActive}
            aria-label={`Filtrar por ${tab.label}`}
            aria-description={tab.description}
            data-testid={`status-tab-${tab.value.toLowerCase()}`}
            className={`
              px-4 py-2 whitespace-nowrap font-medium rounded text-sm md:text-base
              transition-colors duration-200 flex-shrink-0
              ${isActive
                ? 'bg-blue-500 text-white border-b-2 border-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            tabIndex={isActive ? 0 : -1}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
