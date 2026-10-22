import { PermissionsMask } from '../permissions-mask.js'

describe('PermissionsMask', () => {
	it('should grant and revoke permissions using bits or values', () => {
		const sut = PermissionsMask.create()

		const granted = sut.grant(1n).grant({ value: 2n })
		expect(granted.value).toBe(3n)
		expect(granted.has(1n)).toBe(true)
		expect(granted.has({ value: 2n })).toBe(true)
		expect(granted.revoke(1n).value).toBe(2n)
	})

	it('should reject a negative mask', () => {
		expect(() => PermissionsMask.create(-1n)).toThrow('Role permissions mask cannot be negative')
	})
})
