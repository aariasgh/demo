import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import React from 'react';
import './styles/index.css';
import CreateLeadModal from './components/CreateLeadModal';
import KanbanBoard from './components/KanbanBoard';

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
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Mini CRM de Seguimiento de Leads
              </h1>
            </div>
          </header>
          <main>
            <KanbanBoard />
          </main>
          {/* Create Lead Modal - appears when triggered */}
          <CreateLeadModal />
        </div>
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
