/**
 * KanbanBoard Component - Main Dashboard Container
 * Renders 4 columns for lead status tracking (Nuevo, En contacto, Propuesta, Cerrado)
 * Responsive: 1 col (mobile), 2 cols (tablet), 4 cols (desktop)
 */

import { useLeadsByStatus } from '../hooks/useLeadsByStatus';
import KanbanColumn from './KanbanColumn';
import { LEAD_STATUSES } from '../utils/constants';

export default function KanbanBoard() {
  const { groupedLeads, isLoading, error, totalLeads } = useLeadsByStatus();

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
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Pipeline de Ventas
        </h1>
        <p className="text-gray-600 mt-2">
          Total de leads: {totalLeads}
        </p>
      </div>

      {/* Kanban Grid */}
      {/* 
        Responsive breakpoints:
        - Mobile (default): grid-cols-1 (stacked vertically)
        - Tablet (md:): grid-cols-2 (2x2 grid)
        - Desktop (lg:): grid-cols-4 (1x4 grid)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5 lg:grid-cols-4 gap-4 lg:gap-6">
        {LEAD_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={groupedLeads[status] ?? []}
          />
        ))}
      </div>
    </div>
  );
}
