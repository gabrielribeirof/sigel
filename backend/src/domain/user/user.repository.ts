import type { User } from './user.js'
import type { Identifier } from '../shared/identifier.js'

export interface UserRepository {
	save(user: User): Promise<User>
	findById(id: Identifier): Promise<User | null>
	findByEmail(email: string): Promise<User | null>
	findAll(): Promise<User[]>
	delete(id: Identifier): Promise<void>
}
