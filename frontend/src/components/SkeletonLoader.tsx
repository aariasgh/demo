interface SkeletonLoaderProps {
  count?: number;
  type?: 'list' | 'card' | 'grid';
  ariaLabel?: string;
}

export default function SkeletonLoader({
  count = 4,
  type = 'card',
  ariaLabel = 'Loading content',
}: SkeletonLoaderProps) {
  const getGridClass = () => {
    const baseClasses =
      'grid gap-4 md:gap-6 w-full';
    switch (type) {
      case 'list':
        return `${baseClasses}`;
      case 'card':
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
      case 'grid':
        return `${baseClasses} grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
      default:
        return baseClasses;
    }
  };

  return (
    <div
      className={getGridClass()}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          {/* Header skeleton */}
          <div className="h-4 bg-gray-200 rounded animate-pulse" />

          {/* Content skeleton lines */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-4/6" />
          </div>

          {/* Footer skeleton (for card type) */}
          {type === 'card' && (
            <div className="flex gap-2 pt-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
              <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
            </div>
          )}
        </div>
      ))}

      {/* Accessibility: hidden live region */}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
