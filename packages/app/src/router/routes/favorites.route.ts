import { createRoute } from '@tanstack/react-router'

import { rootRoute } from './root.route'
import { requireAuth } from '@/router/guards'
import { FavoritesPage } from '@/pages/favorites'

// Favorites route (protected)
export const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  beforeLoad: requireAuth,
  component: FavoritesPage,
})
