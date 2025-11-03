import { SignInForm } from "~/components/auth/SignInForm";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--primary)]">
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
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              Accéder à la plateforme
            </Link>
          </Button>
        {/* <SignInForm /> */}
      </div>
    </div>
  );
}
