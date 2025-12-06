import { Ban, LogOut } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function BannedCard(): React.ReactElement {
  const { banReason } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/auth/sign-in'
  }

  return (
    <Card className="w-full max-w-md p-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <Ban className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Compte suspendu</h1>
        <p className="text-muted-foreground mt-2">
          Votre compte a été suspendu et vous ne pouvez plus accéder à la
          plateforme.
        </p>

        {banReason && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Motif :</p>
            <p className="text-sm text-muted-foreground">{banReason}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-4">
          Si vous pensez qu'il s'agit d'une erreur, veuillez contacter
          l'administrateur à{' '}
          <a
            href="mailto:support@linkinvests.com"
            className="text-primary hover:underline"
          >
            support@linkinvests.com
          </a>
        </p>

        <div className="mt-6">
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </Card>
  )
}
