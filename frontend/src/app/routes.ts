const ROUTE_SEGMENTS = {
  users: 'users',
  employees: 'employees',
  roles: 'roles',
  customers: 'customers',
  suppliers: 'suppliers',
} as const

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  users: `/dashboard/${ROUTE_SEGMENTS.users}`,
  employees: `/dashboard/${ROUTE_SEGMENTS.employees}`,
  roles: `/dashboard/${ROUTE_SEGMENTS.roles}`,
  customers: `/dashboard/${ROUTE_SEGMENTS.customers}`,
  suppliers: `/dashboard/${ROUTE_SEGMENTS.suppliers}`,
} as const

export const DASHBOARD_ROUTE_SEGMENTS = ROUTE_SEGMENTS

export const NAV_ITEMS = [
  { path: ROUTES.dashboard, label: 'Visão geral', end: true },
  { path: ROUTES.employees, label: 'Funcionários', end: false },
  { path: ROUTES.users, label: 'Usuários', end: false },
  { path: ROUTES.roles, label: 'Perfis', end: false },
  { path: ROUTES.customers, label: 'Clientes', end: false },
  { path: ROUTES.suppliers, label: 'Fornecedores', end: false },
] as const
