"use client";

import { useSession } from "~/lib/auth-client";
import { SignOutButton } from "~/components/auth/SignOutButton";

export function UserInfo() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <p className="font-medium">{session.user.name}</p>
        <p className="text-gray-500 text-xs">{session.user.email}</p>
      </div>
      <SignOutButton />
    </div>
  );
}
