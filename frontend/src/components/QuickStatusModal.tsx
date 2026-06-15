import { useState } from 'react';
// @ts-ignore - focus-trap-react CommonJS compatibility
import FocusTrap from 'focus-trap-react';
import { useUIStore } from '../store/uiStore';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'En contacto' },
  { value: 'proposal_sent', label: 'Propuesta enviada' },
  { value: 'closed', label: 'Cerrado' },
] as const;

/**
 * QuickStatusModal Component
 * Modal for quickly changing lead status via S keyboard shortcut
 * 
 * Features:
 * - Status selection with keyboard navigation
 * - Arrow keys to navigate options
 * - Enter to confirm
 * - Escape to close
 */
export default function QuickStatusModal() {
  const { isStatusModalOpen, closeStatusModal } = useUIStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!isStatusModalOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % STATUS_OPTIONS.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // TODO: Implement status change API call
      closeStatusModal();
    } else if (e.key === 'Escape') {
      closeStatusModal();
    }
  };

  return (
    <FocusTrap>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
          <div className="flex justify-between items-center mb-4 p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Cambiar Estado</h2>
            <button
              onClick={closeStatusModal}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              aria-label="Cerrar modal"
            >
              ×
            </button>
          </div>
          
          <div className="p-6" onKeyDown={handleKeyDown}>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((status, index) => (
                <button
                  key={status.value}
                  onClick={() => closeStatusModal()}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-500 text-white outline-2 outline-blue-700 outline-offset-2'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2`}
                  autoFocus={index === selectedIndex}
                >
                  {status.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Use ↑↓ to navigate, Enter to confirm, Escape to cancel
            </p>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
