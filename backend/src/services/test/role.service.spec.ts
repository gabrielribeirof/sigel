import { RoleService } from '../role.service.js'
import { Permission } from '../../domain/role/permission.js'
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory/in-memory-role.repository.js'
import { ADMINISTRATOR_ROLE_ID, Role } from '../../domain/role/role.js'
import { PermissionsMask } from '../../domain/role/permissions-mask.js'

describe('RoleService', () => {
	it('should create, grant, update and list roles', async () => {
		const repository = new InMemoryRoleRepository()
		const sut = new RoleService(repository)
		const role = await sut.create('Readers')

		await sut.grant(role.id, Permission.ReadEmployees)
		await sut.update(role.id, 'Managers', Permission.ManageUsers)
		expect((await sut.findAll())[0]).toMatchObject({
			name: 'Managers',
			mask: Permission.ManageUsers,
		})
	})

	it('should not update, grant or delete an unknown role', async () => {
		const sut = new RoleService(new InMemoryRoleRepository())

		const missingId = '01900000-0000-7000-8000-000000000099'
		await expect(sut.update(missingId, 'Role', 0n)).rejects.toThrow('Role not found')
		await expect(sut.grant(missingId, Permission.ManageRoles)).rejects.toThrow('Role not found')
	})

	it('should not delete the administrator role', async () => {
		const repository = new InMemoryRoleRepository()
		const sut = new RoleService(repository)
		await repository.save(Role.reconstitute({
			id: ADMINISTRATOR_ROLE_ID,
			name: 'Administrador',
			permissionsMask: PermissionsMask.create(15n),
			createdAt: new Date(),
			updatedAt: new Date(),
		}))

		expect(() => sut.delete(ADMINISTRATOR_ROLE_ID)).toThrow('A role administradora não pode ser removida.')
	})
})
