import { Argon2PasswordHasher } from '../argon2.password-hasher.js'

describe('Argon2PasswordHasher', () => {
	it('should hash and verify a valid password', async () => {
		const sut = new Argon2PasswordHasher()
		const hash = await sut.hash('strong-password')

		expect(hash).not.toBe('strong-password')
		expect(await sut.compare('strong-password', hash)).toBe(true)
		expect(await sut.compare('wrong-password', hash)).toBe(false)
	})

	it('should not hash passwords shorter than eight characters', async () => {
		const sut = new Argon2PasswordHasher()

		expect(() => sut.hash('short')).toThrow('Password must contain at least 8 characters')
	})
})
