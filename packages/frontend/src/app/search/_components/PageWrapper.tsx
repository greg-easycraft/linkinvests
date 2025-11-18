'use client';

import { Suspense } from 'react';
import PageSkeleton from './PageSkeleton';

interface PageWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides Suspense boundary for pages using useSearchParams
 * Required for Next.js 15 compatibility
 * Shows a comprehensive page skeleton that mimics the complete layout
 */
export default function PageWrapper({ children }: PageWrapperProps): React.ReactElement {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {children}
    </Suspense>
  );
}