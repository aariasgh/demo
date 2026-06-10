/**
 * KanbanColumn Component - Individual Status Column
 * Displays leads grouped by status with column header and counter
 */

import LeadCard from './LeadCard';
import { STATUS_COLORS } from '../utils/constants';
import type { Lead } from '../types';

interface KanbanColumnProps {
  status: string;
  leads: Lead[];
  count: number;
}

export default function KanbanColumn({ status, leads, count }: KanbanColumnProps) {
  const color = STATUS_COLORS[status] || '#6B7280';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1">
          {/* Status Icon - Colored Circle */}
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          
          {/* Status Title */}
          <h2 className="font-semibold text-gray-900 text-sm md:text-base truncate">
            {status}
          </h2>
        </div>

        {/* Counter Badge */}
        <span 
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex-shrink-0 ml-2"
          aria-label={`${count} leads en ${status}`}
        >
          {count}
        </span>
      </div>

      {/* Column Content - Scrollable Container */}
      <div 
        className="flex-1 overflow-y-auto p-3 space-y-3"
        role="region"
        aria-label={`Columna ${status} con ${count} leads`}
        style={{
          maxHeight: 'calc(100vh - 250px)',
        }}
      >
        {leads.length > 0 ? (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
            />
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500 text-sm font-medium">
              No hay leads aún
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Crea tu primer lead
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
