"use client";
// import { SignInForm } from "~/components/auth/SignInForm";
import { useEffect, useState } from "react";

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
        <div className="text-center text-3xl text-[#3E3E3E]">Merci à tous pour un superbe évènement, l'application sera de retour début 2026 !</div>
      </div>
    </div>
  );
}
