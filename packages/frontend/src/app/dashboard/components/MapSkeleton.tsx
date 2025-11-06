import { Card, CardContent } from "~/components/ui/card";

/**
 * Skeleton component for the OpportunityMap while loading
 * Provides visual feedback during map initialization and data fetching
 */
export function MapSkeleton(): React.ReactElement {
  return (
    <div className="relative w-full h-full">
      {/* Main map area skeleton */}
      <div className="w-full h-full rounded-lg bg-gray-200 animate-pulse" />

      {/* Legend skeleton */}
      <div className="absolute bottom-4 right-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              {/* Legend title skeleton */}
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />

              {/* Legend items skeleton */}
              <div className="space-y-1">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map markers skeleton - scattered dots to simulate markers */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="absolute w-3 h-3 rounded-full bg-gray-300 animate-pulse"
            style={{
              top: `${20 + (index * 13) % 60}%`,
              left: `${15 + (index * 17) % 70}%`,
              animationDelay: `${index * 200}ms`,
            }}
          />
        ))}
      </div>

      {/* Loading overlay with text */}
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
          <div className="text-sm text-gray-600 font-medium">Chargement de la carte...</div>
        </div>
      </div>
    </div>
  );
}