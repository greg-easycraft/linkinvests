import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

interface OpportunitiesListSkeletonProps {
  count?: number
}

export function OpportunitiesListSkeleton({
  count = 5,
}: OpportunitiesListSkeletonProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex gap-4">
            {/* Thumbnail skeleton */}
            <Skeleton className="w-24 h-[72px] rounded-sm flex-shrink-0" />

            {/* Content skeleton */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
