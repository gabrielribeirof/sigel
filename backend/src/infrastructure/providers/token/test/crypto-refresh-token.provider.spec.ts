import { CryptoRefreshTokenProvider } from '../crypto-refresh-token.provider.js'

describe('CryptoRefreshTokenProvider', () => {
	it('should issue unique refresh tokens with hashes and expiration', () => {
		const sut = new CryptoRefreshTokenProvider()
		const first = sut.issue()
		const second = sut.issue()

		expect(first.value).not.toBe(second.value)
		expect(first.hash).toBe(sut.hash(first.value))
		expect(first.hash).not.toBe(first.value)
		expect(first.expiresAt.getTime()).toBeGreaterThan(Date.now())
	})
})
