import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "~/server/db";
import { users, sessions, accounts, verifications } from "@linkinvests/db";
import { env } from "~/lib/env";
import { EmailService } from "~/server/services";

const emailService = new EmailService();

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
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        await emailService.sendResetPasswordEmail(user.email, url, user.name);
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw new Error("Failed to send password reset email");
      }
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await emailService.sendVerificationEmail(user.email, url, user.name);
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw new Error("Failed to send verification email");
      }
    },
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

  trustedOrigins: [
    env.BETTER_AUTH_URL,
    "https://linkinvests.easycraft.cloud",
    "https://www.linkinvests.easycraft.cloud"
  ],

  baseURL: env.BETTER_AUTH_URL || "https://linkinvests.easycraft.cloud",
});

export type Session = typeof auth.$Infer.Session.session & {
  user: typeof auth.$Infer.Session.user;
};
export type User = Session['user'];
