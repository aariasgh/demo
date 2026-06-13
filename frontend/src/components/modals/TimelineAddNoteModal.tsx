// frontend/src/components/modals/TimelineAddNoteModal.tsx

import { useState } from 'react';
import { apiClient } from '../../services/apiClient';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TimelineAddNoteModalProps {
  leadId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TimelineAddNoteModal({
  leadId,
  onClose,
  onSuccess,
}: TimelineAddNoteModalProps) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('La nota no puede estar vacía');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post(`/api/leads/${leadId}/timeline`, {
        event_type: 'NOTE_ADDED',
        description: description.trim(),
      });
      toast.success('Nota agregada');
      onSuccess();
    } catch (error) {
      toast.error('Error al agregar nota');
      console.error('Add note error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="timeline-add-note-modal"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-md shadow-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Agregar Nota</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            data-testid="timeline-note-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={5}
            disabled={isSubmitting}
          />

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="timeline-note-submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
