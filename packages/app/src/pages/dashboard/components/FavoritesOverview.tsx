import { Building2, FileText, Gavel, Heart, Scale, Zap } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import type { GroupedFavorites } from '@linkinvests/shared'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FavoritesOverviewProps {
  favorites: GroupedFavorites | undefined
}

const OPPORTUNITY_TYPES: Array<{
  key: keyof GroupedFavorites
  label: string
  icon: LucideIcon
  color: string
}> = [
  { key: 'auctions', label: 'Encheres', icon: Gavel, color: 'text-amber-500' },
  {
    key: 'listings',
    label: 'Annonces',
    icon: Building2,
    color: 'text-blue-500',
  },
  {
    key: 'successions',
    label: 'Successions',
    icon: FileText,
    color: 'text-purple-500',
  },
  {
    key: 'liquidations',
    label: 'Liquidations',
    icon: Scale,
    color: 'text-orange-500',
  },
  {
    key: 'energySieves',
    label: 'Passoires',
    icon: Zap,
    color: 'text-green-500',
  },
]

export function FavoritesOverview({ favorites }: FavoritesOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          Mes Opportunités
        </CardTitle>
        <CardDescription>
          Apercu de vos opportunites sauvegardees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {OPPORTUNITY_TYPES.map(({ key, label, icon: Icon, color }) => {
            const count = favorites?.[key].length ?? 0
            return (
              <Link key={key} to="/favorites" className="group">
                <div className="flex flex-col items-center p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                  <Icon className={cn('h-8 w-8 mb-2', color)} />
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full">
          <Link to="/favorites">Voir tous mes favoris</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
