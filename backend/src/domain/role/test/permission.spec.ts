import {
	Permission,
	allPermissionsMask,
	hasPermission,
	permissionEntries,
} from '../permission.js'

describe('Permission', () => {
	it('should expose all permissions and their combined mask', () => {
		const entries = permissionEntries()

		expect(entries).toHaveLength(8)
		expect(entries.map(entry => entry.key)).toEqual([
			'ManageUsers',
			'ManageEmployees',
			'ManageRoles',
			'ManageCategories',
			'ManageEquipments',
			'ManagePromotions',
			'ManageCustomers',
			'ManageSuppliers',
		])
		expect(entries.map(entry => entry.keyName)).toEqual([
			'Gerenciar usuários',
			'Gerenciar funcionários',
			'Gerenciar perfis',
			'Gerenciar categorias',
			'Gerenciar equipamentos',
			'Gerenciar pacotes promocionais',
			'Gerenciar clientes',
			'Gerenciar fornecedores',
		])
		expect(allPermissionsMask()).toBe(255n)
		expect(hasPermission(allPermissionsMask(), Permission.ManageRoles)).toBe(true)
		expect(hasPermission(Permission.ManageUsers.value, Permission.ManageRoles)).toBe(false)
	})
})
