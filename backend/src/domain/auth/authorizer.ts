import type { PermissionBit } from '../role/permission-bit.js'
import type { PermissionRequirement } from '../role/permission-requirement.js'

export interface Authorizer {
	authorize(userId: string | undefined, requirement: PermissionBit | PermissionRequirement): Promise<void>
}
