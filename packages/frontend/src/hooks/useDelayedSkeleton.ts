import { useState, useEffect } from 'react';
import { SKELETON_TIMEOUT_MS } from '~/constants/ui';

/**
 * Custom hook to delay skeleton loading display to prevent flashing
 * when data loads quickly
 *
 * @param isLoading - The loading state from a query or async operation
 * @param timeout - Optional timeout in milliseconds (defaults to SKELETON_TIMEOUT_MS)
 * @returns boolean indicating whether to show skeleton
 */
export function useDelayedSkeleton(
  isLoading: boolean,
  timeout: number = SKELETON_TIMEOUT_MS
): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [hideTimer, setHideTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If loading starts, show skeleton immediately and clear any hide timer
    if (isLoading) {
      setShowSkeleton(true);
      if (hideTimer) {
        clearTimeout(hideTimer);
        setHideTimer(null);
      }
    } else if (showSkeleton) {
      // If loading stops, keep skeleton visible for at least 'timeout' ms
      const timer = setTimeout(() => {
        setShowSkeleton(false);
        setHideTimer(null);
      }, timeout);
      setHideTimer(timer);

      // Cleanup function clears any running timer
      return () => {
        clearTimeout(timer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Ensure timer is cleared on unmount
  useEffect(() => {
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [hideTimer]);

  return showSkeleton;
}