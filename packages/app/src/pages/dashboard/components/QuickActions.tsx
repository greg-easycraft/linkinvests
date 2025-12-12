import { Gavel, MapPin, Search } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { OpportunityType } from '@/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
        <CardDescription>
          Accedez rapidement aux fonctionnalites principales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/search">
              <Search className="mr-2 h-4 w-4" />
              Nouvelle recherche
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/search" search={{ types: [OpportunityType.AUCTION] }}>
              <Gavel className="mr-2 h-4 w-4" />
              Voir les encheres
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/search/address">
              <MapPin className="mr-2 h-4 w-4" />
              Recherche par adresse
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
