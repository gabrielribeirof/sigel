import {
  Permission,
  PermissionRequirement,
  type PermissionBit,
} from '../shared/auth/permissions'

const ROUTE_SEGMENTS = {
  users: 'users',
  employees: 'employees',
  roles: 'roles',
  categories: 'categories',
  equipments: 'equipments',
  promotions: 'promotions',
  customers: 'customers',
  suppliers: 'suppliers',
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
  customers: `/dashboard/${ROUTE_SEGMENTS.customers}`,
  suppliers: `/dashboard/${ROUTE_SEGMENTS.suppliers}`,
} as const

export const DASHBOARD_ROUTE_SEGMENTS = ROUTE_SEGMENTS

export const ROUTE_PERMISSIONS = {
  employees: PermissionRequirement.any(Permission.ManageEmployees, Permission.ManageUsers),
  users: Permission.ManageUsers,
  roles: PermissionRequirement.any(Permission.ManageRoles, Permission.ManageUsers),
} as const

export type NavItem = {
  path: string
  label: string
  end: boolean
  permission?: PermissionRequirement | PermissionBit
}

export const NAV_ITEMS: readonly NavItem[] = [
  { path: ROUTES.dashboard, label: 'Visão geral', end: true },
  { path: ROUTES.employees, label: 'Funcionários', end: false, permission: ROUTE_PERMISSIONS.employees },
  { path: ROUTES.users, label: 'Usuários', end: false, permission: ROUTE_PERMISSIONS.users },
  { path: ROUTES.roles, label: 'Perfis', end: false, permission: ROUTE_PERMISSIONS.roles },
  { path: ROUTES.customers, label: 'Clientes', end: false },
  { path: ROUTES.suppliers, label: 'Fornecedores', end: false },
  { path: ROUTES.categories, label: 'Categorias', end: false },
  { path: ROUTES.equipments, label: 'Equipamentos', end: false },
  { path: ROUTES.promotions, label: 'Pacotes promocionais', end: false },
]
