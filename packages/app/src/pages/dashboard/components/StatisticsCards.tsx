import { Heart, Search } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { GroupedFavorites } from '@linkinvests/shared'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatisticsCardsProps {
  favorites: GroupedFavorites | undefined
  savedSearchesCount: number
  className?: string
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  href?: string
}

function StatCard({ title, value, icon, href }: StatCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-full bg-muted p-3">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}

export function StatisticsCards({
  favorites,
  savedSearchesCount,
  className,
}: StatisticsCardsProps) {
  const totalFavorites = favorites
    ? Object.values(favorites).reduce((sum, arr) => sum + arr.length, 0)
    : 0

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      <StatCard
        title="Favoris"
        value={totalFavorites}
        icon={<Heart className="h-5 w-5 text-red-500" />}
        href="/favorites"
      />
      <StatCard
        title="Recherches sauvegardees"
        value={savedSearchesCount}
        icon={<Search className="h-5 w-5 text-blue-500" />}
      />
    </div>
  )
}
