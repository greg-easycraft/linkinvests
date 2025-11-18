import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/server/db";
import { users, sessions, accounts, verifications } from "@linkinvests/db";
import { env } from "~/lib/env";

export const auth = betterAuth({
  logger: {
    level: "debug",
  },
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


  advanced: {
    disableCSRFCheck: true,
    disableOriginCheck: true
  },
  
  // // ✅ Fixed: Enable trusted origins for both www and non-www
  // trustedOrigins: [
  //   env.BETTER_AUTH_URL,
  //   "https://linkinvests.easycraft.cloud",
  //   "https://www.linkinvests.easycraft.cloud"
  // ],

  // // ✅ Fixed: Configure cookies to work across subdomains
  // cookies: {
  //   domain: ".linkinvests.easycraft.cloud", // Leading dot allows www and non-www
  //   secure: true, // Required for production HTTPS
  //   sameSite: "lax", // Required for OAuth redirects
  // },

  // ✅ Fixed: Set consistent base URL
  baseURL: env.BETTER_AUTH_URL || "https://linkinvests.easycraft.cloud",
});

export type Session = typeof auth.$Infer.Session.session & {
  user: typeof auth.$Infer.Session.user;
};
export type User = Session['user'];
