export type RefreshToken = {
	value: string
	hash: string
	expiresAt: Date
}

export interface RefreshTokenProvider {
	issue(): RefreshToken
	hash(value: string): string
}
