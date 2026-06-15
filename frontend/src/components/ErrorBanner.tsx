import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  autoClose?: number; // ms to auto-close (0 = no close)
  ariaLive?: 'polite' | 'assertive';
}

export default function ErrorBanner({
  message,
  onRetry,
  autoClose = 0,
  ariaLive = 'assertive',
}: ErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-close timer
  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoClose);

      return () => clearTimeout(timer);
    }
    // No cleanup needed when autoClose is 0
    return undefined;
  }, [autoClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live={ariaLive}
      className="flex items-center justify-between bg-red-100 text-red-900 p-4 rounded-md border border-red-300 shadow-sm transition-opacity duration-200"
    >
      {/* Error message */}
      <div className="flex items-center gap-3 flex-1">
        {/* Error icon */}
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {/* Error text */}
        <p className="text-sm font-medium">{message}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
        {/* Retry button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-200 rounded transition-colors duration-200 whitespace-nowrap"
            aria-label="Retry"
          >
            Reintentar
          </button>
        )}

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="inline-flex items-center justify-center p-1 text-red-600 hover:text-red-900 hover:bg-red-200 rounded transition-colors duration-200"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
