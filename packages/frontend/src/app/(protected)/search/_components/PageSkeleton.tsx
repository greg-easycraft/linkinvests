'use client';

/**
 * Comprehensive page skeleton that mimics the complete page layout
 * including header, filters sidebar, and main content area
 */
export default function PageSkeleton(): React.ReactElement {
  return (
    <div className="flex flex-col h-screen">
      {/* Header Skeleton */}
      <div className="border-b border-[var(--secundary)] px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-300 mr-4 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-300 mx-4 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-300 mx-4 rounded animate-pulse"></div>
          </div>
          {/* User info skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 flex overflow-hidden bg-(--secundary)">
        {/* Filters Sidebar Skeleton - Hidden on mobile */}
        <div className="hidden md:block w-80 transition-all duration-300 ease-in-out border-r border-neutral-700">
          <div className="p-4 h-full">
            {/* View Toggle Skeleton */}
            <div className="w-full h-10 bg-gray-300 rounded animate-pulse mt-2 mb-6"></div>

            {/* Type Selector Skeleton */}
            <div className="mb-6">
              <div className="w-24 h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Departments Filter Skeleton */}
            <div className="mb-6">
              <div className="w-28 h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Zip Codes Filter Skeleton */}
            <div className="mb-6">
              <div className="w-32 h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Date Period Filter Skeleton */}
            <div className="mb-6">
              <div className="w-20 h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-300 rounded animate-pulse"></div>
            </div>

          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <div className="w-full rounded py-2 mb-4">
            <div className="w-full rounded bg-gray-300 h-[40px] animate-pulse">
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden p-4 bg-gray-300 rounded animate-pulse">
          </div>
        </div>
      </div>
    </div>
  );
}