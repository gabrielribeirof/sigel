import { EnvConfig } from '../../config/env/env.config.js'
import { VineEnvValidator } from '../../config/env/vine.env-validator.js'
import {
	InMemoryAuthTokenRepository,
} from '../../infrastructure/repositories/in-memory/in-memory-auth-token.repository.js'
import { FakePasswordHasher } from '../../infrastructure/providers/password-hasher/fake.password-hasher.js'
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory/in-memory-role.repository.js'
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory/in-memory-user.repository.js'
import { RoleService } from '../role.service.js'
import { UserService } from '../user.service.js'
import { AuthService } from '../auth.service.js'
import { JoseTokenProvider } from '../../infrastructure/providers/token/jose-token.provider.js'
import { CryptoRefreshTokenProvider } from '../../infrastructure/providers/token/crypto-refresh-token.provider.js'

const request = (cookies: Record<string, string> = {}) => ({
	params: {},
	query: {},
	body: {},
	cookies,
})

function cookieValue(cookies: NonNullable<Awaited<ReturnType<AuthService['login']>>['cookies']>, name: string): string {
	const cookie = cookies.find(item => item.name === name)
	if (!cookie) throw new Error(`Cookie ${name} was not issued`)
	return cookie.value
}

describe('AuthService', () => {
	beforeAll(async () => {
		await EnvConfig.init(new VineEnvValidator(), {
			HTTP_PORT: '4000',
			DATABASE_HOST: 'database',
			DATABASE_PORT: '5432',
			DATABASE_USER: 'myuser',
			DATABASE_PASSWORD: 'mypassword',
			DATABASE_NAME: 'mydatabase',
			JWT_SECRET: 'a-secret-with-at-least-thirty-two-characters',
		})
	})

	async function createSut() {
		const users = new InMemoryUserRepository()
		const roles = new InMemoryRoleRepository()
		const role = await new RoleService(roles).create('Administrator')
		const tokens = new InMemoryAuthTokenRepository()
		const userService = new UserService(users, roles, new FakePasswordHasher(), tokens)
		const user = await userService.create({
			email: 'admin@example.com',
			password: 'password',
			roleId: role.id,
			employeeId: null,
		})
		return {
			sut: new AuthService(
				userService,
				tokens,
				new JoseTokenProvider(),
				new CryptoRefreshTokenProvider(),
			),
			userService,
			user,
			tokens,
		}
	}

	it('should issue cookies, authenticate, rotate refresh tokens and logout', async () => {
		const { sut, tokens } = await createSut()
		const login = await sut.login('admin@example.com', 'password')
		expect(login.cookies).toHaveLength(2)
		const access = cookieValue(login.cookies ?? [], 'sigel_access_token')
		const refresh = cookieValue(login.cookies ?? [], 'sigel_refresh_token')
		expect(await sut.authenticate(request({ sigel_access_token: access }))).toBeDefined()

		const renewed = await sut.refresh(request({ sigel_refresh_token: refresh! }))
		expect(renewed.cookies?.find(cookie => cookie.name === 'sigel_refresh_token')?.value).not.toBe(refresh)
		await expect(sut.refresh(request({ sigel_refresh_token: refresh! }))).rejects.toMatchObject({ statusCode: 401 })
		await sut.logout(request({ sigel_refresh_token: refresh! }))
		expect(tokens.all()).toHaveLength(4)
	})

	it('should reject missing, malformed, expired and revoked credentials', async () => {
		const { sut, tokens } = await createSut()
		await expect(sut.login('unknown@example.com', 'password')).rejects.toMatchObject({ statusCode: 401 })
		await expect(sut.refresh(request())).rejects.toMatchObject({ statusCode: 401 })
		await expect(sut.authenticate(request())).rejects.toMatchObject({ statusCode: 401 })
		await expect(
			sut.authenticate(request({ sigel_access_token: 'invalid' })),
		).rejects.toMatchObject({ statusCode: 401 })

		const login = await sut.login('admin@example.com', 'password')
		const access = cookieValue(login.cookies ?? [], 'sigel_access_token')
		for (const token of tokens.all()) {
			token.revoke()
			await tokens.save(token)
		}
		await expect(
			sut.authenticate(request({ sigel_access_token: access })),
		).rejects.toMatchObject({ statusCode: 401 })
	})

	it('should revoke all tokens when the user is deactivated', async () => {
		const { sut, userService, user, tokens } = await createSut()
		const login = await sut.login('admin@example.com', 'password')
		const access = cookieValue(login.cookies ?? [], 'sigel_access_token')
		await userService.update(user.id, { active: false })
		expect(tokens.all().every(token => token.revokedAt !== null)).toBe(
			true,
		)
		await expect(
			sut.authenticate(request({ sigel_access_token: access })),
		).rejects.toMatchObject({ statusCode: 401 })
	})
})
