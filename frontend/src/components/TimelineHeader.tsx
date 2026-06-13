// frontend/src/components/TimelineHeader.tsx

import { ArrowLeftIcon } from '@heroicons/react/24/solid';

interface TimelineHeaderProps {
  leadName?: string;
  onBack: () => void;
}

export default function TimelineHeader({ leadName, onBack }: TimelineHeaderProps) {
  return (
    <div data-testid="timeline-header" className="mb-6 flex items-center gap-4">
      <button
        data-testid="timeline-back-button"
        onClick={onBack}
        className="p-2 hover:bg-gray-200 rounded-lg transition"
        aria-label="Volver"
      >
        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
      </button>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Timeline de Actividad</h1>
        {leadName && <p className="text-gray-600">{leadName}</p>}
      </div>
    </div>
  );
}
