import { EmployeeController } from '../employees/employees.controller.js'
import { EmployeeService } from '../../services/employee.service.js'
import {
	InMemoryEmployeeRepository,
} from '../../infrastructure/repositories/in-memory/in-memory-employee.repository.js'
import type { HttpServer, RouteHandler } from '../../infrastructure/http/http.types.js'

class InMemoryHttpServer implements HttpServer {
	public readonly routes = new Map<string, RouteHandler>()

	public register(method: string, path: string, handler: RouteHandler): void {
		this.routes.set(`${method} ${path}`, handler)
	}

	public listen(): void {}
}

describe('EmployeeController', () => {
	it('should register employee routes', () => {
		const httpServer = new InMemoryHttpServer()
		new EmployeeController(new EmployeeService(new InMemoryEmployeeRepository()), httpServer)

		expect(httpServer.routes.has('POST /employees')).toBe(true)
	})
})
