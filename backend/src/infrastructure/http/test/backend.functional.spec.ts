import request from 'supertest'
import { EmployeeController } from '../../../controllers/employees/employees.controller.js'
import { HealthController } from '../../../controllers/health.controller.js'
import { RoleController } from '../../../controllers/roles/roles.controller.js'
import { UserController } from '../../../controllers/users/users.controller.js'
import { AuthorizationService } from '../../../services/authorization.service.js'
import { EmployeeService } from '../../../services/employee.service.js'
import { RoleService } from '../../../services/role.service.js'
import { UserService } from '../../../services/user.service.js'
import { allPermissionsMask, Permission } from '../../../domain/role/permission.js'
import { ExpressHttpServer } from '../express.http-server.js'
import { InMemoryEmployeeRepository } from '../../repositories/in-memory/in-memory-employee.repository.js'
import { InMemoryRoleRepository } from '../../repositories/in-memory/in-memory-role.repository.js'
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user.repository.js'
import { FakePasswordHasher } from '../../providers/password-hasher/fake.password-hasher.js'
import { UUIDv7IdentifierProvider } from '../../providers/identity/uuid-v7.identifier-provider.js'
import { Identifier } from '../../../domain/shared/identifier.js'

describe('backend functional API', () => {
	beforeAll(() => {
		Identifier.configure(new UUIDv7IdentifierProvider())
	})
	const setupApp = async (mask: bigint = allPermissionsMask()) => {
		const httpServer = new ExpressHttpServer()
		const roles = new InMemoryRoleRepository()
		const users = new InMemoryUserRepository()
		const employees = new InMemoryEmployeeRepository()
		const passwords = new FakePasswordHasher()
		const roleService = new RoleService(roles)
		const userService = new UserService(users, roles, passwords)
		const authorizer = new AuthorizationService(users, roles)

		const actorRole = await roleService.create('Actor Role', mask)
		const actor = await userService.create({
			email: 'actor@example.com',
			password: 'strong-password',
			roleId: actorRole.id.value,
			employeeId: null,
		})
		httpServer.setAuthentication(async () => actor.id.value)

		new HealthController(httpServer)
		new RoleController(roleService, authorizer, httpServer)
		new UserController(userService, authorizer, httpServer)
		new EmployeeController(new EmployeeService(employees), authorizer, httpServer)

		return {
			httpServer,
			actor,
			actorRole,
		}
	}

	it('should create related resources, authenticate, read them back and clean them up', async () => {
		const { httpServer } = await setupApp()

		const health = await request(httpServer.expressApp).get('/health')
		expect(health.status).toBe(200)

		const role = await request(httpServer.expressApp)
			.post('/roles')
			.send({
				name: 'Administrators',
				permissionsMask: '1',
			})
		expect(role.status).toBe(201)

		const employee = await request(httpServer.expressApp)
			.post('/employees')
			.send({
				registration: 'REG-100',
				name: 'Ada Lovelace',
				sector: 'administrative',
				admissionDate: '2024-01-01',
			})
		expect(employee.status).toBe(201)

		const user = await request(httpServer.expressApp)
			.post('/users')
			.send({
				email: 'ada@example.com',
				password: 'strong-password',
				roleId: role.body.id,
				employeeId: employee.body.id,
			})
		expect(user.status).toBe(201)
		expect(user.body).not.toHaveProperty('passwordHash')

		const usersReadBack = await request(httpServer.expressApp).get('/users')
		const employeesReadBack = await request(httpServer.expressApp).get('/employees')
		const rolesReadBack = await request(httpServer.expressApp).get('/roles')
		expect(usersReadBack.body).toHaveLength(2)
		expect(employeesReadBack.body[0]).toMatchObject({ registration: 'REG-100' })
		expect(rolesReadBack.body).toHaveLength(2)

		const employeeUpdate = await request(httpServer.expressApp)
			.put(`/employees/${employee.body.id}`)
			.send({
				admissionDate: '2024-01-01',
				terminationDate: '',
			})
		expect(employeeUpdate.status).toBe(200)
		expect(employeeUpdate.body.terminationDate).toBeNull()

		expect((await request(httpServer.expressApp).delete(`/users/${user.body.id}`)).status).toBe(200)
		expect((await request(httpServer.expressApp).delete(`/employees/${employee.body.id}`)).status).toBe(200)
		expect((await request(httpServer.expressApp).delete(`/roles/${role.body.id}`)).status).toBe(200)
		expect((await request(httpServer.expressApp).get('/users')).body).toHaveLength(1)
	})

	it('should reject invalid request bodies without changing stored data', async () => {
		const { httpServer } = await setupApp()

		const response = await request(httpServer.expressApp).post('/roles').send({ permissionsMask: '1' })
		expect(response.status).toBe(400)
		expect(response.body.type).toBe('INVALID_PARAMETERS')
		const rolesResponse = await request(httpServer.expressApp).get('/roles')
		expect(rolesResponse).toMatchObject({ body: [expect.objectContaining({ name: 'Actor Role' })] })
	})

	it('should return 403 FORBIDDEN when the authenticated user lacks the required permission', async () => {
		const { httpServer } = await setupApp(Permission.ReadEmployees.value)

		const listEmployees = await request(httpServer.expressApp).get('/employees')
		expect(listEmployees.status).toBe(200)

		const createEmployee = await request(httpServer.expressApp)
			.post('/employees')
			.send({
				registration: 'REG-200',
				name: 'Grace Hopper',
				sector: 'administrative',
				admissionDate: '2024-01-01',
			})
		expect(createEmployee.status).toBe(403)
		expect(createEmployee.body.type).toBe('FORBIDDEN')

		const listUsers = await request(httpServer.expressApp).get('/users')
		expect(listUsers.status).toBe(403)
		expect(listUsers.body.type).toBe('FORBIDDEN')

		const listRoles = await request(httpServer.expressApp).get('/roles')
		expect(listRoles.status).toBe(403)
		expect(listRoles.body.type).toBe('FORBIDDEN')
	})
})
