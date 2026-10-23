import type { User } from '../../../domain/user/user.js'
import type { UserRepository } from '../../../domain/user/user.repository.js'
import type { Identifier } from '../../../domain/shared/identifier.js'

export class InMemoryUserRepository implements UserRepository {
	private readonly items = new Map<string, User>()

	public async save(user: User): Promise<User> {
		this.items.set(user.id.value, user)
		return user
	}

	public async findById(id: Identifier): Promise<User | null> {
		return this.items.get(id.value) ?? null
	}

	public async findByEmail(email: string): Promise<User | null> {
		return [...this.items.values()].find(user => user.email === email.trim().toLowerCase()) ?? null
	}

	public async findAll(): Promise<User[]> {
		return [...this.items.values()]
	}

	public async delete(id: Identifier): Promise<void> {
		this.items.delete(id.value)
	}
}
