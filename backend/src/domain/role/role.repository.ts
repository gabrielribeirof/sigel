import type { Role } from './role.js'
import type { Identifier } from '../shared/identifier.js'

export interface RoleRepository {
	save(role: Role): Promise<Role>
	findById(id: Identifier): Promise<Role | null>
	findByName(name: string): Promise<Role | null>
	findAll(): Promise<Role[]>
	delete(id: Identifier): Promise<void>
}
