import { SignInForm } from '@/components/auth/SignInForm'

export function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center auth-page">
      <SignInForm />
    </div>
  )
}
