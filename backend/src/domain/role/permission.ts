import { PermissionBit } from './permission-bit.js'

export { PermissionBit }

export const Permission = {
	ManageUsers: PermissionBit.create(1n << 0n),
	ManageEmployees: PermissionBit.create(1n << 1n),
	ManageRoles: PermissionBit.create(1n << 2n),
	ReadEmployees: PermissionBit.create(1n << 3n),
} as const

export type PermissionKey = keyof typeof Permission
export const allPermissionsMask = (): bigint =>
	Object.values(Permission).reduce((mask, bit) => mask | bit.value, 0n)

export const hasPermission = (mask: bigint, permission: PermissionBit): boolean =>
	(mask & permission.value) === permission.value

export const permissionEntries = (): Array<{
	key: PermissionKey
	bit: PermissionBit
}> =>
	Object.entries(Permission).map(([key, bit]) => ({
		key: key as PermissionKey,
		bit,
	}))
