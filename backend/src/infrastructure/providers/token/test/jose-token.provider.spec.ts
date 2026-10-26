import { EnvConfig } from '../../../../config/env/env.config.js'
import { VineEnvValidator } from '../../../../config/env/vine.env-validator.js'
import { JoseTokenProvider } from '../jose-token.provider.js'

describe('JoseTokenProvider', () => {
	beforeAll(async () => {
		await EnvConfig.init(new VineEnvValidator(), {
			HTTP_PORT: '4000',
			DATABASE_HOST: 'database',
			DATABASE_PORT: '5432',
			DATABASE_USER: 'myuser',
			DATABASE_PASSWORD: 'mypassword',
			DATABASE_NAME: 'mydatabase',
			JWT_SECRET: 'a-secret-with-at-least-thirty-two-characters',
		})
	})

	it('should issue and verify an access token', async () => {
		const sut = new JoseTokenProvider()
		const issued = await sut.issueAccessToken('01900000-0000-7000-8000-000000000002')
		const claims = await sut.verifyAccessToken(issued.value)
		expect(claims.userId).toBe('01900000-0000-7000-8000-000000000002')
		expect(claims.tokenId).toBeTruthy()
		expect(Math.abs(claims.expiresAt.getTime() - issued.claims.expiresAt.getTime())).toBeLessThanOrEqual(1000)
	})

	it('should reject malformed and tampered tokens', async () => {
		const sut = new JoseTokenProvider()
		await expect(sut.verifyAccessToken('invalid')).rejects.toMatchObject({ statusCode: 401 })
		const issued = await sut.issueAccessToken('01900000-0000-7000-8000-000000000002')
		await expect(sut.verifyAccessToken(`${issued.value}tampered`)).rejects.toMatchObject({ statusCode: 401 })
	})
})
