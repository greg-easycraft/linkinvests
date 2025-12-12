import { createRoute } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'

import { rootRoute } from './root.route'
import { requireAuth } from '@/router/guards'
import { unifiedSearchFiltersSchema } from '@/schemas/filters.schema'
import { UnifiedSearchPage } from '@/pages/search/UnifiedSearchPage'
import { AddressSearchPage } from '@/pages/search/AddressSearchPage'

// Search routes (protected)
export const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  validateSearch: zodSearchValidator(unifiedSearchFiltersSchema),
  beforeLoad: requireAuth,
  component: UnifiedSearchPage,
})

export const searchAddressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/address',
  beforeLoad: requireAuth,
  component: AddressSearchPage,
})
