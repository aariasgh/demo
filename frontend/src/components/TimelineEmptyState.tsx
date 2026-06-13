// frontend/src/components/TimelineEmptyState.tsx

import { CubeIcon } from '@heroicons/react/24/outline';

export default function TimelineEmptyState() {
  return (
    <div
      data-testid="timeline-empty-state"
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <CubeIcon className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos aún</h3>
      <p className="text-gray-500 text-sm max-w-md">
        Comienza a agregar eventos como notas, llamadas o emails para construir un historial completo de este lead.
      </p>
    </div>
  );
}
