import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export default function AuctionNotFound() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Enchère non trouvée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-neutral-600">
            Cette enchère n&apos;existe pas ou a été supprimée.
          </p>
          <Link href="/search/auctions">
            <Button>Retour aux enchères</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
