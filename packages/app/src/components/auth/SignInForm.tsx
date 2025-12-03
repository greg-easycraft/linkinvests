import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signInSchema } from '@/schemas/auth.schema'
import type { SignInInput } from '@/schemas/auth.schema'

export function SignInForm(): React.ReactElement {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<SignInInput>({
    email: '',
    password: '',
  })
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    // Validate form
    const result = signInSchema.safeParse(formData)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0].toString()] = issue.message
        }
      })
      setValidationErrors(errors)
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Dummy success - redirect to auctions page
    console.log('Sign in:', formData)
    setIsLoading(false)
    navigate({ to: '/search/auctions' })
  }

  return (
    <Card className="w-full max-w-md p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-muted-foreground mt-2">
          Connectez-vous à votre compte
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@exemple.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          {validationErrors.email && (
            <p className="text-sm text-destructive">{validationErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          {validationErrors.password && (
            <p className="text-sm text-destructive">
              {validationErrors.password}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Se connecter
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Pas encore de compte ? </span>
        <Link to="/auth/sign-up" className="text-primary hover:underline">
          Créer un compte
        </Link>
      </div>
    </Card>
  )
}
