import { Repository } from 'typeorm'
import type { Role } from '../../../domain/role/role.js'
import type { RoleRepository } from '../../../domain/role/role.repository.js'
import { RoleTypeormEntity } from '../../../config/typeorm/entities/role.typeorm-entity.js'
import { RoleMapper } from '../../../shared/mappers/role.mapper.js'
import type { Identifier } from '../../../domain/shared/identifier.js'

export class TypeORMRoleRepository implements RoleRepository {
	public constructor(private readonly repository: Repository<RoleTypeormEntity>) {

	}

	public async save(role: Role): Promise<Role> {
		return RoleMapper.toDomain(await this.repository.save(RoleMapper.toPersistence(role)))
	}

	public async findById(id: Identifier): Promise<Role | null> {
		const entity = await this.repository.findOneBy({ id: id.value })
		return entity ? RoleMapper.toDomain(entity) : null
	}

	public async findByName(name: string): Promise<Role | null> {
		const entity = await this.repository.findOneBy({ name })
		return entity ? RoleMapper.toDomain(entity) : null
	}

	public async findAll(): Promise<Role[]> {
		return (await this.repository.find()).map(RoleMapper.toDomain)
	}

	public async delete(id: Identifier): Promise<void> {
		await this.repository.delete(id.value)
	}
}
