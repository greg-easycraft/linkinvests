import { createRoute } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { z } from 'zod'

import { rootRoute } from './root.route'
import { requireGuest } from '@/router/guards'
import { AuthLayout } from '@/components/layouts'
import { BannedCard, CheckEmailCard, SignInForm } from '@/components/auth'

// Sign-in search schema for redirect parameter
const signInSearchSchema = z.object({
  redirect: z.string().optional(),
})

// Auth layout route - redirects to /search if authenticated
export const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  beforeLoad: requireGuest,
  component: AuthLayout,
})

export const signInRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/sign-in',
  validateSearch: zodSearchValidator(signInSearchSchema),
  component: SignInForm,
})

export const checkEmailRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/check-email',
  component: CheckEmailCard,
})

export const bannedRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/banned',
  component: BannedCard,
})

// Export auth routes as a group for the route tree
export const authRoutes = authLayoutRoute.addChildren([
  signInRoute,
  checkEmailRoute,
  bannedRoute,
])
