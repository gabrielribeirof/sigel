import { User } from '../../../domain/user/user.js'
import { Password } from '../../../domain/user/password.js'
import { UserMapper } from '../user.mapper.js'
import { Identifier } from '../../../domain/shared/identifier.js'

describe('UserMapper', () => {
	it('should map a user to persistence and public DTOs without exposing its password', () => {
		const sut = User.create({
			email: 'admin@example.com',
			password: Password.fromHash('secret-hash'),
			roleId: Identifier.from('01900000-0000-7000-8000-000000000001'),
			employeeId: null,
		})

		expect(UserMapper.toPersistence(sut)).toMatchObject({ passwordHash: 'secret-hash' })
		expect(UserMapper.toDTO(sut)).not.toHaveProperty('passwordHash')
		expect(UserMapper.toAuthenticatedDTO(sut)).toEqual({
			id: sut.id.value,
			email: sut.email,
			roleId: '01900000-0000-7000-8000-000000000001',
		})
		expect(UserMapper.toDomain(UserMapper.toPersistence(sut))).toEqual(sut)
	})
})
