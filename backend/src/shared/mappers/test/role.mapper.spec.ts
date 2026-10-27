import { Role } from '../../../domain/role/role.js'
import { RoleMapper } from '../role.mapper.js'
import { PermissionsMask } from '../../../domain/role/permissions-mask.js'

describe('RoleMapper', () => {
	it('should map a role bigint mask to persistence and string DTOs', () => {
		const sut = Role.create({
			name: 'Admin',
			permissionsMask: PermissionsMask.create(3n),
		})
		const persisted = RoleMapper.toPersistence(sut)

		expect(persisted.permissionsMask).toBe('3')
		expect(RoleMapper.toDTO(sut).permissionsMask).toBe('3')
		expect(RoleMapper.toDomain(persisted).mask).toBe(3n)
	})
})
