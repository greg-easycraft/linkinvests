"use client";
// import { SignInForm } from "~/components/auth/SignInForm";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 3500);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        src="logo-motion.mp4"
      />
      {/* Overlay for better text readability */}
      {/* <div className="absolute inset-0 bg-black/40" /> */}

      {/* Content */}
      <div
        className={`absolute z-10 w-full px-4 bottom-[20vh] transition-opacity duration-700 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* <SignInForm /> */}
        <div className="flex justify-center">
          <Button variant="outline" className="bg-white/10 border-black text-black hover:bg-white/20 hover:text-black transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105" asChild>
            <div className="flex items-center gap-2 p-4 py-6">
              <Link href="/search/listings">
                <div className="text-lg">
                  Invest differently
                </div>
              </Link>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
