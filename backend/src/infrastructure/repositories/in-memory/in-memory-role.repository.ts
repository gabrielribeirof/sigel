import type { Role } from '../../../domain/role/role.js'
import type { RoleRepository } from '../../../domain/role/role.repository.js'
import type { Identifier } from '../../../domain/shared/identifier.js'

export class InMemoryRoleRepository implements RoleRepository {
	private readonly items = new Map<string, Role>()

	public async save(role: Role): Promise<Role> {
		this.items.set(role.id.value, role)
		return role
	}

	public async findById(id: Identifier): Promise<Role | null> {
		return this.items.get(id.value) ?? null
	}

	public async findByName(name: string): Promise<Role | null> {
		return [...this.items.values()].find(role => role.name === name.trim()) ?? null
	}

	public async findAll(): Promise<Role[]> {
		return [...this.items.values()]
	}

	public async delete(id: Identifier): Promise<void> {
		this.items.delete(id.value)
	}
}
