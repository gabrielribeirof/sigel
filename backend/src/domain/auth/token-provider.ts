export type AccessTokenClaims = {
	userId: string
	tokenId: string
	expiresAt: Date
}

export interface TokenProvider {
	issueAccessToken(userId: string): Promise<{
		value: string
		claims: AccessTokenClaims
	}>
	verifyAccessToken(token: string): Promise<AccessTokenClaims>
}
