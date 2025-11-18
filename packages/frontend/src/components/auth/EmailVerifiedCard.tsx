"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function EmailVerifiedCard() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleContinue = () => {
    setIsRedirecting(true);
    router.push("/search");
  };

  // Check if there's an error in the URL parameters
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get("error");

      if (errorParam === "invalid_token") {
        setError("Le lien de vérification est invalide ou a expiré. Veuillez vous inscrire à nouveau.");
      } else if (errorParam) {
        setError("Une erreur s'est produite lors de la vérification. Veuillez réessayer.");
      }
    }
  }, []);

  if (error) {
    return (
      <Card className="w-full max-w-md bg-[var(--secundary)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <CardTitle className="!text-red-600">Vérification échouée</CardTitle>
          <CardDescription className="!text-[var(--primary)]">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <Button
              type="button"
              className="w-full"
              onClick={() => router.push("/sign-up")}
            >
              Créer un nouveau compte
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Retour à la connexion
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-[var(--secundary)]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <CardTitle className="!text-[var(--primary)]">Email vérifié !</CardTitle>
        <CardDescription className="!text-[var(--primary)]">
          Votre adresse email a été vérifiée avec succès.
          Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <p className="text-sm text-[var(--primary)]">
            Bienvenue sur LinkInvests !
          </p>

          <Button
            type="button"
            className="w-full"
            onClick={handleContinue}
            disabled={isRedirecting}
          >
            {isRedirecting ? "Redirection..." : "Continuer vers l'application"}
          </Button>

          <div className="pt-4 border-t border-[var(--primary)]">
            <p className="text-xs text-[var(--primary)] opacity-75">
              Vous pouvez maintenant explorer les opportunités d&apos;investissement
              et commencer à constituer votre portefeuille immobilier.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}