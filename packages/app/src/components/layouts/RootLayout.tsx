import { Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { AppHeader } from './AppHeader'

export function RootLayout() {
  const location = useRouterState({ select: (s) => s.location })
  const isAuthRoute = location.pathname.startsWith('/auth')

  return (
    <>
      {!isAuthRoute && <AppHeader />}
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}
