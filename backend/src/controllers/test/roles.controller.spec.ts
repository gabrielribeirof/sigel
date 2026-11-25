import { RoleController } from '../roles/roles.controller.js'
import { RoleService } from '../../services/role.service.js'
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory/in-memory-role.repository.js'
import type { HttpServer, RouteHandler } from '../../infrastructure/http/http.types.js'

class InMemoryHttpServer implements HttpServer {
	public readonly routes = new Map<string, RouteHandler>()

	public register(method: string, path: string, handler: RouteHandler): void {
		this.routes.set(`${method} ${path}`, handler)
	}

	public listen(): void {}
}

describe('RoleController', () => {
	it('should register role routes', () => {
		const httpServer = new InMemoryHttpServer()
		new RoleController(new RoleService(new InMemoryRoleRepository()), httpServer)

		expect(httpServer.routes.has('POST /roles')).toBe(true)
		expect(httpServer.routes.has('GET /permissions')).toBe(true)
	})

	it('should return permissions with Portuguese keyName', async () => {
		const httpServer = new InMemoryHttpServer()
		new RoleController(new RoleService(new InMemoryRoleRepository()), httpServer)
		const handler = httpServer.routes.get('GET /permissions')

		const response = await handler?.({ body: {}, params: {}, query: {} })

		expect(response?.statusCode).toBe(200)
		expect(response?.body).toEqual([
			{ key: 'ManageUsers', keyName: 'Gerenciar usuários', bit: '1' },
			{ key: 'ManageEmployees', keyName: 'Gerenciar funcionários', bit: '2' },
			{ key: 'ManageRoles', keyName: 'Gerenciar perfis', bit: '4' },
			{ key: 'ReadEmployees', keyName: 'Visualizar funcionários', bit: '8' },
		])
	})
})
