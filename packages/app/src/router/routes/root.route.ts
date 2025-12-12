import { createRootRouteWithContext, createRoute, redirect } from '@tanstack/react-router'

import type { RouterContext } from '@/router/context'
import { RootLayout } from '@/components/layouts'

// Root route with context
export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

// Index route - redirect based on auth status
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/search' })
    }
    throw redirect({ to: '/auth/sign-in' })
  },
})
