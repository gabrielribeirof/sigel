const ROUTE_SEGMENTS = {
  users: 'users',
  employees: 'employees',
  roles: 'roles',
  categories: 'categories',
  equipments: 'equipments',
  promotions: 'promotions',
} as const

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  users: `/dashboard/${ROUTE_SEGMENTS.users}`,
  employees: `/dashboard/${ROUTE_SEGMENTS.employees}`,
  roles: `/dashboard/${ROUTE_SEGMENTS.roles}`,
  categories: `/dashboard/${ROUTE_SEGMENTS.categories}`,
  equipments: `/dashboard/${ROUTE_SEGMENTS.equipments}`,
  promotions: `/dashboard/${ROUTE_SEGMENTS.promotions}`,
} as const

export const DASHBOARD_ROUTE_SEGMENTS = ROUTE_SEGMENTS

export const NAV_ITEMS = [
  { path: ROUTES.dashboard, label: 'Visão geral', end: true },
  { path: ROUTES.employees, label: 'Funcionários', end: false },
  { path: ROUTES.users, label: 'Usuários', end: false },
  { path: ROUTES.roles, label: 'Perfis', end: false },
  { path: ROUTES.categories, label: 'Categorias', end: false },
  { path: ROUTES.equipments, label: 'Equipamentos', end: false },
  { path: ROUTES.promotions, label: 'Pacotes promocionais', end: false },
] as const
