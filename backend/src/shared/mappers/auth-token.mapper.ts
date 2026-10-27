import { AuthToken } from '../../domain/auth/auth-token.js'
import type { AuthTokenTypeormEntity } from '../../config/typeorm/entities/auth-token.typeorm-entity.js'
import { Identifier } from '../../domain/shared/identifier.js'

export class AuthTokenMapper {
	public static toDomain(entity: AuthTokenTypeormEntity): AuthToken {
		return AuthToken.reconstitute({
			id: Identifier.from(entity.id),
			userId: Identifier.from(entity.userId),
			type: entity.type,
			tokenHash: entity.tokenHash,
			expiresAt: entity.expiresAt,
			revokedAt: entity.revokedAt,
			createdAt: entity.createdAt,
		})
	}

	public static toPersistence(token: AuthToken): AuthTokenTypeormEntity {
		return {
			id: token.id.value,
			userId: token.userId.value,
			type: token.type,
			tokenHash: token.tokenHash,
			expiresAt: token.expiresAt,
			revokedAt: token.revokedAt,
			createdAt: token.createdAt,
		}
	}
}
