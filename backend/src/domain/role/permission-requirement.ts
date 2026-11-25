import { AppError, ForbiddenError } from '../../shared/errors/app.error.js'
import type { PermissionBit } from './permission-bit.js'
import type { Role } from './role.js'

type RequirementMode = 'all' | 'any'

export class PermissionRequirement {
	private constructor(
		private readonly mode: RequirementMode,
		private readonly permissions: readonly PermissionBit[],
	) {
		if (permissions.length === 0) {
			throw new AppError('INVALID_PARAMETERS', 'At least one permission is required')
		}
	}

	public static all(...permissions: PermissionBit[]): PermissionRequirement {
		return new PermissionRequirement('all', permissions)
	}

	public static any(...permissions: PermissionBit[]): PermissionRequirement {
		return new PermissionRequirement('any', permissions)
	}

	public static from(requirement: PermissionBit | PermissionRequirement): PermissionRequirement {
		return requirement instanceof PermissionRequirement
			? requirement
			: PermissionRequirement.all(requirement)
	}

	public isSatisfiedBy(role: Role): boolean {
		return this.mode === 'all'
			? role.hasAll(...this.permissions)
			: role.hasAny(...this.permissions)
	}

	public ensureSatisfiedBy(role: Role): void {
		if (!this.isSatisfiedBy(role)) {
			throw new ForbiddenError()
		}
	}
}
