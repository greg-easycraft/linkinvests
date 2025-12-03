import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

// Import schemas
import {
  auctionFiltersSchema,
  listingFiltersSchema,
  energyDiagnosticFiltersSchema,
  baseFiltersSchema,
} from '@/schemas/filters.schema'

// Import page components
import { AuctionsPage } from './pages/search/AuctionsPage'
import { ListingsPage } from './pages/search/ListingsPage'
import { SuccessionsPage } from './pages/search/SuccessionsPage'
import { LiquidationsPage } from './pages/search/LiquidationsPage'
import { EnergySievesPage } from './pages/search/EnergySievesPage'

// Import auth components
import { SignInForm } from '@/components/auth/SignInForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { VerifyEmailCard } from '@/components/auth/VerifyEmailCard'

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
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          Linkinvest
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/search/auctions"
            className="text-sm hover:text-primary [&.active]:text-primary [&.active]:font-medium"
          >
            Enchères
          </Link>
          <Link
            to="/search/listings"
            className="text-sm hover:text-primary [&.active]:text-primary [&.active]:font-medium"
          >
            Annonces
          </Link>
          <Link
            to="/search/successions"
            className="text-sm hover:text-primary [&.active]:text-primary [&.active]:font-medium"
          >
            Successions
          </Link>
          <Link
            to="/search/liquidations"
            className="text-sm hover:text-primary [&.active]:text-primary [&.active]:font-medium"
          >
            Liquidations
          </Link>
          <Link
            to="/search/energy-sieves"
            className="text-sm hover:text-primary [&.active]:text-primary [&.active]:font-medium"
          >
            Passoires énergétiques
          </Link>
          <Link to="/auth/sign-in" className="text-sm hover:text-primary">
            Connexion
          </Link>
        </nav>
      </div>
    </header>
  )
}

// Home page
function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Bienvenue sur Linkinvest</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Découvrez les meilleures opportunités immobilières
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/search/auctions">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
            Voir les enchères
          </button>
        </Link>
        <Link to="/search/listings">
          <button className="px-6 py-3 border rounded-lg hover:bg-accent">
            Voir les annonces
          </button>
        </Link>
      </div>
    </div>
  )
}

// Auth layout wrapper
function AuthLayout() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Outlet />
    </div>
  )
}

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <AppHeader />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})

// Index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

// Search routes
const searchAuctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/auctions',
  validateSearch: zodSearchValidator(auctionFiltersSchema),
  component: AuctionsPage,
})

const searchListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/listings',
  validateSearch: zodSearchValidator(listingFiltersSchema),
  component: ListingsPage,
})

const searchSuccessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/successions',
  validateSearch: zodSearchValidator(baseFiltersSchema),
  component: SuccessionsPage,
})

const searchLiquidationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/liquidations',
  validateSearch: zodSearchValidator(baseFiltersSchema),
  component: LiquidationsPage,
})

const searchEnergySievesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/energy-sieves',
  validateSearch: zodSearchValidator(energyDiagnosticFiltersSchema),
  component: EnergySievesPage,
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
  component: SignInForm,
})

const signUpRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/sign-up',
  component: SignUpForm,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/forgot-password',
  component: ForgotPasswordForm,
})

const verifyEmailRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/verify-email',
  component: VerifyEmailCard,
})

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  searchAuctionsRoute,
  searchListingsRoute,
  searchSuccessionsRoute,
  searchLiquidationsRoute,
  searchEnergySievesRoute,
  authLayoutRoute.addChildren([
    signInRoute,
    signUpRoute,
    forgotPasswordRoute,
    verifyEmailRoute,
  ]),
])

// Create router
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register router types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Mount app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

reportWebVitals()
