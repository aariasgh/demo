import React, { Suspense } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import LoadingSpinner from './LoadingSpinner';
import logger, { useLogger } from '../utils/logger';

/**
 * AI-8: Improved LazyBoundary with Enhanced Error Handling
 *
 * Features:
 * - Structured error logging
 * - Retry counter with max attempts
 * - Better error messages for different failure types
 * - Accessibility improvements
 * - Testing support via data-testid
 */

interface LazyBoundaryProps {
  children: ReactNode;
  fallbackText: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  showErrorDetails?: boolean;
}

interface LazyBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  errorInfo: ErrorInfo | null;
}

/**
 * Get user-friendly error message based on error type
 */
function getErrorMessage(error: Error, fallbackText: string): string {
  const message = error.message.toLowerCase();

  // Network error
  if (message.includes('failed to fetch') || message.includes('network')) {
    return `Fallo de red al cargar ${fallbackText}. Verifica tu conexión.`;
  }

  // Timeout error
  if (message.includes('timeout')) {
    return `Tiempo de carga agotado para ${fallbackText}. La red puede estar lenta.`;
  }

  // Chunk loading error (common with code-splitting)
  if (message.includes('loading chunk') || message.includes('chunk')) {
    return `Error al descargar componente ${fallbackText}. Intenta actualizar la página.`;
  }

  // Module not found
  if (message.includes('module not found')) {
    return `Componente ${fallbackText} no encontrado. Contacta a soporte.`;
  }

  // Default message
  return `Error al cargar ${fallbackText}: ${error.message}`;
}

class LazyBoundary extends React.Component<LazyBoundaryProps, LazyBoundaryState> {
  private maxRetries: number;
  private showErrorDetails: boolean;

  constructor(props: LazyBoundaryProps) {
    super(props);
    this.maxRetries = props.maxRetries ?? 3;
    this.showErrorDetails = props.showErrorDetails ?? process.env.NODE_ENV === 'development';
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Omit<LazyBoundaryState, 'retryCount' | 'errorInfo'> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with context
    logger.error(`[LazyBoundary] Failed to load component: ${this.props.fallbackText}`, error, {
      componentName: this.props.fallbackText,
      retryCount: this.state.retryCount,
      componentStack: errorInfo.componentStack,
      errorMessage: error.message,
    });

    // Update state with error details
    this.setState({ errorInfo });

    // Call parent error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Retry loading the component
   */
  retry = () => {
    const { retryCount } = this.state;

    // Check if max retries exceeded
    if (retryCount >= this.maxRetries) {
      logger.error(
        `[LazyBoundary] Max retries (${this.maxRetries}) exceeded for ${this.props.fallbackText}`,
        undefined,
        { component: this.props.fallbackText, retryCount }
      );
      return; // Don't reset, show max retries message
    }

    logger.info(
      `[LazyBoundary] Retrying load (attempt ${retryCount + 1}/${this.maxRetries}) for ${this.props.fallbackText}`
    );

    this.setState({
      hasError: false,
      error: null,
      retryCount: retryCount + 1,
      errorInfo: null,
    });
  };

  /**
   * Check if max retries exceeded
   */
  isMaxRetriesExceeded(): boolean {
    return this.state.retryCount >= this.maxRetries;
  }

  render() {
    const { hasError, error, retryCount, errorInfo } = this.state;
    const { fallbackText } = this.props;

    if (hasError && error) {
      const isMaxRetries = this.isMaxRetriesExceeded();
      const errorMessage = getErrorMessage(error, fallbackText);

      return (
        <div
          className="fixed bottom-4 right-4 bg-red-50 border border-red-300 rounded-lg p-4 shadow-lg max-w-sm z-50"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          data-testid="lazy-error-boundary"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-700 text-sm">Error cargando {fallbackText}</h3>
              <p className="text-sm text-red-600 mt-1">{errorMessage}</p>

              {/* Development: Show detailed error info */}
              {this.showErrorDetails && (
                <details className="mt-3 text-xs text-red-500 border-t border-red-200 pt-2">
                  <summary className="cursor-pointer font-mono">Detalles técnicos</summary>
                  <div className="mt-2 max-h-40 overflow-y-auto bg-red-100 p-2 rounded font-mono whitespace-pre-wrap break-words">
                    <p>{error.message}</p>
                    {errorInfo?.componentStack && (
                      <>
                        <p className="mt-2 font-bold">Stack:</p>
                        <p>{errorInfo.componentStack}</p>
                      </>
                    )}
                  </div>
                </details>
              )}

              {/* Retry info */}
              {!isMaxRetries && (
                <p className="text-xs text-red-500 mt-2">
                  Intento {retryCount + 1} de {this.maxRetries}
                </p>
              )}
              {isMaxRetries && (
                <p className="text-xs text-red-700 font-semibold mt-2">
                  Máximo número de reintentos alcanzado. Por favor, recarga la página.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={this.retry}
              disabled={isMaxRetries}
              className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              aria-label={`Reintentar cargar ${fallbackText}`}
              data-testid="lazy-error-retry"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition"
              aria-label="Recargar página"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={<LoadingSpinner size="md" text={`Cargando ${fallbackText}...`} />}>
        {this.props.children}
      </Suspense>
    );
  }
}

export default LazyBoundary;
