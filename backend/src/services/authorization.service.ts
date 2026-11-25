import type { Authorizer } from '../domain/auth/authorizer.js'
import type { PermissionBit } from '../domain/role/permission-bit.js'
import { PermissionRequirement } from '../domain/role/permission-requirement.js'
import type { RoleRepository } from '../domain/role/role.repository.js'
import { Identifier } from '../domain/shared/identifier.js'
import type { UserRepository } from '../domain/user/user.repository.js'
import { AppError, ForbiddenError } from '../shared/errors/app.error.js'

export class AuthorizationService implements Authorizer {
	public constructor(
		private readonly users: UserRepository,
		private readonly roles: RoleRepository,
	) {}

	public async authorize(
		userId: string | undefined,
		requirement: PermissionBit | PermissionRequirement,
	): Promise<void> {
		if (!userId) {
			throw new AppError(
				'AUTHENTICATION_REQUIRED',
				'Sua sessão expirou. Entre novamente.',
				undefined,
				401,
			)
		}

		const user = await this.users.findById(Identifier.from(userId))
		if (!user?.active) {
			throw new AppError(
				'AUTHENTICATION_REQUIRED',
				'Usuário não autenticado ou inativo.',
				undefined,
				401,
			)
		}

		const role = await this.roles.findById(user.roleId)
		if (!role) {
			throw new ForbiddenError('Perfil de acesso não encontrado.')
		}

		PermissionRequirement.from(requirement).ensureSatisfiedBy(role)
	}
}
