import { useState, useEffect } from 'react';
// @ts-ignore - focus-trap-react CommonJS compatibility
import FocusTrap from 'focus-trap-react';
import { useUIStore } from '../store/uiStore';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nuevo', apiValue: 'Nuevo' },
  { value: 'contacted', label: 'En contacto', apiValue: 'En contacto' },
  { value: 'proposal_sent', label: 'Propuesta enviada', apiValue: 'Propuesta enviada' },
  { value: 'closed', label: 'Cerrado', apiValue: 'Cerrado' },
] as const;

/**
 * QuickStatusModal Component
 * Modal for quickly changing lead status via S keyboard shortcut
 * 
 * Features:
 * - Status selection with keyboard navigation
 * - Arrow keys to navigate options
 * - Enter to confirm and call API
 * - Escape to close without saving
 * - Loading state and error handling
 */
export default function QuickStatusModal() {
  const { 
    isStatusModalOpen, 
    closeStatusModal, 
    selectedLeadIdForStatus, 
    selectedLeadCurrentStatus,
    showToast,
    setLoading
  } = useUIStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previousFocusElement, setPreviousFocusElement] = useState<HTMLElement | null>(null);

  // L-4: Save and restore focus element when modal opens/closes
  useEffect(() => {
    if (isStatusModalOpen) {
      // Save current focused element before opening modal
      setPreviousFocusElement(document.activeElement as HTMLElement);
    } else if (previousFocusElement && previousFocusElement !== document.body) {
      // Restore focus when modal closes
      previousFocusElement.focus();
      setPreviousFocusElement(null);
    }
  }, [isStatusModalOpen, previousFocusElement]);

  // Initialize selectedIndex when modal opens (find current status in options)
  useEffect(() => {
    if (isStatusModalOpen && selectedLeadCurrentStatus) {
      const currentIndex = STATUS_OPTIONS.findIndex(
        s => s.apiValue === selectedLeadCurrentStatus
      );
      setSelectedIndex(currentIndex !== -1 ? currentIndex : 0);
    }
  }, [isStatusModalOpen, selectedLeadCurrentStatus]);

  if (!isStatusModalOpen) return null;

  const handleStatusChange = async () => {
    if (!selectedLeadIdForStatus) {
      showToast('Error: Lead no seleccionado', 'error');
      return;
    }

    // L-2: Array boundary check - ensure selectedIndex is valid
    if (selectedIndex < 0 || selectedIndex >= STATUS_OPTIONS.length) {
      showToast('Error: Estado no válido', 'error');
      return;
    }

    const newStatus = STATUS_OPTIONS[selectedIndex].apiValue;
    
    // Avoid no-op updates
    if (newStatus === selectedLeadCurrentStatus) {
      closeStatusModal();
      return;
    }

    setIsUpdating(true);
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/leads/${selectedLeadIdForStatus}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al cambiar estado');
      }

      showToast(`Lead movido a "${newStatus}"`, 'success');
      closeStatusModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      showToast(`Error: ${message}`, 'error');
    } finally {
      setIsUpdating(false);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isUpdating) {
      // Prevent keyboard navigation while updating
      if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % STATUS_OPTIONS.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleStatusChange();
    } else if (e.key === 'Escape') {
      closeStatusModal();
    }
  };

  return (
    <FocusTrap>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="presentation">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4" role="dialog" aria-labelledby="status-modal-title" aria-modal="true">
          <div className="flex justify-between items-center mb-4 p-6 border-b">
            <h2 id="status-modal-title" className="text-xl font-semibold text-gray-900">Cambiar Estado</h2>
            <button
              onClick={closeStatusModal}
              disabled={isUpdating}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none disabled:opacity-50"
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
                  onClick={() => {
                    setSelectedIndex(index);
                    // Auto-submit on click
                    setTimeout(handleStatusChange, 0);
                  }}
                  disabled={isUpdating}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    index === selectedIndex
                      ? `bg-blue-500 text-white outline-2 outline-blue-700 outline-offset-2 ${
                          isUpdating ? 'ring-2 ring-blue-300 animate-pulse' : ''
                        }`
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2`}
                  autoFocus={index === selectedIndex}
                >
                  <div className="flex items-center justify-between">
                    <span>{status.label}</span>
                    {/* L-3: Loading indicator visual feedback */}
                    {isUpdating && index === selectedIndex && (
                      <span className="inline-block animate-spin">
                        ⟳
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {isUpdating 
                ? '⟳ Actualizando estado en backend...' 
                : 'Use ↑↓ to navigate, Enter to confirm, Escape to cancel'}
            </p>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
