import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export default function LiquidationNotFound() {
  return (
    <div className="max-w-md mx-auto mt-20 min-h-screen bg-[var(--secundary)]">
      <Card>
        <CardHeader>
          <CardTitle>Liquidation non trouvée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-neutral-600">
            Cette liquidation n&apos;existe pas ou a été supprimée.
          </p>
          <Link href="/search/liquidations">
            <Button>Retour aux liquidations</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
