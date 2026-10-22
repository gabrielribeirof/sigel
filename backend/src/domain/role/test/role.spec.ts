import { Permission } from '../permission.js'
import { ADMINISTRATOR_ROLE_ID, Role } from '../role.js'
import { PermissionsMask } from '../permissions-mask.js'

describe('Role', () => {
	it('should trim its name and manage permissions', () => {
		const sut = Role.create({ name: ' Managers ' })

		sut.grant(Permission.ManageUsers)
		expect(sut.name).toBe('Managers')
		expect(sut.has(Permission.ManageUsers)).toBe(true)
		sut.revoke(Permission.ManageUsers)
		expect(sut.has(Permission.ManageUsers)).toBe(false)
	})

	it('should set permissions and rename the role', () => {
		const sut = Role.create({ name: 'Managers' })

		sut.rename(' Administrators ')
		sut.setPermissions(5n)

		expect(sut.name).toBe('Administrators')
		expect(sut.mask).toBe(5n)
		expect(sut.has(Permission.ManageUsers)).toBe(true)
	})

	it('should reject empty names and invalid masks', () => {
		expect(() => Role.create({ name: ' ' })).toThrow('Role name is required')
		const sut = Role.create({ name: 'Managers' })
		expect(() => sut.rename('')).toThrow('Role name is required')
		expect(() => sut.setPermissions(-1n)).toThrow('Role permissions mask cannot be negative')
	})

	it('should protect the administrator role from changes', () => {
		const sut = Role.reconstitute({
			id: ADMINISTRATOR_ROLE_ID,
			name: 'Administrador',
			permissionsMask: PermissionsMask.create(15n),
			createdAt: new Date(),
			updatedAt: new Date(),
		})

		expect(() => sut.rename('Managers')).toThrow('A role administradora não pode ser alterada.')
		expect(() => sut.setPermissions(0n)).toThrow('A role administradora não pode ser alterada.')
	})
})
