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
 */

import { useKanbanFilterStore, type LeadStatus } from '../store/kanbanFilterStore';

const TABS = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'Nuevo' as const, label: 'Nuevo' },
  { value: 'En contacto' as const, label: 'En contacto' },
  { value: 'Propuesta' as const, label: 'Propuesta' },
  { value: 'Cerrado' as const, label: 'Cerrado' },
];

export default function StatusFilterTabs() {
  const { selectedStatus, setSelectedStatus } = useKanbanFilterStore();

  // AC-2.1: Handle tab click (idempotent - clicking active tab does nothing)
  const handleTabClick = (status: LeadStatus | 'all') => {
    setSelectedStatus(status);
  };

  // AC-5.2: Keyboard navigation - select on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>, status: LeadStatus | 'all') => {
    if (e.key === 'Enter') {
      setSelectedStatus(status);
    }
  };

  return (
    <div
      className="flex gap-2 pb-4 border-b border-gray-200 overflow-x-auto sticky top-16 bg-white z-10 md:gap-3"
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
            onKeyPress={(e) => handleKeyPress(e, tab.value)}
            role="tab"
            aria-pressed={isActive}
            aria-label={`Filtrar por ${tab.label}`}
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
