"use client";

import { createAuthClient } from "better-auth/react";
import type { Session, User } from "./auth";
import { env } from "~/lib/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;

export type { Session, User };
