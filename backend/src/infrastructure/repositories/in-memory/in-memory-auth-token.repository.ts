import type { AuthTokenRepository } from '../../../domain/auth/auth-token.repository.js'
import type { AuthToken, AuthTokenType } from '../../../domain/auth/auth-token.js'

export class InMemoryAuthTokenRepository implements AuthTokenRepository {
	private readonly items = new Map<string, AuthToken>()

	public async save(token: AuthToken): Promise<AuthToken> {
		this.items.set(token.tokenHash, token)
		return token
	}

	public async findActive(tokenHash: string, type: AuthTokenType): Promise<AuthToken | null> {
		const token = this.items.get(tokenHash)
		return token?.type === type && token.isActive() ? token : null
	}

	public async findActiveByUser(userId: string): Promise<AuthToken[]> {
		return [...this.items.values()].filter(token => token.userId.value === userId && token.isActive())
	}

	public all(): AuthToken[] {
		return [...this.items.values()]
	}
}
