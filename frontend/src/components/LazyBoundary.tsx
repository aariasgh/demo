import React, { Suspense } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LazyBoundaryProps {
  children: ReactNode;
  fallbackText: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface LazyBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class LazyBoundary extends React.Component<LazyBoundaryProps, LazyBoundaryState> {
  constructor(props: LazyBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): LazyBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[LazyBoundary] Failed to load component: ${this.props.fallbackText}`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="fixed bottom-4 right-4 bg-red-50 border border-red-300 rounded-lg p-4 shadow-lg max-w-sm z-50"
          role="alert"
          aria-live="assertive"
        >
          <h3 className="font-bold text-red-700 mb-2">Error loading {this.props.fallbackText}</h3>
          <p className="text-sm text-red-600 mb-3">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={this.retry}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return (
      <Suspense fallback={<LoadingSpinner size="md" text={this.props.fallbackText} />}>
        {this.props.children}
      </Suspense>
    );
  }
}

export default LazyBoundary;
