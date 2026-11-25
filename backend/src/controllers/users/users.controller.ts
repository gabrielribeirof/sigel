import { UserService } from '../../services/user.service.js'
import { StatusCode, type HttpServer, type Request, type Response } from '../../infrastructure/http/http.types.js'
import { validate } from '../../shared/validation/validate.js'
import { UserMapper } from '../../shared/mappers/user.mapper.js'
import { Permission } from '../../domain/role/permission.js'
import type { Authorizer } from '../../domain/auth/authorizer.js'
import {
	userCreateSchema,
	userIdSchema,
	userUpdateSchema,
} from './schemas/user.schemas.js'

export class UserController {
	public constructor(
		private readonly service: UserService,
		private readonly authorizer: Authorizer,
		httpServer: HttpServer,
	) {
		httpServer.register('GET', '/users', request => this.list(request))
		httpServer.register('POST', '/users', request => this.create(request))
		httpServer.register('PUT', '/users/:id', request => this.update(request))
		httpServer.register('DELETE', '/users/:id', request => this.remove(request))
	}

	public async list(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageUsers)
		const users = await this.service.findAll()
		return {
			statusCode: StatusCode.Ok,
			body: users.map(UserMapper.toDTO),
		}
	}

	public async create(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageUsers)
		const body = await validate(userCreateSchema, request.body)
		const user = await this.service.create({
			email: body.email,
			password: body.password,
			roleId: body.roleId,
			employeeId: body.employeeId ?? null,
		})
		return {
			statusCode: StatusCode.Created,
			body: UserMapper.toDTO(user),
		}
	}

	public async update(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageUsers)
		await validate(userIdSchema, request.params)
		const user = await this.service.update(request.params.id, await validate(userUpdateSchema, request.body))
		return {
			statusCode: StatusCode.Ok,
			body: UserMapper.toDTO(user),
		}
	}

	public async remove(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageUsers)
		await validate(userIdSchema, request.params)
		await this.service.delete(request.params.id)
		return {
			statusCode: StatusCode.Ok,
			body: null,
		}
	}
}
