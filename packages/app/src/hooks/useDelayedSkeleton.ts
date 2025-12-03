import { useEffect, useState } from 'react'

/**
 * Custom hook to delay showing skeleton loaders
 *
 * This prevents "flash" of skeleton when data loads quickly.
 * If data loads within the delay period, no skeleton is shown.
 * If loading takes longer than the delay, skeleton appears.
 *
 * @param isLoading - Whether data is currently loading
 * @param delay - Delay in milliseconds before showing skeleton (default: 200ms)
 * @returns Whether to show the skeleton loader
 */
export function useDelayedSkeleton(
  isLoading: boolean,
  delay: number = 200,
): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false)
      return
    }

    // Start a timer when loading begins
    const timer = setTimeout(() => {
      setShowSkeleton(true)
    }, delay)

    // Clean up timer if loading finishes before delay
    return () => {
      clearTimeout(timer)
    }
  }, [isLoading, delay])

  return showSkeleton && isLoading
}

/**
 * Alternative hook that returns both skeleton state and loading state
 * Useful when you need more control over the loading UI
 */
export function useLoadingState(
  isLoading: boolean,
  delay: number = 200,
): { showSkeleton: boolean; isLoading: boolean } {
  const showSkeleton = useDelayedSkeleton(isLoading, delay)

  return {
    showSkeleton,
    isLoading,
  }
}
