import {
	Permission,
	allPermissionsMask,
	hasPermission,
	permissionEntries,
} from '../permission.js'

describe('Permission', () => {
	it('should expose all permissions and their combined mask', () => {
		const entries = permissionEntries()

		expect(entries).toHaveLength(6)
		expect(entries.map(entry => entry.key)).toEqual([
			'ManageUsers',
			'ManageEmployees',
			'ManageRoles',
			'ManageCategories',
			'ManageEquipments',
			'ManagePromotions',
		])
		expect(entries.map(entry => entry.keyName)).toEqual([
			'Gerenciar usuários',
			'Gerenciar funcionários',
			'Gerenciar perfis',
			'Gerenciar categorias',
			'Gerenciar equipamentos',
			'Gerenciar pacotes promocionais',
		])
		expect(allPermissionsMask()).toBe(63n)
		expect(hasPermission(allPermissionsMask(), Permission.ManageRoles)).toBe(true)
		expect(hasPermission(Permission.ManageUsers.value, Permission.ManageRoles)).toBe(false)
	})
})
