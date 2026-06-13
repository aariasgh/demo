// frontend/src/components/TimelineEvent.tsx

import { TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import TimelineDeleteConfirmation from './TimelineDeleteConfirmation';
import type { TimelineEvent as TimelineEventType } from '../types/timeline';

interface TimelineEventProps {
  event: TimelineEventType;
  onDeleted: () => void;
}

const EVENT_COLORS: Record<string, string> = {
  LEAD_CREATED: 'bg-green-100 text-green-800',
  STATUS_CHANGED: 'bg-blue-100 text-blue-800',
  NOTE_ADDED: 'bg-yellow-100 text-yellow-800',
  CALL_MADE: 'bg-purple-100 text-purple-800',
  EMAIL_SENT: 'bg-indigo-100 text-indigo-800',
};

const EVENT_LABELS: Record<string, string> = {
  LEAD_CREATED: 'Lead Creado',
  STATUS_CHANGED: 'Estado Cambiado',
  NOTE_ADDED: 'Nota',
  CALL_MADE: 'Llamada',
  EMAIL_SENT: 'Email',
};

export default function TimelineEvent({ event, onDeleted }: TimelineEventProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const timestamp = new Date(event.timestamp).toLocaleString('es-ES');
  const colorClass = EVENT_COLORS[event.event_type] || 'bg-gray-100 text-gray-800';
  const label = EVENT_LABELS[event.event_type] || event.event_type;

  return (
    <>
      <div
        data-testid={`timeline-event`}
        data-event-id={event.id}
        data-event-type={event.event_type}
        className="flex gap-4 pb-6 relative"
      >
        {/* Timeline line */}
        <div className="flex flex-col items-center">
          <div className={`w-4 h-4 rounded-full ${colorClass.split(' ')[0]} border-4 border-white`} />
          <div className="w-1 h-20 bg-gray-200 mt-2" />
        </div>

        {/* Content */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span
                data-testid={`timeline-event-type-${event.event_type}`}
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
              >
                {label}
              </span>
              <p
                data-testid="timeline-event-description"
                className="text-gray-700 mt-2 text-sm leading-relaxed"
              >
                {event.description}
              </p>
              <p data-testid="timeline-event-timestamp" className="text-gray-500 text-xs mt-2">
                {timestamp}
              </p>
            </div>

            {/* Delete button */}
            <button
              data-testid="timeline-delete-button"
              onClick={() => setShowDeleteConfirm(true)}
              className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              aria-label="Eliminar evento"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <TimelineDeleteConfirmation
          eventId={event.id}
          leadId={event.lead_id}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDeleted();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
