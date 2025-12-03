import type { auth } from './auth';

export type Session = typeof auth.$Infer.Session.session & {
  user: typeof auth.$Infer.Session.user;
};

export type User = typeof auth.$Infer.Session.user;
