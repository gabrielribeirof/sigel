import { Role } from '../../domain/role/role.js'
import type { RoleTypeormEntity } from '../../config/typeorm/entities/role.typeorm-entity.js'
import { Identifier } from '../../domain/shared/identifier.js'
import { PermissionsMask } from '../../domain/role/permissions-mask.js'

export type RoleDTO = {
	id: string
	name: string
	permissionsMask: string
	createdAt: string
	updatedAt: string
}

export class RoleMapper {
	public static toDomain(entity: RoleTypeormEntity): Role {
		return Role.reconstitute({
			id: Identifier.from(entity.id),
			name: entity.name,
			permissionsMask: PermissionsMask.create(BigInt(entity.permissionsMask)),
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		})
	}

	public static toPersistence(role: Role): RoleTypeormEntity {
		return {
			id: role.id.value,
			name: role.name,
			permissionsMask: role.mask.toString(),
			createdAt: role.createdAt,
			updatedAt: role.updatedAt,
		}
	}

	public static toDTO(role: Role): RoleDTO {
		return {
			id: role.id.value,
			name: role.name,
			permissionsMask: role.mask.toString(),
			createdAt: role.createdAt.toISOString(),
			updatedAt: role.updatedAt.toISOString(),
		}
	}
}
