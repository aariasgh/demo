interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'inbox' | 'search' | 'error';
  ctaText?: string;
  onCtaClick?: () => void;
  ariaLabel?: string;
}

const iconMap = {
  inbox: (
    <svg
      className="w-16 h-16 text-gray-300 mx-auto mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  ),
  search: (
    <svg
      className="w-16 h-16 text-gray-300 mx-auto mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-16 h-16 text-gray-300 mx-auto mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export default function EmptyState({
  title,
  description,
  icon = 'inbox',
  ctaText,
  onCtaClick,
  ariaLabel,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4"
      aria-label={ariaLabel}
    >
      {/* Icon */}
      {icon && iconMap[icon]}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-sm text-center">
          {description}
        </p>
      )}

      {/* CTA Button */}
      {ctaText && onCtaClick && (
        <button
          onClick={onCtaClick}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
}
