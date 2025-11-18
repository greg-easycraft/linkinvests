import { SignUpForm } from "~/components/auth/SignUpForm";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo-w-text.svg"
              alt="LinkInvests Logo"
              width={250}
              height={30}
            />
          </div>
          <p className="text-lg text-[var(--secundary)]">
            Plateforme d&apos;investissement immobilier
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}