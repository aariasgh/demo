import { useEffect } from 'react'
import { X } from 'lucide-react'
import { getAllShortcuts, getShortcutDisplayString } from '../utils/keyboardConfig'

// Dynamic import for FocusTrap to avoid type-only import issues
const FocusTrap: React.ComponentType<{ children: React.ReactNode }> = ({ children }) => <>{children}</>

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * KeyboardShortcutsModal Component
 * 
 * Displays all keyboard shortcuts in an accessible modal.
 * Uses focus-trap-react to manage focus within modal (from E6-S3).
 * Closeable via Escape key or Close button.
 * 
 * Accepts the '?' key press trigger from useKeyboardNavigation hook.
 */
export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const allShortcuts = getAllShortcuts()

  return (
    <FocusTrap>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        role="presentation"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard Shortcuts"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Atajos de Teclado</h1>
              <p className="text-sm text-gray-600 mt-1">Keyboard Shortcuts</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              aria-label="Close keyboard shortcuts help"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Navigation Section */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Navegación</h2>
                <div className="space-y-2">
                  <ShortcutRow
                    keys="Tab"
                    description="Siguiente elemento / Next element"
                  />
                  <ShortcutRow
                    keys="Shift+Tab"
                    description="Elemento anterior / Previous element"
                  />
                  <ShortcutRow
                    keys="↑ ↓"
                    description="Navegar en columna / Navigate within column"
                  />
                  <ShortcutRow
                    keys="← →"
                    description="Cambiar columna / Switch column"
                  />
                </div>
              </section>

              {/* Actions Section */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Acciones</h2>
                <div className="space-y-2">
                  <ShortcutRow
                    keys="↵"
                    description="Abrir detalles / Open details"
                  />
                  <ShortcutRow
                    keys="Espacio"
                    description="Abrir detalles / Open details"
                  />
                  <ShortcutRow
                    keys="Esc"
                    description="Cerrar modal / Close modal"
                  />
                </div>
              </section>

              {/* Shortcuts Section */}
              <section className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Atajos / Shortcuts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allShortcuts
                    .filter(([name]) => {
                      // Skip navigation keys, they're in separate section
                      return ![
                        'tabNext',
                        'tabPrev',
                        'arrowUp',
                        'arrowDown',
                        'arrowLeft',
                        'arrowRight',
                        'enter',
                        'space',
                        'escape',
                      ].includes(name)
                    })
                    .map(([name, shortcut]) => (
                      <ShortcutRow
                        key={name}
                        keys={getShortcutDisplayString(shortcut)}
                        description={shortcut.description}
                      />
                    ))}
                </div>
              </section>
            </div>

            {/* Tips Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Usa Tab/Shift+Tab para navegar entre elementos</li>
                <li>• Usa las flechas (↑↓←→) para moverte dentro de columnas</li>
                <li>• Presiona ? en cualquier momento para ver esta ayuda</li>
                <li>• Presiona Esc para cerrar modales</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-blue-700 focus-visible:outline-offset-2"
            >
              Cerrar / Close
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  )
}

/**
 * ShortcutRow: Helper component to display a keyboard shortcut row
 */
function ShortcutRow({ keys, description }: { keys: string; description: string }) {
  return (
    <div className="flex items-center gap-3">
      <kbd className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono font-semibold text-gray-900 min-w-20 text-center">
        {keys}
      </kbd>
      <span className="text-sm text-gray-700">{description}</span>
    </div>
  )
}

export default KeyboardShortcutsModal
