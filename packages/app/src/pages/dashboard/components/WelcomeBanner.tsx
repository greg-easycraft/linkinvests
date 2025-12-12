interface WelcomeBannerProps {
  userName?: string | null
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) {
    return 'Bonjour'
  }
  if (hour < 18) {
    return 'Bon apres-midi'
  }
  return 'Bonsoir'
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const displayName = userName ?? 'Investisseur'
  const greeting = getTimeBasedGreeting()

  return (
    <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold">
        {greeting}, {displayName} !
      </h1>
      <p className="text-muted-foreground mt-2">
        Bienvenue sur votre tableau de bord. Retrouvez vos opportunites et
        recherches sauvegardees.
      </p>
    </div>
  )
}
