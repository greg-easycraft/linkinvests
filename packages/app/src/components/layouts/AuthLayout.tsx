import { Outlet } from '@tanstack/react-router'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center auth-page">
      <Outlet />
    </div>
  )
}
