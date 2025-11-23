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
            <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
          {/* User info skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 flex overflow-hidden bg-(--secundary)">
        {/* Filters Sidebar Skeleton - Hidden on mobile */}
        <div className="hidden md:block w-80 transition-all duration-300 ease-in-out border-r border-neutral-700">
          <div className="p-4 h-full">
            {/* View Toggle Skeleton */}
            <div className="mb-6">
              <div className="w-32 h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="flex gap-2">
                <div className="w-16 h-8 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>

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

            {/* Energy Classes Filter Skeleton (conditional) */}
            <div className="mb-6">
              <div className="w-36 h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-2 mt-8">
              <div className="flex-1 h-10 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-20 h-10 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <div className="flex-1 overflow-hidden">
            {/* Content Header Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle button */}
                <div className="md:hidden w-10 h-10 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-48 h-6 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-24 h-8 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Grid Content Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="w-32 h-4 bg-gray-300 rounded animate-pulse mb-1"></div>
                      <div className="w-24 h-3 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div className="w-16 h-6 bg-gray-300 rounded animate-pulse"></div>
                  </div>

                  {/* Image Skeleton */}
                  <div className="w-full h-32 bg-gray-300 rounded animate-pulse mb-3"></div>

                  {/* Content Skeleton */}
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-gray-300 rounded animate-pulse"></div>
                    <div className="w-1/2 h-4 bg-gray-300 rounded animate-pulse"></div>
                  </div>

                  {/* Footer Skeleton */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}