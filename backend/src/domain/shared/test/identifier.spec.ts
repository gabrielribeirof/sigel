import { Identifier } from '../identifier.js'

const validId = '01900000-0000-7000-8000-000000000001'

describe('Identifier', () => {
	it('should generate an identifier using the configured provider', () => {
		expect(Identifier.generate().value).toBe('01900000-0000-7000-8000-000000000000')
	})

	it('should normalize valid identifiers and preserve identifier instances', () => {
		const identifier = Identifier.from(validId.toUpperCase())

		expect(identifier.value).toBe(validId)
		expect(Identifier.from(identifier)).toBe(identifier)
	})

	it('should reject invalid identifiers', () => {
		expect(() => Identifier.from('not-an-identifier')).toThrow('A valid UUIDv7 is required')
	})
})
