import { User } from '../../domain/user/user.js'
import type { UserTypeormEntity } from '../../config/typeorm/entities/user.typeorm-entity.js'
import { Identifier } from '../../domain/shared/identifier.js'
import { Password } from '../../domain/user/password.js'

export type UserDTO = {
	id: string
	email: string
	roleId: string
	employeeId: string | null
	active: boolean
	createdAt: string
	updatedAt: string
}

export type AuthenticatedUserDTO = Pick<UserDTO, 'id' | 'email' | 'roleId'>

export class UserMapper {
	public static toDomain(entity: UserTypeormEntity): User {
		return User.reconstitute({
			...entity,
			id: Identifier.from(entity.id),
			password: Password.fromHash(entity.passwordHash),
			roleId: Identifier.from(entity.roleId),
			employeeId: entity.employeeId ? Identifier.from(entity.employeeId) : null,
		})
	}

	public static toPersistence(user: User): UserTypeormEntity {
		return {
			id: user.id.value,
			email: user.email,
			passwordHash: user.password.value,
			roleId: user.roleId.value,
			employeeId: user.employeeId?.value ?? null,
			active: user.active,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		}
	}

	public static toDTO(user: User): UserDTO {
		return {
			id: user.id.value,
			email: user.email,
			roleId: user.roleId.value,
			employeeId: user.employeeId?.value ?? null,
			active: user.active,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		}
	}

	public static toAuthenticatedDTO(user: User): AuthenticatedUserDTO {
		return {
			id: user.id.value,
			email: user.email,
			roleId: user.roleId.value,
		}
	}
}
