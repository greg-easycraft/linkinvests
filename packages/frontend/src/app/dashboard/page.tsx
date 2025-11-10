"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /dashboard to /dashboard/auctions as the default view
export default function DashboardPage(): React.ReactElement {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/auctions");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p>Redirecting to auctions...</p>
      </div>
    </div>
  );
}
