import type { AuthToken, AuthTokenType } from './auth-token.js'

export interface AuthTokenRepository {
	save(token: AuthToken): Promise<AuthToken>
	findActive(tokenHash: string, type: AuthTokenType): Promise<AuthToken | null>
	findActiveByUser(userId: string): Promise<AuthToken[]>
}
