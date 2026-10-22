import { EmployeeName } from '../employee-name.js'

describe('EmployeeName', () => {
	it('should trim the name', () => {
		expect(EmployeeName.create(' Ada Lovelace ').value).toBe('Ada Lovelace')
	})

	it.each(['', '   ', '\t'])('should reject an empty name: %j', (value) => {
		expect(() => EmployeeName.create(value)).toThrow('Employee name is required')
	})
})
