'use client';

import { APIProvider as GoogleMapsAPIProvider } from '@vis.gl/react-google-maps';
import { env } from '~/lib/env';
// import { useSession } from '~/lib/auth-client';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

export default function OpportunitiesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { data: session, isPending } = useSession();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isPending && !session) {
  //     router.push('/');
  //   }
  // }, [session, isPending, router]);

  // if (isPending) {
  //   return (
  //     <div className="flex h-screen flex-col overflow-hidden">
  //       <div className="border-b border-[var(--secundary)] px-6 py-3">
  //         <div className="flex items-center justify-between">
  //           <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
  //           <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
  //         </div>
  //       </div>
  //       <main className="flex-1 overflow-auto bg-[var(--secundary)] p-6">
  //         <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
  //           <div className="h-8 bg-gray-200 rounded w-3/4" />
  //           <div className="h-64 bg-gray-200 rounded-lg" />
  //           <div className="space-y-2">
  //             <div className="h-4 bg-gray-200 rounded w-1/4" />
  //             <div className="h-4 bg-gray-200 rounded w-1/2" />
  //           </div>
  //         </div>
  //       </main>
  //     </div>
  //   );
  // }

  // if (!session) {
  //   return null;
  // }

  return (
    <GoogleMapsAPIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </GoogleMapsAPIProvider>
  );
}
