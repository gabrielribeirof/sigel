import { HealthController } from '../health.controller.js'
import type { HttpServer, RouteHandler } from '../../infrastructure/http/http.types.js'

class InMemoryHttpServer implements HttpServer {
	public readonly routes = new Map<string, RouteHandler>()

	public register(method: string, path: string, handler: RouteHandler): void {
		this.routes.set(`${method} ${path}`, handler)
	}

	public listen(): void {}
}

describe('HealthController', () => {
	it('should register the health route', () => {
		const httpServer = new InMemoryHttpServer()
		new HealthController(httpServer)

		expect(httpServer.routes.has('GET /health')).toBe(true)
	})
})
