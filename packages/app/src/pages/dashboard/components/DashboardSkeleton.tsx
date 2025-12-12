import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4 space-y-8">
      {/* Welcome Banner Skeleton */}
      <Skeleton className="h-32 w-full rounded-xl" />

      {/* Statistics Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>

      {/* Main Content Skeleton */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>

      {/* Quick Actions Skeleton */}
      <Skeleton className="h-28 rounded-xl" />
    </div>
  )
}
