import { useUIStore } from '../store/uiStore';
import LeadsAtRiskPanel from './LeadsAtRiskPanel';
import type { Lead } from '../types/lead';

/**
 * RiskWidgetContainer Component
 * Wraps LeadsAtRiskPanel and manages visibility via keyboard shortcut (R key)
 * 
 * Features:
 * - Toggle visibility with R keyboard shortcut
 * - Integrated with uiStore for state management
 */
export default function RiskWidgetContainer() {
  const { showRiskWidget, toggleRiskWidget } = useUIStore();

  if (!showRiskWidget) return null;

  const handleSelectLead = (_lead: Lead) => {
    // TODO: Open lead details modal if needed
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-h-96 overflow-auto shadow-lg rounded-lg bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-gray-900">Leads en Riesgo</h3>
        <button
          onClick={() => toggleRiskWidget()}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
          aria-label="Cerrar widget de leads en riesgo"
        >
          ×
        </button>
      </div>
      <LeadsAtRiskPanel 
        isOpen={showRiskWidget}
        onClose={() => toggleRiskWidget()}
        onSelectLead={handleSelectLead}
      />
    </div>
  );
}
