import { EnvConfig } from '../../config/env/env.config.js'
import { VineEnvValidator } from '../../config/env/vine.env-validator.js'
import { AuthController } from '../auth/auth.controller.js'
import { AuthService } from '../../services/auth.service.js'
import { UserService } from '../../services/user.service.js'
import { RoleService } from '../../services/role.service.js'
import {
	InMemoryAuthTokenRepository,
} from '../../infrastructure/repositories/in-memory/in-memory-auth-token.repository.js'
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory/in-memory-role.repository.js'
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory/in-memory-user.repository.js'
import { FakePasswordHasher } from '../../infrastructure/providers/password-hasher/fake.password-hasher.js'
import type { HttpServer, RouteHandler } from '../../infrastructure/http/http.types.js'
import { JoseTokenProvider } from '../../infrastructure/providers/token/jose-token.provider.js'
import { CryptoRefreshTokenProvider } from '../../infrastructure/providers/token/crypto-refresh-token.provider.js'

class InMemoryHttpServer implements HttpServer {
	public readonly routes = new Map<string, RouteHandler>()

	public register(method: string, path: string, handler: RouteHandler): void {
		this.routes.set(`${method} ${path}`, handler)
	}

	public listen(): void {}
}

describe('AuthController', () => {
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

	it('should register and handle authentication endpoints', async () => {
		const roles = new InMemoryRoleRepository()
		const users = new InMemoryUserRepository()
		const tokens = new InMemoryAuthTokenRepository()
		const role = await new RoleService(roles).create('Administrator')
		const userService = new UserService(users, roles, new FakePasswordHasher(), tokens)
		await userService.create({
			email: 'admin@example.com',
			password: 'password',
			roleId: role.id,
			employeeId: null,
		})
		const auth = new AuthService(
			userService,
			tokens,
			new JoseTokenProvider(),
			new CryptoRefreshTokenProvider(),
		)
		const server = new InMemoryHttpServer()
		const controller = new AuthController(auth, server)

		expect(server.routes.has('POST /auth/login')).toBe(true)
		expect(server.routes.has('GET /auth/me')).toBe(true)
		const login = await controller.login({
			params: {},
			query: {},
			body: {
				email: 'admin@example.com',
				password: 'password',
			},
			cookies: {},
		})
		const refresh = login.cookies?.find(cookie => cookie.name === 'sigel_refresh_token')?.value
		expect(login.statusCode).toBe(200)
		const me = await controller.me({
			params: {},
			query: {},
			body: {},
			cookies: {
				sigel_access_token: login.cookies?.find(cookie => cookie.name === 'sigel_access_token')?.value ?? '',
			},
		})
		expect(me.body).toEqual(login.body)
		expect((await controller.refresh({
			params: {},
			query: {},
			body: {},
			cookies: { sigel_refresh_token: refresh ?? '' },
		})).statusCode).toBe(200)
		expect((await controller.logout({
			params: {},
			query: {},
			body: {},
			cookies: {},
		})).statusCode).toBe(204)
	})
})
