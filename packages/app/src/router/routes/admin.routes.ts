import { createRoute } from '@tanstack/react-router'

import { rootRoute } from './root.route'
import { requireAdmin } from '@/router/guards'
import { UsersPage } from '@/pages/admin'

// Admin routes
export const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  beforeLoad: requireAdmin,
  component: UsersPage,
})
