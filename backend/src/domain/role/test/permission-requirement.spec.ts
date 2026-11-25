import { Permission } from '../permission.js'
import { PermissionRequirement } from '../permission-requirement.js'
import { PermissionsMask } from '../permissions-mask.js'
import { Role } from '../role.js'
import { AppError, ForbiddenError } from '../../../shared/errors/app.error.js'

describe('PermissionRequirement', () => {
	it('should throw when created without permissions', () => {
		expect(() => PermissionRequirement.all()).toThrow(AppError)
		expect(() => PermissionRequirement.any()).toThrow(AppError)
	})

	it('should check all required permissions', () => {
		const roleWithOne = Role.create({
			name: 'User Manager',
			permissionsMask: PermissionsMask.create(Permission.ManageUsers.value),
		})
		const roleWithBoth = Role.create({
			name: 'Admin',
			permissionsMask: PermissionsMask.create(Permission.ManageUsers.value | Permission.ManageRoles.value),
		})
		const requirement = PermissionRequirement.all(Permission.ManageUsers, Permission.ManageRoles)

		expect(requirement.isSatisfiedBy(roleWithOne)).toBe(false)
		expect(requirement.isSatisfiedBy(roleWithBoth)).toBe(true)
		expect(() => requirement.ensureSatisfiedBy(roleWithOne)).toThrow(ForbiddenError)
		expect(() => requirement.ensureSatisfiedBy(roleWithBoth)).not.toThrow()
	})

	it('should check any of the accepted permissions', () => {
		const reader = Role.create({
			name: 'Employee Reader',
			permissionsMask: PermissionsMask.create(Permission.ReadEmployees.value),
		})
		const none = Role.create({
			name: 'Guest',
			permissionsMask: PermissionsMask.create(0n),
		})
		const requirement = PermissionRequirement.any(Permission.ReadEmployees, Permission.ManageEmployees)

		expect(requirement.isSatisfiedBy(reader)).toBe(true)
		expect(requirement.isSatisfiedBy(none)).toBe(false)
		expect(() => requirement.ensureSatisfiedBy(reader)).not.toThrow()
		expect(() => requirement.ensureSatisfiedBy(none)).toThrow(ForbiddenError)
	})
})
