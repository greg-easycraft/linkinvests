import { indexRoute, rootRoute } from './root.route'
import { authRoutes } from './auth.routes'
import { searchAddressRoute, searchRoute } from './search.routes'
import {
  auctionDetailRoute,
  energySieveDetailRoute,
  liquidationDetailRoute,
  listingDetailRoute,
  successionDetailRoute,
} from './detail.routes'
import { favoritesRoute } from './favorites.route'
import { adminUsersRoute } from './admin.routes'

// Build route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  searchAddressRoute,
  favoritesRoute,
  auctionDetailRoute,
  listingDetailRoute,
  successionDetailRoute,
  liquidationDetailRoute,
  energySieveDetailRoute,
  adminUsersRoute,
  authRoutes,
])

// Re-export root route for router creation
export { rootRoute }
