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
})
