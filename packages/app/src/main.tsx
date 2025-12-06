import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { z } from 'zod'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

// Import schemas

// Import page components
import { AuctionsPage } from './pages/search/AuctionsPage'
import { ListingsPage } from './pages/search/ListingsPage'
import { SuccessionsPage } from './pages/search/SuccessionsPage'
import { LiquidationsPage } from './pages/search/LiquidationsPage'
import { EnergySievesPage } from './pages/search/EnergySievesPage'

// Import detail page components
import {
  AuctionDetailPage,
  EnergySieveDetailPage,
  LiquidationDetailPage,
  ListingDetailPage,
  SuccessionDetailPage,
} from './pages/opportunities'
import type { RouterContext } from '@/router'
import {
  auctionFiltersSchema,
  baseFiltersSchema,
  energyDiagnosticFiltersSchema,
  listingFiltersSchema,
} from '@/schemas/filters.schema'

// Import auth components
import { CheckEmailCard, SignInForm, UserMenu } from '@/components/auth'

// Import theme components
import { ThemeProvider, useTheme } from '@/components/providers/theme-provider'
import { AuthProvider, useAuth } from '@/components/providers/auth-provider'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Import router utilities
import { requireAuth, requireGuest } from '@/router'

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// App Header with Navigation
function AppHeader() {
  const { theme } = useTheme()
  const isDarkTheme = theme === 'dark'

  return (
    <header className="border-b bg-background">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/search/auctions"
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
            to="/search/auctions"
            search={{}}
            className="text-sm hover:text-primary [&.active]:text-primary [&.active]:font-medium"
            activeOptions={{ includeSearch: false }}
          >
            Opportunités
          </Link>
          <UserMenu />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

// Auth layout wrapper (full height since no header)
function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center auth-page">
      <Outlet />
    </div>
  )
}

// Sign-in search schema for redirect parameter
const signInSearchSchema = z.object({
  redirect: z.string().optional(),
})

// Root layout component that conditionally shows header
function RootLayout() {
  const location = useRouterState({ select: (s) => s.location })
  const isAuthRoute = location.pathname === '/' || location.pathname.startsWith('/auth')

  return (
    <>
      {!isAuthRoute && <AppHeader />}
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}

// Root route with context
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

// Index route - redirect to sign-in
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/auth/sign-in' })
  },
})

// Search routes (protected)
const searchAuctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/auctions',
  validateSearch: zodSearchValidator(auctionFiltersSchema),
  beforeLoad: requireAuth,
  component: AuctionsPage,
})

const searchListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/listings',
  validateSearch: zodSearchValidator(listingFiltersSchema),
  beforeLoad: requireAuth,
  component: ListingsPage,
})

const searchSuccessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/successions',
  validateSearch: zodSearchValidator(baseFiltersSchema),
  beforeLoad: requireAuth,
  component: SuccessionsPage,
})

const searchLiquidationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/liquidations',
  validateSearch: zodSearchValidator(baseFiltersSchema),
  beforeLoad: requireAuth,
  component: LiquidationsPage,
})

const searchEnergySievesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/energy-sieves',
  validateSearch: zodSearchValidator(energyDiagnosticFiltersSchema),
  beforeLoad: requireAuth,
  component: EnergySievesPage,
})

// Detail page routes (protected)
const auctionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionId',
  beforeLoad: requireAuth,
  component: AuctionDetailPage,
})

const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listings/$listingId',
  beforeLoad: requireAuth,
  component: ListingDetailPage,
})

const successionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/successions/$successionId',
  beforeLoad: requireAuth,
  component: SuccessionDetailPage,
})

const liquidationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/liquidations/$liquidationId',
  beforeLoad: requireAuth,
  component: LiquidationDetailPage,
})

const energySieveDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/energy-sieves/$energySieveId',
  beforeLoad: requireAuth,
  component: EnergySieveDetailPage,
})

// Auth routes
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthLayout,
})

const signInRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/sign-in',
  validateSearch: zodSearchValidator(signInSearchSchema),
  beforeLoad: requireGuest,
  component: SignInForm,
})

const checkEmailRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/check-email',
  component: CheckEmailCard,
})

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  searchAuctionsRoute,
  searchListingsRoute,
  searchSuccessionsRoute,
  searchLiquidationsRoute,
  searchEnergySievesRoute,
  auctionDetailRoute,
  listingDetailRoute,
  successionDetailRoute,
  liquidationDetailRoute,
  energySieveDetailRoute,
  authLayoutRoute.addChildren([
    signInRoute,
    checkEmailRoute,
  ]),
])

// Inner App component that has access to auth context
function InnerApp() {
  const auth = useAuth()

  const router = createRouter({
    routeTree,
    context: { auth },
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  })

  return <RouterProvider router={router} />
}

// Register router types
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter<typeof routeTree, 'never', boolean>>
  }
}

// Mount app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <InnerApp />
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}

reportWebVitals()
