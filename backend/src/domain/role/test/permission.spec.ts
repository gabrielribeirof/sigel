import {
	Permission,
	allPermissionsMask,
	hasPermission,
	permissionEntries,
} from '../permission.js'

describe('Permission', () => {
	it('should expose all permissions and their combined mask', () => {
		const entries = permissionEntries()

		expect(entries).toHaveLength(4)
		expect(entries.map(entry => entry.key)).toEqual([
			'ManageUsers',
			'ManageEmployees',
			'ManageRoles',
			'ReadEmployees',
		])
		expect(allPermissionsMask()).toBe(15n)
		expect(hasPermission(allPermissionsMask(), Permission.ManageRoles)).toBe(true)
		expect(hasPermission(Permission.ManageUsers.value, Permission.ManageRoles)).toBe(false)
	})
})
