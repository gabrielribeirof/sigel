import { EmployeeService, type EmployeeUpdateInput } from '../../services/employee.service.js'
import { StatusCode, type HttpServer, type Request, type Response } from '../../infrastructure/http/http.types.js'
import { validate } from '../../shared/validation/validate.js'
import { EmployeeMapper } from '../../shared/mappers/employee.mapper.js'
import {
	employeeCreateSchema,
	employeeIdSchema,
	employeeUpdateSchema,
} from './schemas/employee.schemas.js'
import { parseDateOnly } from '../../shared/dates/date-only.js'
import { Permission } from '../../domain/role/permission.js'
import { PermissionRequirement } from '../../domain/role/permission-requirement.js'
import type { Authorizer } from '../../domain/auth/authorizer.js'

export class EmployeeController {
	public constructor(
		private readonly service: EmployeeService,
		private readonly authorizer: Authorizer,
		httpServer: HttpServer,
	) {
		httpServer.register('GET', '/employees', request => this.list(request))
		httpServer.register('POST', '/employees', request => this.create(request))
		httpServer.register('PUT', '/employees/:id', request => this.update(request))
		httpServer.register('DELETE', '/employees/:id', request => this.remove(request))
	}

	public async list(request: Request): Promise<Response> {
		await this.authorizer.authorize(
			request.userId,
			PermissionRequirement.any(
				Permission.ReadEmployees,
				Permission.ManageEmployees,
				Permission.ManageUsers,
			),
		)
		return {
			statusCode: StatusCode.Ok,
			body: (await this.service.findAll()).map(EmployeeMapper.toDTO),
		}
	}

	public async create(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageEmployees)
		const body = await validate(employeeCreateSchema, request.body)
		const employee = await this.service.create({
			registration: body.registration,
			name: body.name,
			sector: body.sector as 'logistics' | 'assembly' | 'service' | 'administrative',
			admissionDate: parseDateOnly(body.admissionDate),
			terminationDate: body.terminationDate ? parseDateOnly(body.terminationDate) : null,
			userId: body.userId ?? null,
		})
		return {
			statusCode: StatusCode.Created,
			body: EmployeeMapper.toDTO(employee),
		}
	}

	public async update(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageEmployees)
		await validate(employeeIdSchema, request.params)
		const body = await validate(employeeUpdateSchema, request.body)
		const input: EmployeeUpdateInput = {
			...body,
			sector: body.sector as EmployeeUpdateInput['sector'],
			admissionDate: body.admissionDate ? parseDateOnly(body.admissionDate) : undefined,
			terminationDate: body.terminationDate === null || body.terminationDate === ''
				? null
				: typeof body.terminationDate === 'string'
					? parseDateOnly(body.terminationDate)
					: body.terminationDate,
		}
		return {
			statusCode: StatusCode.Ok,
			body: EmployeeMapper.toDTO(await this.service.update(request.params.id, input)),
		}
	}

	public async remove(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageEmployees)
		await validate(employeeIdSchema, request.params)
		await this.service.delete(request.params.id)
		return {
			statusCode: StatusCode.Ok,
			body: null,
		}
	}
}
