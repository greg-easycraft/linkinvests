import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  basePath: '/api/auth',
  plugins: [magicLinkClient()],
});

export const { useSession, signIn, signOut } = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = Session['user'];
