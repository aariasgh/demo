// frontend/src/components/TimelineDeleteConfirmation.tsx

import { useState } from 'react';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';

interface TimelineDeleteConfirmationProps {
  eventId: number;
  leadId: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TimelineDeleteConfirmation({
  eventId,
  leadId,
  onConfirm,
  onCancel,
}: TimelineDeleteConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/leads/${leadId}/timeline/${eventId}`);
      toast.success('Evento eliminado');
      onConfirm();
    } catch (error) {
      toast.error('Error al eliminar evento');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      data-testid="timeline-delete-confirmation"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
        <h2 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar evento?</h2>
        <p className="text-gray-600 mb-6">
          Esta acción no se puede deshacer. El evento será eliminado permanentemente.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            data-testid="timeline-delete-cancel-button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            data-testid="timeline-delete-confirm-button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
