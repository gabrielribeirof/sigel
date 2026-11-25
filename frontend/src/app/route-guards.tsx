import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from './routes'
import { useAuth } from '../shared/auth/use-auth'
import { usePermissions } from '../shared/auth/use-permissions'
import type { PermissionBit, PermissionRequirement } from '../shared/auth/permissions'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  return user ? <Outlet /> : <Navigate replace to={ROUTES.login} />
}

export function PublicRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  return user ? <Navigate replace to={ROUTES.dashboard} /> : <Outlet />
}

export function PermissionRoute({
  permission,
}: {
  permission: PermissionRequirement | PermissionBit
}) {
  const { can } = usePermissions()
  return can(permission) ? <Outlet /> : <Navigate replace to={ROUTES.dashboard} />
}
