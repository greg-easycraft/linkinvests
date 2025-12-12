import {
  Building2,
  FileText,
  Gavel,
  Heart,
  MapPin,
  Scale,
  Search,
  Shield,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { QuickActionId } from '@linkinvests/shared'
import { OpportunityType } from '@/types'

export interface QuickAction {
  id: QuickActionId
  label: string
  icon: LucideIcon
  link: string
  searchParams?: Record<string, unknown>
  adminOnly: boolean
}

export const AVAILABLE_ACTIONS: Array<QuickAction> = [
  {
    id: 'new_search',
    label: 'Nouvelle recherche',
    icon: Search,
    link: '/search',
    adminOnly: false,
  },
  {
    id: 'auctions',
    label: 'Encheres',
    icon: Gavel,
    link: '/search',
    searchParams: { types: [OpportunityType.AUCTION] },
    adminOnly: false,
  },
  {
    id: 'listings',
    label: 'Annonces',
    icon: Building2,
    link: '/search',
    searchParams: { types: [OpportunityType.REAL_ESTATE_LISTING] },
    adminOnly: false,
  },
  {
    id: 'successions',
    label: 'Successions',
    icon: FileText,
    link: '/search',
    searchParams: { types: [OpportunityType.SUCCESSION] },
    adminOnly: false,
  },
  {
    id: 'liquidations',
    label: 'Liquidations',
    icon: Scale,
    link: '/search',
    searchParams: { types: [OpportunityType.LIQUIDATION] },
    adminOnly: false,
  },
  {
    id: 'energy_sieves',
    label: 'Passoires',
    icon: Zap,
    link: '/search',
    searchParams: { types: [OpportunityType.ENERGY_SIEVE] },
    adminOnly: false,
  },
  {
    id: 'address_search',
    label: 'Adresses',
    icon: MapPin,
    link: '/search/address',
    adminOnly: false,
  },
  {
    id: 'favorites',
    label: 'Favoris',
    icon: Heart,
    link: '/favorites',
    adminOnly: false,
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: Shield,
    link: '/admin/users',
    adminOnly: true,
  },
]

export function getActionById(id: QuickActionId): QuickAction | undefined {
  return AVAILABLE_ACTIONS.find((action) => action.id === id)
}

export function getAvailableActions(isAdmin: boolean): Array<QuickAction> {
  return AVAILABLE_ACTIONS.filter((action) => !action.adminOnly || isAdmin)
}
