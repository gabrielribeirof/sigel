import { RoleService } from '../role.service.js'
import { UserService } from '../user.service.js'
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory/in-memory-role.repository.js'
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory/in-memory-user.repository.js'
import { FakePasswordHasher } from '../../infrastructure/providers/password-hasher/fake.password-hasher.js'

describe('UserService', () => {
	it('should create, authenticate, update and delete a user using injected fakes', async () => {
		const users = new InMemoryUserRepository()
		const roles = new InMemoryRoleRepository()
		const passwords = new FakePasswordHasher()
		const sut = new UserService(users, roles, passwords)
		const role = await new RoleService(roles).create('Administrator')

		const created = await sut.create({
			email: 'admin@example.com',
			password: 'strong-password',
			roleId: role.id,
			employeeId: null,
		})
		expect(created.password.value).toBe('fake:strong-password')
		expect(await sut.authenticate('admin@example.com', 'strong-password')).toBe(created)

		const updated = await sut.update(created.id, {
			email: 'updated@example.com',
			password: 'new-password',
		})
		expect(updated.email).toBe('updated@example.com')
		expect(await sut.authenticate('updated@example.com', 'new-password')).toBe(updated)

		await sut.delete(created.id)
		expect(await sut.findById(created.id)).toBeNull()
	})

	it('should not create users with duplicate emails or unknown roles', async () => {
		const users = new InMemoryUserRepository()
		const roles = new InMemoryRoleRepository()
		const sut = new UserService(users, roles, new FakePasswordHasher())
		const role = await new RoleService(roles).create('Administrator')
		await sut.create({
			email: 'admin@example.com',
			password: 'password',
			roleId: role.id,
			employeeId: null,
		})

		await expect(sut.create({
			email: 'ADMIN@example.com',
			password: 'password',
			roleId: role.id,
			employeeId: null,
		})).rejects.toThrow('User email already exists')
		await expect(sut.create({
			email: 'other@example.com',
			password: 'password',
			roleId: '01900000-0000-7000-8000-000000000099',
			employeeId: null,
		})).rejects.toThrow('Role not found')
		expect(await sut.authenticate('admin@example.com', 'wrong')).toBeNull()
	})
})
