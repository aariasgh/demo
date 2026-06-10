/**
 * KanbanColumn Component - Individual Status Column
 * Displays leads grouped by status with column header and counter
 * Supports drag-drop to reorder leads or change status
 */

import { Droppable, Draggable } from 'react-beautiful-dnd';
import type { DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import LeadCard from './LeadCard';
import { STATUS_COLORS } from '../utils/constants';
import type { Lead } from '../types';

interface KanbanColumnProps {
  status: string;
  leads: Lead[];
  isDisabled?: boolean;
}

export default function KanbanColumn({ status, leads, isDisabled = false }: KanbanColumnProps) {
  const count = leads.length;
  const color = STATUS_COLORS[status];
  if (!color) {
    console.warn(`Invalid status color for: ${status}`);
  }
  const displayColor = color || '#EF4444';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1">
          {/* Status Icon - Colored Circle */}
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: displayColor }}
            aria-hidden="true"
          />
          
          {/* Status Title */}
          <h2 className="font-semibold text-gray-900 text-sm md:text-base truncate">
            {status}
          </h2>
        </div>

        {/* Counter Badge - AC-12: Accessible counter with aria-live */}
        <span 
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex-shrink-0 ml-2"
          aria-label={`${count} leads en ${status}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {count}
        </span>
      </div>

      {/* Column Content - Droppable Container */}
      <Droppable droppableId={status} isDropDisabled={isDisabled}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-3 space-y-3 transition-all duration-200 rounded-b-lg ${
              snapshot.isDraggingOver 
                ? 'bg-blue-50 ring-2 ring-blue-300 shadow-inner' 
                : 'bg-white'
            } ${
              isDisabled ? 'opacity-50 pointer-events-none' : ''
            }`}
            role="region"
            aria-label={`Columna ${status} con ${count} leads${isDisabled ? ' - sincronizando' : ''}`}
            style={{
              maxHeight: 'calc(100vh - 250px)',
            }}
          >
            {leads.length > 0 ? (
              leads.map((lead, index) => (
                <Draggable 
                  key={lead.id} 
                  draggableId={`lead-${lead.id}`} 
                  index={index}
                >
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-all duration-200 ${
                        snapshot.isDragging 
                          ? 'opacity-50 shadow-lg' 
                          : 'opacity-100'
                      }`}
                    >
                      <LeadCard lead={lead} />
                    </div>
                  )}
                </Draggable>
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
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
