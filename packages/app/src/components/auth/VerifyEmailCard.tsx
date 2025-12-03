import { Link } from '@tanstack/react-router'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function VerifyEmailCard(): React.ReactElement {
  return (
    <Card className="w-full max-w-md p-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Vérifiez votre email</h1>
        <p className="text-muted-foreground mt-2">
          Un email de vérification a été envoyé à votre adresse. Cliquez sur le
          lien dans l'email pour activer votre compte.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Si vous n'avez pas reçu l'email, vérifiez votre dossier spam ou
          demandez un nouvel email de vérification.
        </p>
        <div className="mt-6 space-y-2">
          <Button variant="outline" className="w-full">
            Renvoyer l'email de vérification
          </Button>
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
