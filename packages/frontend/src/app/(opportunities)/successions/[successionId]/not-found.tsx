import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export default function SuccessionNotFound() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Succession non trouvée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-neutral-600">
            Cette succession n&apos;existe pas ou a été supprimée.
          </p>
          <Link href="/search/successions">
            <Button>Retour aux successions</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
