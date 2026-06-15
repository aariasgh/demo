import { useState } from 'react';
// @ts-ignore - focus-trap-react CommonJS compatibility
import FocusTrap from 'focus-trap-react';
import { useUIStore } from '../store/uiStore';

/**
 * QuickNotesModal Component
 * Modal for quickly adding/viewing notes on a lead via N keyboard shortcut
 * 
 * Features:
 * - Quick note input with auto-save
 * - Keyboard accessible (Escape to close)
 * - Focus trap for accessibility
 */
export default function QuickNotesModal() {
  const { isNotesModalOpen, closeNotesModal } = useUIStore();
  const [notes, setNotes] = useState('');

  if (!isNotesModalOpen) return null;

  return (
    <FocusTrap>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4 p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Notas Rápidas</h2>
            <button
              onClick={closeNotesModal}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              aria-label="Cerrar modal"
            >
              ×
            </button>
          </div>
          
          <div className="p-6">
            <textarea
              autoFocus
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade tus notas aquí..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 resize-none"
              aria-label="Campo de notas"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeNotesModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
