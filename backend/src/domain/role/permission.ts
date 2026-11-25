import { PermissionBit } from './permission-bit.js'

export { PermissionBit }

export const Permission = {
	ManageUsers: PermissionBit.create(1n << 0n),
	ManageEmployees: PermissionBit.create(1n << 1n),
	ManageRoles: PermissionBit.create(1n << 2n),
	ManageCategories: PermissionBit.create(1n << 3n),
	ManageEquipments: PermissionBit.create(1n << 4n),
	ManagePromotions: PermissionBit.create(1n << 5n),
} as const

export type PermissionKey = keyof typeof Permission

export const PermissionKeyName: Record<PermissionKey, string> = {
	ManageUsers: 'Gerenciar usuários',
	ManageEmployees: 'Gerenciar funcionários',
	ManageRoles: 'Gerenciar perfis',
	ManageCategories: 'Gerenciar categorias',
	ManageEquipments: 'Gerenciar equipamentos',
	ManagePromotions: 'Gerenciar pacotes promocionais',
}

export const allPermissionsMask = (): bigint =>
	Object.values(Permission).reduce((mask, bit) => mask | bit.value, 0n)

export const hasPermission = (mask: bigint, permission: PermissionBit): boolean =>
	(mask & permission.value) === permission.value

export const permissionEntries = (): Array<{
	key: PermissionKey
	keyName: string
	bit: PermissionBit
}> =>
	Object.entries(Permission).map(([key, bit]) => ({
		key: key as PermissionKey,
		keyName: PermissionKeyName[key as PermissionKey],
		bit,
	}))
