"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { authClient } from "~/lib/auth-client";
import Link from "next/link";

export function VerifyEmailCard() {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);

  // Rate limiting: 1 minute between resends
  const RATE_LIMIT_MS = 60 * 1000;

  const handleResendEmail = async () => {
    const now = Date.now();

    if (lastResendTime && (now - lastResendTime) < RATE_LIMIT_MS) {
      const remainingTime = Math.ceil((RATE_LIMIT_MS - (now - lastResendTime)) / 1000);
      setResendMessage(`Please wait ${remainingTime} seconds before resending.`);
      return;
    }

    setIsResending(true);
    setResendMessage(null);

    try {
      // Get the current user's email from session if available
      const session = await authClient.getSession();

      if (session?.data?.user?.email) {
        await authClient.sendVerificationEmail({
          email: session.data.user.email,
          callbackURL: `${window.location.origin}/email-verified`,
        });

        setResendMessage("Verification email sent! Please check your inbox.");
        setLastResendTime(now);
      } else {
        setResendMessage("Unable to resend email. Please sign up again.");
      }
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      setResendMessage("Failed to resend email. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  const getRemainingTime = () => {
    if (!lastResendTime) return 0;
    const now = Date.now();
    const remaining = Math.max(0, RATE_LIMIT_MS - (now - lastResendTime));
    return Math.ceil(remaining / 1000);
  };

  const isRateLimited = lastResendTime && (Date.now() - lastResendTime) < RATE_LIMIT_MS;

  return (
    <Card className="w-full max-w-md bg-[var(--secundary)]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <CardTitle className="!text-[var(--primary)]">Vérifiez votre email</CardTitle>
        <CardDescription className="!text-[var(--primary)]">
          Nous avons envoyé un email de vérification à votre adresse.
          Cliquez sur le lien dans l&apos;email pour activer votre compte.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <p className="text-sm text-[var(--primary)]">
            Vous n&apos;avez pas reçu l&apos;email ? Vérifiez votre dossier spam ou cliquez ci-dessous pour renvoyer.
          </p>

          {resendMessage && (
            <div className={`rounded-md p-4 text-sm border ${
              resendMessage.includes("sent") || resendMessage.includes("envoyé")
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              {resendMessage}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendEmail}
            disabled={isResending || Boolean(isRateLimited)}
          >
            {isResending
              ? "Envoi en cours..."
              : isRateLimited
                ? `Renvoyer dans ${getRemainingTime()}s`
                : "Renvoyer l'email de vérification"
            }
          </Button>

          <div className="pt-4 border-t border-[var(--primary)]">
            <p className="text-sm text-[var(--primary)]">
              Problème avec votre compte ?{" "}
              <Link href="/" className="text-primary hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}