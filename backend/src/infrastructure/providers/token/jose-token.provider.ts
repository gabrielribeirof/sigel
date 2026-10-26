import { jwtVerify, SignJWT } from 'jose'
import { randomUUID } from 'node:crypto'
import type { AccessTokenClaims, TokenProvider } from '../../../domain/auth/token-provider.js'
import { EnvConfig } from '../../../config/env/env.config.js'
import { AppError } from '../../../shared/errors/app.error.js'

const ACCESS_TTL_SECONDS = 15 * 60

export class JoseTokenProvider implements TokenProvider {
	public async issueAccessToken(userId: string): Promise<{
		value: string
		claims: AccessTokenClaims
	}> {
		const tokenId = randomUUID()
		const expiresAt = new Date(Date.now() + ACCESS_TTL_SECONDS * 1000)
		const value = await new SignJWT({ sub: userId })
			.setProtectedHeader({
				alg: 'HS256',
				typ: 'JWT',
			})
			.setJti(tokenId)
			.setIssuedAt()
			.setExpirationTime(expiresAt)
			.sign(new TextEncoder().encode(EnvConfig.get('JWT_SECRET')))
		return {
			value,
			claims: {
				userId,
				tokenId,
				expiresAt,
			},
		}
	}

	public async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
		try {
			const verified = await jwtVerify(
				token,
				new TextEncoder().encode(EnvConfig.get('JWT_SECRET')),
				{ algorithms: ['HS256'] },
			)
			if (
				typeof verified.payload.sub !== 'string'
				|| typeof verified.payload.jti !== 'string'
				|| typeof verified.payload.exp !== 'number'
			) {
				throw new Error('Invalid claims')
			}
			return {
				userId: verified.payload.sub,
				tokenId: verified.payload.jti,
				expiresAt: new Date(verified.payload.exp * 1000),
			}
		}
		catch {
			throw new AppError(
				'AUTHENTICATION_REQUIRED',
				'Sua sessão expirou. Entre novamente.',
				undefined,
				401,
			)
		}
	}
}
