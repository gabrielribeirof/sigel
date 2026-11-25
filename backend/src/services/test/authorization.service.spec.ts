import { AuthorizationService } from '../authorization.service.js'
import { RoleService } from '../role.service.js'
import { UserService } from '../user.service.js'
import { Permission } from '../../domain/role/permission.js'
import { PermissionRequirement } from '../../domain/role/permission-requirement.js'
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory/in-memory-role.repository.js'
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory/in-memory-user.repository.js'
import { FakePasswordHasher } from '../../infrastructure/providers/password-hasher/fake.password-hasher.js'
import { AppError, ForbiddenError } from '../../shared/errors/app.error.js'

describe('AuthorizationService', () => {
	it('should authorize a user whose role satisfies the requirement', async () => {
		const roles = new InMemoryRoleRepository()
		const users = new InMemoryUserRepository()
		const role = await new RoleService(roles).create('HR', Permission.ManageEmployees.value)
		const user = await new UserService(users, roles, new FakePasswordHasher()).create({
			email: 'hr@example.com',
			password: 'secret',
			roleId: role.id.value,
			employeeId: null,
		})
		const sut = new AuthorizationService(users, roles)

		await expect(sut.authorize(user.id.value, Permission.ManageEmployees)).resolves.toBeUndefined()
		await expect(
			sut.authorize(
				user.id.value,
				PermissionRequirement.any(Permission.ManageEmployees, Permission.ManageUsers),
			),
		).resolves.toBeUndefined()
	})

	it('should throw ForbiddenError when user lacks the required permission', async () => {
		const roles = new InMemoryRoleRepository()
		const users = new InMemoryUserRepository()
		const role = await new RoleService(roles).create('HR', Permission.ManageEmployees.value)
		const user = await new UserService(users, roles, new FakePasswordHasher()).create({
			email: 'viewer@example.com',
			password: 'secret',
			roleId: role.id.value,
			employeeId: null,
		})
		const sut = new AuthorizationService(users, roles)

		await expect(sut.authorize(user.id.value, Permission.ManageUsers)).rejects.toThrow(ForbiddenError)
	})

	it('should throw AppError 401 when userId is missing or user is inactive', async () => {
		const roles = new InMemoryRoleRepository()
		const users = new InMemoryUserRepository()
		const role = await new RoleService(roles).create('Admin', Permission.ManageUsers.value)
		const userService = new UserService(users, roles, new FakePasswordHasher())
		const user = await userService.create({
			email: 'inactive@example.com',
			password: 'secret',
			roleId: role.id.value,
			employeeId: null,
		})
		await userService.update(user.id, { active: false })
		const sut = new AuthorizationService(users, roles)

		await expect(sut.authorize(undefined, Permission.ManageUsers)).rejects.toMatchObject({
			type: 'AUTHENTICATION_REQUIRED',
			statusCode: 401,
		})
		await expect(sut.authorize(user.id.value, Permission.ManageUsers)).rejects.toBeInstanceOf(AppError)
	})
})
