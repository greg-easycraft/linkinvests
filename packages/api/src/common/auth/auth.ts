import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Resend } from 'resend';

import { accounts, sessions, users, verifications } from '@linkinvests/db';

import { config } from '../config';

// Create a dedicated postgres client for Better Auth
const client = postgres(config.DATABASE_URL);
const db = drizzle(client);

// Create Resend client for sending emails
const resend = new Resend(config.RESEND_API_KEY);

export const auth = betterAuth({
  basePath: '/api/auth',
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: 'LinkInvests <noreply@easycraft.cloud>',
          to: email,
          subject: 'Connexion à LinkInvests',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Connexion à LinkInvests</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f9fafb;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0;">Connexion à LinkInvests</h1>
                  </div>

                  <div style="margin-bottom: 32px;">
                    <p style="color: #374151; margin: 0 0 16px 0;">Bonjour,</p>
                    <p style="color: #374151; margin: 0 0 16px 0;">Cliquez sur le bouton ci-dessous pour vous connecter à votre compte LinkInvests.</p>
                  </div>

                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                      Se connecter
                    </a>
                  </div>

                  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0; word-break: break-all;">${url}</p>
                  </div>

                  <div style="margin-top: 24px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">Ce lien expirera dans 10 minutes. Si vous n'avez pas demandé cette connexion, vous pouvez ignorer cet email en toute sécurité.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      },
      expiresIn: 600, // 10 minutes
    }),
  ],

  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
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

  trustedOrigins: [config.BETTER_AUTH_URL],

  // Required for hook decorator support
  hooks: {},
});
