"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.email("Adresse email invalide"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setIsPending(true);

    try {
      await authClient.forgetPassword({
        email: data.email,
        redirectTo: "/reset-password",
      });
      setSuccess(true);
    } catch {
      setError("Échec de l'envoi de l'email de réinitialisation. Veuillez réessayer.");
    } finally {
      setIsPending(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md bg-[var(--secundary)]">
        <CardHeader>
          <CardTitle className="!text-[var(--primary)]">Vérifiez votre email</CardTitle>
          <CardDescription className="!text-[var(--primary)]">
            Nous vous avons envoyé un lien de réinitialisation. Veuillez vérifier votre boîte de réception.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className="text-primary hover:underline text-sm">
            Retour à la connexion
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-[var(--secundary)]">
      <CardHeader>
        <CardTitle className="!text-[var(--primary)]">Mot de passe oublié</CardTitle>
        <CardDescription className="!text-[var(--primary)]">
          Entrez votre adresse email et nous vous enverrons un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[var(--primary)]">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link href="/" className="text-primary hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
