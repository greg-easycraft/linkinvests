import React from 'react';

/**
 * Skeleton component for the opportunity count display
 * Shows a loading placeholder while the count is being fetched
 */
export function CountSkeleton(): React.ReactElement {
  return (
    <div className="inline-block">
      <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded h-4 w-16"></div>
    </div>
  );
}