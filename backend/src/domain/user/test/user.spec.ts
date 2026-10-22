import { User } from '../user.js'
import { Password } from '../password.js'
import { Identifier } from '../../shared/identifier.js'

const roleId = Identifier.from('01900000-0000-7000-8000-000000000001')

describe('User', () => {
	it('should create an active user and normalize its email', () => {
		const sut = User.create({
			email: ' ADMIN@EXAMPLE.COM ',
			password: Password.fromHash('hash'),
			roleId,
			employeeId: null,
		})

		expect(sut.email).toBe('admin@example.com')
		expect(sut.active).toBe(true)
		expect(sut.roleId).toBe(roleId)
		expect(sut.employeeId).toBeNull()
	})

	it('should update account details', () => {
		const sut = User.create({
			email: 'admin@example.com',
			password: Password.fromHash('old-hash'),
			roleId,
			employeeId: null,
		})
		const employeeId = Identifier.from('01900000-0000-7000-8000-000000000002')

		sut.update({
			email: 'new@example.com',
			active: false,
			employeeId,
			password: Password.fromHash('new-hash'),
		})

		expect(sut.email).toBe('new@example.com')
		expect(sut.active).toBe(false)
		expect(sut.employeeId).toBe(employeeId)
		expect(sut.password.value).toBe('new-hash')
	})

	it('should reject an invalid email or missing role', () => {
		expect(() => User.create({
			email: 'invalid',
			password: Password.fromHash('hash'),
			roleId,
			employeeId: null,
		})).toThrow('A valid user email is required')
		expect(() => User.reconstitute({
			id: roleId,
			email: 'valid@example.com',
			password: Password.fromHash('hash'),
			roleId: null as never,
			employeeId: null,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		})).toThrow('User role is required')
	})
})
