import { Registration } from '../registration.js'

describe('Registration', () => {
	it('should trim the registration', () => {
		expect(Registration.create(' REG-123 ').value).toBe('REG-123')
	})

	it.each(['', '   ', '\t'])('should reject an empty registration: %j', (value) => {
		expect(() => Registration.create(value)).toThrow('Employee registration is required')
	})
})
