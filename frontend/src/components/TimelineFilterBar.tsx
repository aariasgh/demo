// frontend/src/components/TimelineFilterBar.tsx

interface TimelineFilterBarProps {
  selectedType: string | null;
  onFilterChange: (type: string | null) => void;
}

const EVENT_TYPES = [
  { value: null, label: 'Todos' },
  { value: 'LEAD_CREATED', label: 'Lead Creado' },
  { value: 'STATUS_CHANGED', label: 'Estado Cambiado' },
  { value: 'NOTE_ADDED', label: 'Nota' },
  { value: 'CALL_MADE', label: 'Llamada' },
  { value: 'EMAIL_SENT', label: 'Email' },
];

export default function TimelineFilterBar({ selectedType, onFilterChange }: TimelineFilterBarProps) {
  return (
    <div data-testid="timeline-filter-bar" className="mb-6 flex gap-2 flex-wrap">
      {EVENT_TYPES.map((type) => (
        <button
          key={type.value || 'all'}
          data-testid={`timeline-filter-${type.value || 'all'}`}
          onClick={() => onFilterChange(type.value)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedType === type.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
