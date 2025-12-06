import { Link } from '@tanstack/react-router'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CheckEmailCard(): React.ReactElement {
  return (
    <Card className="w-full max-w-md p-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Vérifiez votre boîte mail</h1>
        <p className="text-muted-foreground mt-2">
          Nous vous avons envoyé un lien de connexion. Cliquez sur le lien dans
          l'email pour accéder à votre compte.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Le lien expire dans 10 minutes. Si vous ne trouvez pas l'email,
          vérifiez votre dossier spam.
        </p>

        <div className="mt-6">
          <Link to="/auth/sign-in" className="block">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
