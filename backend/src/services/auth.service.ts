import type { Request, Response, Cookie } from '../infrastructure/http/http.types.js'
import type { AuthTokenRepository } from '../domain/auth/auth-token.repository.js'
import { AuthToken } from '../domain/auth/auth-token.js'
import type { RefreshTokenProvider } from '../domain/auth/refresh-token-provider.js'
import type { TokenProvider } from '../domain/auth/token-provider.js'
import type { User } from '../domain/user/user.js'
import { AppError, InvalidCredentialsError } from '../shared/errors/app.error.js'
import { UserMapper } from '../shared/mappers/user.mapper.js'
import { UserService } from './user.service.js'

const ACCESS_COOKIE = 'sigel_access_token'
const REFRESH_COOKIE = 'sigel_refresh_token'

export class AuthService {
	public constructor(
		private readonly users: UserService,
		private readonly authTokenRepository: AuthTokenRepository,
		private readonly tokenProvider: TokenProvider,
		private readonly refreshTokenProvider: RefreshTokenProvider,
	) {}

	public async login(email: string, password: string): Promise<Response> {
		const user = await this.users.authenticate(email, password)
		if (!user) throw new InvalidCredentialsError()
		return this.issue(user)
	}

	public async refresh(request: Request): Promise<Response> {
		const refresh = request.cookies?.[REFRESH_COOKIE]
		if (!refresh) throw new InvalidCredentialsError()
		const stored = await this.authTokenRepository.findActive(this.refreshTokenProvider.hash(refresh), 'refresh')
		if (!stored || !stored.isActive()) throw new InvalidCredentialsError()
		const user = await this.users.findById(stored.userId)
		if (!user?.active) {
			await this.revokeUserTokens(stored.userId.value)
			throw new InvalidCredentialsError()
		}
		stored.revoke()
		await this.authTokenRepository.save(stored)
		return this.issue(user)
	}

	public async me(request: Request): Promise<Response> {
		const userId = await this.authenticate(request)
		const user = await this.users.findById(userId)
		if (!user) throw new InvalidCredentialsError()
		return {
			statusCode: 200,
			body: UserMapper.toAuthenticatedDTO(user),
		}
	}

	public async logout(request: Request): Promise<Response> {
		const refresh = request.cookies?.[REFRESH_COOKIE]
		if (refresh) {
			const token = await this.authTokenRepository.findActive(this.refreshTokenProvider.hash(refresh), 'refresh')
			if (token) {
				token.revoke()
				await this.authTokenRepository.save(token)
			}
		}
		return {
			statusCode: 204,
			body: null,
			cookies: clearCookies(),
		}
	}

	public async authenticate(request: Request): Promise<string> {
		const access = request.cookies?.[ACCESS_COOKIE]
		if (!access) throw authenticationRequired()
		const claims = await this.tokenProvider.verifyAccessToken(access)
		const stored = await this.authTokenRepository.findActive(this.refreshTokenProvider.hash(access), 'access')
		if (!stored || !stored.isActive() || stored.userId.value !== claims.userId) {
			throw authenticationRequired()
		}
		const user = await this.users.findById(claims.userId)
		if (!user?.active) {
			await this.revokeUserTokens(claims.userId)
			throw new AppError(
				'AUTHENTICATION_REQUIRED',
				'Seu usuário foi desativado. Entre novamente.',
				undefined,
				401,
			)
		}
		return claims.userId
	}

	private async issue(user: User): Promise<Response> {
		const access = await this.tokenProvider.issueAccessToken(user.id.value)
		const refresh = this.refreshTokenProvider.issue()
		await this.authTokenRepository.save(AuthToken.create({
			userId: user.id,
			type: 'access',
			tokenHash: this.refreshTokenProvider.hash(access.value),
			expiresAt: access.claims.expiresAt,
		}))
		await this.authTokenRepository.save(AuthToken.create({
			userId: user.id,
			type: 'refresh',
			tokenHash: refresh.hash,
			expiresAt: refresh.expiresAt,
		}))
		return {
			statusCode: 200,
			body: UserMapper.toAuthenticatedDTO(user),
			cookies: [
				{
					name: ACCESS_COOKIE,
					value: access.value,
					maxAge: access.claims.expiresAt.getTime() - Date.now(),
				},
				{
					name: REFRESH_COOKIE,
					value: refresh.value,
					maxAge: refresh.expiresAt.getTime() - Date.now(),
				},
			],
		}
	}

	private async revokeUserTokens(userId: string): Promise<void> {
		for (const token of await this.authTokenRepository.findActiveByUser(userId)) {
			token.revoke()
			await this.authTokenRepository.save(token)
		}
	}
}

function authenticationRequired(): AppError {
	return new AppError(
		'AUTHENTICATION_REQUIRED',
		'Sua sessão expirou. Entre novamente.',
		undefined,
		401,
	)
}

function clearCookies(): Cookie[] {
	return [
		{
			name: ACCESS_COOKIE,
			value: '',
			maxAge: 0,
		},
		{
			name: REFRESH_COOKIE,
			value: '',
			maxAge: 0,
		},
	]
}
