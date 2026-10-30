import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './shared/auth/auth.context'
import { DashboardLayout } from './pages/dashboard/dashboard.layout'
import { DashboardOverview } from './pages/dashboard/dashboard.page'
import { EmployeesLayout } from './pages/employees/employees.layout'
import { EmployeesPage } from './pages/employees/employees.page'
import { LoginPage } from './pages/login/login.page'
import { RolesLayout } from './pages/roles/roles.layout'
import { RolesPage } from './pages/roles/roles.page'
import { UsersLayout } from './pages/users/users.layout'
import { UsersPage } from './pages/users/users.page'
import { ProtectedRoute, PublicRoute } from './app/route-guards'
import { DASHBOARD_ROUTE_SEGMENTS, ROUTES } from './app/routes'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />} path={ROUTES.dashboard}>
            <Route index element={<DashboardOverview />} />
            <Route
              element={<UsersLayout><UsersPage /></UsersLayout>}
              path={DASHBOARD_ROUTE_SEGMENTS.users}
            />
            <Route
              element={<EmployeesLayout><EmployeesPage /></EmployeesLayout>}
              path={DASHBOARD_ROUTE_SEGMENTS.employees}
            />
            <Route
              element={<RolesLayout><RolesPage /></RolesLayout>}
              path={DASHBOARD_ROUTE_SEGMENTS.roles}
            />
          </Route>
        </Route>
        <Route element={<Navigate replace to={ROUTES.login} />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
