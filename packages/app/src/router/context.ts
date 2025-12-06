import type { Session, User } from '@/lib/auth-client';

export interface RouterContext {
  auth: {
    session: Session | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
}
