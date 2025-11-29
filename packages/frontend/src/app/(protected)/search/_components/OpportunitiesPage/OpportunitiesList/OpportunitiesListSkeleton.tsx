// Skeleton components for loading state in OpportunityList

function OpportunityCardSkeleton(): React.ReactElement {
  return (
    <div className="cursor-pointer transition-all bg-[var(--secundary)] rounded-lg">
      <div className="flex gap-4 p-4">
        {/* Street View Thumbnail Skeleton */}
        <div className="flex-shrink-0">
          <div className="w-24 h-16 rounded-sm bg-gray-300 animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Header Skeleton */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="h-5 bg-gray-300 rounded-md w-1/2 animate-pulse" />
              <div className="flex gap-2 flex-shrink-0">
                <div className="h-6 bg-gray-300 rounded-full w-16 animate-pulse" />
              </div>
            </div>

            {/* Details Grid Skeleton */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {/* Address Skeleton */}
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 bg-gray-300 rounded animate-pulse" />
                <div className="min-w-0">
                  <div className="h-3 bg-gray-300 rounded w-12 mb-1 animate-pulse" />
                  <div className="h-3 bg-gray-300 rounded w-24 animate-pulse" />
                </div>
              </div>

              {/* Date Skeleton */}
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 bg-gray-300 rounded animate-pulse" />
                <div>
                  <div className="h-3 bg-gray-300 rounded w-8 mb-1 animate-pulse" />
                  <div className="h-3 bg-gray-300 rounded w-20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OpportunitiesListSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Cards Grid Skeleton */}
      <div className="space-y-2">
        {[...Array(8)].map((_, index) => (
          <OpportunityCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}