import { Resend } from "resend";
import { env } from "~/lib/env";

export class EmailService {
    constructor(private readonly resend: Resend = new Resend(env.RESEND_API_KEY)) { }

    async sendResetPasswordEmail(userEmail: string, url: string, userName?: string): Promise<void> {
        const body = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Réinitialisez votre mot de passe - Linkinvests</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f9fafb;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0;">Réinitialisation de mot de passe</h1>
                  </div>

                  <div style="margin-bottom: 32px;">
                    <p style="color: #374151; margin: 0 0 16px 0;">Bonjour ${userName || userEmail},</p>
                    <p style="color: #374151; margin: 0 0 16px 0;">Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Linkinvests. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.</p>
                  </div>

                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                      Réinitialiser le mot de passe
                    </a>
                  </div>

                  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0; word-break: break-all;">${url}</p>
                  </div>

                  <div style="margin-top: 24px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">Ce lien de réinitialisation expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
                  </div>

                  <div style="margin-top: 16px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">Pour votre sécurité, ne partagez jamais ce lien avec d'autres personnes.</p>
                  </div>
                </div>
              </body>
            </html>
    `;

        const success = await this.sendEmail(userEmail, "Réinitialisation de mot de passe - LinkInvests", body);

        if (!success) {
            throw new Error("Failed to send reset password email");
        }
    }

    async sendVerificationEmail(userEmail: string, url: string, userName?: string): Promise<void> {
        const body = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Verify your email - Linkinvests</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f9fafb;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0;">Welcome to Linkinvests</h1>
                  </div>

                  <div style="margin-bottom: 32px;">
                    <p style="color: #374151; margin: 0 0 16px 0;">Hi ${userName || userEmail},</p>
                    <p style="color: #374151; margin: 0 0 16px 0;">Thanks for signing up for Linkinvests! To get started, please verify your email address by clicking the button below.</p>
                  </div>

                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                      Verify Email Address
                    </a>
                  </div>

                  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0; word-break: break-all;">${url}</p>
                  </div>

                  <div style="margin-top: 24px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
                  </div>
                </div>
              </body>
            </html>
          `;

        const success = await this.sendEmail(userEmail, "Verify your email - LinkInvests", body);

        if (!success) {
            throw new Error("Failed to send verification email");
        }
    }

    private async sendEmail(email: string, subject: string, htmlBody: string): Promise<boolean> {
        const response = await this.resend.emails.send({
            from: "Linkinvests <noreply@linkinvests.com>",
            to: email,
            subject,
            html: htmlBody,
        });

        if (response.error) {
            return false;
        }

        return true;
    }
}