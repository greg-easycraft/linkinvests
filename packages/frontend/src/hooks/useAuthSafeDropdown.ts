"use client";

import { useEffect, useState } from "react";
import { useSession } from "~/lib/auth-client";

/**
 * Custom hook that provides safe dropdown state management during authentication changes.
 * Automatically closes dropdowns when the user session changes to prevent
 * portal cleanup conflicts during component unmounting.
 */
export function useAuthSafeDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  // Close dropdown when auth state changes (login/logout/session change)
  useEffect(() => {
    setIsOpen(false);
  }, [session?.user?.id]);

  // Close dropdown before unmount to prevent portal conflicts
  useEffect(() => {
    return () => {
      setIsOpen(false);
    };
  }, []);

  return { isOpen, setIsOpen };
}