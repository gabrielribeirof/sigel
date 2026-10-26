import { createHash, randomBytes } from 'node:crypto'
import type { RefreshToken, RefreshTokenProvider } from '../../../domain/auth/refresh-token-provider.js'

const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60

export class CryptoRefreshTokenProvider implements RefreshTokenProvider {
	public issue(): RefreshToken {
		const value = randomBytes(48).toString('base64url')
		return {
			value,
			hash: this.hash(value),
			expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
		}
	}

	public hash(value: string): string {
		return createHash('sha256').update(value).digest('hex')
	}
}
