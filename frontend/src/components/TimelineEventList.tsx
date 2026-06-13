// frontend/src/components/TimelineEventList.tsx

import TimelineEvent from './TimelineEvent';
import TimelineEmptyState from './TimelineEmptyState';
import type { TimelineEvent as TimelineEventType } from '../types/timeline';

interface TimelineEventListProps {
  events: TimelineEventType[];
  onEventDeleted: () => void;
  isEmpty: boolean;
  isLoading: boolean;
}

export default function TimelineEventList({
  events,
  onEventDeleted,
  isEmpty,
  isLoading,
}: TimelineEventListProps) {
  return (
    <div
      data-testid="timeline-event-list"
      className={`${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity`}
    >
      {isEmpty ? (
        <TimelineEmptyState />
      ) : (
        <div className="relative">
          {events.map((event) => (
            <TimelineEvent
              key={event.id}
              event={event}
              onDeleted={onEventDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
