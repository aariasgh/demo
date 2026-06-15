import { useMemo, useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
  ariaLabel?: string;
}

export default function LoadingSpinner({
  size = 'md',
  text,
  fullscreen = false,
  ariaLabel = 'Loading',
}: LoadingSpinnerProps) {
  // Determine size classes
  const sizeClasses = useMemo(() => {
    const sizeMap = {
      sm: { spinner: 'w-8 h-8', text: 'text-sm' },
      md: { spinner: 'w-12 h-12', text: 'text-base' },
      lg: { spinner: 'w-16 h-16', text: 'text-lg' },
    };
    return sizeMap[size];
  }, [size]);

  // Check prefers-reduced-motion - use state to handle test environment
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Safe check for matchMedia availability
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Listen for changes
      const handler = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // No cleanup needed when matchMedia is not available
    return undefined;
  }, []);

  // Container classes
  const containerClass = fullscreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/50'
    : 'flex flex-col items-center justify-center';

  return (
    <div
      className={`${containerClass} motion-reduce-enabled`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      {/* SVG Spinner */}
      <svg
        className={`${sizeClasses.spinner} ${
          prefersReducedMotion ? '' : 'animate-spin'
        } text-blue-500`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        data-testid="loading-spinner"
      >
        {/* Background circle (light gray) */}
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        {/* Animated circle (colored) */}
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      {/* Loading Text */}
      {text && (
        <p
          className={`${sizeClasses.text} text-gray-600 mt-2 font-medium`}
        >
          {text}
        </p>
      )}

      {/* Hidden accessibility text */}
      {!text && <span className="sr-only">{ariaLabel}</span>}
    </div>
  );
}
