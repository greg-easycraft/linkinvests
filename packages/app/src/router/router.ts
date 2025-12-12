import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routes'
import type { RouterContext } from './context'

// Create router factory that accepts auth context
export function createAppRouter(auth: RouterContext['auth']) {
  return createRouter({
    routeTree,
    context: { auth },
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  })
}

// Register router types
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
