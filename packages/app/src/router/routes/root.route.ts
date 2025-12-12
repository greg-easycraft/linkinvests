import {
  createRootRouteWithContext,
  createRoute,
  redirect,
} from '@tanstack/react-router'

import type { RouterContext } from '@/router/context'
import { RootLayout } from '@/components/layouts'
import { DashboardPage } from '@/pages/dashboard'

// Root route with context
export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

// Index route - Dashboard for authenticated users
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated && !context.auth.isLoading) {
      throw redirect({ to: '/auth/sign-in' })
    }
    if (context.auth.isBanned && !context.auth.isLoading) {
      throw redirect({ to: '/auth/banned' })
    }
  },
  component: DashboardPage,
})
