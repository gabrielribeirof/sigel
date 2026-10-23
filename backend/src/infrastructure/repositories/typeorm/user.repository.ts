import { Repository } from 'typeorm'
import type { User } from '../../../domain/user/user.js'
import type { UserRepository } from '../../../domain/user/user.repository.js'
import { UserTypeormEntity } from '../../../config/typeorm/entities/user.typeorm-entity.js'
import { UserMapper } from '../../../shared/mappers/user.mapper.js'
import type { Identifier } from '../../../domain/shared/identifier.js'

export class TypeORMUserRepository implements UserRepository {
	public constructor(private readonly repository: Repository<UserTypeormEntity>) {

	}

	public async save(user: User): Promise<User> {
		return UserMapper.toDomain(await this.repository.save(UserMapper.toPersistence(user)))
	}

	public async findById(id: Identifier): Promise<User | null> {
		const entity = await this.repository.findOneBy({ id: id.value })
		return entity ? UserMapper.toDomain(entity) : null
	}

	public async findByEmail(email: string): Promise<User | null> {
		const entity = await this.repository.findOneBy({ email: email.toLowerCase() })
		return entity ? UserMapper.toDomain(entity) : null
	}

	public async findAll(): Promise<User[]> {
		return (await this.repository.find()).map(UserMapper.toDomain)
	}

	public async delete(id: Identifier): Promise<void> {
		await this.repository.delete(id.value)
	}
}
