import { redirect } from '@tanstack/react-router'
import type { RouterContext } from './context'

export function requireAuth({ context }: { context: RouterContext }) {
  if (!context.auth.isAuthenticated && !context.auth.isLoading) {
    throw redirect({
      to: '/auth/sign-in',
    })
  }
  if (context.auth.isBanned && !context.auth.isLoading) {
    throw redirect({
      to: '/auth/banned',
    })
  }
}

export function requireGuest({ context }: { context: RouterContext }) {
  if (context.auth.isAuthenticated && !context.auth.isLoading) {
    throw redirect({
      to: '/search/auctions',
    })
  }
}

export function requireAdmin({ context }: { context: RouterContext }) {
  if (!context.auth.isAuthenticated && !context.auth.isLoading) {
    throw redirect({
      to: '/auth/sign-in',
    })
  }
  if (context.auth.isBanned && !context.auth.isLoading) {
    throw redirect({
      to: '/auth/banned',
    })
  }
  if (!context.auth.isAdmin && !context.auth.isLoading) {
    throw redirect({
      to: '/search/auctions',
    })
  }
}
