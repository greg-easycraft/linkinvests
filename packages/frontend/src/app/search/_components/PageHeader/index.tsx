"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserInfo } from "./UserInfo";

export function PageHeader(): React.ReactElement {
  const pathname = usePathname();

  return (
    <div className="border-b border-[var(--secundary)] px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a
            href="https://linkinvests.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.svg"
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
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-[var(--secundary)]'
              }`}
            >
              Recherche
            </Link>
            <Link
              href="/address-search"
              className={`px-3 py-2 text-sm rounded-sm font-medium ${
                pathname === '/address-search'
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                : 'text-[var(--secundary)]'
              }`}
            >
              Recherche d&apos;adresse
            </Link>
          </nav>
        </div>
        <UserInfo />
      </div>
    </div>
  );
}