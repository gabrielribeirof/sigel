import { Repository } from 'typeorm'
import type { Employee } from '../../../domain/employee/employee.js'
import type { EmployeeRepository } from '../../../domain/employee/employee.repository.js'
import { EmployeeTypeormEntity } from '../../../config/typeorm/entities/employee.typeorm-entity.js'
import { EmployeeMapper } from '../../../shared/mappers/employee.mapper.js'
import type { Identifier } from '../../../domain/shared/identifier.js'

export class TypeORMEmployeeRepository implements EmployeeRepository {
	public constructor(private readonly repository: Repository<EmployeeTypeormEntity>) {

	}

	public async save(employee: Employee): Promise<Employee> {
		return EmployeeMapper.toDomain(await this.repository.save(EmployeeMapper.toPersistence(employee)))
	}

	public async findById(id: Identifier): Promise<Employee | null> {
		const entity = await this.repository.findOneBy({ id: id.value })
		return entity ? EmployeeMapper.toDomain(entity) : null
	}

	public async findByRegistration(registration: string): Promise<Employee | null> {
		const entity = await this.repository.findOneBy({ registration })
		return entity ? EmployeeMapper.toDomain(entity) : null
	}

	public async findAll(): Promise<Employee[]> {
		return (await this.repository.find()).map(EmployeeMapper.toDomain)
	}

	public async delete(id: Identifier): Promise<void> {
		await this.repository.delete(id.value)
	}
}
