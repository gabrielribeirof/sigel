import { RoleService } from '../../services/role.service.js'
import { StatusCode, type HttpServer, type Request, type Response } from '../../infrastructure/http/http.types.js'
import { validate } from '../../shared/validation/validate.js'
import { RoleMapper } from '../../shared/mappers/role.mapper.js'
import { roleCreateSchema, roleIdSchema, roleUpdateSchema } from './schemas/role.schemas.js'
import { permissionEntries } from '../../domain/role/permission.js'

export class RoleController {
	public constructor(private readonly service: RoleService, httpServer: HttpServer) {
		httpServer.register('GET', '/roles', () => this.list())
		httpServer.register('GET', '/permissions', () => this.permissions())
		httpServer.register('POST', '/roles', request => this.create(request))
		httpServer.register('PUT', '/roles/:id', request => this.update(request))
		httpServer.register('DELETE', '/roles/:id', request => this.remove(request))
	}

	public async list(): Promise<Response> {
		return {
			statusCode: StatusCode.Ok,
			body: (await this.service.findAll()).map(RoleMapper.toDTO),
		}
	}

	public permissions(): Response {
		return {
			statusCode: StatusCode.Ok,
			body: permissionEntries().map(({ key, bit }) => ({
				key,
				bit: bit.value.toString(),
			})),
		}
	}

	public async create(request: Request): Promise<Response> {
		const body = await validate(roleCreateSchema, request.body)
		const role = await this.service.create(body.name, BigInt(body.permissionsMask ?? '0'))
		return {
			statusCode: StatusCode.Created,
			body: RoleMapper.toDTO(role),
		}
	}

	public async update(request: Request): Promise<Response> {
		await validate(roleIdSchema, request.params)
		const body = await validate(roleUpdateSchema, request.body)
		const role = await this.service.update(request.params.id, body.name, BigInt(body.permissionsMask))
		return {
			statusCode: StatusCode.Ok,
			body: RoleMapper.toDTO(role),
		}
	}

	public async remove(request: Request): Promise<Response> {
		await validate(roleIdSchema, request.params)
		await this.service.delete(request.params.id)
		return {
			statusCode: StatusCode.Ok,
			body: null,
		}
	}
}
