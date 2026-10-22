import { Email } from '../email.js'

describe('Email', () => {
	it('should normalize a valid email', () => {
		expect(Email.create(' ADMIN@EXAMPLE.COM ').value).toBe('admin@example.com')
		expect(Email.from('user@example.com').value).toBe('user@example.com')
	})

	it('should reject an invalid email', () => {
		expect(() => Email.create('invalid-email')).toThrow('A valid user email is required')
	})
})
