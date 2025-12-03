import { Inject, Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { CONFIG_TOKEN, type ConfigType } from '~/common/config';
import {
  type OperationResult,
  succeed,
  refuse,
} from '~/common/utils/operation-result';

export enum EmailServiceErrorReason {
  SEND_FAILED = 'SEND_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;

  constructor(@Inject(CONFIG_TOKEN) private readonly config: ConfigType) {
    this.resend = new Resend(this.config.RESEND_API_KEY);
  }

  async sendResetPasswordEmail(
    userEmail: string,
    url: string,
    userName?: string,
  ): Promise<OperationResult<void, EmailServiceErrorReason>> {
    try {
      const body = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Réinitialisez votre mot de passe - LinkInvests</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f9fafb;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0;">Réinitialisation de mot de passe</h1>
                  </div>

                  <div style="margin-bottom: 32px;">
                    <p style="color: #374151; margin: 0 0 16px 0;">Bonjour ${userName || userEmail},</p>
                    <p style="color: #374151; margin: 0 0 16px 0;">Vous avez demandé la réinitialisation de votre mot de passe pour votre compte LinkInvests. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.</p>
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

      const success = await this.sendEmail(
        userEmail,
        'Réinitialisation de mot de passe - LinkInvests',
        body,
      );

      if (!success) {
        return refuse(EmailServiceErrorReason.SEND_FAILED);
      }

      return succeed(undefined);
    } catch (error) {
      this.logger.error('Failed to send reset password email', error);
      return refuse(EmailServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async sendVerificationEmail(
    userEmail: string,
    url: string,
    userName?: string,
  ): Promise<OperationResult<void, EmailServiceErrorReason>> {
    try {
      const body = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Vérifiez votre email - LinkInvests</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f9fafb;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0;">Bienvenue sur LinkInvests</h1>
                  </div>

                  <div style="margin-bottom: 32px;">
                    <p style="color: #374151; margin: 0 0 16px 0;">Bonjour ${userName || userEmail},</p>
                    <p style="color: #374151; margin: 0 0 16px 0;">Merci de vous être inscrit sur LinkInvests ! Pour commencer, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.</p>
                  </div>

                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                      Vérifier l'adresse email
                    </a>
                  </div>

                  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0; word-break: break-all;">${url}</p>
                  </div>

                  <div style="margin-top: 24px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">Ce lien de vérification expirera dans 24 heures. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.</p>
                  </div>
                </div>
              </body>
            </html>
          `;

      const success = await this.sendEmail(
        userEmail,
        'Vérifiez votre email - LinkInvests',
        body,
      );

      if (!success) {
        return refuse(EmailServiceErrorReason.SEND_FAILED);
      }

      return succeed(undefined);
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
      return refuse(EmailServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  private async sendEmail(
    email: string,
    subject: string,
    htmlBody: string,
  ): Promise<boolean> {
    const response = await this.resend.emails.send({
      from: 'LinkInvests <noreply@easycraft.cloud>',
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
