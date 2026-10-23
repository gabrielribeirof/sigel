import { IsNull, Repository } from 'typeorm'
import { AuthTokenTypeormEntity } from '../../../config/typeorm/entities/auth-token.typeorm-entity.js'
import { AuthToken, type AuthTokenType } from '../../../domain/auth/auth-token.js'
import type { AuthTokenRepository as AuthTokenRepositoryContract } from '../../../domain/auth/auth-token.repository.js'
import { AuthTokenMapper } from '../../../shared/mappers/auth-token.mapper.js'

export class AuthTokenRepository implements AuthTokenRepositoryContract {
	public constructor(private readonly repository: Repository<AuthTokenTypeormEntity>) {}

	public async save(token: AuthToken): Promise<AuthToken> {
		return AuthTokenMapper.toDomain(await this.repository.save(AuthTokenMapper.toPersistence(token)))
	}

	public async findActive(tokenHash: string, type: AuthTokenType): Promise<AuthToken | null> {
		const entity = await this.repository.findOne({
			where: {
				tokenHash,
				type,
				revokedAt: IsNull(),
			},
		})
		return entity ? AuthTokenMapper.toDomain(entity) : null
	}

	public async findActiveByUser(userId: string): Promise<AuthToken[]> {
		const entities = await this.repository.find({
			where: {
				userId,
				revokedAt: IsNull(),
			},
		})
		return entities.map(AuthTokenMapper.toDomain)
	}
}
