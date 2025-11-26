import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export default function ListingNotFound() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Annonce non trouvée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-neutral-600">
            Cette annonce n&apos;existe pas ou a été supprimée.
          </p>
          <Link href="/search/listings">
            <Button>Retour aux annonces</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
