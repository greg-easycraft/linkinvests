// Skeleton components for loading state in OpportunityList

function OpportunityCardSkeleton(): React.ReactElement {
  return (
    <div className="cursor-pointer transition-all bg-[var(--secundary)] border-2 border-transparent rounded-lg">
      <div className="flex gap-4 p-4">
        {/* Street View Thumbnail Skeleton */}
        <div className="flex-shrink-0">
          <div className="w-48 h-32 rounded-lg bg-gray-300 animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Header Skeleton */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="h-6 bg-gray-300 rounded-md w-2/3 animate-pulse" />
              <div className="flex gap-2 flex-shrink-0">
                <div className="h-6 bg-gray-300 rounded-full w-20 animate-pulse" />
              </div>
            </div>

            {/* Details Grid Skeleton */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {/* Address Skeleton */}
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 bg-gray-300 rounded animate-pulse" />
                <div className="min-w-0">
                  <div className="h-3 bg-gray-300 rounded w-12 mb-1 animate-pulse" />
                  <div className="h-4 bg-gray-300 rounded w-32 animate-pulse" />
                </div>
              </div>

              {/* Department Skeleton */}
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 bg-gray-300 rounded animate-pulse" />
                <div>
                  <div className="h-3 bg-gray-300 rounded w-16 mb-1 animate-pulse" />
                  <div className="h-4 bg-gray-300 rounded w-20 animate-pulse" />
                </div>
              </div>

              {/* Date Skeleton */}
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 bg-gray-300 rounded animate-pulse" />
                <div>
                  <div className="h-3 bg-gray-300 rounded w-8 mb-1 animate-pulse" />
                  <div className="h-4 bg-gray-300 rounded w-24 animate-pulse" />
                </div>
              </div>

              {/* SIRET Skeleton */}
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 bg-gray-300 rounded animate-pulse" />
                <div className="min-w-0">
                  <div className="h-3 bg-gray-300 rounded w-10 mb-1 animate-pulse" />
                  <div className="h-4 bg-gray-300 rounded w-28 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OpportunityListSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Stats skeleton */}
      <div className="h-4 bg-gray-300 rounded w-48 animate-pulse" />

      {/* Cards Grid Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <OpportunityCardSkeleton key={index} />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center pt-2">
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-300 rounded w-20 animate-pulse" />
          <div className="h-4 bg-gray-300 rounded w-24 animate-pulse" />
          <div className="h-8 bg-gray-300 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
}