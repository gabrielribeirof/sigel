import { AuthToken } from '../auth-token.js'

describe('AuthToken', () => {
	it('should create an active token and revoke it once', () => {
		const createdAt = new Date('2026-01-01T00:00:00.000Z')
		const token = AuthToken.reconstitute({
			id: '01900000-0000-7000-8000-000000000001',
			userId: '01900000-0000-7000-8000-000000000002',
			type: 'access',
			tokenHash: 'hash',
			expiresAt: new Date('2026-01-01T01:00:00.000Z'),
			revokedAt: null,
			createdAt,
		})

		expect(token.isActive(new Date('2026-01-01T00:30:00.000Z'))).toBe(true)
		token.revoke(new Date('2026-01-01T00:40:00.000Z'))
		token.revoke(new Date('2026-01-01T00:50:00.000Z'))
		expect(token.revokedAt).toEqual(new Date('2026-01-01T00:40:00.000Z'))
		expect(token.isActive()).toBe(false)
	})

	it('should reject empty hashes and expired tokens', () => {
		const base = {
			id: '01900000-0000-7000-8000-000000000001',
			userId: '01900000-0000-7000-8000-000000000002',
			type: 'refresh' as const,
			expiresAt: new Date('2026-01-01T01:00:00.000Z'),
			revokedAt: null,
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
		}
		expect(() => AuthToken.reconstitute({
			...base,
			tokenHash: ' ',
		})).toThrow('Token hash is required')
		expect(() => AuthToken.reconstitute({
			...base,
			tokenHash: 'hash',
			expiresAt: base.createdAt,
		})).toThrow('Token expiration must be in the future')
	})
})
