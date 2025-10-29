"use client";

import { ResetPasswordForm } from "~/components/auth/ResetPasswordForm";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--primary)]">
        <div className="w-full max-w-md px-4">
          <div className="text-center">
            <p className="text-red-600">Invalid or missing reset token.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--primary)]">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo.svg"
              alt="LinkInvests Logo"
              width={32}
              height={32}
            />
            <h1 className="text-4xl font-bold text-gray-900">linkinvests</h1>
          </div>
          <p className="text-lg text-gray-600">
            Plateforme d&apos;investissement immobilier
          </p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
