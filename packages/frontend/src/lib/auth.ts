import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/server/db";
import { users, sessions, accounts, verifications } from "@linkinvests/db";
import { env } from "~/lib/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },

  // trustedOrigins: [
  //   env.BETTER_AUTH_URL,
  //   "https://linkinvests.easycraft.cloud"
  // ],

  advanced: {
    disableCSRFCheck: true,
  },
});

export type Session = typeof auth.$Infer.Session.session & {
  user: typeof auth.$Infer.Session.user;
};
export type User = Session['user'];
