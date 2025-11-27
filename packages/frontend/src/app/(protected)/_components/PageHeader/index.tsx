"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserInfo } from "./UserInfo";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { useTheme } from "~/components/providers/theme-provider";

export function PageHeader(): React.ReactElement {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  return (
    <div className={`h-[var(--header-height)] border-b border-[var(--primary)] px-6 py-3 shadow-lg sticky top-0 z-50 bg-[var(--background-color)]`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
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

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/search"
              className={`px-3 py-2 text-sm rounded-sm font-medium ${
                pathname.startsWith('/search') && pathname !== '/address-search'
                ? 'text-gray-400'
                : ' hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Recherche
            </Link>
            <Link
              href="/address-search"
              className={`px-3 py-2 text-sm rounded-sm font-medium ${
                pathname === '/address-search'
                ? 'text-gray-400'
                : ' hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Recherche d&apos;adresse
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserInfo />
        </div>
      </div>
    </div>
  );
}