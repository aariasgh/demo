import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy, useState } from 'react';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import CreateLeadModal from './components/CreateLeadModal';
import KanbanBoard from './components/KanbanBoard';
import TimelineView from './pages/TimelineView';
import useKeyboardNavigation, { registerKeyboardHandler, unregisterKeyboardHandler } from './hooks/useKeyboardNavigation';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import QuickNotesModal from './components/QuickNotesModal';
import QuickStatusModal from './components/QuickStatusModal';
import RiskWidgetContainer from './components/RiskWidgetContainer';
import { useUIStore } from './store/uiStore';
import { logKeyboardValidation } from './utils/keyboardValidator';

const ReactQueryDevtools =
  import.meta.env.DEV
    ? lazy(() =>
        import('@tanstack/react-query-devtools').then((mod) => ({
          default: mod.ReactQueryDevtools,
        }))
      )
    : () => null;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

// Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] Caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white shadow rounded-lg p-6 max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Algo salió mal
            </h1>
            <p className="text-gray-600 mb-4">
              Ocurrió un error inesperado. Por favor, recarga la página.
            </p>
            {this.state.error && (
              <pre className="bg-gray-100 p-2 rounded text-xs text-gray-800 mb-4 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { openCreateModal, openNotesModal, openStatusModal, toggleRiskWidget, focusedLead } = useUIStore();
  
  // Initialize global keyboard navigation
  useKeyboardNavigation();
  
  // Validate keyboard shortcuts on app startup
  React.useEffect(() => {
    logKeyboardValidation();
  }, []);
  
  // Register keyboard handlers for all shortcuts
  React.useEffect(() => {
    
    const handleOpenHelpModal = () => {
      setShowHelpModal(true);
    };
    
    const handleCloseModal = () => {
      setShowHelpModal(false);
    };
    
    // E6-S4 Phase 4: Action Shortcuts
    const handleOpenCreateModal = () => {
      openCreateModal();
    };

    const handleOpenNotesModal = () => {
      openNotesModal();
    };

    const handleOpenStatusModal = () => {
      if (focusedLead) {
        const leadId = typeof focusedLead.id === 'string' ? parseInt(focusedLead.id, 10) : focusedLead.id;
        // L-1: Defensive null-check - provide default status if undefined
        const leadStatus = focusedLead.status || 'Nuevo';
        openStatusModal(leadId, leadStatus);
      }
    };

    const handleToggleRiskWidget = () => {
      toggleRiskWidget();
    };
    
    // Register help modal handlers
    registerKeyboardHandler('onOpenHelpModal', handleOpenHelpModal);
    registerKeyboardHandler('onCloseModal', handleCloseModal);
    
    // Register action shortcut handlers (Phase 4: C, N, S, R)
    registerKeyboardHandler('onOpenCreateModal', handleOpenCreateModal);
    registerKeyboardHandler('onOpenNotesList', handleOpenNotesModal);
    registerKeyboardHandler('onChangeStatus', handleOpenStatusModal);
    registerKeyboardHandler('onToggleRiskWidget', handleToggleRiskWidget);
    
    return () => {
      unregisterKeyboardHandler('onOpenHelpModal');
      unregisterKeyboardHandler('onCloseModal');
      unregisterKeyboardHandler('onOpenCreateModal');
      unregisterKeyboardHandler('onOpenNotesList');
      unregisterKeyboardHandler('onChangeStatus');
      unregisterKeyboardHandler('onToggleRiskWidget');
    };
  }, [focusedLead]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <header 
              className="bg-white shadow sticky top-0 z-30"
              role="banner"
              aria-label="Encabezado de la aplicación"
            >
              <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Mini CRM de Seguimiento de Leads
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Panel de Kanban accesible para seguimiento de clientes potenciales
                </p>
              </div>
            </header>
            <main 
              className="flex-1 flex flex-col"
              aria-label="Área principal de la aplicación"
              role="main"
            >
              <Routes>
                {/* Main Kanban Board Page */}
                <Route path="/" element={<KanbanBoard />} />
                
                {/* Timeline View Page */}
                <Route path="/leads/:leadId/timeline" element={<TimelineView />} />
              </Routes>
            </main>
            {/* Create Lead Modal - appears when triggered */}
            <CreateLeadModal />
            
            {/* Phase 4: Action Shortcut Modals */}
            <QuickNotesModal />
            <QuickStatusModal />
            <RiskWidgetContainer />
            
            {/* Keyboard Shortcuts Help Modal */}
            <KeyboardShortcutsModal 
              isOpen={showHelpModal} 
              onClose={() => setShowHelpModal(false)} 
            />
          </div>
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
