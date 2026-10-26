import { User } from '../domain/user/user.js'
import type { UserRepository } from '../domain/user/user.repository.js'
import type { PasswordHasher } from '../domain/user/password-hasher.js'
import type { RoleRepository } from '../domain/role/role.repository.js'
import { AppError, ConflictError, NotFoundError } from '../shared/errors/app.error.js'
import { Password } from '../domain/user/password.js'
import { Identifier } from '../domain/shared/identifier.js'
import { MASTER_USER_ID } from '../domain/user/user.js'
import type { AuthTokenRepository } from '../domain/auth/auth-token.repository.js'

export type CreateUserInput = {
	email: string
	password: string
	roleId: string
	employeeId: string | null
}
export type UpdateUserInput = {
	email?: string
	password?: string
	roleId?: string
	employeeId?: string | null
	active?: boolean
}

export class UserService {
	public constructor(
		private readonly users: UserRepository,
		private readonly roles: RoleRepository,
		private readonly passwordHasher: PasswordHasher,
		private readonly authTokenRepository?: AuthTokenRepository,
	) {}

	public async create(input: CreateUserInput): Promise<User> {
		if (await this.users.findByEmail(input.email)) throw new ConflictError('User email already exists')
		if (!await this.roles.findById(Identifier.from(input.roleId))) throw new NotFoundError('Role')
		return this.users.save(User.create({
			email: input.email,
			password: await Password.create(input.password, this.passwordHasher),
			roleId: Identifier.from(input.roleId),
			employeeId: input.employeeId ? Identifier.from(input.employeeId) : null,
		}))
	}

	public findById(id: string | Identifier): Promise<User | null> {
		return this.users.findById(Identifier.from(id))
	}

	public findAll(): Promise<User[]> {
		return this.users.findAll()
	}

	public async update(id: string | Identifier, input: UpdateUserInput): Promise<User> {
		const user = await this.users.findById(Identifier.from(id))
		if (!user) throw new NotFoundError('User')
		if (user.id.value === MASTER_USER_ID) {
			throw new AppError(
				'MASTER_USER_PROTECTED',
				'O usuário administrador principal não pode ser editado.',
				undefined,
				409,
			)
		}
		if (input.roleId && !await this.roles.findById(Identifier.from(input.roleId))) throw new NotFoundError('Role')
		const wasActive = user.active
		user.update({
			...input,
			roleId: input.roleId === undefined ? undefined : Identifier.from(input.roleId),
			employeeId: input.employeeId === undefined
				? undefined
				: input.employeeId === null ? null : Identifier.from(input.employeeId),
			password: input.password === undefined
				? undefined
				: await Password.create(input.password, this.passwordHasher),
		})
		const saved = await this.users.save(user)
		if (wasActive && !saved.active && this.authTokenRepository) {
			for (const token of await this.authTokenRepository.findActiveByUser(saved.id.value)) {
				token.revoke()
				await this.authTokenRepository.save(token)
			}
		}
		return saved
	}

	public async authenticate(email: string, password: string): Promise<User | null> {
		const user = await this.users.findByEmail(email)
		let passwordMatches = false
		if (user) passwordMatches = await user.password.matches(password, this.passwordHasher)
		if (!user || !user.active || !passwordMatches) return null
		return user
	}

	public async delete(id: string | Identifier): Promise<void> {
		if (Identifier.from(id).value === MASTER_USER_ID) {
			throw new AppError(
				'MASTER_USER_PROTECTED',
				'O usuário administrador principal não pode ser removido.',
				undefined,
				409,
			)
		}
		return this.users.delete(Identifier.from(id))
	}
}
