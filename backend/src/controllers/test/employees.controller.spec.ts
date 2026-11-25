import { EmployeeController } from '../employees/employees.controller.js'
import { EmployeeService } from '../../services/employee.service.js'
import {
	InMemoryEmployeeRepository,
} from '../../infrastructure/repositories/in-memory/in-memory-employee.repository.js'
import type { HttpServer, RouteHandler } from '../../infrastructure/http/http.types.js'
import type { Authorizer } from '../../domain/auth/authorizer.js'
import { ForbiddenError } from '../../shared/errors/app.error.js'

class InMemoryHttpServer implements HttpServer {
	public readonly routes = new Map<string, RouteHandler>()

	public register(method: string, path: string, handler: RouteHandler): void {
		this.routes.set(`${method} ${path}`, handler)
	}

	public listen(): void {}
}

class AllowingAuthorizer implements Authorizer {
	public async authorize(): Promise<void> {}
}

class DenyingAuthorizer implements Authorizer {
	public async authorize(): Promise<void> {
		throw new ForbiddenError()
	}
}

describe('EmployeeController', () => {
	it('should register employee routes', () => {
		const httpServer = new InMemoryHttpServer()
		new EmployeeController(
			new EmployeeService(new InMemoryEmployeeRepository()),
			new AllowingAuthorizer(),
			httpServer,
		)

		expect(httpServer.routes.has('POST /employees')).toBe(true)
	})

	it('should reject unauthorized employee actions with ForbiddenError', async () => {
		const httpServer = new InMemoryHttpServer()
		const sut = new EmployeeController(
			new EmployeeService(new InMemoryEmployeeRepository()),
			new DenyingAuthorizer(),
			httpServer,
		)

		await expect(sut.list({
			params: {},
			query: {},
			body: {},
		})).rejects.toThrow(ForbiddenError)
	})
})
