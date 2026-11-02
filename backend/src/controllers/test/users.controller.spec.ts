import { UserController } from '../users/users.controller.js'
import { RoleService } from '../../services/role.service.js'
import { UserService } from '../../services/user.service.js'
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory/in-memory-role.repository.js'
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory/in-memory-user.repository.js'
import { FakePasswordHasher } from '../../infrastructure/providers/password-hasher/fake.password-hasher.js'
import type { HttpServer, RouteHandler } from '../../infrastructure/http/http.types.js'

class InMemoryHttpServer implements HttpServer {
	public readonly routes = new Map<string, RouteHandler>()

	public register(method: string, path: string, handler: RouteHandler): void {
		this.routes.set(`${method} ${path}`, handler)
	}

	public listen(): void {}
}

describe('UserController', () => {
	it('should register user routes without a legacy login route', () => {
		const httpServer = new InMemoryHttpServer()
		const roles = new InMemoryRoleRepository()
		new UserController(
			new UserService(new InMemoryUserRepository(), roles, new FakePasswordHasher()),
			httpServer,
		)

		expect(httpServer.routes.has('POST /users')).toBe(true)
		expect(httpServer.routes.has('POST /users/login')).toBe(false)
	})

	it('should create and update users', async () => {
		const httpServer = new InMemoryHttpServer()
		const roles = new InMemoryRoleRepository()
		const role = await new RoleService(roles).create('Admin')
		const service = new UserService(
			new InMemoryUserRepository(),
			roles,
			new FakePasswordHasher(),
		)
		const sut = new UserController(service, httpServer)

		const created = await sut.create({
			params: {},
			query: {},
			body: {
				email: 'admin@example.com',
				password: 'password',
				roleId: role.id.value,
			},
		})
		const update = await sut.update({
			params: { id: (created.body as { id: string }).id },
			query: {},
			body: { active: false },
		})

		expect(created.statusCode).toBe(201)
		expect(update.statusCode).toBe(200)
	})
})
