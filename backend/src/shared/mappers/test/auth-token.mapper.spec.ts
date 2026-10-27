import { AuthToken } from '../../../domain/auth/auth-token.js'
import { AuthTokenMapper } from '../auth-token.mapper.js'

describe('AuthTokenMapper', () => {
	it('should map tokens between domain and persistence', () => {
		const token = AuthToken.create({
			userId: '01900000-0000-7000-8000-000000000002',
			type: 'access',
			tokenHash: 'hash',
			expiresAt: new Date(Date.now() + 60_000),
		})
		const persistence = AuthTokenMapper.toPersistence(token)
		expect(AuthTokenMapper.toDomain(persistence)).toEqual(token)
	})
})
