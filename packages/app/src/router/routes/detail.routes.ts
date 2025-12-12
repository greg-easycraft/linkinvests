import { createRoute } from '@tanstack/react-router'

import { rootRoute } from './root.route'
import { requireAuth } from '@/router/guards'
import {
  AuctionDetailPage,
  EnergySieveDetailPage,
  LiquidationDetailPage,
  ListingDetailPage,
  SuccessionDetailPage,
} from '@/pages/opportunities'

// Detail page routes (protected)
export const auctionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionId',
  beforeLoad: requireAuth,
  component: AuctionDetailPage,
})

export const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listings/$listingId',
  beforeLoad: requireAuth,
  component: ListingDetailPage,
})

export const successionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/successions/$successionId',
  beforeLoad: requireAuth,
  component: SuccessionDetailPage,
})

export const liquidationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/liquidations/$liquidationId',
  beforeLoad: requireAuth,
  component: LiquidationDetailPage,
})

export const energySieveDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/energy-sieves/$energySieveId',
  beforeLoad: requireAuth,
  component: EnergySieveDetailPage,
})
