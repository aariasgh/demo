// frontend/src/components/modals/TimelineAddEmailModal.tsx

import { useState } from 'react';
import { apiClient } from '../../services/apiClient';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TimelineAddEmailModalProps {
  leadId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TimelineAddEmailModal({
  leadId,
  onClose,
  onSuccess,
}: TimelineAddEmailModalProps) {
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !subject.trim()) {
      toast.error('Completa todos los campos');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post(`/api/leads/${leadId}/timeline`, {
        event_type: 'EMAIL_SENT',
        description: description.trim(),
        metadata: {
          subject: subject.trim(),
        },
      });
      toast.success('Email registrado');
      onSuccess();
    } catch (error) {
      toast.error('Error al registrar email');
      console.error('Add email error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="timeline-add-email-modal"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-md shadow-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Registrar Email</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asunto
            </label>
            <input
              type="text"
              data-testid="timeline-email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              data-testid="timeline-email-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumen del email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

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
              data-testid="timeline-email-submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
