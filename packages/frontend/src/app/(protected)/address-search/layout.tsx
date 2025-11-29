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
  return (
    <GoogleMapsAPIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </GoogleMapsAPIProvider>
  );
}
