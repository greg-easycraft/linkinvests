import { Link } from '@tanstack/react-router'

import { useTheme } from '@/components/providers/theme-provider'
import { UserMenu } from '@/components/auth'

export function AppHeader() {
  const { theme } = useTheme()
  const isDarkTheme = theme === 'dark'

  return (
    <header className="border-b bg-background">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={isDarkTheme ? '/logo.svg' : '/logo-dark.svg'}
            alt="LinkInvests Logo"
            width={24}
            height={24}
          />
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm hover:text-primary [&.active]:text-primary [&.active]:font-medium"
          >
            Tableau de bord
          </Link>
          <Link
            to="/search"
            search={{}}
            className="text-sm hover:text-primary [&.active]:text-primary [&.active]:font-medium"
            activeOptions={{ includeSearch: false }}
          >
            Recherche
          </Link>
          <Link
            to="/favorites"
            className="text-sm hover:text-primary [&.active]:text-primary [&.active]:font-medium flex items-center gap-1"
          >
            Mes Opportunités
          </Link>
          <Link
            to="/search/address"
            className="text-sm hover:text-primary [&.active]:text-primary [&.active]:font-medium"
          >
            Adresses
          </Link>
        </nav>
        <UserMenu />
      </div>
    </header>
  )
}
