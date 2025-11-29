"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserInfo } from "./UserInfo";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { useTheme } from "~/components/providers/theme-provider";
import { useEffect, useState } from "react";

export function PageHeader(): React.ReactElement {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
}, []);

  return (
    <nav className={`h-[var(--header-height)] px-6 py-3 shadow-sm sticky top-0 z-50 ${scrolled ? 'bg-white' : 'bg-[var(--background-color)]'}`}>
      <div className="flex items-center justify-between">
          <a
            href="https://linkinvests.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src={isDarkTheme ? "/logo.svg" : "/logo-dark.svg"}
              alt="LinkInvests Logo"
              width={20}
              height={20}
            />
          </a>
        <div className="flex items-center gap-8">

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/search"
              className={`px-3 py-2 text-sm rounded-sm font-medium ${
                pathname.startsWith('/search')
                ? ' hover:text-gray-900 hover:bg-gray-100'
                : 'text-gray-400'
              }`}
            >
              Recherche
            </Link>
            <Link
              href="/address-search"
              className={`px-3 py-2 text-sm rounded-sm font-medium ${
                pathname === '/address-search'
                ? ' hover:text-gray-900 hover:bg-gray-100'
                : 'text-gray-400'
              }`}
            >
              Adresses
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserInfo />
        </div>
      </div>
    </nav>
  );
}