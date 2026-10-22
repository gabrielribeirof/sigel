import { PermissionBit } from '../permission-bit.js'

describe('PermissionBit', () => {
	it('should create a bit containing one permission', () => {
		expect(PermissionBit.create(4n).value).toBe(4n)
	})

	it.each([0n, 3n, 6n])('should reject values that are not a single bit: %j', (value) => {
		expect(() => PermissionBit.create(value)).toThrow('Permission bit must contain exactly one permission')
	})
})
