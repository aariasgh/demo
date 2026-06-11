/**
 * Skeleton Loader Components
 * Shows placeholder UI while content loads
 */

export function SkeletonWidgetLoader() {
  return (
    <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
      </div>
      <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
    </div>
  );
}

export function SkeletonLeadCard() {
  return (
    <div className="p-4 border-l-4 border-gray-300 space-y-2">
      <div className="h-5 bg-gray-300 rounded w-40 animate-pulse"></div>
      <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  );
}

export function SkeletonPanelLoader() {
  return (
    <div className="divide-y divide-gray-200">
      {[1, 2, 3].map((i) => (
        <SkeletonLeadCard key={i} />
      ))}
    </div>
  );
}
