import { ADMINISTRATOR_ROLE_ID, Role } from '../domain/role/role.js'
import type { RoleRepository } from '../domain/role/role.repository.js'
import type { PermissionBit } from '../domain/role/permission.js'
import { AppError, NotFoundError } from '../shared/errors/app.error.js'
import { Identifier } from '../domain/shared/identifier.js'
import { PermissionsMask } from '../domain/role/permissions-mask.js'

export class RoleService {
	public constructor(private readonly roles: RoleRepository) {}

	public create(name: string, permissionsMask: bigint = 0n): Promise<Role> {
		return this.roles.save(Role.create({
			name,
			permissionsMask: PermissionsMask.create(permissionsMask),
		}))
	}

	public findById(id: string | Identifier): Promise<Role | null> {
		return this.roles.findById(Identifier.from(id))
	}

	public findAll(): Promise<Role[]> {
		return this.roles.findAll()
	}

	public async update(id: string | Identifier, name: string, permissionsMask: bigint): Promise<Role> {
		const role = await this.roles.findById(Identifier.from(id))
		if (!role) throw new NotFoundError('Role')
		role.rename(name)
		role.setPermissions(permissionsMask)
		return this.roles.save(role)
	}

	public async grant(id: string | Identifier, permission: PermissionBit): Promise<Role> {
		const role = await this.roles.findById(Identifier.from(id))
		if (!role) throw new NotFoundError('Role')
		role.grant(permission)
		return this.roles.save(role)
	}

	public delete(id: string | Identifier): Promise<void> {
		if (Identifier.from(id).value === ADMINISTRATOR_ROLE_ID) {
			throw new AppError('ADMINISTRATOR_ROLE_PROTECTED', 'A role administradora não pode ser removida.')
		}
		return this.roles.delete(Identifier.from(id))
	}
}
