/**
 * KanbanBoard Component - Main Dashboard Container
 * Renders 4 columns for lead status tracking (Nuevo, En contacto, Propuesta, Cerrado)
 * Responsive: 1 col (mobile), 2 cols (tablet), 4 cols (desktop)
 * Supports drag-drop to change lead status between columns
 * 
 * E4-S1 Integration: Includes SearchFilterHeader for real-time lead filtering
 * E4-S3 Integration: Includes StatusFilterTabs for status filtering
 */

import { useMemo, useState, useRef, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useLeadsByStatus } from '../hooks/useLeadsByStatus';
import { useKanbanDragDrop } from '../hooks/useKanbanDragDrop';
import { useKanbanFilterStore } from '../store/kanbanFilterStore';
import KanbanColumn from './KanbanColumn';
import SearchFilterHeader from './SearchFilterHeader';
import StatusFilterTabs from './StatusFilterTabs';
import LeadsAtRiskWidget from './LeadsAtRiskWidget';
import LeadsAtRiskPanel from './LeadsAtRiskPanel';
import type { Lead, LeadStatus } from '../types/lead';

export default function KanbanBoard() {
  const { groupedLeads, isLoading, error, totalLeads } = useLeadsByStatus();
  const { isDragging, handleDragEnd, isPending } = useKanbanDragDrop();
  const { searchQuery, selectedPriorities, selectedStatus, getVisibleColumns } = useKanbanFilterStore();
  
  // E4-S2: At-risk leads widget state
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /**
   * BAJO-11: Loading/Transition State During Filter Changes
   * 
   * When user rapidly changes filters, briefly fade the grid to provide visual feedback
   * that filtering is happening. This is especially noticeable on slow devices.
   * 
   * Implementation: Track filter changes with refs and apply CSS transition for smooth effect
   */
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevStatusRef = useRef(selectedStatus);
  const prevSearchRef = useRef(searchQuery);
  const prevPrioritiesRef = useRef(selectedPriorities);

  useEffect(() => {
    // Detect any filter change (status, search, or priority)
    const statusChanged = selectedStatus !== prevStatusRef.current;
    const searchChanged = searchQuery !== prevSearchRef.current;
    const prioritiesChanged = JSON.stringify(selectedPriorities) !== JSON.stringify(prevPrioritiesRef.current);

    if (statusChanged || searchChanged || prioritiesChanged) {
      // Briefly show transition effect
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        prevStatusRef.current = selectedStatus;
        prevSearchRef.current = searchQuery;
        prevPrioritiesRef.current = selectedPriorities;
        setIsTransitioning(false);
      }, 150); // 150ms fade effect
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [selectedStatus, searchQuery, selectedPriorities]);

  /**
   * MEDIUM-8: Triple Filter Pipeline with AND Logic
   * 
   * Filter Precedence (ALL must match for a lead to appear):
   * 1. STATUS FILTER (E4-S3):
   *    - User selects tab: "Todos" | "Nuevo" | "En contacto" | "Propuesta enviada" | "Cerrado"
   *    - Gets visibleColumns from store
   *    - Only leads matching selectedStatus are shown
   *    - AND logic: Only proceeds to step 2 if status matches
   *
   * 2. SEARCH FILTER (E4-S1):
   *    - User types search query
   *    - Searches across 3 fields (name, company, email)
   *    - Case-insensitive matching
   *    - AND logic: Lead must match search AND status from step 1
   *
   * 3. PRIORITY FILTER (E4-S1):
   *    - User selects priorities: "Baja" | "Media" | "Alta" | "Urgente"
   *    - Multi-select allows filtering by multiple priorities
   *    - If no priority selected, all priorities shown (no filtering)
   *    - AND logic: Lead must match status AND search AND priority
   *
   * Result: Lead appears in Kanban ONLY if:
   *   - Its status is in visibleColumns AND
   *   - Its name/company/email contains searchQuery AND
   *   - Its priority is in selectedPriorities (if any selected)
   *
   * Example:
   *   Status="Nuevo", Search="juan", Priority=["Alta"]
   *   → Shows only leads with status="Nuevo" AND (name|company|email contains "juan") AND priority="Alta"
   */
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
      // ALTO-2: Replace `as any` with specific LeadStatus type
      if (!visibleColumns.includes(status as LeadStatus)) {
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
  // ALTO-5: Remove getVisibleColumns from dependencies (it's a function that recreates on every render)
  // Only depend on its inputs (selectedStatus) and other filter states
  }, [groupedLeads, searchQuery, selectedPriorities, selectedStatus]);

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
    <div className="min-h-screen bg-gray-50" data-testid="kanban-board">
      {/* E4-S1: SearchFilterHeader — AC-1.1: Sticky header above Kanban */}
      <SearchFilterHeader />

      {/* E4-S3: StatusFilterTabs — AC-1.1: Sticky tabs below search header */}
      <div className="px-4 md:px-6">
        <StatusFilterTabs />
      </div>

      <div className="p-4 md:p-6" data-testid="kanban-header">
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
              
              BAJO-11: Apply fade transition when filters change for visual feedback
            */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 relative transition-opacity duration-300 ${
              isTransitioning ? 'opacity-60' : 'opacity-100'
            }`}>
              {/* Overlay during drag sync */}
              {isDragging && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg z-50 pointer-events-none backdrop-blur-sm" data-testid="drag-sync-overlay">
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
