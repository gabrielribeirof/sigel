import { RoleService } from '../../services/role.service.js'
import { StatusCode, type HttpServer, type Request, type Response } from '../../infrastructure/http/http.types.js'
import { validate } from '../../shared/validation/validate.js'
import { RoleMapper } from '../../shared/mappers/role.mapper.js'
import { roleCreateSchema, roleIdSchema, roleUpdateSchema } from './schemas/role.schemas.js'
import { Permission, permissionEntries } from '../../domain/role/permission.js'
import { PermissionRequirement } from '../../domain/role/permission-requirement.js'
import type { Authorizer } from '../../domain/auth/authorizer.js'

export class RoleController {
	public constructor(
		private readonly service: RoleService,
		private readonly authorizer: Authorizer,
		httpServer: HttpServer,
	) {
		httpServer.register('GET', '/roles', request => this.list(request))
		httpServer.register('GET', '/permissions', request => this.permissions(request))
		httpServer.register('POST', '/roles', request => this.create(request))
		httpServer.register('PUT', '/roles/:id', request => this.update(request))
		httpServer.register('DELETE', '/roles/:id', request => this.remove(request))
	}

	public async list(request: Request): Promise<Response> {
		await this.authorizer.authorize(
			request.userId,
			PermissionRequirement.any(Permission.ManageRoles, Permission.ManageUsers),
		)
		return {
			statusCode: StatusCode.Ok,
			body: (await this.service.findAll()).map(RoleMapper.toDTO),
		}
	}

	public async permissions(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageRoles)
		return {
			statusCode: StatusCode.Ok,
			body: permissionEntries().map(({ key, keyName, bit }) => ({
				key,
				keyName,
				bit: bit.value.toString(),
			})),
		}
	}

	public async create(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageRoles)
		const body = await validate(roleCreateSchema, request.body)
		const role = await this.service.create(body.name, BigInt(body.permissionsMask ?? '0'))
		return {
			statusCode: StatusCode.Created,
			body: RoleMapper.toDTO(role),
		}
	}

	public async update(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageRoles)
		await validate(roleIdSchema, request.params)
		const body = await validate(roleUpdateSchema, request.body)
		const role = await this.service.update(request.params.id, body.name, BigInt(body.permissionsMask))
		return {
			statusCode: StatusCode.Ok,
			body: RoleMapper.toDTO(role),
		}
	}

	public async remove(request: Request): Promise<Response> {
		await this.authorizer.authorize(request.userId, Permission.ManageRoles)
		await validate(roleIdSchema, request.params)
		await this.service.delete(request.params.id)
		return {
			statusCode: StatusCode.Ok,
			body: null,
		}
	}
}
