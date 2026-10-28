import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from './routes'
import { useAuth } from '../shared/auth/use-auth'

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
