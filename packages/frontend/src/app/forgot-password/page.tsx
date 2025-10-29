import { ForgotPasswordForm } from "~/components/auth/ForgotPasswordForm";
import Image from "next/image";

export default function ForgotPasswordPage() {
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
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
