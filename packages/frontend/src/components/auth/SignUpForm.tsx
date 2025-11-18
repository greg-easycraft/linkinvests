"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

const signUpSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);
    setIsPending(true);

    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        setError(result.error.message || "An error occurred during sign up");
      } else {
        router.push("/search");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsPending(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/search",
      });
    } catch {
      setError("Failed to sign up with Google");
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-[var(--secundary)]">
      <CardHeader>
        <CardTitle className="!text-[var(--primary)]">Créer un compte</CardTitle>
        <CardDescription className="!text-[var(--primary)]">Créez votre nouveau compte</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-[var(--primary)]">
              Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[var(--primary)]">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[var(--primary)]">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--primary)]">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="space-y-2 text-center text-sm">
          <div>
            <span className="text-[var(--primary)]">Déjà un compte ? </span>
            <Link href="/" className="text-primary hover:underline">
              Connectez-vous
            </Link>
          </div>
        </div>

        <hr className="w-full border-t border-[var(--primary)] mx-2" />
        <div className="flex items-center justify-center">
          <span className="bg-background px-2 text-[var(--primary)]">
            Ou continuez avec
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignUp}
          disabled={isPending}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
}