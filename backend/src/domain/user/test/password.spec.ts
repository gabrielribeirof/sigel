import { jest } from '@jest/globals'
import { Password } from '../password.js'

const hasher = {
	hash: jest.fn(async (value: string) => `hashed:${value}`),
	compare: jest.fn(async (value: string, hash: string) => hash === `hashed:${value}`),
}

describe('Password', () => {
	beforeEach(() => jest.clearAllMocks())

	it('should hash a plaintext password', async () => {
		const sut = await Password.create('secret', hasher)

		expect(sut.value).toBe('hashed:secret')
		expect(hasher.hash).toHaveBeenCalledWith('secret')
	})

	it('should match plaintext against its hash', async () => {
		const sut = Password.fromHash('hashed:secret')

		await expect(sut.matches('secret', hasher)).resolves.toBe(true)
		await expect(sut.matches('wrong', hasher)).resolves.toBe(false)
		expect(hasher.compare).toHaveBeenNthCalledWith(1, 'secret', 'hashed:secret')
	})

	it('should reject missing plaintext and hashes', async () => {
		await expect(Password.create('', hasher)).rejects.toThrow('User password is required')
		expect(() => Password.fromHash('')).toThrow('User password hash is required')
	})
})
