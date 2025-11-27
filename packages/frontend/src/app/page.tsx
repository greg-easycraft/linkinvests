// import { SignInForm } from "~/components/auth/SignInForm";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        loop
        src="https://linkinvests.com/wp-content/uploads/2025/06/0_Modern_House_3840x2160.webm"
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Logo at top left */}
      <div className="absolute top-6 left-6 z-10">
        <Image
          src="/logo-w-text.svg"
          alt="LinkInvests Logo"
          width={250}
          height={30}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-300 text-white">
            Plateforme d&apos;investissement immobilier
          </h1>
        </div>
        {/* <SignInForm /> */}
        <div className="flex justify-center">
          <Button variant="outline" className="bg-white/10 border-white text-white hover:bg-black/10 hover:text-white" asChild>
            <div className="flex items-center gap-2 p-4 py-6">
              <Link href="/search/listings">
                <div className="flex items-center gap-2 text-lg">
                  <Image
                    src="/logo.svg"
                    alt=""
                    width={20}
                    height={20}
                  />
                  Accéder à la plateforme
                </div>
              </Link>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
