/**
 * KanbanBoard Component - Main Dashboard Container
 * Renders 4 columns for lead status tracking (Nuevo, En contacto, Propuesta, Cerrado)
 * Responsive: 1 col (mobile), 2 cols (tablet), 4 cols (desktop)
 * Supports drag-drop to change lead status between columns
 * 
 * E4-S1 Integration: Includes SearchFilterHeader for real-time lead filtering
 * E4-S3 Integration: Includes StatusFilterTabs for status filtering
 */

import { useMemo, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useLeadsByStatus } from '../hooks/useLeadsByStatus';
import { useKanbanDragDrop } from '../hooks/useKanbanDragDrop';
import { useKanbanFilterStore } from '../store/kanbanFilterStore';
import KanbanColumn from './KanbanColumn';
import SearchFilterHeader from './SearchFilterHeader';
import StatusFilterTabs from './StatusFilterTabs';
import LeadsAtRiskWidget from './LeadsAtRiskWidget';
import LeadsAtRiskPanel from './LeadsAtRiskPanel';
import type { Lead } from '../types/lead';

export default function KanbanBoard() {
  const { groupedLeads, isLoading, error, totalLeads } = useLeadsByStatus();
  const { isDragging, handleDragEnd, isPending } = useKanbanDragDrop();
  const { searchQuery, selectedPriorities, selectedStatus, getVisibleColumns } = useKanbanFilterStore();
  
  // E4-S2: At-risk leads widget state
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // E4-S1 + E4-S3: Filter leads based on search + priority + status filters (AND logic)
  const filteredGroupedLeads = useMemo(() => {
    const visibleColumns = getVisibleColumns();
    const filtered: Record<string, typeof groupedLeads[keyof typeof groupedLeads]> = {};
    const searchLower = searchQuery.toLowerCase();

    // Initialize filtered object with visible columns only (E4-S3: AC-2.1)
    visibleColumns.forEach((status) => {
      filtered[status] = [];
    });

    Object.entries(groupedLeads).forEach(([status, leads]) => {
      // Only process if this status is in visible columns (E4-S3: AC-2.1)
      if (!visibleColumns.includes(status as any)) {
        return;
      }

      filtered[status] = leads.filter((lead: Lead) => {
        // AC-1.3: Search in 3 fields (name, company, email)
        // AC-1.4: Case-insensitive search
        const matchesSearch =
          searchQuery === '' ||
          (lead.name?.toLowerCase?.().includes(searchLower) ?? false) ||
          (lead.company?.toLowerCase?.().includes(searchLower) ?? false) ||
          (lead.email?.toLowerCase?.().includes(searchLower) ?? false);

        // AC-3.1 to AC-3.5: Priority filter (multi-select)
        const matchesPriority =
          selectedPriorities.length === 0 ||
          (lead.priority && selectedPriorities.includes(lead.priority));

        // AC-4.1: AND logic (search AND priority AND status must all match)
        return matchesSearch && matchesPriority;
      });
    });

    return filtered;
  }, [groupedLeads, searchQuery, selectedPriorities, selectedStatus, getVisibleColumns]);

  // AC-4.3: Calculate filtered totals
  const filteredTotalLeads = useMemo(() => {
    return Object.values(filteredGroupedLeads).reduce((sum, leads) => sum + leads.length, 0);
  }, [filteredGroupedLeads]);

  // E4-S3: Get visible columns for rendering
  const visibleColumns = useMemo(() => {
    return getVisibleColumns();
  }, [getVisibleColumns]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
          role="status"
          aria-label="Cargando leads"
        ></div>
      </div>
    );
  }

  if (error) {
    console.error('Error en KanbanBoard:', error);
    const handleRetry = () => window.location.reload();
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">Error cargando pipeline</p>
          <p className="text-sm text-gray-500">Por favor, intenta recargar la página</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            aria-label="Reintentar cargar pipeline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* E4-S1: SearchFilterHeader — AC-1.1: Sticky header above Kanban */}
      <SearchFilterHeader />

      {/* E4-S3: StatusFilterTabs — AC-1.1: Sticky tabs below search header */}
      <div className="px-4 md:px-6">
        <StatusFilterTabs />
      </div>

      <div className="p-4 md:p-6">
        {/* AC-12: Accessibility - Live region for status updates */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="kanban-status-announcer"
        >
          {isPending && 'Sincronizando cambio de estado...'}
        </div>

        {/* E4-S2: LeadsAtRiskWidget — AC-3.1: Widget appears at top */}
        <div className="mb-6">
          <LeadsAtRiskWidget onOpenPanel={() => setIsPanelOpen(true)} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Pipeline de Ventas
          </h1>
          <p className="text-gray-600 mt-2">
            Total de leads: {filteredTotalLeads}
            {(searchQuery || selectedPriorities.length > 0) && (
              <span className="ml-2 text-sm">
                (de {totalLeads} totales)
              </span>
            )}
          </p>
        </div>

        {/* E4-S1: No Results Message — AC-2.2, AC-4.4: Clear message for empty results */}
        {filteredTotalLeads === 0 && (searchQuery || selectedPriorities.length > 0) && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery && selectedPriorities.length > 0
                ? `No hay leads con esos criterios`
                : searchQuery
                  ? `No hay leads que coincidan con '${searchQuery}'`
                  : `No hay leads con esa prioridad`}
            </p>
          </div>
        )}

        {/* Kanban Grid with Drag-Drop Context */}
        {filteredTotalLeads > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            {/* 
              Responsive breakpoints:
              - Mobile (default): grid-cols-1 (stacked vertically)
              - Tablet (md:): grid-cols-2 (2x2 grid)
              - Desktop (lg:): grid-cols-4 (1x4 grid)
              
              E4-S3: Only render visible columns based on selectedStatus filter
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5 lg:grid-cols-4 gap-4 lg:gap-6 relative transition-opacity duration-300">
              {/* Overlay during drag sync */}
              {isDragging && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg z-50 pointer-events-none backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p className="text-white text-sm font-medium">Sincronizando...</p>
                  </div>
                </div>
              )}

              {/* E4-S3: Render only visible columns (AC-2.1: Show 1 or 4 columns) */}
              {visibleColumns.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  leads={filteredGroupedLeads[status] ?? []}
                  isDisabled={isPending}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* E4-S2: LeadsAtRiskPanel — AC-3.3: Panel overlay */}
      <LeadsAtRiskPanel 
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSelectLead={() => {
          // TODO: Scroll to lead or open edit modal
          setIsPanelOpen(false);
        }}
      />
    </div>
  );
}
